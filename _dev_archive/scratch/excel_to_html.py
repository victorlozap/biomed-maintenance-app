import openpyxl
import sys

def excel_to_html(file_path, output_path):
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb.active
        html = ["<table border='1' style='border-collapse: collapse; font-family: sans-serif; font-size: 10px;'>"]
        for row in sheet.iter_rows(max_row=80):
            html.append("<tr>")
            for cell in row:
                val = str(cell.value) if cell.value else ""
                # Handle merged cells (simplified)
                # This is just for visualization
                html.append(f"<td style='padding: 2px; min-width: 20px;'>{val}</td>")
            html.append("</tr>")
        html.append("</table>")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("".join(html))
        print(f"HTML saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    excel_to_html(sys.argv[1], sys.argv[2])
