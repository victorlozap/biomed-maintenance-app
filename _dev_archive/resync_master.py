import pandas as pd
import os
import urllib.request
import json
import ssl

def get_serials_from_f2(path):
    xl = pd.ExcelFile(path)
    all_serials = set()
    for sheet in xl.sheet_names:
        df = xl.parse(sheet, header=None)
        print(f"Buscando en hoja: {sheet} ({df.shape[0]} filas)")
        for col_idx in range(df.shape[1]):
            col_data = df.iloc[:, col_idx].astype(str)
            # Buscar seriales de 7+ dígitos
            serials = col_data.str.extract(r'(\d{7,})')[0].dropna()
            all_serials.update(serials.tolist())
    return all_serials

print("Cargando archivos...")
serials_431 = get_serials_from_f2("f2.xlsx")
print(f"Total seriales identificados en f2: {len(serials_431)}")

# Si aún no llegamos a 431, verificamos f1.xlsx (ICU)
df_f1 = pd.read_excel("f1.xlsx", header=None)

# Mapeo
master_data = []
for s in serials_431:
    s = str(s).replace('.0','')
    equipo, marca, modelo, servicio, ubicacion, id_u = "BOMBA DE INFUSIÓN", "ICU MEDICAL", "PLUM A+", "N/A", "N/A", s
    
    # f1 search
    for i, row in df_f1.iterrows():
        row_str = [str(v).strip().replace('.0','') for v in row]
        if s in row_str:
            val_g = str(row[6]) if len(row) > 6 else "N/A"
            servicio = val_g.strip().replace('"', '')
            ubicacion = val_g.strip().replace('"', '')
            modelo = str(row[4]) if len(row) > 4 else modelo
            if len(row) > 2 and pd.notna(row[2]): id_u = str(row[2]).replace('.0', '')
            break
            
    master_data.append({
        "id_unico": str(id_u).replace('nan','').strip() or s,
        "numero_serie": s, "equipo": equipo, "marca": marca, "modelo": str(modelo).replace('nan','PLUM A+'),
        "servicio": str(servicio).replace('nan','N/A').strip(),
        "ubicacion": str(ubicacion).replace('nan','N/A').strip(),
        "estado": "BUENO", "riesgo": "IIb", "propietario": "HUSJ (COMODATO)"
    })

print(f"Total registros para subir: {len(master_data)}")

# SYNC
url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
context = ssl._create_unverified_context()

for i in range(0, len(master_data), 50):
    batch = master_data[i:i+50]
    req = urllib.request.Request(f"{url_base}/equipments?on_conflict=id_unico", 
                                 data=json.dumps(batch).encode("utf-8"), 
                                 headers={**headers, "Prefer": "resolution=merge-duplicates"}, method="POST")
    # Execute
    try:
        with urllib.request.urlopen(req, context=context) as response:
            print(".", end="", flush=True)
    except Exception as e:
        print(f"x")

print("\n✨ FINALIZADO.")
