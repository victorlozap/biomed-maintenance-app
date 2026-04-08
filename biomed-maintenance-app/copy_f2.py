import shutil
import os

src = r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN\INVENTARIO BOMBAS DE INFUSIÓN ICU MEDICAL.xlsx"
dst = "f2.xlsx"

try:
    shutil.copy2(src, dst)
    print(f"Copied to {dst}")
except Exception as e:
    print(f"Error copying: {e}")
