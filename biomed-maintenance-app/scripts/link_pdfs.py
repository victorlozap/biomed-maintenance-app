import os
import requests
import json

SUPABASE_URL = "https://gzdspkhpxkibjxbfdeuc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def link_pdfs():
    # 1. Obtener registros de la base de datos
    print("Obteniendo registros de Supabase...")
    resp = requests.get(f"{SUPABASE_URL}/rest/v1/calibrations", headers=HEADERS)
    records = resp.json()
    
    # 2. Listar archivos PDF
    pdf_dir = "public/certificados/2025"
    if not os.path.exists(pdf_dir):
        print(f"Directorio no encontrado: {pdf_dir}")
        return
        
    pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
    print(f"Encontrados {len(pdf_files)} archivos PDF locales.")
    
    # 3. Intentar hacer match
    matches = 0
    updates = []
    
    for r in records:
        record_id = r['id']
        equipo = str(r.get('equipo', '')).upper()
        serie = str(r.get('serie', '')).upper()
        codigo_equipo = str(r.get('codigo_equipo', '')).upper()
        
        # Buscar el archivo que mejor coincida
        best_match = None
        for pdf in pdf_files:
            pdf_upper = pdf.upper()
            
            # Estrategia 1: Código de Equipo (Activo Fijo) está en el nombre
            # Esto es muy útil porque a veces los proveedores cambian el nombre del equipo, pero el código es único.
            # Verificamos que el código no esté vacío y tenga al menos 4 caracteres para evitar falsos positivos con números cortos.
            if codigo_equipo and codigo_equipo != "NONE" and codigo_equipo != "NAN" and len(codigo_equipo) >= 4:
                if codigo_equipo in pdf_upper:
                    best_match = pdf
                    break

            # Estrategia 2: Serie está en el nombre
            if serie and serie != "NONE" and serie != "NAN" and len(serie) >= 3:
                if serie in pdf_upper:
                    best_match = pdf
                    break
                
            # Estrategia 3: Si no hay serie ni activo, buscar coincidencia parcial de equipo
            if (not serie or serie == "NONE" or serie == "NAN") and (not codigo_equipo or codigo_equipo == "NONE"):
                if equipo in pdf_upper:
                    best_match = pdf
                    break
                    
        if best_match:
            pdf_url = f"/certificados/2025/{best_match}"
            
            # Actualizar en Supabase
            update_url = f"{SUPABASE_URL}/rest/v1/calibrations?id=eq.{record_id}"
            requests.patch(update_url, headers=HEADERS, json={"pdf_url": pdf_url})
            matches += 1
            print(f"Match: {equipo} {serie} -> {best_match}")
            
    print(f"Proceso completado. {matches} de {len(records)} registros actualizados con URL de PDF.")

if __name__ == "__main__":
    link_pdfs()
