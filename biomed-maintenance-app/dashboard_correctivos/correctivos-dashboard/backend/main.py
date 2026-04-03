from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
import traceback

APP = FastAPI(title="API Correctivos HUSJ - Marzo 2026")

APP.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

XLSX_PATH = Path("D:/VICTOR LOPEZ/2. TRABAJO/3. HUSJ PEREIRA/DASHBOARDS HUSJ/dashboard_correctivos/correctivos-dashboard/backend/data/MARZO 2026.xlsx")
SHEET = "MARZO"

def load_marzo():
    """Lee la hoja MARZO directamente — sin buscar tablas ni escanear"""
    df = pd.read_excel(XLSX_PATH, sheet_name=SHEET)
    # Limpiar nombres de columnas (quitar espacios extra)
    df.columns = [str(c).strip() for c in df.columns]
    # Eliminar filas sin No. REPORTE
    col_id = [c for c in df.columns if "REPORTE" in c.upper()][0]
    df = df[pd.to_numeric(df[col_id], errors="coerce").notnull()].copy()
    df[col_id] = df[col_id].astype(int)
    print(f"LOG: {len(df)} registros cargados de hoja '{SHEET}'")
    return df, col_id

def safe(val):
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return "N/A"
    return str(val).strip()

def col(df, *keywords):
    """Encuentra columna por keyword parcial"""
    for c in df.columns:
        cu = str(c).upper()
        for kw in keywords:
            if kw.upper() in cu:
                return c
    return None

@APP.get("/api/correctivos")
def get_correctivos(periodo: str = "2026-03"):
    try:
        df, col_id = load_marzo()

        # Mapeo exacto basado en diagnóstico
        C_FECHA    = col(df, "FECHA CREACI")
        C_EQUIPO   = col(df, "EQUIPO")
        C_SERVICIO = col(df, "SERVICIO")
        C_UBIC     = col(df, "UBICACI")
        C_CAUSA    = col(df, "CAUSA")
        C_ESTADO   = col(df, "ESTADO")           # col 28: ESTADO
        C_GMA      = col(df, "ESTADO EN GMA")    # col 13: ESTADO EN GMA SOPORTE
        C_TECNICO  = col(df, "EJECUTADO")
        C_SLA      = col(df, "Capacidad_Respuesta", "CAPACIDAD")
        C_ESTADO_EQ = col(df, "ESTADO DEL EQUIPO")

        # Para C_ESTADO, necesitamos la columna 28, no la 13
        # Si 'ESTADO' matcheó con 'ESTADO EN GMA SOPORTE' (col 13), buscar la otra
        estados_cols = [c for c in df.columns if "ESTADO" in str(c).upper()]
        # La columna correcta de estado es la que NO tiene "GMA" ni "EQUIPO"
        C_ESTADO = next((c for c in estados_cols if "GMA" not in str(c).upper() and "EQUIPO" not in str(c).upper()), C_ESTADO)
        C_GMA = next((c for c in estados_cols if "GMA" in str(c).upper()), None)

        print(f"LOG: ESTADO='{C_ESTADO}', GMA='{C_GMA}', SLA='{C_SLA}'")

        out = []
        for _, r in df.iterrows():
            equipo = safe(r.get(C_EQUIPO))
            if equipo == "N/A": continue

            # Estado normalizado — basado en columna GMA (col N) como fuente autoritativa
            gma_raw = safe(r.get(C_GMA)).upper() if C_GMA else ""
            if "PTE POR CONFIRMAR" in gma_raw or "CONFIRMAR" in gma_raw:
                estado_norm = "CERRADO"
            elif "TRABAJANDO" in gma_raw:
                estado_norm = "TRABAJANDO"
            elif gma_raw in ["N/A", ""]:
                # Fallback a columna ESTADO solo si GMA está vacía
                estado_raw = safe(r.get(C_ESTADO)).upper()
                if "CERRADO" in estado_raw:
                    estado_norm = "CERRADO"
                elif "TRABAJANDO" in estado_raw:
                    estado_norm = "TRABAJANDO"
                else:
                    estado_norm = "PENDIENTE"
            else:
                estado_norm = "PENDIENTE"

            # SLA
            sla_raw = r.get(C_SLA) if C_SLA else None
            sla = 0
            if pd.notna(sla_raw):
                s = str(sla_raw).upper().strip()
                if s in ["TRUE", "VERDADERO", "1", "SI", "SÍ"]:
                    sla = 1

            # Fecha
            fecha_raw = r.get(C_FECHA) if C_FECHA else None
            if pd.notna(fecha_raw):
                try:
                    fecha = pd.Timestamp(fecha_raw).strftime("%Y-%m-%d")
                except:
                    fecha = str(fecha_raw)
            else:
                fecha = "N/A"

            out.append({
                "id": int(r[col_id]),
                "fechaCreacion": fecha,
                "equipo": equipo,
                "servicio": safe(r.get(C_SERVICIO)),
                "ubicacion": safe(r.get(C_UBIC)),
                "causa": safe(r.get(C_CAUSA)),
                "estado": safe(r.get(C_ESTADO)),
                "estadoNorm": estado_norm,
                "tecnico": safe(r.get(C_TECNICO)),
                "capacidadLt3Dias": sla,
                "estadoEquipo": safe(r.get(C_ESTADO_EQ)) if C_ESTADO_EQ else "N/A",
            })

        print(f"LOG: Enviando {len(out)} registros.")
        return out

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@APP.get("/api/kpis")
def get_kpis(periodo: str = "2026-03"):
    data = get_correctivos(periodo)
    if isinstance(data, dict):
        return {"total": 0, "cerrados": 0, "abiertos": 0, "slaPct": 0, "topEquipo": {"name": None, "count": 0}}

    total = len(data)
    cerrados = sum(1 for x in data if x["estadoNorm"] == "CERRADO")
    sla_ok = sum(1 for x in data if x["capacidadLt3Dias"] == 1)

    counts = {}
    for d in data:
        counts[d["equipo"]] = counts.get(d["equipo"], 0) + 1
    top_eq = max(counts, key=counts.get) if counts else "N/A"

    return {
        "total": total,
        "cerrados": cerrados,
        "abiertos": total - cerrados,
        "slaPct": round((sla_ok / total) * 100) if total else 0,
        "cumplimiento": round((cerrados / total) * 100) if total else 0,
        "topEquipo": {"name": top_eq, "count": counts.get(top_eq, 0)}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(APP, host="127.0.0.1", port=8000)
