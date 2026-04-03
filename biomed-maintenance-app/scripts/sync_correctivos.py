import os
import pandas as pd
import math
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Cargar Variables de Entorno
# 1. Configuración de Supabase
# Se han colocado las mismas credenciales que usa la app en frontend
SUPABASE_URL = "https://gzdspkhpxkibjxbfdeuc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Configuración de la Carpeta Local
SYNC_FOLDER = r"C:\Correctivos_Sync"

# Diccionario para mapear nombres de meses a números
MESES = {
    "ENERO": "01", "FEBRERO": "02", "MARZO": "03", "ABRIL": "04",
    "MAYO": "05", "JUNIO": "06", "JULIO": "07", "AGOSTO": "08",
    "SEPTIEMBRE": "09", "OCTUBRE": "10", "NOVIEMBRE": "11", "DICIEMBRE": "12"
}

def safe(val):
    """Limpia valores sucios, nan, nat, etc."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    s = str(val).strip()
    return None if s in ["", "nan", "NaT", "N/A"] else s

def find_column(df, *keywords):
    """Busca una columna en el DataFrame basándose en su nombre (parcial)."""
    for c in df.columns:
        cu = str(c).upper()
        for kw in keywords:
            if kw.upper() in cu:
                return c
    return None

def main():
    print(f"🚀 Iniciando Sincronización Automática desde: {SYNC_FOLDER}")
    
    # --- PASO A: Descargar mapeo completo de Equipos de Supabase ---
    print("📚 Descargando mapa de activos fijos de Supabase para emparejamiento...")
    eq_map = {}
    page_size = 1000
    offset = 0
    while True:
        res = supabase.table("equipments").select("id, id_unico").range(offset, offset + page_size - 1).execute()
        if not res.data:
            break
        for eq in res.data:
            if eq.get("id_unico"):
                # Guardamos como string sin espacios
                eq_map[str(eq["id_unico"]).strip()] = eq["id"]
        offset += page_size

    print(f"✅ {len(eq_map)} activos fijos enlazados en memoria.")

    # --- PASO B: Procesar cada archivo en la carpeta ---
    if not os.path.exists(SYNC_FOLDER):
        print(f"❌ La carpeta {SYNC_FOLDER} no existe.")
        return

    archivos = [f for f in os.listdir(SYNC_FOLDER) if f.endswith(".xlsx") and not f.startswith("~")]
    
    if not archivos:
        print("ℹ️ No se encontraron archivos Excel en la carpeta.")
        return

    for archivo in archivos:
        print(f"\n📄 Analizando: {archivo}")
        
        # Inferir PERIODO desde el nombre del archivo (Ej: "MARZO 2026.xlsx" -> "2026-03")
        nombre_limpio = archivo.upper().replace(".XLSX", "")
        partes = nombre_limpio.split()
        
        mes_num = "00"
        anio = "2026"  # Fallback
        
        for parte in partes:
            if parte in MESES:
                mes_num = MESES[parte]
            elif parte.isdigit() and len(parte) == 4:
                anio = parte
                
        periodo = f"{anio}-{mes_num}"
        ruta_completa = os.path.join(SYNC_FOLDER, archivo)
        
        try:
            xls = pd.ExcelFile(ruta_completa)
            df = None
            C_REPORTE = None
            
            for sheet_name in xls.sheet_names:
                sn_upper = sheet_name.upper()
                if sn_upper == "GENERALIDADES" or "FORMATO" in sn_upper:
                    continue
                
                temp_df = pd.read_excel(ruta_completa, sheet_name=sheet_name)
                temp_df.columns = [str(c).strip() for c in temp_df.columns]
                
                # Buscamos columnas clave que siempre deberían estar
                c_rep = find_column(temp_df, "REPORTE")
                c_causa = find_column(temp_df, "CAUSA")
                c_equipo = find_column(temp_df, "EQUIPO")
                
                if c_rep or (c_causa and c_equipo):
                    df = temp_df
                    # Si no encuentra C_REPORTE explícito, asume la primera columna numérica o lo reporta
                    C_REPORTE = c_rep if c_rep else temp_df.columns[0]
                    print(f"  ➜ Hoja de datos encontrada: {sheet_name}")
                    break
            
            if df is None:
                print(f"⚠️ No se encontró la hoja con datos de reportes en {archivo}. Se omite.")
                continue
            
            # Filtrar filas sin número de reporte
            df = df[pd.to_numeric(df[C_REPORTE], errors="coerce").notnull()].copy()
            # Eliminar duplicados para evitar error de Supabase (ON CONFLICT DO UPDATE)
            df.drop_duplicates(subset=[C_REPORTE], keep='last', inplace=True)
            df[C_REPORTE] = df[C_REPORTE].astype(int)
            
            # Mapear las columnas dinámicamente basándonos en cómo analizaste el fastAPI
            C_FECHA_CREA = find_column(df, "FECHA CREACI")
            C_FECHA_ATEN = find_column(df, "FECHA ATENCI")
            C_FECHA_CIER = find_column(df, "FECHA CIERRE", "FECHA DE CIERRE")
            C_EQUIPO     = find_column(df, "EQUIPO")
            C_MARCA      = find_column(df, "MARCA")
            C_MODELO     = find_column(df, "MODELO")
            C_ACTIVO     = find_column(df, "ACTIVO", "PLACA")
            C_SERVICIO   = find_column(df, "SERVICIO")
            C_UBIC       = find_column(df, "UBICACI", "LUGAR")
            C_DESC       = find_column(df, "DESCRIPCI")
            C_ACCION     = find_column(df, "ACCIÓN REALIZADA", "ACCION")
            C_CAUSA      = find_column(df, "CAUSA")
            C_TECNICO    = find_column(df, "EJECUTADO", "TECNICO")
            C_SLA        = find_column(df, "CAPACIDAD", "Respuesta")
            C_ESTADO_EQ  = find_column(df, "ESTADO DEL EQUIPO", "STATUS")
            C_SERIE      = find_column(df, "SERIE")
            C_OBSERV     = find_column(df, "OBSERVACIONES")
            C_COMEN      = find_column(df, "COMENTARIOS ADICIONALES")
            
            # Detectar ESTADO VS ESTADO GMA
            estados_cols = [c for c in df.columns if "ESTADO" in str(c).upper()]
            C_ESTADO = next((c for c in estados_cols if "GMA" not in str(c).upper() and "EQUIPO" not in str(c).upper()), None)
            C_GMA    = next((c for c in estados_cols if "GMA" in str(c).upper()), None)
            
            total_filas = len(df)
            registros_batch = []
            
            for _, r in df.iterrows():
                no_reporte = int(r[C_REPORTE])
                
                # Resolviendo Fechas
                def parse_date(col_name):
                    val = r.get(col_name) if col_name else None
                    if pd.notna(val):
                        try:
                            return pd.Timestamp(val).strftime("%Y-%m-%d")
                        except: pass
                    return None

                fecha_crea = parse_date(C_FECHA_CREA)
                fecha_atencion = parse_date(C_FECHA_ATEN)
                fecha_cierre = parse_date(C_FECHA_CIER)
                
                # Resolviendo Activo Fijo y UUID Relacional (equipment_id)
                activo_fijo = safe(r.get(C_ACTIVO))
                equipment_id = None
                
                if activo_fijo:
                    # Limpiamos ceros a la izquierda o decimales si es necesario para el cruce
                    activo_str = str(activo_fijo).split('.')[0].strip()
                    equipment_id = eq_map.get(activo_str)

                # Lógica de Normalización de Estado
                gma_raw = safe(r.get(C_GMA)).upper() if safe(r.get(C_GMA)) else ""
                estado_raw = safe(r.get(C_ESTADO)).upper() if safe(r.get(C_ESTADO)) else ""
                
                estado_norm = "PENDIENTE"
                
                # Reportes Cerrados según requerimiento HUSJ:
                # "CERRADO", "PTE POR CONFIRMAR", "CONFIRMADO"
                if any(x in gma_raw or x in estado_raw for x in ["CERRADO", "CONFIRMADO", "PTE POR CONFIRMAR", "CONFIRMAR"]):
                    estado_norm = "CERRADO"
                elif "TRABAJANDO" in gma_raw or "TRABAJANDO" in estado_raw:
                    estado_norm = "TRABAJANDO"

                # Parseo de SLA (Boolean)
                sla_raw = r.get(C_SLA) if C_SLA else None
                capacidad_sla = None
                if pd.notna(sla_raw):
                    s = str(sla_raw).upper().strip()
                    if s in ["TRUE", "VERDADERO", "1", "SI", "SÍ", "1.0"]:
                        capacidad_sla = True
                    elif s in ["FALSE", "FALSO", "0", "NO", "0.0"]:
                        capacidad_sla = False

                rec = {
                    "no_reporte": no_reporte,
                    "periodo": periodo,
                    "fecha_creacion": fecha_crea,
                    "fecha_atencion": fecha_atencion,
                    "fecha_cierre": fecha_cierre,
                    "equipo": safe(r.get(C_EQUIPO)),
                    "marca": safe(r.get(C_MARCA)),
                    "modelo": safe(r.get(C_MODELO)),
                    "activo_fijo": activo_fijo,
                    "equipment_id": equipment_id,  # EL ENLACE RELACIONAL
                    "servicio": safe(r.get(C_SERVICIO)),
                    "ubicacion": safe(r.get(C_UBIC)),
                    "descripcion": safe(r.get(C_DESC)),
                    "accion": safe(r.get(C_ACCION)),
                    "tecnico": safe(r.get(C_TECNICO)),
                    "estado": safe(r.get(C_ESTADO)),
                    "estado_gma": safe(r.get(C_GMA)),
                    "estado_equipo": safe(r.get(C_ESTADO_EQ)),
                    "estado_norm": estado_norm,
                    "causa": safe(r.get(C_CAUSA)),
                    "capacidad_respuesta": capacidad_sla,
                    "serie": safe(r.get(C_SERIE)),
                    "observaciones": safe(r.get(C_OBSERV)),
                    "comentarios": safe(r.get(C_COMEN))
                }
                
                registros_batch.append(rec)
            
            if registros_batch:
                # Subir en bloques de 1000 para no sobrecargar el servidor
                batch_size = 500
                print(f"⬆️ Subiendo {len(registros_batch)} registros para {periodo}...")
                
                for i in range(0, len(registros_batch), batch_size):
                    chunk = registros_batch[i:i + batch_size]
                    try:
                        # Aquí hacemos UPSERT!
                        res = supabase.table("correctivos_husj").upsert(chunk).execute()
                        print(f"  ➜ Lote {i//batch_size + 1} completado.")
                    except Exception as e:
                        print(f"ERROR SUPABASE: {e}")
                        open("sync_errors.txt", "a").write(str(e) + "\n")
                    
        except Exception as e:
            print(f"❌ Error procesando {archivo}: {e}")

    print("\n✅ SINCRONIZACIÓN FINALIZADA CON ÉXITO")

if __name__ == "__main__":
    main()
