import pandas as pd
f2 = "f2.xlsx"
df = pd.read_excel(f2, sheet_name="inventario", header=None)
for i, row in df.head(30).iterrows():
    print(f"R{i}: {row.tolist()}")
