# Ingesta Automatizada de Datos y Enlace Local de Archivos (Metrología)

## Contexto
Durante la creación del módulo de **Metrología (Calibraciones)**, surgió el reto de poblar la base de datos a partir de matrices en formato Excel (ej. `BANCO DE SANGRE.xlsx`) que contenían los registros de equipos con sus fechas de calibración, además de enlazar más de 1,400 certificados en PDF almacenados localmente a dichos registros.

## Problema
- Hacer la carga manual en Supabase era inviable debido al volumen de datos y el riesgo de error humano.
- Los archivos PDF tenían nombres basados en el equipo y la serie (ej. `ASPIRADOR 544956.pdf`), lo cual no coincidía de manera exacta uno-a-uno con el ID en base de datos.

## Solución Implementada
1. **Script de Ingesta ETL (Python + Pandas)**:
   - Se creó un script (`import_calibrations.py`) usando la biblioteca `pandas` de Python para leer los Excels, sanear los datos (ignorando filas vacías o basura) y parsear/validar las fechas usando expresiones regulares para evitar errores `invalid input syntax for type date` en PostgreSQL.
   - **Autocálculo de Fechas:** Se incorporó lógica para autocalcular la fecha próxima de calibración (sumando 1 año o 6 meses según periodicidad) si el archivo de Excel omitía este dato pero proveía la fecha inicial.
   - El script consumió la API REST de Supabase, utilizando la `service_role_key` para esquivar temporalmente el RLS, limpiando primero los registros antiguos y subiendo los nuevos en lotes de 100 (*batching*).

2. **Alojamiento Local Temporal**:
   - En lugar de subir temporalmente todos los PDFs a Supabase Storage incurriendo en tiempos y costos, se movieron a la carpeta `public/certificados/2025` de Vite (frontend). Así, la aplicación puede servir estáticamente esos archivos.

3. **Fuzzy Matching para Archivos (Python)**:
   - Se diseñó un segundo script (`link_pdfs.py`) que lista los PDFs locales y realiza una comparación difusa: si el **número de serie** o el **código de equipo (activo fijo)** de la base de datos está contenido dentro del nombre del PDF, asume que hay correspondencia (*Match*). Luego hace un `PATCH` a Supabase para actualizar la columna `pdf_url`. Buscar por activo fijo elevó drásticamente el éxito del enlazamiento (del 16% al 80%).

4. **Sincronización Bidireccional**:
   - Se implementó un tercer script (`sync_calibrations_to_inventory.py`) para volcar las fechas corregidas desde el módulo de calibraciones hacia el **Inventario Maestro** (`equipments`), manteniendo una fuente única de verdad sin entrada manual duplicada.

## Lecciones Aprendidas
- **Validación Estricta de Fechas antes de Supabase:** Supabase (y PostgreSQL) son estrictos con los tipos de fecha (`date`). Los Excels pueden tener fechas seriales (ej. `46365`) o cadenas mal formateadas (ej. `179/2026`). Sanitizar estas columnas antes del payload previene el fallo del lote completo.
- **Vite Public Directory:** La carpeta `public` es excelente para servir miles de archivos estáticos de forma local rápida sin necesidad de buckets S3/Supabase en fases tempranas de desarrollo.
- **Python como navaja suiza:** Para migraciones de un solo uso o scripts de puenteo, Python con `requests` y `pandas` ofrece la mayor velocidad y flexibilidad (frente a Node.js sin TS-Node preconfigurado).

## Cuándo usar este patrón
- Cuando un cliente entrega un volcado de Excel histórico y se requiere ingestar al sistema sin dañar la integridad de los datos.
- Cuando hay una correspondencia difusa entre archivos físicos y registros de DB, resolviéndolo programáticamente mediante heurísticas (búsqueda de subcadenas).
