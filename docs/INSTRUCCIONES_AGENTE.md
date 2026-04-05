# 🤖 Instrucciones para el Agente (Antigravity)

Este archivo contiene las reglas de oro y flujo de trabajo preferido por el usuario. **DEBE ser leído al inicio de cada nueva sesión.**

## 📥 Flujo de Control de Versiones (Git)
- **NO realizar commits automáticos:** El agente no debe ejecutar `git commit` ni `git push` por iniciativa propia tras cada cambio.
- **Commits a petición:** Solo se realizarán commits cuando el usuario lo solicite explícitamente (ej: "has el commit" o "sube los cambios").
- **Agrupación de cambios:** El objetivo es reducir la saturación del historial de GitHub, agrupando múltiples mejoras en un solo envío bajo la dirección del usuario.
- **Actualización Obligatoria de Bitácora:** Antes de realizar cualquier commit, el agente **DEBE** actualizar el archivo `BITACORA_DESARROLLO.md`. Esta documentación debe ser clara, detallada y contener todos los elementos clave (hitos, desafíos, soluciones técnicas) que sirvan de base para la sustentación final del proyecto.

## 🛠️ Estilo de Desarrollo
- **Diseño Premium:** Mantener la estética institucional (HUSJ), con efectos de vidrio (glassmorphism) y gradientes.
- **Mobile-First:** Priorizar siempre la usabilidad en dispositivos móviles antes de cerrar una tarea.
- **Base de Datos:** Los cambios deben reflejarse en las tablas de Supabase y el bucket de Storage correspondiente (`equipment-images`).

---
*Última actualización: 31 de Marzo 2026*
