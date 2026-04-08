import pandas as pd
import urllib.request
import json
import ssl

def solve():
    # Get 431 valid serials from f1.xlsx
    df_f1 = pd.read_excel("f1.xlsx", header=None)
    valid_serials = set()
    for _, row in df_f1.iterrows():
        r = [str(v).strip().replace('.0','') for v in row]
        serials_in_row = [v for v in r if v.isdigit() and len(v) >= 7]
        if serials_in_row:
            valid_serials.add(serials_in_row[0])
            
    print(f"Valid serials in f1.xlsx: {len(valid_serials)}")

    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
    context = ssl._create_unverified_context()

    # 1. Fetch all BOMBA DE INFUSION from Supabase
    req = urllib.request.Request(f"{url_base}/equipments?equipo=eq.BOMBA%20DE%20INFUSI%C3%93N&select=id_unico,numero_serie", headers=headers)
    with urllib.request.urlopen(req, context=context) as response:
        all_bombs = json.loads(response.read().decode('utf-8'))
        
    print(f"BOMBA DE INFUSION in Supabase: {len(all_bombs)}")
    
    # 2. Identify extras
    to_delete = []
    for b in all_bombs:
        sn = b.get('numero_serie')
        if sn not in valid_serials:
            to_delete.append(b['id_unico'])
            
    print(f"To delete: {len(to_delete)}")
    
    # 3. Delete extras
    for d_id in to_delete:
        del_req = urllib.request.Request(f"{url_base}/equipments?id_unico=eq.{d_id}", headers=headers, method="DELETE")
        try:
            with urllib.request.urlopen(del_req, context=context) as response:
                pass
        except Exception as e:
            print(f"Error deleting {d_id}: {e}")
            
    print("DONE")

solve()
