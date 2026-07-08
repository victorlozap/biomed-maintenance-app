import pandas as pd

file_path = r"d:\VICTOR LOPEZ\CLAUDE CODE\prueba\formatos\FORMATO RONDAS DE CIRUGÍA.xlsx"
df = pd.read_excel(file_path, header=None)
for index, row in df.iterrows():
    # Only show cells that actually have something
    cells = [str(x).replace('\n', ' ') for x in row if pd.notna(x) and str(x).strip() != ""]
    if cells:
        print(f"Row {index}: {' | '.join(cells)}")
