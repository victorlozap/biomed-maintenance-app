import pandas as pd
import urllib.request
import json
import ssl
import time

def clean_serial(s):
    if pd.isna(s): return None
    if isinstance(s, float):
        if s == int(s): s = int(s)
    s = str(s).strip().upper()
    if s in ["", "NAN", "NO ENCONTRADO", "BUSCAR", "SERIE", "NO IDENTIFICADO"]: return None
    if s.endswith(".0"): s = s[:-2]
    return s

def solve():
    print("Reading f1.xlsx...")
    df1 = pd.read_excel("f1.xlsx", skiprows=1)
    serials2026 = set()
    for s in df1.iloc[:, 4].dropna():
        cs = clean_serial(s)
        if cs: serials2026.add(cs)
    for s in df1.iloc[:, 8].dropna():
        cs = clean_serial(s)
        if cs: serials2026.add(cs)
        
    print(f"Valid 2026 serials: {len(serials2026)}")
    
    print("Reading master_inventory_bombs_clean.csv using node ... well we can read it using python's csv ")
    import csv
    master_data = []
    seen = set()
    with open('master_inventory_bombs_clean.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sn = clean_serial(row.get('Serial', ''))
            if sn in serials2026:
                if sn in seen: continue
                seen.add(sn)
                
                placa = row.get('Placa')
                if not placa or placa.strip() == "N/A" or len(placa) < 6:
                    placa = sn
                    
                # From f1 we can get the actual placa!
                # We'll map it below just in case.
                
                service = row.get('Nueva_Ubicacion')
                if not service: service = row.get('Servicio')
                if not service: service = 'N/A'
                
                item = {
                    "id_unico": str(placa),
                    "numero_serie": str(sn),
                    "equipo": "BOMBA DE INFUSIÓN",
                    "marca": str(row.get('Marca', 'ICU MEDICAL')),
                    "modelo": str(row.get('Modelo', 'PLUM A+')).replace('?', 'A').replace('.0',''),
                    "servicio": service,
                    "ubicacion": service,
                    "estado": "BUENO",
                    "riesgo": "IIB",
                    "propietario": "HUSJ (COMODATO)"
                }
                master_data.append(item)
                
    # enforce strict id_unico from f1
    map_placa = {}
    for i, row in df1.iterrows():
        r = [str(v).strip().replace('.0','') for v in row]
        serials_in_row = [v for v in r if v.isdigit() and len(v) >= 7]
        placas_in_row = [v for v in r if v.isdigit() and len(v) >= 6 and len(v) < 10]
        if serials_in_row and placas_in_row:
            map_placa[serials_in_row[0]] = placas_in_row[0]
            
    for m in master_data:
        if m['numero_serie'] in map_placa:
            m['id_unico'] = map_placa[m['numero_serie']]
                
    print(f"Master data to upload: {len(master_data)}")

    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
    context = ssl._create_unverified_context()

    print("Uploading...")
    for i in range(0, len(master_data), 50):
        batch = master_data[i:i+50]
        req = urllib.request.Request(f"{url_base}/equipments?on_conflict=id_unico", 
                                     data=json.dumps(batch).encode("utf-8"), 
                                     headers={**headers, "Prefer": "resolution=merge-duplicates"}, 
                                     method="POST")
        retries = 5
        while retries > 0:
            try:
                with urllib.request.urlopen(req, context=context) as response:
                    print(".", end="", flush=True)
                    break
            except Exception as e:
                retries -= 1
                time.sleep(2)
    print("\nDONE")

solve()
