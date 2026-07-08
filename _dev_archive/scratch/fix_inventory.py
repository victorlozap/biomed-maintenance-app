import os

file_path = r'd:\VICTOR LOPEZ\CLAUDE CODE\prueba\biomed-maintenance-app\src\pages\Inventory.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dynamic import logic with static one
old_code = """                                      try {
                                        const { generateCorrectivePDF } = await import('../utils/pdfCorrectiveGenerator');
                                        await generateCorrectivePDF(item.raw, selectedEquipment, user?.email || '');
                                      } catch (err: any) {
                                        console.error('Error generando PDF:', err);
                                        alert('Error al generar PDF');
                                      }"""

new_code = """                                      try {
                                        await generateCorrectivePDF(item.raw, selectedEquipment, user?.email || '');
                                      } catch (err: any) {
                                        console.error('Error generando PDF:', err);
                                        alert('Error al generar PDF: ' + (err.message || 'Error desconocido'));
                                      }"""

# Since spacing might be tricky, let's use a more robust replacement
if "const { generateCorrectivePDF } = await import('../utils/pdfCorrectiveGenerator');" in content:
    content = content.replace("const { generateCorrectivePDF } = await import('../utils/pdfCorrectiveGenerator');", "")
    content = content.replace("alert('Error al generar PDF');", "alert('Error al generar PDF: ' + (err.message || 'Error desconocido'));")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replacement successful via python script")
else:
    print("Could not find target string in file")
