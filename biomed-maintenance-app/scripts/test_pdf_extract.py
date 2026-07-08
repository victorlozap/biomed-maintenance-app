import pdfplumber
import re

def test_extract(pdf_path):
    print(f"Reading: {pdf_path}")
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    
    print("--- RAW TEXT ---")
    print(text)
    print("--- END RAW TEXT ---")

    # try to find "Fecha Calibración: 2025-09-18"
    match = re.search(r"Fecha Calibraci[oó]n:\s*([0-9-]{10})", text, re.IGNORECASE)
    if match:
        print(f"Found match: {match.group(1)}")
    else:
        print("No match found")
        lines = text.split("\n")
        for i, line in enumerate(lines):
            if "Fecha Calibraci" in line:
                print(f"Line {i}: {line}")

if __name__ == "__main__":
    test_extract(r"D:\VICTOR LOPEZ\CLAUDE CODE\prueba\biomed-maintenance-app\Calibraciones\2025\VACUTRÓN 545703.pdf")
