# BioMed HUSJ - Sistema de Mantenimiento Biomédico

Aplicación para la gestión y seguimiento del mantenimiento preventivo y correctivo de equipos biomédicos en el Hospital Universitario San Jorge.

## 📁 Estructura
- `/biomed-maintenance-app`: Aplicación React + Vite (Frontend).
- `/docs`: Documentación técnica y bitácoras de desarrollo.
- `/formatos`: Plantillas institucionales (GRF3MAN).
- `/scripts`: Automatización y sincronización de datos (Python/Node).

## ✨ Características Principales
- **Inventario Cloud**: Gestión de >3,000 activos con fotos y hoja de vida.
- **Mantenimiento Preventivo**: Seguimiento de cronograma y generación de actas PDF.
- **Dashboard de Correctivos**: Análisis en tiempo real de fallas, técnicos y SLAs (Q1 2026: 565 registros).
- **Sincronización Automática**: Pipeline desde Excel local (`C:\Correctivos_Sync`) a Supabase.
- **Diseño Glassmorphic**: Interfaz premium, 100% responsiva y optimizada para móvil.

## 🚀 Inicio Rápido
1. Abrir terminal en `biomed-maintenance-app`.
2. Instalar dependencias: `npm install`.
3. Iniciar desarrollo: `npm run dev`.
4. Correr sincronización (opcional): `python scripts/sync_correctivos.py`.

## 🛠️ Tecnologías
- Vite / React / TypeScript
- Vanilla CSS
- Python (para extracción de datos)
