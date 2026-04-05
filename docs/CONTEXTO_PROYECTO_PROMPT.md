# 🏥 BioMed HUSJ: Contexto y Prompt de Desarrollo

> [!IMPORTANT]
> **PROMPT DE CONTEXTUALIZACIÓN RÁPIDA (Copia y pega esto al iniciar un nuevo chat):**
> 
> "Estoy desarrollando un sistema de **Mantenimiento Biomédico Móvil** para el **Hospital Universitario San Jorge (HUSJ)**.
> He establecido una documentación rigurosa que debes leer antes de empezar:
> 1. Lee la **`BITACORA_DESARROLLO.md`** para entender los hitos técnicos alcanzados (Inventario, Rondas de Cirugía, Supabase Storage, etc.).
> 2. Lee las **`INSTRUCCIONES_AGENTE.md`** para conocer las reglas de flujo de trabajo (NO commits automáticos, actualizar bitácora antes de cada commit, etc.).
> 
> Por favor, una vez leída esta información, actúa como el asistente experto del proyecto respetando todas las normas establecidas y el stack tecnológico (React, TypeScript, Tailwind, Supabase)."

---

## 🎯 Objetivo General del Proyecto
Crear una aplicación web móvil (*Mobile-First*) de alto rendimiento para el **Hospital Universitario San Jorge**, diseñada para que los ingenieros biomédicos gestionen en tiempo real:
- **Inventario:** Identificación técnica, fotos de activos y edición dinámica.
- **Rondas de Cirugía:** Listas de chequeo para quirófanos (Acordeón UX).
- **Mantenimientos:** Generación de actas en PDF siguiendo el formato institucional **GRF3MAN-FR25**.

## 🛠️ Stack Tecnológico
- **Frontend:** React + Vite + TypeScript.
- **Estilos:** Tailwind CSS (Diseño Premium Dark-Mode).
- **Backend:** Supabase (Auth, Database, Storage).
- **Reportes:** jsPDF + autoTable (Formato Oficial SENA/HUSJ).

## ⚠️ Reglas Inamovibles (Workflow)
1. **Control de Versiones:** NUNCA realizar commits automáticos. El usuario debe autorizarlos explícitamente.
2. **Documentación:** Cada cambio relevante debe ser registrado en la **`BITACORA_DESARROLLO.md`** ANTES de realizar el commit.
3. **Diseño:** Priorizar la usabilidad móvil y una estética premium (Dark Mode, Glassmorphism).
4. **Fechas:** Asegurar el tratamiento correcto de fechas provenientes de Excel (formatos seriales vs legibles).

---

## 🗂️ Archivos Clave en esta Carpeta
- `biomed-maintenance-app/`: Raíz del código fuente.
- `BITACORA_DESARROLLO.md`: Registro histórico de hitos y soluciones técnicas.
- `INSTRUCCIONES_AGENTE.md`: Reglas persistentes de comportamiento para la IA.
- `1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx`: Base de datos maestra original.
