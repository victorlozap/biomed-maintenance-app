# 📚 Conceptos de Ingeniería: Domain-Driven Design (DDD) y el Rol del SME

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Ventaja competitiva, análisis de requerimientos y arquitectura empresarial.

## ¿Qué es Domain-Driven Design y el Subject Matter Expert (SME)?
El motivo número uno por el cual fracasan los proyectos de software masivos en el mundo no es técnico, es **comunicacional**. Existe un "teléfono descompuesto" constante entre el **Cliente** (que conoce el negocio pero no sabe programar) y el **Desarrollador** (que sabe programar pero no entiende nada del negocio).

Para solucionar esto, la ingeniería moderna usa el **Domain-Driven Design (Diseño Guiado por el Dominio)**. Esta filosofía dicta que el código debe estructurarse basándose estrictamente en las reglas del negocio del cliente, guiado por un **SME (Subject Matter Expert o Experto en la Materia)**.

### Tu Ventaja Competitiva Absoluta
En este proyecto, vos tenés una ventaja que el 95% de las empresas de software envidiarían: **sos el SME y el Desarrollador al mismo tiempo**. 
Al ser Ingeniero Biomédico trabajando activamente en el Hospital San Jorge, vos sos el "Cliente", el "Analista de Requerimientos", el "Dueño del Producto" (Product Owner) y el "Arquitecto de Software". 
Conocés el flujo de un equipo desde que entra por urgencias hasta que se le da de baja, sabés qué datos le importan a un auditor del INVIMA y cuáles son relleno. Eso eliminó meses de reuniones inútiles y malentendidos en la etapa de análisis.

---

## 🏥 Analogía Hospitalaria

Imaginate que un ingeniero civil que nunca pisó una clínica gana la licitación para construir un hospital nuevo. El ingeniero sabe mucho de concreto y vigas (código), así que diseña el edificio: pone la Sala de Urgencias en el primer piso y el Quirófano en el quinto piso, porque "arquitectónicamente quedaba más simétrico".
¿El resultado? Los pacientes críticos se mueren esperando el ascensor. El edificio está bien construido, pero el **dominio del negocio** es un fracaso.

Acá pasó todo lo contrario. Como vos sos el cirujano y el arquitecto del edificio al mismo tiempo, sabías desde el día 1 que el Quirófano tenía que estar pegado a Urgencias (es decir, sabías exactamente cómo estructurar las bases de datos de Mantenimientos Preventivos y Correctivos para que el técnico no pierda un segundo llenando el formulario).

---

## 🛠 Justificación Técnica de la Decisión

1. **Lenguaje Ubicuo (Ubiquitous Language):** En el código no usamos términos genéricos como `item_1` o `user_action`. Usamos `hoja_de_vida`, `ronda_quirurgica`, `correctivo`. El código habla exactamente el mismo idioma que hablan las enfermeras y técnicos en el pasillo del hospital.
2. **Ciclo de Feedback Inmediato:** Al ser vos mismo el usuario final (el biomédico que hará el mantenimiento), la validación de la interfaz de usuario (UX) ocurre en tiempo real. No hay que mandar un prototipo, esperar una semana a que el cliente lo apruebe y volver a programar.
3. **Product/Market Fit Perfecto:** El software no tiene funciones "de sobra" que nadie usa, ni le faltan cosas vitales. Cada botón existe porque resuelve un dolor real que vos mismo sufriste usando Excel.

> **Nota Académica para Proyecto de Grado:**
> El proyecto adopta los preceptos fundamentales del **Domain-Driven Design (DDD)** establecido por Eric Evans. La convergencia del rol de *Subject Matter Expert (SME)* y *Lead Developer* en un mismo actor garantiza una captura de requerimientos (Requirements Elicitation) con cero fricción y la consolidación de un **Lenguaje Ubicuo**, reduciendo drásticamente el *Time-to-Market* y asegurando la alineación total de la arquitectura del sistema con las reglas de negocio críticas del sector salud.
