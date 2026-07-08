import sys
import os

try:
    import pypdf
except ImportError:
    import os
    os.system('pip install pypdf')
    import pypdf

reader = pypdf.PdfReader('d:/VICTOR LOPEZ/CLAUDE CODE/prueba/biomed-maintenance-app/public/formatos/formato-ronda-cirugia.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

print(text)
