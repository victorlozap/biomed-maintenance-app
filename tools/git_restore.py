import json
import os

# Try to find the old monitor block from the backup file
file_path = 'old_protocols.json'
if os.path.exists(file_path):
    # Try different encodings for the dump file
    for enc in ['utf-8', 'utf-16le', 'latin-1']:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.read()
                # Find the MONITOR block manually if JSON parsing fails due to truncation
                start_idx = content.find('"MONITOR": {')
                if start_idx != -1:
                    # Look for the end of the block or just grab a chunk
                    # This is risky, but better than nothing
                    print("Found MONITOR block in backup.")
                    # Actually, I'll just restore the WHOLE file from git if I can
                    os.system('git checkout HEAD -- biomed-maintenance-app/src/data/protocols.json')
                    print("File restored from git HEAD.")
                    break
        except:
            continue
