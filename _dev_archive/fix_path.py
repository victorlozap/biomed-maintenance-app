import os, shutil, glob

folder = r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN"
pattern = os.path.join(folder, "*ICU MEDICAL*.xlsx")
out_log = r"d:\VICTOR LOPEZ\CLAUDE CODE\prueba\biomed-maintenance-app\fix_log_v5.txt"

log = []
def log_it(m): log.append(str(m))

try:
    matches = glob.glob(pattern)
    log_it(f"Matches: {matches}")
    if matches:
        src = matches[0]
        dst = r"d:\VICTOR LOPEZ\CLAUDE CODE\prueba\biomed-maintenance-app\f2_safe.xlsx"
        shutil.copy2(src, dst)
        log_it(f"Copied {src} to {dst}")
        
        # Try reading the copied file
        df = pd.read_excel(dst, nrows=5)
        log_it("SUCCESS reading f2_safe.xlsx")
        log_it(f"Cols: {df.columns.tolist()}")
    else:
        log_it("No matches found")
except Exception as e:
    log_it(f"Error: {e}")

# Try to import pandas inside the try block to catch import errors if any (unlikely)
import pandas as pd

with open(out_log, "w", encoding="utf-8") as f: f.write("\n".join(log))
