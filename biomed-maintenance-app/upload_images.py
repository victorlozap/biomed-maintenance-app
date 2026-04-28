import urllib.request
import urllib.parse
import json
import ssl
import os

# Simple dotenv parser to avoid requiring external libraries
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if line.strip() and not line.startswith("#") and "=" in line:
                k, v = line.strip().split("=", 1)
                os.environ[k] = v.strip('"\'')

url_base = os.environ.get("SUPABASE_URL", "https://gzdspkhpxkibjxbfdeuc.supabase.co")
apikey = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not apikey:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in environment or .env file")
headers = {
    "apikey": apikey,
    "Authorization": f"Bearer {apikey}"
}
context = ssl.create_default_context()

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
