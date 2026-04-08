import pandas as pd
import os
import io

paths = [
    r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN\Bombas Infusión 2026.xlsx",
    r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN\INVENTARIO BOMBAS DE INFUSIÓN ICU MEDICAL.xlsx",
    r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx"
]

log = []

for i, p in enumerate(paths):
    log.append(f"\nFILE {i+1}: {os.path.basename(p)}")
    if not os.path.exists(p):
        log.append("  [NOT FOUND]")
        continue
    
    try:
        xl = pd.ExcelFile(p)
        sn = xl.sheet_names[0]
        df = pd.read_excel(p, sheet_name=sn, nrows=10)
        log.append(f"  Sheets: {xl.sheet_names}")
        log.append(f"  Cols: {df.columns.tolist()}")
        # Check first 5 rows
        for idx, row in df.head(5).iterrows():
            row_str = " | ".join([str(val)[:15] for val in row.values])
            log.append(f"  R{idx}: {row_str}")
    except Exception as e:
        log.append(f"  Error: {str(e)}")

# Save log as UTF-8
with open("inventory_log.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(log))
