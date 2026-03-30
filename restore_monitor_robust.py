import json
import subprocess

def read_git_file(path):
    out = subprocess.check_output(['git', 'show', f'HEAD:{path}'])
    for enc in ['utf-8', 'latin-1', 'utf-16le', 'cp1252']:
        try:
            return json.loads(out.decode(enc))
        except:
            continue
    raise Exception("Could not decode git file")

def read_local_file(path):
    with open(path, 'rb') as f:
        content = f.read()
    for enc in ['utf-8', 'latin-1', 'utf-16le', 'cp1252']:
        try:
            return json.loads(content.decode(enc))
        except:
            continue
    raise Exception("Could not decode local file")

path = 'biomed-maintenance-app/src/data/protocols.json'
old = read_git_file(path)
curr = read_local_file(path)

curr['MONITOR'] = old['MONITOR']

with open(path, 'w', encoding='utf-8') as f:
    json.dump(curr, f, indent=2, ensure_ascii=False)

print("Monitor restored.")
