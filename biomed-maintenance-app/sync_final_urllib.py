import urllib.request
import json
import ssl
import pandas as pd
import os

env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if line.strip() and not line.startswith("#") and "=" in line:
                k, v = line.strip().split("=", 1)
                os.environ[k] = v.strip('"\'')

apikey = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not apikey:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in environment or .env file")

url_base = f"{os.environ.get('SUPABASE_URL', 'https://gzdspkhpxkibjxbfdeuc.supabase.co')}/rest/v1"
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
        res_content = response.read()
        if not res_content: return None
        return json.loads(res_content)

# 1. LOAD DATA
df = pd.read_csv("master_inventory_bombs_final_431.csv")
target_serials = set(df["Serial"].astype(str).str.strip().str.upper().tolist())

# 2. FETCH CURRENT
print("Fetching current bombs...")
current = api_call("/equipments?equipo=ilike.*BOMBA*&select=id,numero_serie")
print(f"Current count: {len(current)}")

# 3. UPSERT
print("Upserting 431 assets...")
payload = []
for _, row in df.iterrows():
    s = str(row["Serial"]).strip()
    payload.append({
        "numero_serie": s,
        "id_unico": str(row["Id_Unico"]) if pd.notna(row["Id_Unico"]) else s,
        "equipo": str(row["Equipo"]) if pd.notna(row["Equipo"]) else "BOMBA DE INFUSIÓN",
        "marca": str(row["Marca"]) if pd.notna(row["Marca"]) else "ICU MEDICAL",
        "modelo": str(row["Modelo"]) if pd.notna(row["Modelo"]) else "N/A",
        "servicio": str(row["Servicio"]) if pd.notna(row["Servicio"]) else "N/A",
        "ubicacion": str(row["Nueva_Ubicacion"]) if pd.notna(row["Nueva_Ubicacion"]) else "N/A",
        "estado": "BUENO",
        "riesgo": "IIb",
        "propietario": "HUSJ (COMODATO)"
    })

for i in range(0, len(payload), 50):
    batch = payload[i:i+50]
    api_call("/equipments?on_conflict=id_unico", method="POST", body=batch, extra_headers={"Prefer": "resolution=merge-duplicates"})
    print(".", end="", flush=True)

print("\nUpsert complete.")

# 4. DELETE REMAINING OBSOLETE
print("Cleaning up obsolete items...")
final_current = api_call("/equipments?equipo=ilike.*BOMBA*&select=id,numero_serie")
to_delete = [item["id"] for item in final_current if str(item["numero_serie"]).strip().upper() not in target_serials]

if to_delete:
    print(f"Deleting {len(to_delete)} items...")
    for i in range(0, len(to_delete), 50):
        ids_str = ",".join([f'"{id}"' for id in to_delete[i:i+50]])
        api_call(f"/equipments?id=in.({ids_str})", method="DELETE")
    print("Cleanup complete.")

print("✨ DATABASE FULLY SYNCHRONIZED AND CLEANED. 431 BOOMBS IN INVENTORY.")
