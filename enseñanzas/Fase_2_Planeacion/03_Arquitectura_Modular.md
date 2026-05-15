# 📚 Conceptos de Ingeniería: Arquitectura Modular

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Organización estructural del código y Separación de Responsabilidades.

## ¿Qué es la Arquitectura Modular?
En el desarrollo de software amateur, las aplicaciones suelen construirse como un "Monolito" (Spaghetti Code): un solo bloque gigante donde todas las funciones están mezcladas. En un monolito, si modificás un botón en la vista de perfil, podés romper accidentalmente el sistema de facturación.

Para evadir ese riesgo, diseñamos el dashboard bajo una **Arquitectura Modular basada en Dominios**. Dividimos el sistema en bloques lógicos independientes:
1. **Módulo de Inventarios** (Gestión de Activos Fijos).
2. **Módulo Preventivo** (Cronograma y protocolos FR).
3. **Módulo Correctivo** (Trazabilidad de averías y hoja de ruta).
4. **Módulo de Rondas Quirúrgicas** (Verificación diaria de salas).

---

## 🏥 Analogía Hospitalaria

Imaginate la infraestructura física del Hospital San Jorge. La gerencia no pone las mesas de cirugía en el medio de la sala de espera de Urgencias, ni guarda los medicamentos de control en el cuarto de máquinas. 

El hospital está lógicamente dividido en **Servicios o Pabellones (Módulos)**: UCI, Quirófanos, Urgencias, Consulta Externa. Cada pabellón tiene su espacio físico, sus reglas y su flujo de trabajo, aunque todos atiendan a la misma base de pacientes.

Si mantenimiento tiene que cerrar y remodelar el área de Quirófanos (Rondas Quirúrgicas), los obreros tapan esa zona, **pero la UCI (Inventario/Preventivos) sigue salvando vidas sin interrupción**. En el software modular ocurre exactamente lo mismo: podemos actualizar y "romper" temporalmente el código de Correctivos sin que el módulo de Inventario se caiga.

---

## 🛠 Justificación Técnica de la Decisión

Elegimos no mezclar todo por tres razones fundamentales:

1. **Aislamiento de Fallos (Fault Isolation):** Si un bug crítico (error) afecta la generación de reportes en el módulo de Rondas de Cirugía, la aplicación no colapsa por completo. El biomédico en terreno podrá seguir registrando Mantenimientos Preventivos sin enterarse de que otra sección está bajo reparación.
2. **Escalabilidad Horizontal Fácil:** Si el próximo año el Ministerio de Salud exige agregar un "Módulo de Metrología", simplemente construimos un "pabellón nuevo" y lo conectamos al menú lateral. No tenemos que desarmar el código existente para hacerle espacio.
3. **Carga Cognitiva Reducida:** Si un técnico reporta un fallo en un Correctivo, como ingeniero sabés que tenés que ir directo a la carpeta `/src/components/corrective`. No perdés tiempo buscando en 10,000 líneas de código revueltas.

> **Nota Académica para Proyecto de Grado:**
> La adopción de una Arquitectura Modular respeta el principio **SoC (Separation of Concerns - Separación de Responsabilidades)** a nivel de interfaz de usuario. Este enfoque mitiga drásticamente la deuda técnica, facilita el control de versiones en equipos multidisciplinarios (evitando *merge conflicts*) y establece una fundación arquitectónica robusta, permitiendo a la aplicación evolucionar orgánicamente sin riesgo de regresiones funcionales.
