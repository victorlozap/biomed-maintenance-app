# 📓 Bitácora de Desarrollo: Sistema BioMed HUSJ

Este documento registra el proceso evolutivo, los retos técnicos y las decisiones de arquitectura tomadas durante el desarrollo del sistema de gestión de mantenimiento para el Hospital Universitario San Jorge.

## 🚀 Hitos Recientes (Mayo 2026)

### 🔹 Optimización de UX y UI: Búsqueda Dinámica y Drawer (15/05/2026)
- **Reto**: La creación de mantenimientos correctivos era manual y propensa a errores de digitación de activos.
- **Solución**: Se implementó un buscador dinámico con *debouncing* de 400ms conectado a la base de datos de Supabase. Se transformó el modal centrado en un **Drawer lateral derecho** para mantener paridad visual con el módulo de preventivos.
- **Aprendizaje**: El uso de componentes laterales (Drawers) mejora la retención del contexto del usuario en aplicaciones de gestión de datos.

### 🔹 Estabilización de Producción y Generación de PDF (15/05/2026)
- **Reto**: Error silencioso "Error al generar PDF" en el entorno de Vercel, a pesar de funcionar en local.
- **Solución**: Se identificó un conflicto de *ineffective dynamic imports* en Vite. Se migró de `await import()` a importación estática del generador de PDF, eliminando fallos en la carga de chunks.
- **Desafío**: Depurar errores en producción sin acceso directo a consola (logs ciegos). Se mejoró el manejo de excepciones para mostrar detalles técnicos al usuario.

### 🔹 Gestión de Firmas y Sesiones Dinámicas (Mayo 2026)
- **Reto**: Automatizar la firma de reportes según el ingeniero que realiza la labor.
- **Solución**: Integración de lógica basada en `user.email` de Supabase Auth para inyectar automáticamente la firma (`.png`) y el nombre del técnico en el acta final.
- **Hito**: Mapeo correcto de firmas para David Ospina, Tatiana Salazar, Cristian Hurtado y Leonardo Grajales.

### 🔹 Estandarización de Fechas y Zona Horaria (Mayo 2026)
- **Reto**: Desfase de un día en las fechas al guardar/visualizar (UTC vs Local Colombia).
- **Solución**: Implementación de un protocolo estricto en `dateUtils.ts` que trata las fechas como literales de texto y fuerza el cálculo en `UTC-5`.
- **Aprendizaje**: Nunca confiar en `new Date(string)` para fechas de solo día en aplicaciones multi-zona.

## 🛠 Desafíos Técnicos Superados
1. **Sincronización de Base de Datos**: Migración de un inventario maestro de 431 equipos desde Excel a PostgreSQL (Supabase) manteniendo integridad referencial.
2. **Generación de Reportes en el Cliente**: Uso de `jsPDF` y `jsPDF-AutoTable` para maquetar formatos institucionales (GRF3MAN-FR134) de forma precisa sin depender de un servidor de impresión.
3. **Control de Versiones y Despliegue**: Implementación de un flujo de *Zero-Regression* usando `npm run build` como gatekeeper antes del push a Vercel.

## 💡 Oportunidades de Mejora (Roadmap)
- [ ] **Modo Offline-First**: Implementar Service Workers para permitir el llenado de reportes en zonas del hospital sin cobertura Wi-Fi.
- [ ] **Dashboard de Analítica**: Panel de control avanzado con PowerBI o Recharts para visualizar tendencias de fallos por marca/modelo.
- [ ] **Módulo de Metrología**: Integración de certificados de calibración vinculados a cada activo.

---
*Documentación generada por Antigravity como soporte para la Tecnología en Análisis y Desarrollo de Software.*
