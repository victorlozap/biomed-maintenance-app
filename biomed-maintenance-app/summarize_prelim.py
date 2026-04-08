import pandas as pd
import os

files = {"f1.xlsx": "Bombas 2026", "f3.xlsx": "Inventario 2025"}
summary = []

for f, name in files.items():
    if not os.path.exists(f):
        summary.append(f"{name}: [NOT COPIED]")
        continue
    
    try:
        # File 1: Skip if headers look like nan
        if f == "f1.xlsx":
            df = pd.read_excel(f, skiprows=1) # Row 0 was Model/Serial, Row 1 is data
            # Use columns by index if needed
            count = len(df.dropna(subset=[df.columns[4]])) # Serial Number column
            summary.append(f"{name}: {count} seriales encontrados")
        else:
            df = pd.read_excel(f, sheet_name="INVENTARIO HUSJ (2025)")
            count = len(df.dropna(subset=["NumeroSerie"]))
            summary.append(f"{name}: {count} seriales encontrados")
    except Exception as e:
        summary.append(f"{name}: Error {str(e)}")

with open("preliminary_summary.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(summary))
