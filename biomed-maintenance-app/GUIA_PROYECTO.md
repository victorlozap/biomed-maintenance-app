# 🏥 Guía del Proyecto: Sistema de Gestión de Mantenimiento BioMed HUSJ

## 📖 Descripción General
Este sistema es una aplicación web progresiva diseñada para centralizar y automatizar el ciclo de vida del mantenimiento biomédico en el Hospital Universitario San Jorge. Permite la gestión de inventario, ejecución de protocolos de mantenimiento preventivo y generación de reportes de mantenimiento correctivo bajo estándares institucionales.

## 🛠 Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite.
- **Estilizado**: Tailwind CSS (Diseño Glassmorphic y Responsive).
- **Backend (BaaS)**: Supabase (PostgreSQL, Auth, Storage).
- **Generación de Documentos**: jsPDF + jsPDF-AutoTable.
- **Despliegue**: Vercel (CI/CD integrado con GitHub).

## 🏗 Arquitectura del Software
El proyecto sigue un patrón de **Arquitectura Basada en Componentes** y una estrategia de **Datos Centralizados**:

1. **Capa de Datos (Supabase)**:
   - Tabla `equipments`: Repositorio maestro de activos con metadatos técnicos.
   - Tabla `correctivos_husj`: Registro histórico de intervenciones correctivas.
   - Tabla `maintenance_logs`: Trazabilidad de cada acción realizada sobre un activo.

2. **Capa de Lógica (Hooks & Contexts)**:
   - `AuthContext`: Gestión de sesiones y permisos de ingenieros.
   - `dateUtils`: Motor de estandarización de fechas para Colombia (UTC-5).

3. **Capa de Presentación**:
   - Módulos segregados: Inventario, Preventivos, Correctivos y Dashboard.
   - Interfaz basada en **Drawers y Modales** para una carga cognitiva reducida.

## 🚩 Desafíos y Soluciones (Análisis de Desarrollo)

### 1. El problema de la "Caja Negra" en Reportes
- **Problema**: Generar archivos PDF con diseño institucional exacto desde el navegador es complejo debido a las limitaciones de layout de jsPDF.
- **Solución**: Creación de un motor de generación (`pdfCorrectiveGenerator.ts`) que mapea objetos JSON directamente a coordenadas de PDF, permitiendo firmas dinámicas e imágenes de marca de agua.

### 2. Integridad del Inventario
- **Problema**: Datos sucios provenientes de múltiples Excels antiguos.
- **Solución**: Scripts de limpieza en Python y Node.js para sanitizar seriales, eliminar duplicados decimales (ej. `.0`) y normalizar nombres de servicios.

### 3. Sincronización en Tiempo Real
- **Problema**: Necesidad de que varios ingenieros vean los cambios al instante.
- **Solución**: Uso de las capacidades `Realtime` de Supabase para que el listado de correctivos se actualice sin necesidad de recargar la página.

## 📊 Valor Agregado para la Institución
- **Reducción de Error Humano**: Búsqueda dinámica de equipos que evita errores en seriales y placas.
- **Seguridad Forense**: Trazabilidad completa de quién, cuándo y cómo se realizó un mantenimiento.
- **Ahorro de Tiempo**: Generación automática de reportes en segundos, listos para impresión o envío digital.

---
*Este proyecto se presenta como requisito para la Tecnología en Análisis y Desarrollo de Software.*
