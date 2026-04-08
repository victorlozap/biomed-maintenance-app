import urllib.request
import json
import ssl
import pandas as pd

url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
headers = {
    "apikey": apikey,
    "Authorization": f"Bearer {apikey}",
    "Content-Type": "application/json"
}
context = ssl._create_unverified_context()

def api_call(path, method="GET", body=None, extra_headers=None):
    full_url = f"{url_base}{path}"
    h = headers.copy()
    if extra_headers: h.update(extra_headers)
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(full_url, data=data, headers=h, method=method)
    with urllib.request.urlopen(req, context=context) as response:
        res_data = response.read()
        return json.loads(res_data) if res_data else None

# 1. FETCH ALL
print("Buscando registros con .0 para purgar...")
current = api_call("/equipments?select=id,id_unico,numero_serie")
to_delete = [item["id"] for item in current if str(item["id_unico"]).endswith(".0") or str(item["numero_serie"]).endswith(".0")]

if to_delete:
    print(f"Purgando {len(to_delete)} registros con formato incorrecto (.0)...")
    for i in range(0, len(to_delete), 50):
        ids_str = ",".join([f'"{id}"' for id in to_delete[i:i+50]])
        api_call(f"/equipments?id=in.({ids_str})", method="DELETE")
    print("Purga completada.")
else:
    print("No se encontraron registros con .0")

# 2. RE-UPSERT CLEAN DATA
df = pd.read_csv("master_inventory_bombs_final_431.csv")
print("Sincronizando 431 equipos limpios...")
payload = []
for _, row in df.iterrows():
    s = str(row["Serial"])
    payload.append({
        "id_unico": str(row["Id_Unico"]),
        "numero_serie": s,
        "equipo": str(row["Equipo"]),
        "marca": str(row["Marca"]),
        "modelo": str(row["Modelo"]),
        "servicio": str(row["Servicio"]),
        "ubicacion": str(row["Nueva_Ubicacion"]),
        "estado": "BUENO",
        "riesgo": "IIb",
        "propietario": "HUSJ (COMODATO)"
    })

for i in range(0, len(payload), 50):
    batch = payload[i:i+50]
    api_call("/equipments?on_conflict=id_unico", method="POST", body=batch, extra_headers={"Prefer": "resolution=merge-duplicates"})
    print(".", end="", flush=True)

print("\n✨ ¡Sincronización FINAL sin .0 completada!")
