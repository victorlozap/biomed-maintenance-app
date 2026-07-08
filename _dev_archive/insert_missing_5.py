import pandas as pd
import urllib.request
import json
import ssl

def clean(s):
    s = str(s).strip()
    if s.endswith('.0'): s = s[:-2]
    return s

# 1. Parse f1 valid serials
df = pd.read_excel('f1.xlsx', header=None)
valid_serials = set()
map_placa = {}
for idx, row in df.iterrows():
    vals = [clean(v) for v in row if clean(v).isdigit()]
    sers = [v for v in vals if len(v) >= 7]
    placas = [v for v in vals if 5 <= len(v) <= 8 and v not in sers]  # simple heuristic to find placas

    # f1.xlsx has two sections of columns (left and right) for pagination probably
    # Let's cleanly just get the specific columns: 
    # it's usually Col 1 for Placa, Col 4 for Serial, etc.
    if idx == 0: continue
    
    # Left side: Placa=1, Serie=4
    p1 = clean(row.iloc[1]) if len(row)>1 else ""
    s1 = clean(row.iloc[4]) if len(row)>4 else ""
    if s1.isdigit() and len(s1) >= 6:
        valid_serials.add(s1)
        if p1.isdigit(): map_placa[s1] = p1
        
    # Right side: Placa=5, Serie=8
    p2 = clean(row.iloc[5]) if len(row)>5 else ""
    s2 = clean(row.iloc[8]) if len(row)>8 else ""
    if s2.isdigit() and len(s2) >= 6:
        valid_serials.add(s2)
        if p2.isdigit(): map_placa[s2] = p2

print(f"Total valid serials directly parsed: {len(valid_serials)}")

# 2. Get from Supabase
url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
context = ssl._create_unverified_context()

req = urllib.request.Request(f"{url_base}/equipments?equipo=eq.BOMBA%20DE%20INFUSI%C3%93N&select=id_unico,numero_serie", headers=headers)
with urllib.request.urlopen(req, context=context) as response:
    sb_bombs = json.loads(response.read().decode('utf-8'))

sb_serials = {clean(b.get("numero_serie","")) for b in sb_bombs}
print(f"Total valid serials in Supabase: {len(sb_serials)}")

missing = valid_serials - sb_serials
print(f"Missing from Supabase: {missing}")

if missing:
    import csv
    master_data = []
    seen = set()
    with open('master_inventory_bombs_clean.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sn = clean(row.get('Serial', ''))
            if sn in missing and sn not in seen:
                seen.add(sn)
                placa = map_placa.get(sn, sn)
                service = row.get('Nueva_Ubicacion') or row.get('Servicio') or 'N/A'
                
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
                
    # If the CSV didn't have it (maybe it's one of the f2 ones we missed due to weird formatting in the CSV), we can provide a default
    for m in missing:
        if m not in seen:
            item = {
                    "id_unico": str(map_placa.get(m, m)),
                    "numero_serie": str(m),
                    "equipo": "BOMBA DE INFUSIÓN",
                    "marca": "ICU MEDICAL",
                    "modelo": "PLUM A+",
                    "servicio": "N/A",
                    "ubicacion": "N/A",
                    "estado": "BUENO",
                    "riesgo": "IIB",
                    "propietario": "HUSJ (COMODATO)"
            }
            master_data.append(item)

    # Upsert the missing 5
    print(f"Will insert {len(master_data)} missing items.")
    req_in = urllib.request.Request(f"{url_base}/equipments?on_conflict=id_unico", 
                                 data=json.dumps(master_data).encode("utf-8"), 
                                 headers={**headers, "Prefer": "resolution=merge-duplicates"}, 
                                 method="POST")
    with urllib.request.urlopen(req_in, context=context) as res:
        print("Inserted missing items correctly!")
