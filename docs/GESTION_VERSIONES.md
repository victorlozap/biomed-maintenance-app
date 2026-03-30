# Guía de Gestión de Versiones y Respaldo - BioMed HUSJ

Este proyecto utiliza **Git y GitHub** para el control de versiones. Esto asegura que tu trabajo esté respaldado en la nube y puedas recuperarlo en cualquier momento.

## 1. Estructura del Respaldo
Hemos configurado el proyecto para que se guarden los archivos esenciales:
- `biomed-maintenance-app/src`: Código fuente de la aplicación.
- `docs/`: Documentación y especificaciones.
- `formatos/`: Plantillas originales.
- `scripts/`: Herramientas de extracción de datos.
- `*.xlsx`: Base de datos de inventario.

## 2. Comandos Frecuentes
Cuando hagas cambios importantes, usa estos comandos en la terminal:

1. **Guardar cambios localmente:**
   ```bash
   git add .
   git commit -m "Descripción de lo que hiciste"
   ```

2. **Subir a GitHub:**
   ```bash
   git push origin main
   ```

## 3. Recuperar el proyecto (en otra PC)
1. Instala Git y Node.js.
2. Clona el repositorio: `git clone https://github.com/victorlozap/biomed-maintenance-app.git`.
3. Entra en `biomed-maintenance-app` y ejecuta `npm install`.
4. Ejecuta `npm run dev` para iniciar.
