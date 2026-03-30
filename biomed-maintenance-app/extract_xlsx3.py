import pandas as pd
file_path = r"d:\VICTOR LOPEZ\CLAUDE CODE\prueba\formatos\FORMATO RONDAS DE CIRUGÍA.xlsx"
df = pd.read_excel(file_path, header=None)
with open("excel_dump.txt", "w", encoding="utf-8") as f:
    for index, row in df.iterrows():
        # Clean nan values
        r = [str(x).replace('\n', ' ') if pd.notna(x) else "" for x in row]
        if any(r):
            f.write(f"Row {index}: {' | '.join(r)}\n")
