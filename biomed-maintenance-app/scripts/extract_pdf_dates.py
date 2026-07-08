import os
import re
import pdfplumber
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Configurar Supabase
load_dotenv()
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Credenciales de Supabase no encontradas.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Directorio de PDFs
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CERTIFICADOS_DIR = os.path.join(BASE_DIR, "Calibraciones", "2025")

def process_pdf_dates():
    print("Iniciando extracción de fechas desde PDFs...")
    
    if not os.path.exists(CERTIFICADOS_DIR):
        print(f"Error: No se encontró el directorio {CERTIFICADOS_DIR}")
        return

    # Traer calibraciones para cruzar activo_fijo
    print("Cargando Calibraciones...")
    calibrations_by_codigo = {}
    page = 0
    page_size = 1000
    while True:
        resp = supabase.table('calibrations').select('id, codigo_equipo').range(page * page_size, (page + 1) * page_size - 1).execute()
        data = resp.data
        if not data:
            break
        for cal in data:
            if cal.get('codigo_equipo'):
                calibrations_by_codigo[str(cal['codigo_equipo']).strip()] = cal['id']
        if len(data) < page_size:
            break
        page += 1

    print("Cargando Inventario...")
    equipments_by_codigo = {}
    page = 0
    while True:
        resp = supabase.table('equipments').select('id, id_unico').range(page * page_size, (page + 1) * page_size - 1).execute()
        data = resp.data
        if not data:
            break
        for eq in data:
            if eq.get('id_unico'):
                equipments_by_codigo[str(eq['id_unico']).strip()] = eq['id']
        if len(data) < page_size:
            break
        page += 1

    pdfs = [f for f in os.listdir(CERTIFICADOS_DIR) if f.lower().endswith('.pdf')]
    print(f"Encontrados {len(pdfs)} archivos PDF.")

    updated_count = 0
    not_found_dates = 0

    for idx, filename in enumerate(pdfs):
        if idx > 0 and idx % 50 == 0:
            print(f"Procesados {idx} PDFs...")

        match_activo = re.search(r'\b\d{5,7}\b', filename)
        if not match_activo:
            continue
        activo_fijo = match_activo.group(0).strip()

        pdf_path = os.path.join(CERTIFICADOS_DIR, filename)
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for p in pdf.pages:
                    text += p.extract_text() + "\n"
            
            # Buscar fecha
            match_date = re.search(r"Fecha Calibraci[oó]n:\s*([0-9-]{10})", text, re.IGNORECASE)
            if match_date:
                cal_date_str = match_date.group(1)
                try:
                    cal_date = datetime.strptime(cal_date_str, "%Y-%m-%d")
                    next_cal_date = cal_date + timedelta(days=365) # Asumimos 1 año

                    cal_date_formatted = cal_date.strftime("%Y-%m-%d")
                    next_cal_date_formatted = next_cal_date.strftime("%Y-%m-%d")

                    # Update calibrations
                    if activo_fijo in calibrations_by_codigo:
                        cal_id = calibrations_by_codigo[activo_fijo]
                        supabase.table('calibrations').update({
                            'fecha_calibracion': cal_date_formatted,
                            'fecha_proxima_calibracion': next_cal_date_formatted
                        }).eq('id', cal_id).execute()

                    # Update equipments
                    if activo_fijo in equipments_by_codigo:
                        eq_id = equipments_by_codigo[activo_fijo]
                        supabase.table('equipments').update({
                            'fecha_calibracion': cal_date_formatted,
                            'fecha_vencimiento_calibracion': next_cal_date_formatted
                        }).eq('id', eq_id).execute()

                    updated_count += 1
                except ValueError:
                    pass
            else:
                not_found_dates += 1
        except Exception as e:
            print(f"Error procesando {filename}: {e}")

    print("=========================================")
    print("RESUMEN DE EXTRACCIÓN Y ACTUALIZACIÓN:")
    print(f"Equipos actualizados: {updated_count}")
    print(f"PDFs sin fecha encontrada: {not_found_dates}")
    print("=========================================")

if __name__ == "__main__":
    process_pdf_dates()
