from pypdf import PdfReader
import json
import os

path = r'D:\VICTOR LOPEZ\CLAUDE CODE\prueba\formatos\GRF3MAN-FR134 VERSIÓN REPORTE DE CORRECTIVO.pdf'

if os.path.exists(path):
    try:
        reader = PdfReader(path)
        page = reader.pages[0]
        text = page.extract_text()
        
        # Intentar obtener información de los campos del formulario si los hay
        fields = reader.get_fields()
        
        print(json.dumps({
            "status": "success", 
            "text": text,
            "num_pages": len(reader.pages),
            "fields": str(fields)
        }))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
else:
    print(json.dumps({"status": "error", "message": f"File not found at {path}"}))
