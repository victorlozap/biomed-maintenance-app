import os

file_path = r'd:\VICTOR LOPEZ\CLAUDE CODE\prueba\biomed-maintenance-app\supabase_types.ts'
if os.path.exists(file_path):
    with open(file_path, 'rb') as f:
        content = f.read()
    
    # Try to decode as UTF-16LE
    try:
        text = content.decode('utf-16le')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print("Converted to UTF-8 successfully")
    except Exception as e:
        print(f"Failed to convert: {e}")
else:
    print("File not found")
