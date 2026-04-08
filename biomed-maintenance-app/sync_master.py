import pandas as pd
from supabase import create_client, Client

url = "https://gzdspkhpxkibjxbfdeuc.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
supabase: Client = create_client(url, key)

df = pd.read_csv("master_inventory_bombs_final_431.csv")
target_serials = set(df["Serial"].astype(str).str.strip().str.upper().tolist())

# 1. Fetch
print("Fetching current bombs...")
res = supabase.table("equipments").select("id", "numero_serie").filter("equipo", "ilike", "%BOMBA%").execute()
current_data = res.data

# 2. Delete
to_delete = [item["id"] for item in current_data if str(item["numero_serie"]).strip().upper() not in target_serials]
if to_delete:
    print(f"Deleting {len(to_delete)} items...")
    for i in range(0, len(to_delete), 50):
        supabase.table("equipments").delete().in_("id", to_delete[i:i+50]).execute()

# 3. Upsert
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
        "propietario": "ICU MEDICAL (COMODATO)"
    })

for i in range(0, len(payload), 50):
    supabase.table("equipments").upsert(payload[i:i+50], on_conflict="id_unico").execute()

print("SYNC COMPLETE!")
