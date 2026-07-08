import pandas as pd
import urllib.request
import json
import ssl
import urllib.parse
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
    # 1. Get exact 431 serials
    df1 = pd.read_excel("f1.xlsx", skiprows=1)
    serials2026 = set()
    for s in df1.iloc[:, 4].dropna():
        cs = clean_serial(s)
        if cs: serials2026.add(cs)
    for s in df1.iloc[:, 8].dropna():
        cs = clean_serial(s)
        if cs: serials2026.add(cs)
        
    print(f"Total unique serials in 2026 file: {len(serials2026)}")
    
    # 2. Read the master clean BOMBs
    # we know pandas fails to read_csv on the previous file because one of them is broken...
    # let's write our own basic matching: map_serial_placa 
    
    # Actually we can get the metadata for the 431 serials from f2.xlsx!
    print("Reading f2.xlsx...")
    xl = pd.ExcelFile("f2.xlsx")
    master_data = []
    seen_serials = set()
    
    for sheet in xl.sheet_names:
        df = xl.parse(sheet, header=None)
        start_row = 0
        for i, row in df.iterrows():
            if any(x in str(v).upper() for v in row for x in ["SERIE", "SERIAL"]):
                start_row = i + 1
                break
        
        for i, row in df.iloc[start_row:].iterrows():
            row_vals = [str(v).strip().replace('.0','') for v in row]
            sn_candidates = [v for v in row_vals if v.isdigit() and len(v) >= 7]
            if not sn_candidates: continue
            
            sn = sn_candidates[0]
            if sn not in serials2026: continue # ONLY THE 431
            
            if sn in seen_serials: continue
            seen_serials.add(sn)
            
            service = "N/A"
            if len(row) > 6 and pd.notna(row[6]) and not str(row[6]).startswith("*"):
                service = str(row[6]).strip().replace('"', '')
            
            # Map placa from f1.xlsx
            idu = sn # fallback
            # We map the correct IDU using df1
            
            payload_item = {
                "id_unico": idu,
                "numero_serie": sn,
                "equipo": "BOMBA DE INFUSIÓN",
                "marca": "ICU MEDICAL",
                "modelo": "PLUM A+",
                "servicio": service,
                "ubicacion": service,
                "estado": "BUENO",
                "riesgo": "IIB", # the screenshot showed IIB correctly without b lowercase perhaps?
                "propietario": "HUSJ (COMODATO)"
            }
            for v in row_vals:
                if "PLUM" in v.upper():
                    payload_item["modelo"] = v
                    break
            
            master_data.append(payload_item)
            
    # MAP PLACA logic from f1.xlsx
    for i, row in df1.iterrows():
        r = [str(v).strip().replace('.0','') for v in row]
        serials_in_row = [v for v in r if v.isdigit() and len(v) >= 7]
        placas_in_row = [v for v in r if v.isdigit() and len(v) >= 6 and len(v) < 10]
        if serials_in_row and placas_in_row:
            s_sn = serials_in_row[0]
            s_placa = placas_in_row[0]
            for m in master_data:
                if m["numero_serie"] == s_sn:
                    m["id_unico"] = s_placa

    print(f"Total matching master data: {len(master_data)}")

    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
    context = ssl._create_unverified_context()

    # Bulk insert
    for i in range(0, len(master_data), 50):
        batch = master_data[i:i+50]
        req = urllib.request.Request(f"{url_base}/equipments?on_conflict=id_unico", 
                                     data=json.dumps(batch).encode("utf-8"), 
                                     headers={**headers, "Prefer": "resolution=merge-duplicates"}, 
                                     method="POST")
        retries = 10
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
