import pandas as pd
import os

base_path = r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣"
bombas_path = os.path.join(base_path, "BOMBAS DE INFUSIÓN")

paths = [
    os.path.join(bombas_path, "Bombas Infusión 2026.xlsx"),
    os.path.join(bombas_path, "INVENTARIO BOMBAS DE INFUSIÓN ICU MEDICAL.xlsx"),
    os.path.join(base_path, "1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx")
]

log = []

def log_it(msg):
    log.append(msg)
    print(msg)

for i, p in enumerate(paths):
    log_it(f"\nFILE {i+1}: {os.path.basename(p)}")
    if not os.path.exists(p):
        log_it("  [NOT FOUND]")
        continue
    
    try:
        xl = pd.ExcelFile(p)
        log_it(f"  Sheets: {xl.sheet_names}")
        
        target_sheet = xl.sheet_names[0]
        if i == 2 and "INVENTARIO HUSJ (2025)" in xl.sheet_names:
            target_sheet = "INVENTARIO HUSJ (2025)"
            
        df = pd.read_excel(p, sheet_name=target_sheet, nrows=10)
        log_it(f"  Using Sheet: {target_sheet}")
        log_it(f"  Cols: {df.columns.tolist()}")
        # Check first 5 rows
        for idx, row in df.head(5).iterrows():
            row_str = " | ".join([str(val)[:15] for val in row.values])
            log_it(f"  R{idx}: {row_str}")
    except Exception as e:
        log_it(f"  Error: {str(e)}")

with open("inventory_log_v3.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(log))
