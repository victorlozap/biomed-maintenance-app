import json

path = 'biomed-maintenance-app/src/data/protocols.json'
with open(path, 'rb') as f:
    content = f.read()
    # Try multiple decodings to get it clean
    for enc in ['utf-8', 'latin-1', 'utf-16le', 'cp1252']:
        try:
            data = json.loads(content.decode(enc))
            break
        except:
            continue

def clean_symbols(text):
    if not isinstance(text, str): return text
    # Replace the weird artifacts seen in screenshots
    text = text.replace('(\"d', '(\u2264').replace('!&', '\u2126').replace('!&)', '\u2126)')
    # Just in case, standard replacements
    text = text.replace('<=', '\u2264').replace('Ohms', '\u2126')
    return text

# Recurse and clean
def walk(obj):
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [walk(i) for i in obj]
    elif isinstance(obj, str):
        return clean_symbols(obj)
    else:
        return obj

cleaned_data = walk(data)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

print("Protocols cleaned with Unicode escapes.")
