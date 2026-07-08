import pandas as pd
import warnings
warnings.simplefilter('ignore')

xls = pd.ExcelFile('C:\\Correctivos_Sync\\ENERO 2026.xlsx')
for sn in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sn)
    
    c_rep = next((c for c in df.columns if "REPORTE" in str(c).upper()), None)
    c_causa = next((c for c in df.columns if "CAUSA" in str(c).upper()), None)
    c_equipo = next((c for c in df.columns if "EQUIPO" in str(c).upper()), None)
    
    print(f"[{sn}]")
    print(f"  Rep: {c_rep}")
    print(f"  Causa: {c_causa}")
    print(f"  Equipo: {c_equipo}")
    print(df.columns.tolist()[:5])
