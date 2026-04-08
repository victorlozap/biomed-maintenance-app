import urllib.request
import urllib.parse
import json
import ssl

url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co"
apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
headers = {
    "apikey": apikey,
    "Authorization": f"Bearer {apikey}"
}
context = ssl._create_unverified_context()

def update_db(model_pattern, photo_url):
    print(f"Updating equipments for model pattern: {model_pattern}")
    encoded_pattern = urllib.parse.quote(model_pattern)
    patch_url = f"{url_base}/rest/v1/equipments?modelo=ilike.{encoded_pattern}"
    
    payload = json.dumps({"foto_url": photo_url}).encode("utf-8")
    h = headers.copy()
    h["Content-Type"] = "application/json"
    
    req = urllib.request.Request(patch_url, data=payload, headers=h, method="PATCH")
    try:
        with urllib.request.urlopen(req, context=context) as response:
            print(f"Update call successful for {model_pattern}")
    except Exception as e:
        print(f"Error updating DB for {model_pattern}: {e}")

url_a_plus = f"{url_base}/storage/v1/object/public/equipment-images/photos/Plum_A_Plus.png"
url_360 = f"{url_base}/storage/v1/object/public/equipment-images/photos/Plum_360.png"

update_db("%PLUM A+%", url_a_plus)
update_db("%PLUM 360%", url_360)

print("DB Update finished.")
