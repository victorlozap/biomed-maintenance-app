# 📑 Guía de Actualización - HUSJ Maintenance Dashboard

Esta guía contiene los comandos necesarios para sincronizar los datos de los informes de Excel (OneDrive) con la base de datos del Dashboard.

---

## 🛠 1. Mantenimientos Correctivos
Se sincronizan cada mes desde la carpeta de Correctivos.

### Comando para Abril 2026:
```powershell
python scripts/sync_correctivos.py "C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\3. CORRECTIVOS 🛠\3- Correctivos 2026\04 - Abril 2026\Abril 2026.xlsx"
```

### Comando para meses futuros (Ejemplo):
Solo debés cambiar el nombre de la carpeta y el archivo:
```powershell
python scripts/sync_correctivos.py "C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\3. CORRECTIVOS 🛠\3- Correctivos 2026\05 - Mayo 2026\Mayo 2026.xlsx"
```

---

## 📅 2. Mantenimientos Preventivos (Cronograma)
Se sincronizan desde la carpeta de Preventivos 2026 para actualizar el estado del plan anual.

### Comando para un mes específico (Ej: Abril):
```powershell
node scripts/sync_2026_real.cjs "C:\Users\victo\OneDrive - E.S.E. Hospital Universitario San Jorge de Pereira\🏣 HUSJ (METROMEDICA)\2. PREVENTIVOS\2026\4. Preventivo Abril 2026.xlsx"
```

---

## 📦 3. Inventario (Activos Fijos)
Si realizaste cambios masivos en el Inventario Maestro, usá este comando para refrescar los equipos en el sistema.

```powershell
node scripts/sync_master_complete.cjs
```
*(Asegurate de tener el archivo de Inventario actualizado en la carpeta de sincronización configurada).*

---

## 💡 Notas Importantes

- **Terminal:** Ejecutá estos comandos desde la carpeta raíz del proyecto (`biomed-maintenance-app`).
- **Nombres de Archivos:** El script de Correctivos busca palabras clave como "ABRIL" o "MAYO" en el nombre del archivo para asignar el periodo automáticamente.
- **Errores comunes:** Si el comando falla por "archivo no encontrado", verificá que el nombre del archivo en OneDrive coincida exactamente con el del comando.

---
**Actualizado:** 06 de Abril de 2026
