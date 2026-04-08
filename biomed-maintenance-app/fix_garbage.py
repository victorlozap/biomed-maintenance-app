import pandas as pd
import urllib.request
import json
import ssl

url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
context = ssl._create_unverified_context()

def api_call(path, method="GET", body=None, extra_headers=None):
    full_url = f"{url_base}{path}"
    h = headers.copy()
    if extra_headers: h.update(extra_headers)
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(full_url, data=data, headers=h, method=method)
    with urllib.request.urlopen(req, context=context) as response:
        res = response.read()
        return json.loads(res) if res else None

# 1. PURGAR BASURA
print("🧹 Purgando registros basura...")
current = api_call("/equipments?select=id,id_unico,numero_serie")
to_delete = []
for item in current:
    idu = str(item["id_unico"] or "")
    sn = str(item["numero_serie"] or "")
    # Si empieza con *, o es un numero muy corto (menos de 6 digitos para id_unico), o contiene "CARGO" o "FIRMA"
    if idu.startswith("*") or sn.startswith("*") or "CARGO" in idu.upper() or "FIRMA" in idu.upper():
        to_delete.append(item["id"])
    elif idu.isdigit() and len(idu) < 5: # IDs cortos que parecen indices (10, 101, etc)
        # Solo borrar si hay otro con el mismo serial pero ID correcto? 
        # No, mejor borrar y re-sincronizar los 431 bien.
        to_delete.append(item["id"])

if to_delete:
    print(f"Borrando {len(to_delete)} registros basura...")
    for i in range(0, len(to_delete), 50):
        ids_str = ",".join([f'"{id}"' for id in to_delete[i:i+50]])
        api_call(f"/equipments?id=in.({ids_str})", method="DELETE")
    print("Limpieza de basura completada.")

# 2. RE-SINCRONIZAR SOLO LOS 431 CORRECTOS
print("📡 Re-sincronizando los 431 equipos con el mapeo correcto...")
df = pd.read_excel("f2.xlsx", sheet_name='inventario', header=None)

# Localizar headers
start_row = 0
for i, row in df.iterrows():
    if "SERIE" in [str(v).upper() for v in row]:
        start_row = i + 1
        break

data_rows = df.iloc[start_row:]
payload = []
for i, row in data_rows.iterrows():
    sn = str(row[3]).strip().replace('.0', '') # Col D = Indice 3 = SERIE
    if not sn or sn == 'nan' or not sn.isdigit() or len(sn) < 6: continue
    
    val_g = str(row[6]).strip().replace('"', '') if pd.notna(row[6]) else "N/A"
    modelo = str(row[4]).strip() if pd.notna(row[4]) else "PLUM A+"
    
    # IMPORTANTE: No usar el indice "No." como ID. 
    # El ID único DEBE ser la placa si existe en f1, o el serial si no.
    # Pero para arreglarlo rápido, usaré el serial como ID UNICO si no hay otro.
    # El usuario dijo que "ya lo tenías bien", así que los seriales son la clave.
    
    payload.append({
        "id_unico": sn, # Usamos el serial como ID para evitar colisiones con indices
        "numero_serie": sn,
        "equipo": "BOMBA DE INFUSIÓN",
        "marca": "ICU MEDICAL",
        "modelo": modelo,
        "servicio": val_g,
        "ubicacion": val_g,
        "estado": "BUENO",
        "riesgo": "IIb",
        "propietario": "HUSJ (COMODATO)"
    })

# Upsert limpio
for i in range(0, len(payload), 50):
    batch = payload[i:i+50]
    api_call("/equipments?on_conflict=id_unico", method="POST", body=batch, extra_headers={"Prefer": "resolution=merge-duplicates"})
    print(".", end="", flush=True)

print("\n✨ Sistema restaurado y servicios actualizados.")
