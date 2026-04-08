import os

path = r"C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\1. INVENTARIO HUSJ 🏣\BOMBAS DE INFUSIÓN"
try:
    files = os.listdir(path)
    with open("dir_list.txt", "w", encoding="utf-8") as f:
        f.write(f"Files in {path}:\n")
        f.write("\n".join(files))
except Exception as e:
    with open("dir_list.txt", "w", encoding="utf-8") as f:
        f.write(f"Error listing {path}: {str(e)}")
