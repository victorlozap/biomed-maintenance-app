import pandas as pd
import os
import sys

# Set encoding for console output
# sys.stdout.reconfigure(encoding='utf-8') # Might not work on all python versions

paths = [
    r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN\Bombas Infusión 2026.xlsx",
    r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN\INVENTARIO BOMBAS DE INFUSIÓN ICU MEDICAL.xlsx",
    r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx"
]

def inspect_file(path, index):
    print(f"\n==========================================")
    print(f"FILE {index+1}: {os.path.basename(path)}")
    print(f"==========================================")
    
    if not os.path.exists(path):
        print(f"ERROR: File not found.")
        return
    
    try:
        xl = pd.ExcelFile(path)
        print(f"Sheets: {xl.sheet_names}")
        
        # Read the first sheet, first 10 rows
        df_raw = pd.read_excel(path, sheet_name=xl.sheet_names[0], header=None, nrows=15)
        print("\nRaw View (First 15 rows):")
        for i, row in df_raw.iterrows():
            print(f"Row {i:2}: {' | '.join([str(x)[:20].strip() for x in row.values])}")
            
    except Exception as e:
        print(f"Error: {e}")

for i, p in enumerate(paths):
    inspect_file(p, i)
