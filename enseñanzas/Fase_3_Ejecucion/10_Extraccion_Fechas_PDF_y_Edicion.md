# Extracción Automática de Datos desde PDFs y Sincronización Bidireccional

## Contexto del Problema
Tras la ingesta masiva de 1,400 certificados de calibración en PDF, se identificó que muchos registros en la base de datos (tanto en Inventario como en Metrología) tenían fechas de calibración desactualizadas o nulas, mientras que la fecha correcta y real yacía escrita dentro del texto del documento PDF recién subido. Actualizar manualmente 1,400 registros para leer y escribir una fecha era ineficiente y propenso a errores.

## Solución Híbrida: Automatización + Control Manual

Se implementó una estrategia en dos frentes para resolver el problema de manera rápida, pero manteniendo la flexibilidad de corregir excepciones:

### 1. Extracción Automatizada (Backend - Python)
Se desarrolló un script (`extract_pdf_dates.py`) que aprovecha la biblioteca `pdfplumber` para leer y parsear el texto de todos los documentos PDF alojados en la carpeta `Calibraciones/2025/`.
- **Match de Archivos:** Se relacionó el número de activo fijo en el nombre del archivo (ej. `..._545703.pdf`) con el ID único en la base de datos.
- **Regex:** Usando expresiones regulares (`r"Fecha Calibración:\s*([0-9-]{10})"`) se extrajo la fecha de la calibración dentro de cada página del PDF.
- **Cálculo:** El sistema calcula automáticamente la fecha de próximo vencimiento sumando 1 año a la fecha extraída.
- **Sincronización:** Se actualizan ambas tablas a la vez (`calibrations` y `equipments`) para mantener la integridad de la información en todos los módulos de la aplicación.
*Resultado:* De 1,432 documentos, 852 se corrigieron automáticamente en menos de 5 minutos, ahorrando incontables horas de trabajo manual.

### 2. Edición Manual Controlada (Frontend - React)
Dado que la extracción de texto en PDFs no siempre es 100% infalible (formatos variados, proveedores con plantillas distintas), se implementó un mecanismo de rescate manual.
- Se agregó una columna "Acciones" en la tabla principal del módulo de metrología.
- Al hacer clic, se abre el componente `EditCalibrationModal.tsx`.
- Este modal permite a los usuarios con permisos modificar la fecha de la última calibración, lo cual recalcula automáticamente (+1 año) la fecha del próximo vencimiento (modificable).
- Al guardar, la actualización repercute tanto en el Inventario Maestro como en los registros históricos de calibración, manteniendo todo el ecosistema sincronizado con un solo botón.

## Lecciones Aprendidas
- **Las herramientas adecuadas para el trabajo adecuado:** Utilizar Node/TypeScript para el frontend y Python para tareas pesadas de parseo de datos y Machine Learning/Extracción de texto resulta en una arquitectura óptima.
- **Cierre del ciclo (Feedback Loop):** Toda automatización masiva debe ir acompañada de una interfaz humana que permita corregir los "edge cases" (casos atípicos) que el script no logre capturar.
- **Sincronicidad Estricta:** Al tener datos duplicados por diseño arquitectónico (para acelerar lecturas en tablas distintas), siempre se deben encapsular las actualizaciones para que toquen ambas tablas (`equipments` y `calibrations`) simultáneamente, previniendo discrepancias futuras.
