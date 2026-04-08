import pandas as pd
import os

files = {
    "f1.xlsx": "Bombas 2026",
    "f2.xlsx": "ICU Medical",
    "f3.xlsx": "Inventario 2025"
}

log = []

def log_it(msg):
    log.append(msg)
    print(msg)

for f, name in files.items():
    log_it(f"\n--- {name} ({f}) ---")
    try:
        xl = pd.ExcelFile(f)
        sheet = xl.sheet_names[0]
        if f == "f3.xlsx":
            sheet = "INVENTARIO HUSJ (2025)"
        
        # Read with no header to find where valid headers are
        df = pd.read_excel(f, sheet_name=sheet, header=None, nrows=20)
        log_it(f"Sheet: {sheet}")
        for i, row in df.iterrows():
            row_str = " | ".join([str(val)[:20].strip() for val in row.values])
            log_it(f"R{i:2}: {row_str}")
            
    except Exception as e:
        log_it(f"Error: {str(e)}")

with open("full_inspection_log.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(log))
