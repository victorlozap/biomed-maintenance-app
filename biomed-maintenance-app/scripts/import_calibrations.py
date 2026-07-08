import pandas as pd
import requests
import json
import math
import os
from datetime import datetime

# Supabase config
SUPABASE_URL = "https://gzdspkhpxkibjxbfdeuc.supabase.co"
# Usamos la service_role key para saltar RLS en el script
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def clean_val(v):
    if pd.isna(v):
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    if isinstance(v, datetime):
        return v.strftime('%Y-%m-%d')
    if isinstance(v, str):
        v = v.strip()
        # Try to handle weird dates like "179/2026" or just ignore them
        try:
            # If it looks like a date, we could parse it, but let's just return None if it fails in PG
            # For now, let's assume strings might be invalid for Date fields if they contain slashes and aren't valid
            if '/' in v or '-' in v:
                try:
                    pd.to_datetime(v)
                    return v # Let PG try to parse if pd likes it
                except:
                    return None
        except:
            pass
        return v
    return str(v)

import re

def validate_date(d):
    if not d: return None
    d = str(d)
    if re.match(r'^\d{4}-\d{2}-\d{2}$', d):
        return d
    return None

def process_file(file_path):
    print(f"Leyendo {file_path}...")
    df = pd.read_excel(file_path, header=4)
    
    records = []
    for index, row in df.iterrows():
        eq = row.get('EQUIPO ')
        if pd.isna(eq) or "EVALUACION" in str(eq):
            continue
            
        record = {
            "equipo": clean_val(eq),
            "marca": clean_val(row.get('MARCA')),
            "modelo": clean_val(row.get('MODELO')),
            "serie": clean_val(row.get('SERIE')),
            "codigo_equipo": clean_val(row.get('CODIGO EQUIPO')),
            "servicio": clean_val(row.get('SERVICIO')) or "BANCO DE SANGRE",
            "riesgo": clean_val(row.get('RIESGO')),
            "invima": clean_val(row.get('INVIMA')),
            "periodicidad": clean_val(row.get('PERIODICIDAD')),
            "responsable": clean_val(row.get('RESPONSABLE')),
            "nro_certificado": clean_val(row.get('# Certificado ')),
            "fecha_calibracion": validate_date(clean_val(row.get('Fecha de calibracion '))),
            "fecha_proxima_calibracion": validate_date(clean_val(row.get('Fecha Proxima Calibracion ')))
        }
        
        # Auto-calcular fecha próxima si falta y tenemos la actual + periodicidad
        if record['fecha_calibracion'] and not record['fecha_proxima_calibracion'] and record['periodicidad']:
            try:
                base_date = datetime.strptime(record['fecha_calibracion'], '%Y-%m-%d')
                per_str = str(record['periodicidad']).upper()
                if 'ANUAL' in per_str or 'AO' in per_str:
                    record['fecha_proxima_calibracion'] = base_date.replace(year=base_date.year + 1).strftime('%Y-%m-%d')
                elif 'SEMESTRAL' in per_str or '6 MESES' in per_str:
                    new_month = base_date.month + 6
                    new_year = base_date.year + (1 if new_month > 12 else 0)
                    new_month = new_month if new_month <= 12 else new_month - 12
                    record['fecha_proxima_calibracion'] = base_date.replace(year=new_year, month=new_month).strftime('%Y-%m-%d')
            except Exception as e:
                pass
        
        if record['equipo']:
            if not record['servicio']:
                record['servicio'] = "BANCO DE SANGRE"
            records.append(record)

    # Limpiar tabla
    print("Borrando registros existentes de Banco de Sangre...")
    requests.delete(f"{SUPABASE_URL}/rest/v1/calibrations?servicio=eq.BANCO DE SANGRE", headers=HEADERS)
    
    # Subir a Supabase en bloques de 100
    print(f"Subiendo {len(records)} registros a Supabase...")
    
    chunk_size = 100
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/calibrations",
            headers=HEADERS,
            data=json.dumps(chunk)
        )
        if response.status_code >= 300:
            print(f"Error insertando: {response.text}")
        else:
            print(f"Insertados {i + len(chunk)}/{len(records)}")
            
    print("¡Importación completada!")

if __name__ == "__main__":
    process_file('Calibraciones/BANCO DE SANGRE.xlsx')
