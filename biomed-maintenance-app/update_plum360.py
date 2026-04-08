import urllib.request
import urllib.parse
import json
import ssl
import os

def solve():
    url_base = "https://gzdspkhpxkibjxbfdeuc.supabase.co"
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"
    
    headers = {
        "apikey": apikey,
        "Authorization": f"Bearer {apikey}"
    }
    context = ssl._create_unverified_context()

    # 1. Upload photo to Supabase storage
    photo_path = r"d:\VICTOR LOPEZ\CLAUDE CODE\prueba\fotos_equipos\bombas_infusion\Plum_360.png"
    if os.path.exists(photo_path):
        print("Uploading photo...")
        with open(photo_path, "rb") as f:
            file_data = f.read()
        
        upload_url = f"{url_base}/storage/v1/object/equipment-images/photos/Plum_360_v2.png"
        h_upload = headers.copy()
        h_upload["Content-Type"] = "image/png"
        
        req_up = urllib.request.Request(upload_url, data=file_data, headers=h_upload, method="POST")
        try:
            with urllib.request.urlopen(req_up, context=context) as response:
                print("Photo uploaded successfully.")
        except urllib.error.HTTPError as e:
            # If 400 or already exists, we can ignore or do a PUT
            print(f"Post failed, trying PUT (overwrite): {e}")
            req_put = urllib.request.Request(upload_url, data=file_data, headers=h_upload, method="PUT")
            try:
                urllib.request.urlopen(req_put, context=context)
                print("Photo updated successfully.")
            except Exception as e2:
                print(f"Error putting photo: {e2}")

    # 2. Assign the URL and modify model for all matching equipments
    public_url = f"{url_base}/storage/v1/object/public/equipment-images/photos/Plum_360_v2.png"
    
    encoded_query = urllib.parse.quote("50400*").replace("*", "%25") # "likr" uses % for wildcard ? Wait. PostgREST `like.50400*` or `like.50400%`
    # The syntax is `numero_serie=like.50400*` where * is the wildcard in PostgREST!
    # Let's use `numero_serie=like.50400*`
    patch_url = f"{url_base}/rest/v1/equipments?numero_serie=like.50400*"
    
    payload = json.dumps({"modelo": "PLUM 360", "foto_url": public_url}).encode("utf-8")
    
    h_patch = headers.copy()
    h_patch["Content-Type"] = "application/json"
    
    print("Updating equipments with serials starting with 50400...")
    req_patch = urllib.request.Request(patch_url, data=payload, headers=h_patch, method="PATCH")
    try:
        with urllib.request.urlopen(req_patch, context=context) as response:
            print("Successfully updated equipments.")
    except Exception as e:
        print(f"Error updating DB: {e}")

solve()
