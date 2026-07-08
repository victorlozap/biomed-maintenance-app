import pandas as pd
for file in ['ENERO 2026.xlsx', 'FEBRERO 2026.xlsx']:
    print(f"--- {file} ---")
    xls = pd.ExcelFile(f'C:\\Correctivos_Sync\\{file}')
    for sn in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sn)
        print(f"Hoja: [{sn}] cols: {df.columns.tolist()[:10]}")
