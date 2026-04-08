import pandas as pd
import numpy as np

def clean_serial(s):
    if pd.isna(s): return None
    if isinstance(s, float):
        if s == int(s): s = int(s)
    s = str(s).strip().upper()
    if s in ["", "NAN", "NO ENCONTRADO", "BUSCAR", "SERIE", "NO IDENTIFICADO"]: return None
    if s.endswith(".0"): s = s[:-2]
    return s

# 1. LOAD DATA
f1 = "f1.xlsx"
df1 = pd.read_excel(f1, skiprows=1)

# Extract only the base serials from 2026 (f1)
serials2026 = set()
for s in df1.iloc[:, 4].dropna():
    cs = clean_serial(s)
    if cs: serials2026.add(cs)
for s in df1.iloc[:, 8].dropna():
    cs = clean_serial(s)
    if cs: serials2026.add(cs)

print(f"Total unique serials in 2026 file: {len(serials2026)}")

# Load the already consolidated master from the previous step
# (Or just rebuild it to be 100% sure we only include what's in serials2026)
master_df = pd.read_csv("master_inventory_bombs_clean.csv")

# Filter
filtered_df = master_df[master_df["Serial"].isin(serials2026)].copy()

# Follow request: remove old Ubicacion, keep only Nueva_Ubicacion
filtered_df = filtered_df.drop(columns=["Ubicacion"], errors="ignore")

# Save the final target
filtered_df.to_csv("master_inventory_bombs_final_431.csv", index=False)

print(f"Final Count of Filtered Assets: {len(filtered_df)}")
if len(filtered_df) == 431:
    print("MATCH! The count is exactly 431.")
else:
    print(f"MISMATCH! Count is {len(filtered_df)}. Let's investigate.")

# Show head
print(filtered_df.head())
