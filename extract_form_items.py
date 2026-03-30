import openpyxl
import os

file_path = 'formatos/FLUJÓMETROS - REGULADORES - VACUTRONES - GRF3MAN-FR43 VERSION 6.xlsx'
if not os.path.exists(file_path):
    print("File not found")
    exit(1)

wb = openpyxl.load_workbook(file_path, data_only=True)
sheet = wb.active

for row_idx, row in enumerate(sheet.iter_rows(values_only=True), 1):
    filtered_row = [str(x).strip() for x in row if x is not None and str(x).strip() != '']
    if filtered_row:
        print(f"Row {row_idx}: {' | '.join(filtered_row)}")
