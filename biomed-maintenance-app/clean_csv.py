import pandas as pd
import numpy as np
import re

def is_valid_serial(s):
    if not s or pd.isna(s): return False
    s = str(s).strip()
    if s.startswith("*") or len(s) < 3: return False
    # Check if it has at least one digit (most serials do)
    if not any(char.isdigit() for char in s): return False
    return True

df = pd.read_csv("master_inventory_bombs.csv")
# Apply filtering
df = df[df["Serial"].apply(is_valid_serial)]

# Sort
df = df.sort_values("Serial")
df.to_csv("master_inventory_bombs_clean.csv", index=False)

print(f"Final Clean Assets: {len(df)}")
print(df.head(10))
