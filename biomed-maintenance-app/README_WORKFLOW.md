# 🏥 Guía de Desarrollo y Despliegue BioMed HUSJ

Esta guía explica cómo mantener y actualizar la aplicación estándar de mantenimiento biomédico sin comprometer la estabilidad de lo que ya funciona.

## 🚀 Despliegue en Vercel
Para publicar cambios en línea:
1. Asegúrate de que el proyecto esté conectado a **GitHub**.
2. Conecta tu cuenta de **Vercel** al repositorio.
3. Vercel detectará automáticamente que es un proyecto de **Vite** y lo desplegará en cada push a la rama `main`.

## 🛠 Cómo actualizar sin romper nada (Zero-Regression Workflow)
He implementado una arquitectura basada en **metadatos**, lo que permite que cada protocolo sea independiente.

### 1. Agregar un Nuevo Protocolo
Cuando necesites agregar un formato (ej: Máquina de Anestesia):
- **NO modifiques `pdfGenerator.ts`** directamente para lógica de negocio.
- Agrega la entrada en `src/data/protocols.json`.
- Define el comportamiento de diseño en la propiedad `"layout"`:
  - `forceSecondPageBeforeElectric`: Si quieres que la seguridad eléctrica empiece en una hoja nueva.
  - `forceObservationsToNextPage`: Si quieres forzar un salto de página antes de las observaciones.

### 2. Validar antes de Reportar
Antes de subir cambios (push), ejecuta localmente:
```bash
npm run build
```
Si este comando falla, Vercel no podrá desplegar la aplicación. Los errores de TypeScript te avisarán si has borrado algo que otro módulo necesitaba.

### 3. Uso de Ramas (Branches)
- **`main`**: Solo código verificado y listo para el hospital.
- **`desarrollo/nuevo-formato`**: Usa ramas separadas para trabajar en protocolos nuevos. Vercel generará una "Preview URL" para que pruebes el PDF en el navegador antes de unirlo a la rama principal.

## 📈 Arquitectura Actual (Backend con Supabase)
La aplicación ha dejado de ser "Local-First" y actualmente está **conectada en tiempo real a Supabase**, lo que proporciona:
1. **Inventario HUSJ Centralizado:** La base de 431 activos está cargada y sincronizada de manera global.
2. **Autenticación (Auth):** Acceso multiusuario. Cada ingeniero cuenta con un usuario y contraseña.
3. **Firmas Digitales Dinámicas:** Según la sesión de autenticación (`user.email`), el sistema inyecta la firma correspondiente (`firma-[nombre].png`) y el nombre del ingeniero en las actas de mantenimiento de manera automática.
4. **Fechas Estandarizadas (UTC-5):** Toda operación técnica, carga desde Excel, o edición de reportes respeta la zona horaria colombiana usando conversión de literales de texto para evitar defases e inconsistencias en la base de datos.

---
*Diseñado para la Hospital Universitario San Jorge por Antigravity (Advanced Agentic Coding).*
