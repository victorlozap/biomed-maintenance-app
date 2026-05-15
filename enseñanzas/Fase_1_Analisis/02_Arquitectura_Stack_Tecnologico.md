# 📚 Conceptos de Ingeniería: Arquitectura y Stack Tecnológico

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Justificación de la arquitectura de software base del proyecto.

## ¿Por qué elegir un Stack Tecnológico específico?
En la ingeniería de software, la selección de tecnologías no se hace por moda. Se llama **Architecture Decision Record (ADR)**. Cada tecnología se elige basándose en su escalabilidad, mantenibilidad y la velocidad que le aporta al equipo de desarrollo. 

A continuación, la justificación formal de por qué seleccionamos cada componente de nuestro sistema para reemplazar los antiguos archivos de Excel.

---

### 1. React (Frontend Modular)
**Por qué lo elegimos:** React nos permite construir interfaces de usuario basadas en **componentes reutilizables**. En lugar de programar una página web gigante donde todo está enredado, programamos piezas pequeñas (botones, tarjetas, formularios) que se ensamblan.
*   **Analogía Hospitalaria:** Es exactamente igual a un **Monitor de Signos Vitales Modular**. Si se daña el módulo de Capnografía (o si queremos mejorarlo), simplemente sacamos ese módulo y ponemos uno nuevo sin tener que botar a la basura la pantalla o el módulo de ECG. Si un componente de código falla, el resto de la aplicación sigue funcionando.

### 2. Tailwind CSS (Estilos y Diseño UI)
**Por qué lo elegimos:** Es un framework de CSS "Utility-First". En vez de perder horas escribiendo código de diseño personalizado para cada pantalla, Tailwind nos da clases estandarizadas (`text-blue-500`, `p-4`) para armar interfaces *Premium* en minutos, garantizando total consistencia visual.
*   **Analogía Hospitalaria:** Es como un **Kit Quirúrgico Estandarizado**. El cirujano no tiene que forjar un bisturí nuevo cada vez que va a operar; simplemente abre la bandeja estandarizada, toma la pinza que necesita y opera rápido. Tailwind nos da las "pinzas" estandarizadas para el diseño.

### 3. Supabase / PostgreSQL (Base de Datos en la Nube)
**Por qué lo elegimos:** Los archivos Excel no son bases de datos. Supabase nos brinda una base de datos **Relacional (SQL)** ultra segura, con reglas estrictas de integridad de datos y autenticación de usuarios. Evita que existan registros duplicados y permite concurrencia (múltiples personas editando al mismo tiempo).
*   **Analogía Hospitalaria:** Pasar de Excel a Supabase es como pasar de un **Kardex de cartulina a un sistema HIS (Hospital Information System)**. Si 10 enfermeras intentan escribir en la misma cartulina al mismo tiempo, la rompen. En Supabase, 50 biomédicos pueden actualizar la hoja de vida de un equipo simultáneamente desde sus celulares sin chocar entre sí.

### 4. Vercel (Infraestructura y Despliegue CI/CD)
**Por qué lo elegimos:** Vercel automatiza todo el proceso de puesta en producción. Cada vez que hacemos un cambio en el código (un *commit*), Vercel lo detecta, lo compila y lo publica en Internet en segundos, sin tiempo de inactividad (*Zero Downtime*).
*   **Analogía Hospitalaria:** Es el equivalente al **Sistema de Planta Eléctrica UPS (Uninterruptible Power Supply)** de la Unidad de Cuidados Intensivos. Vercel garantiza que la aplicación esté 100% encendida y accesible desde cualquier parte del mundo. Si hacemos una actualización de código, el sistema cambia a la versión nueva sin que la "pantalla del monitor" se apague ni un segundo.

### 5. Node.js / Vite (Motor de Ejecución y Compilación)
**Por qué lo elegimos:** Node.js es el entorno que permite correr JavaScript a altísima velocidad, y Vite es el empaquetador que construye el proyecto en milisegundos, dándonos una experiencia de desarrollo rapidísima.
*   **Analogía Hospitalaria:** Son el **Central de Monitoreo de Telemetría** de nuestro código. Procesan y empaquetan gigabytes de datos y cientos de archivos fuente en un paquete liviano y optimizado para que el navegador del usuario no se cuelgue al cargar la aplicación.

---

> **Nota Académica para Proyecto de Grado:**
> La elección de este stack tecnológico (MERN/JAMstack moderno) responde a los principios de **Separación de Responsabilidades (SoC)** y **Alta Disponibilidad**. Al descentralizar el almacenamiento (Supabase) del procesamiento y presentación visual (Vercel/React), el sistema asegura una arquitectura tolerante a fallos, escalable horizontalmente y perfectamente alineada con los estándares modernos de desarrollo de software empresarial.
