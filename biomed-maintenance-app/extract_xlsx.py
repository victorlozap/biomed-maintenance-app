import pandas as pd
import sys

file_path = r"d:\VICTOR LOPEZ\CLAUDE CODE\prueba\formatos\FORMATO RONDAS DE CIRUGÍA.xlsx"
try:
    df = pd.read_excel(file_path, header=None)
    for index, row in df.iterrows():
        # Clean nan values
        r = [str(x) if pd.notna(x) else "" for x in row]
        # Only print non-empty rows
        if any(r):
            print(f"Row {index}: {' | '.join(r)}")
except Exception as e:
    print(f"Error reading excel: {e}")
