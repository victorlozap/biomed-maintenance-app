import openpyxl
import sys

def read_excel_structure(file_path):
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb.active
        print(f"Sheet: {sheet.title}")
        for r_idx, row in enumerate(sheet.iter_rows(min_row=50, max_row=80, values_only=True), 50):
            vals = [str(cell) if cell else "" for cell in row]
            if any(vals):
                print(f"Row {r_idx}: {vals[:12]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_excel_structure(sys.argv[1])
