# 📚 Conceptos de Ingeniería: Conventional Commits

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Mejores prácticas de CI/CD y Control de Versiones.

## ¿Qué son los Conventional Commits?
Es un estándar global utilizado en la industria del desarrollo de software para estandarizar los mensajes de *commit* en sistemas de control de versiones (como Git). Su objetivo es comunicar de forma semántica la intención exacta de un cambio en el código, evitando ambigüedades y facilitando la auditoría técnica.

---

## 🛠 Los 3 Pilares Fundamentales

### 1. `feat` (Feature / Nueva Funcionalidad)
Se utiliza cuando agregamos una característica completamente nueva al sistema, la cual aporta valor directo al usuario final.
*   **Analogía Biomédica/Hospitalaria:** Adquirir e instalar un nuevo tomógrafo en una sala que estaba vacía, o agregar un módulo de capnografía a un monitor de signos vitales. El hospital antes no tenía esa capacidad clínica, ahora sí.
*   **Ejemplo Real en nuestro proyecto:** `feat: implementar drawer lateral derecho para el módulo correctivo`

### 2. `fix` (Bug Fix / Corrección de Errores)
Se usa cuando una funcionalidad del sistema ya existía, pero presentaba un fallo, error o comportamiento indeseado. Su propósito es devolver el sistema a su estado operativo esperado sin agregar cosas nuevas.
*   **Analogía Biomédica/Hospitalaria:** Realizar un mantenimiento **correctivo** puro. Por ejemplo, cambiar el sensor de flujo averiado de un ventilador mecánico o reemplazar un electrodo roto en un electrobisturí. No le estás dando al equipo una función médica nueva, simplemente lo devolvés a su estado operativo correcto.
*   **Ejemplo Real en nuestro proyecto:** `fix: corregir el crash silencioso en la generación de PDFs en entorno de Vercel`

### 3. `refactor` (Refactorización / Reestructuración Interna)
*La marca de un desarrollador Senior.* Consiste en modificar el código fuente para mejorar su estructura, legibilidad, rendimiento o mantenibilidad **SIN alterar en absoluto su comportamiento externo**. El usuario no nota diferencias visuales ni operativas.
*   **Analogía Biomédica/Hospitalaria:** Reemplazar la placa madre o el cableado interno de una bomba de infusión por repuestos más modernos y ordenados. Para la enfermera, la bomba se programa exactamente igual y la pantalla no cambia en absoluto. Pero para vos (el biomédico), el equipo ahora no se sobrecalienta, los cables no hacen corto, y la máquina es infinitamente más segura y fácil de mantener a futuro.
*   **Ejemplo Real en nuestro proyecto:** `refactor: extraer lógica de compensación UTC a un archivo utilitario independiente`

---

## 📌 Etiquetas Secundarias (Bonus)

*   **`docs`**: Modificaciones exclusivas en archivos de documentación técnica (README, Bitácoras, manuales).
    *   *Ejemplo:* `docs: actualizar bitácora de desarrollo con los retos de producción en Vercel`
*   **`chore`**: Tareas de mantenimiento, actualización de librerías o configuración de herramientas internas (linters, bundlers) que no afectan el código de la aplicación.
    *   *Ejemplo:* `chore: actualizar dependencias a la versión más reciente`

---

> **Nota Académica para Proyecto de Grado:**
> La implementación de *Conventional Commits* garantiza la **Trazabilidad Forense y Semántica** del proyecto, permitiendo localizar el punto exacto de inserción de un error y habilitando la ejecución de *Rollbacks* (reversiones) quirúrgicos en arquitecturas CI/CD sin afectar funciones paralelas.
