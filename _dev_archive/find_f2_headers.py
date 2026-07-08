import pandas as pd
f2 = "f2.xlsx"
df = pd.read_excel(f2, sheet_name="inventario", header=None)
for i, row in df.iterrows():
    # Look for the row that contains 'SERIAL' or 'SERIAL NUMBER' or 'SERIE'
    row_vals = [str(x).upper() for x in row]
    if any("SERIAL" in x or "SERIE" in x for x in row_vals):
        print(f"HEADER FOUND at Row {i}: {row.tolist()}")
        break
