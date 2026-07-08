import pandas as pd
import os

f2 = "f2.xlsx"
try:
    xl = pd.ExcelFile(f2)
    df = pd.read_excel(f2, sheet_name=xl.sheet_names[0], nrows=10)
    print(f"ICU MEDICAL Sheets: {xl.sheet_names}")
    print(f"ICU MEDICAL Cols: {df.columns.tolist()}")
    for idx, row in df.head(5).iterrows():
        print(f"R{idx}: {row.tolist()}")
except Exception as e:
    print(f"Error reading local f2: {e}")
