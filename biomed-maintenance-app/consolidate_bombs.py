import pandas as pd
import numpy as np

def clean_serial(s):
    if pd.isna(s): return None
    # If it's a float like 1234.0, convert to int then string
    if isinstance(s, float):
        if s == int(s): s = int(s)
    s = str(s).strip().upper()
    if s in ["", "NAN", "NO ENCONTRADO", "BUSCAR", "SERIE", "NO IDENTIFICADO"]: return None
    # Remove trailing .0 from strings if they come from floats
    if s.endswith(".0"): s = s[:-2]
    return s

# 1. LOAD DATA
print("Loading files...")
f1 = "f1.xlsx"
df1 = pd.read_excel(f1, skiprows=1)

f2 = "f2.xlsx"
df2 = pd.read_excel(f2, sheet_name="inventario", skiprows=18)

f3 = "f3.xlsx"
df3 = pd.read_excel(f3, sheet_name="INVENTARIO HUSJ (2025)", skiprows=1)

master_data = {}

def add_to_master(serial, source, data=None):
    if not serial: return
    if serial not in master_data:
        master_data[serial] = {
            "Id_Unico": None, "Equipo": "BOMBA DE INFUSIÓN", 
            "Marca": "ICU MEDICAL", "Modelo": None, 
            "Servicio": None, "Ubicacion": None, 
            "Nueva_Ubicacion": None, "Fuentes": []
        }
    master_data[serial]["Fuentes"].append(source)
    if data:
        for k, v in data.items():
            if v and str(v).upper() not in ["NAN", "NONE", ""]:
                # Don't overwrite existing good data unless it's null
                if not master_data[serial].get(k):
                     master_data[serial][k] = v

# --- PHASE 1: COLLECT ALL ---

# From ICU Medical (F2) - Using Indices for robustness
# [0:nan, 1:nan, 2:No., 3:SERIAL, 4:MODELO, 5:UBICACION, 6:NUEVA UBICACION, 7:COLOR]
for _, row in df2.iterrows():
    s = clean_serial(row.iloc[3] if len(row) > 3 else None)
    if s:
        add_to_master(s, "ICU_MEDICAL_LIST", {
            "Modelo": row.iloc[4] if len(row) > 4 else None,
            "Ubicacion": row.iloc[5] if len(row) > 5 else None,
            "Nueva_Ubicacion": row.iloc[6] if len(row) > 6 else None
        })

# From Bombas 2026 (F1)
for _, row in df1.iterrows():
    s1 = clean_serial(row.iloc[4] if len(row) > 4 else None)
    if s1:
        add_to_master(s1, "BOMBAS_2026_MAIN", {
            "Modelo": row.iloc[3] if len(row) > 3 else None
        })
    s2 = clean_serial(row.iloc[8] if len(row) > 8 else None)
    if s2:
        add_to_master(s2, "BOMBAS_2026_PENDIENTES")

# From Inventario 2025 (F3)
for _, row in df3.iterrows():
    equipo = str(row.get("Equipo", "")).upper()
    marca = str(row.get("Marca", "")).upper()
    if "BOMBA" in equipo or "ICU" in marca:
        s = clean_serial(row.get("NumeroSerie"))
        if s:
            add_to_master(s, "INV_2025", {
                "Id_Unico": row.get("Id_Unico"),
                "Equipo": row.get("Equipo"),
                "Marca": (row.get("Marca") if row.get("Marca") else "ICU MEDICAL"),
                "Modelo": row.get("Modelo"),
                "Servicio": row.get("Servicio"),
                # Only use 2025 location if not found in ICU list
                "Ubicacion": row.get("UBICACIÓN") 
            })

# --- PHASE 2: FINAL REFINEMENT ---
final_list = []
for s, d in master_data.items():
    # Only keep ICU/PLUM related
    marca = str(d.get("Marca", "")).upper()
    modelo = str(d.get("Modelo", "")).upper()
    equipo = str(d.get("Equipo", "")).upper()
    
    is_icu = "ICU" in marca or "PLUM" in modelo or "BOMBA" in equipo
    
    if is_icu:
        d["Serial"] = s
        d["Fuentes"] = ", ".join(sorted(set(d["Fuentes"])))
        final_list.append(d)

final_df = pd.DataFrame(final_list)
final_df = final_df[["Serial", "Id_Unico", "Equipo", "Marca", "Modelo", "Servicio", "Ubicacion", "Nueva_Ubicacion", "Fuentes"]]
final_df = final_df.sort_values("Serial")
final_df.to_csv("master_inventory_bombs.csv", index=False)

print(f"\n==========================================")
print(f"CONSOLIDATION SUMMARY")
print(f"==========================================")
print(f"Total Unique Assets: {len(final_df)}")
print(f"With 2025 Metadata: {final_df['Id_Unico'].notna().sum()}")
print(f"With 'Nueva Ubicacion' (F2): {final_df['Nueva_Ubicacion'].notna().sum()}")
print(f"==========================================")
