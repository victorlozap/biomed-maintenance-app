# 📚 Conceptos de Ingeniería: Fuente Única de Verdad (Single Source of Truth) y Consolidación de Inventario Maestro

**Fecha de registro:** 26 de Noviembre de 2026  
**Contexto:** Gobierno de datos, prevención de desincronización (Data Drift) y consolidación del Inventario Maestro del HUSJ.

---

## ¿Qué es la Fuente Única de Verdad (Single Source of Truth - SSOT)?

En arquitectura de software y gestión de datos, el principio de **Single Source of Truth (SSOT)** establece que cada elemento de información debe existir en **un único lugar oficial y canónico**. Cualquier otro módulo, servicio, reporte o usuario que requiera ese dato debe consultarlo o sincronizarse desde esa fuente única, jamás desde copias duplicadas.

Cuando un proyecto crece de forma orgánica sin una estricta política de SSOT, ocurre un fenómeno conocido como **Data Drift (Desvío de Datos)** o **Fractura de Integridad**:
* Se sacan copias locales del archivo de inventario en distintas carpetas (`data/`, `formatos/`, `Mantenimientos/`) para resolver necesidades puntuales.
* Con el paso de los meses, alguien actualiza una copia (por ejemplo, agregando 1.700 equipos nuevos en 2026), mientras las otras 3 copias quedan congeladas en 2025.
* En ese punto, el sistema entra en un estado de **inconsistencia silenciosa**: si un script o un ingeniero toma por error la copia de `Mantenimientos/`, sincronizará una base de datos con 1.500 equipos faltantes, destruyendo datos actualizados sin emitir ninguna alerta visible de error.

---

## 🏥 Analogía Hospitalaria

Imaginate la **Historia Clínica Única del Paciente**.

Si un paciente ingresa por Urgencias, el médico de turno le receta un antibiótico específico y anota su alergia a la penicilina. 
¿Qué pasaría si en lugar de un único expediente digital centralizado, existieran tres fotocopias de la historia clínica repartidas por el hospital: una en Urgencias, otra en Hospitalización del 4° Piso y otra en Farmacia?

1. El médico de Urgencias anota la dosis y la alergia en su copia.
2. Trasladan al paciente al 4° Piso. La enfermera de piso revisa la copia vieja que había allí, donde **no figura la alergia** ni la última dosis administrada.
3. El resultado clínico es catastrófico: riesgo de sobredosis o shock anafiláctico por suministrar un medicamento contraindicado.

En ingeniería biomédica hospitalaria ocurre exactamente lo mismo:
* El archivo maestro `1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025-2026.xlsx` es la **Historia Clínica Oficial de los Equipos**.
* Si dejamos copias viejas de 2025 en `formatos/` o `Mantenimientos/`, cualquiera que genere un cronograma o sincronice la base de datos va a "medicar" o programar mantenimientos basándose en un historial incompleto o erróneo.

---

## 🛠 Justificación Técnica de la Decisión

1. **Principio DRY (Don't Repeat Yourself) a Nivel de Datos**:
   Al eliminar las 3 copias divergentes y dejar un único archivo maestro en `biomed-maintenance-app/1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025-2026.xlsx`, se elimina la ambigüedad operativa.
2. **Archivado con Trazabilidad Histórica**:
   Los archivos obsoletos no se borraron a ciegas; se reubicaron en `_dev_archive/inventarios_historicos_2025/` renombrados por su procedencia. Esto preserva la trazabilidad y auditoría sin contaminar el entorno de producción.
3. **Ingesta Idempotente y No Destructiva (`sync_inventory_2026.cjs`)**:
   El script sincronizador aplica el patrón **Upsert Inteligente**: antes de insertar o modificar un equipo en Supabase, extrae en memoria las fotos (`foto_url`) y certificados de calibración preexistentes para fusionarlos en el payload. Esto garantiza que una sincronización masiva nunca borre el trabajo acumulado de meses anteriores.
4. **Desacoplamiento de Rutas**:
   Se actualizaron los archivos de configuración (`automation/sync-config.json`, scripts de backend y documentación técnica) para que cualquier proceso automatizado invoque exclusivamente el script y la ruta canónica del maestro.

---

> **Nota Académica para Proyecto de Grado (SENA ADSO):**  
> *"La adopción del principio arquitectónico Single Source of Truth (SSOT) junto con políticas de Data Governance mitiga los riesgos de anomalías de modificación e inconsistencia distribuida (Data Drift). En sistemas de gestión hospitalaria de criticidad media-alta, la centralización de los artefactos maestros y la implementación de pipelines de ingesta idempotentes (Upsert) garantizan la coherencia de datos bajo los principios ACID, asegurando que los módulos de analítica, mantenimiento preventivo y hojas de vida operen sobre una única versión fidedigna de la realidad institucional."*
