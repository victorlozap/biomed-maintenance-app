import csv
import urllib.request
import json
import ssl
import pandas as pd

def clean_serial(s):
    if pd.isna(s): return None
    if isinstance(s, float):
        if s == int(s): s = int(s)
    s = str(s).strip().upper()
    if s in ["", "NAN", "NO ENCONTRADO", "BUSCAR", "SERIE", "NO IDENTIFICADO"]: return None
    if s.endswith(".0"): s = s[:-2]
    return s

def solve():
    # Get the 431 valid serials from f1.xlsx
    df1 = pd.read_excel("f1.xlsx", skiprows=1)
    serials2026 = set()
    for s in df1.iloc[:, 4].dropna():
        cs = clean_serial(s)
        if cs: serials2026.add(cs)
    for s in df1.iloc[:, 8].dropna():
        cs = clean_serial(s)
        if cs: serials2026.add(cs)
        
    print(f"Total unique serials in 2026 file: {len(serials2026)}")
    
    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co/rest/v1"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    headers = {"apikey": apikey, "Authorization": f"Bearer {apikey}", "Content-Type": "application/json"}
    context = ssl._create_unverified_context()

    # Get all BOMBA DE INFUSIÓN from Supabase
    req = urllib.request.Request(f"{url_base}/equipments?equipo=eq.BOMBA%20DE%20INFUSI%C3%93N&select=id_unico,numero_serie", headers=headers)
    with urllib.request.urlopen(req, context=context) as response:
        all_bombs = json.loads(response.read().decode('utf-8'))
        
    print(f"BOMBA DE INFUSION in Supabase currently: {len(all_bombs)}")
    
    # We want to DELETE the ones that are NOT in serials2026
    to_delete = []
    kept = 0
    for b in all_bombs:
        sn = clean_serial(b.get('numero_serie'))
        if sn not in serials2026:
            to_delete.append(b['id_unico'])
        else:
            kept += 1
            
    print(f"Keeping {kept} valid ones.")
    print(f"Need to delete {len(to_delete)} invalid ones.")
    
    # Delete them!
    for d_id in to_delete:
        del_req = urllib.request.Request(f"{url_base}/equipments?id_unico=eq.{urllib.parse.quote(d_id)}", headers=headers, method="DELETE")
        try:
            urllib.request.urlopen(del_req, context=context)
        except Exception as e:
            pass

    print("Deletion complete.")

import urllib.parse
solve()
