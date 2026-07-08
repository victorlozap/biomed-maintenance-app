import pandas as pd

df = pd.read_excel('C:\\Correctivos_Sync\\ENERO 2026.xlsx', sheet_name='ENERO')
cols = df.columns.tolist()
print("COLUMNS IN ENERO SHEET:")
for c in cols:
    print(" ->", c)
