import pandas as pd
import os

paths = {
    "Bombas 2026": r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN\Bombas Infusión 2026.xlsx",
    "ICU Medical": r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN\INVENTARIO BOMBAS DE INFUSIÓN ICU MEDICAL.xlsx",
    "Inventario 2025": r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx"
}

log = []

for name, path in paths.items():
    log.append(f"\n--- {name} ---")
    if not os.path.exists(path):
        log.append(f"  [ERROR] Path not found: {path}")
        continue
    
    try:
        xl = pd.ExcelFile(path)
        sheet = xl.sheet_names[0]
        if name == "Inventario 2025" and "INVENTARIO HUSJ (2025)" in xl.sheet_names:
            sheet = "INVENTARIO HUSJ (2025)"
            
        df = pd.read_excel(path, sheet_name=sheet, header=None, nrows=10)
        log.append(f"  Sheet: {sheet}")
        log.append(f"  Total Rows: {len(pd.read_excel(path, sheet_name=sheet))}")
        for i, row in df.iterrows():
            row_str = " | ".join([str(val)[:15] for val in row.values])
            log.append(f"  R{i:2}: {row_str}")
            
    except Exception as e:
        log.append(f"  [ERROR] {str(e)}")

with open("direct_inspection_log.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(log))
