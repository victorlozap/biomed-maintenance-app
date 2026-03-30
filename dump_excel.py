import openpyxl
import sys

# Ensure UTF-8 output if printing or use a file directly
wb = openpyxl.load_workbook('formatos/FLUJÓMETROS - REGULADORES - VACUTRONES - GRF3MAN-FR43 VERSION 6.xlsx', data_only=True)
s = wb.active

with open('final_form_dump.txt', 'w', encoding='utf-8') as f:
    for r_idx in range(1, 150):
        row_data = [str(cell.value).strip() if cell.value else '' for cell in s[r_idx]]
        if any(row_data):
            f.write(f"Row {r_idx}: {' | '.join(row_data)}\n")
