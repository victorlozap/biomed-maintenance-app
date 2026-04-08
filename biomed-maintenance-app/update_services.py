import pandas as pd
import urllib.request
import json
import ssl
import time

def sync_pumps():
    path = "f2.xlsx"
    print(f"Cargando {path}...")
    df = pd.read_excel(path, sheet_name='inventario', header=None)
    
    start_row = 0
    for i, row in df.iterrows():
        if "SERIE" in [str(v).upper() for v in row]:
            start_row = i + 1
            break
    
    data_rows = df.iloc[start_row:]
    master_data = []
    for i, row in data_rows.iterrows():
        sn = str(row[3]).strip().replace('.0', '')
        if not sn or sn == 'nan' or not sn.isdigit(): continue
        val_g = str(row[6]).strip().replace('"', '') if pd.notna(row[6]) else "N/A"
        modelo = str(row[4]).strip() if pd.notna(row[4]) else "PLUM A+"
        placa = str(row[2]).replace('.0', '') if pd.notna(row[2]) else sn
        
        # LIMPIEZA ADICIONAL: "BOMBAS_2026_MAIN" no es un servicio, es un tag. 
        # Si val_g es muy genérico o parece un nombre de hoja, buscamos en f1 si podemos.
        # Pero el usuario dijo que la columna G ES la "Nueva Ubicación".
        
        master_data.append({
            "numero_serie": sn,
            "id_unico": placa,
            "equipo": "BOMBA DE INFUSIÓN",
            "marca": "ICU MEDICAL",
            "modelo": modelo,
            "servicio": val_g,
            "ubicacion": val_g,
            "estado": "BUENO",
            "riesgo": "IIb",
            "propietario": "HUSJ (COMODATO)"
        })

    print(f"Total registros: {len(master_data)}")
    
    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
    context = ssl._create_unverified_context()

    for i in range(0, len(master_data), 50):
        batch = master_data[i:i+50]
        req = urllib.request.Request(f"{url_base}/equipments?on_conflict=id_unico", 
                                     data=json.dumps(batch).encode("utf-8"), 
                                     headers={**headers, "Prefer": "resolution=merge-duplicates"}, 
                                     method="POST")
        retries = 5
        success = False
        while retries > 0 and not success:
            try:
                with urllib.request.urlopen(req, context=context) as response:
                    print(".", end="", flush=True)
                    success = True
            except Exception as e:
                retries -= 1
                if retries == 0: print(f"X", end="")
                else: time.sleep(1)

    print("\n✨ ¡Sincronización FINAL completada!")

sync_pumps()
