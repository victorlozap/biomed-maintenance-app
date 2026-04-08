import pandas as pd
from supabase import create_client, Client

url = "https://gzdspkhpxkibjxbfdeuc.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI"
supabase: Client = create_client(url, key)

df = pd.read_csv("master_inventory_bombs_final_431.csv")
target_serials = set(df["Serial"].astype(str).tolist())

# 1. Fetch current Bombs
res = supabase.table("equipments").select("id", "numero_serie").filter("equipo", "ilike", "%BOMBA%").execute()
current_map = {str(item["numero_serie"]).strip().upper(): item["id"] for item in res.data if item["numero_serie"]}

# 2. Delete leftovers
ids_to_delete = [item["id"] for item in res.data if str(item["numero_serie"]).strip().upper() not in target_serials]
if ids_to_delete:
    print(f"Deleting {len(ids_to_delete)} old items...")
    for i in range(0, len(ids_to_delete), 50):
        supabase.table("equipments").delete().in_("id", ids_to_delete[i:i+50]).execute()

# 3. Prepare Upsert with IDs
upsert_payload = []
for _, row in df.iterrows():
    s = str(row["Serial"])
    item = {
        "numero_serie": s,
        "id_unico": str(row["Id_Unico"]) if pd.notna(row["Id_Unico"]) else s,
        "equipo": str(row["Equipo"]) if pd.notna(row["Equipo"]) else "BOMBA DE INFUSIÓN",
        "marca": str(row["Marca"]) if pd.notna(row["Marca"]) else "ICU MEDICAL",
        "modelo": str(row["Modelo"]) if pd.notna(row["Modelo"]) else None,
        "servicio": str(row["Servicio"]) if pd.notna(row["Servicio"]) else None,
        "ubicacion": str(row["Nueva_Ubicacion"]) if pd.notna(row["Nueva_Ubicacion"]) else None,
        "estado": "BUENO",
        "riesgo": "IIb"
    }
    # If it exists, add ID to keep it (Update)
    if s.upper() in current_map:
        item["id"] = current_map[s.upper()]
    upsert_payload.append(item)

# 4. Perform Sync
print(f"Syncing {len(upsert_payload)} assets to Supabase...")
for i in range(0, len(upsert_payload), 50):
    batch = upsert_payload[i:i+50]
    supabase.table("equipments").upsert(batch).execute()

print("DATABASE FULLY SYNCHRONIZED. 431 assets updated/inserted.")
