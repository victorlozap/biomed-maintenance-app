import urllib.request
import json
import ssl
import urllib.parse
import time

def solve():
    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
    context = ssl._create_unverified_context()

    print("Fetching BOMBA DE INFUSION...")
    req = urllib.request.Request(f"{url_base}/equipments?equipo=eq.BOMBA%20DE%20INFUSI%C3%93N&select=id_unico,numero_serie,id", headers=headers)
    with urllib.request.urlopen(req, context=context) as response:
        all_bombs = json.loads(response.read().decode('utf-8'))
        
    print(f"Total BOMBA DE INFUSIÓN in DB: {len(all_bombs)}")
    
    to_delete_uuids = set() # some might have PK 'id'
    
    # 1. Any record where id_unico ends in .0 
    for b in all_bombs:
        if str(b.get("id_unico", "")).endswith(".0") or str(b.get("numero_serie", "")).endswith(".0"):
            to_delete_uuids.add(b["id"])
            
    print(f"Items to delete (ending in .0): {len(to_delete_uuids)}")
    
    deleted = 0
    for d_id in to_delete_uuids:
        del_req = urllib.request.Request(f"{url_base}/equipments?id=eq.{d_id}", headers=headers, method="DELETE")
        try:
            urllib.request.urlopen(del_req, context=context)
            deleted += 1
        except Exception as e:
            print(f"Err deleting {d_id}: {e}")
            
    print(f"Deleted {deleted} items. Remaining BOMBAS should be {len(all_bombs) - deleted}")

solve()
