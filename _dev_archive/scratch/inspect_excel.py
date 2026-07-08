import pandas as pd
import json
import os

# Ruta absoluta corregida
path = r'D:\VICTOR LOPEZ\CLAUDE CODE\prueba\formatos\GRF3MAN-FR134 VERSIÓN REPORTE DE CORRECTIVO.xlsx'

if os.path.exists(path):
    try:
        df = pd.read_excel(path, header=None)
        # Tomar una muestra más grande para capturar etiquetas
        sample = df.iloc[:40, :15].fillna('').values.tolist()
        print(json.dumps({"status": "success", "sample": sample}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
else:
    print(json.dumps({"status": "error", "message": f"File not found at {path}"}))
