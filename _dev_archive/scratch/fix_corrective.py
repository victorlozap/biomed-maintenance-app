import os
import re

file_path = r'd:\VICTOR LOPEZ\CLAUDE CODE\prueba\biomed-maintenance-app\src\pages\Corrective.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the useEffect with searchEq dependency
pattern = r'  useEffect\(\(\) => \{.*?\}, \[searchEq\]\);'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful via python script (re.sub)")
