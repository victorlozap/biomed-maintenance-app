import pandas as pd
import urllib.request
import json
import ssl
import time

def solve():
    print("Cargando excels y mapeando placas...")
    df_f1 = pd.read_excel("f1.xlsx", header=None)
    map_serial_placa = {}
    for i, row in df_f1.iterrows():
        r = [str(v).strip().replace('.0','') for v in row]
        serials_in_row = [v for v in r if v.isdigit() and len(v) >= 7]
        placas_in_row = [v for v in r if v.isdigit() and len(v) >= 6 and len(v) < 10]
        if serials_in_row and placas_in_row:
            map_serial_placa[serials_in_row[0]] = placas_in_row[0]

    xl = pd.ExcelFile("f2.xlsx")
    master_data = []
    seen_serials = set()
    
    for sheet in xl.sheet_names:
        print(f"Buscando en {sheet}...")
        df = xl.parse(sheet, header=None)
        start_row = 0
        for i, row in df.iterrows():
            if any(x in str(v).upper() for v in row for x in ["SERIE", "SERIAL"]):
                start_row = i + 1
                break
        
        for i, row in df.iloc[start_row:].iterrows():
            # Intentamos encontrar la columna de serial en esta fila
            row_vals = [str(v).strip().replace('.0','') for v in row]
            sn_candidates = [v for v in row_vals if v.isdigit() and len(v) >= 7]
            if not sn_candidates: continue
            
            sn = sn_candidates[0]
            if sn in seen_serials: continue
            seen_serials.add(sn)
            
            # Buscamos servicio en Col G (indice 6) si existe, o en alguna columna con texto largo
            service = "N/A"
            if len(row) > 6 and pd.notna(row[6]) and not str(row[6]).startswith("*"):
                service = str(row[6]).strip().replace('"', '')
            
            idu = map_serial_placa.get(sn, sn)
            
            payload_item = {
                "id_unico": idu,
                "numero_serie": sn,
                "equipo": "BOMBA DE INFUSIÓN",
                "marca": "ICU MEDICAL",
                "modelo": "PLUM A+",
                "servicio": service,
                "ubicacion": service,
                "estado": "BUENO",
                "riesgo": "IIb",
                "propietario": "HUSJ (COMODATO)"
            }
            # Intentar capturar modelo si está en una columna cercana
            for v in row_vals:
                if "PLUM" in v.upper():
                    payload_item["modelo"] = v
                    break
            
            master_data.append(payload_item)

    print(f"Total registros únicos encontrados: {len(master_data)}")
    
    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInZiRefI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    # Wait, I had a typo in apikey ref (extra 'v' in ref?). No, let me use the original.
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
    context = ssl._create_unverified_context()

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
            except:
                retries -= 1
                time.sleep(2)

    print("\n✨ FINALIZADO.")

solve()
