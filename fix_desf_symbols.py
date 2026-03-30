import json

path = 'biomed-maintenance-app/src/data/protocols.json'
with open(path, 'rb') as f:
    data = json.load(f)

# Fix Desfibrilador labels
for item in data['DESFIBRILADOR']['numeric_items']:
    if item['category'] == 'SEGURIDAD ELECTRICA':
        item['label'] = item['label'].replace('<=', '≤').replace('Ohms', 'Ω')

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Symbols updated in Desfibrilador.")
