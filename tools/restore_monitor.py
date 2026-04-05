import subprocess
import json
import os

# Get the last committed version of protocols
raw_old = subprocess.check_output(['git', 'show', 'HEAD:biomed-maintenance-app/src/data/protocols.json']).decode('utf-8')
old_data = json.loads(raw_old)

# Get current version
with open('biomed-maintenance-app/src/data/protocols.json', 'r', encoding='utf-8') as f:
    current_data = json.load(f)

# Restore ONLY MONITOR
current_data['MONITOR'] = old_data['MONITOR']

# Save back
with open('biomed-maintenance-app/src/data/protocols.json', 'w', encoding='utf-8') as f:
    json.dump(current_data, f, indent=2, ensure_ascii=False)

print("Monitor items restored from Git backup.")
