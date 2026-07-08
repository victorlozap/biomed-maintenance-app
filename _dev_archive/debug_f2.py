import pandas as pd
f2 = "f2.xlsx"
df2 = pd.read_excel(f2, sheet_name="inventario", skiprows=18)
print(f"Columns: {df2.columns.tolist()}")
print(df2.head())

# Check for a specific serial
target = "17950741"
match = df2[df2.iloc[:, 3].astype(str).str.contains(target)]
print(f"Match for {target}:")
print(match)
