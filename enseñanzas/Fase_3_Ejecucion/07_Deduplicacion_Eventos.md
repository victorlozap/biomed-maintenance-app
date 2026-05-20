# 📚 Conceptos de Ingeniería: Deduplicación de Eventos y Consistencia en Vistas Combinadas

**Fecha de registro:** 20 de Mayo de 2026
**Contexto:** Integridad de datos en timelines y acoplamiento de tablas históricas en Supabase (React).

## ¿Qué es la Deduplicación de Eventos en Frontend y Consistencia de Datos?
Cuando diseñamos un sistema con múltiples tablas que registran facetas del mismo evento, es extremadamente común terminar con problemas de **Redundancia Visual**. 

En nuestro sistema HUSJ, cuando se genera un reporte correctivo, se insertan registros en dos tablas separadas:
1. `correctivos_husj`: El reporte formal con todo el detalle de fallas, acciones tomadas y firmas.
2. `maintenance_logs`: Un log general histórico que sirve para auditorías y KPIs mensuales rápidos.

El problema surgió en la UI de la hoja de vida del equipo (`Inventory.tsx`). Para armar el historial del equipo, se consultaban ambas tablas al mismo tiempo y se mezclaban los resultados en un único array para mostrarlos de forma cronológica. Como no existía lógica de **Deduplicación**, la aplicación mostraba el mismo evento correctivo **dos veces**: una tarjeta apuntando al reporte detallado (con número e ingeniero correcto) y otra tarjeta apuntando al log de bitácora genérico (mostrando un número de reporte `#---` porque la columna `report_id` no se poblaba al insertar en el log).

---

## 🏥 Analogía Biomédica/Hospitalaria

Imaginate la **Historia Clínica** de un paciente internado. 

Si el médico de guardia entra a la habitación, evalúa al paciente y le prescribe un medicamento, realiza dos anotaciones:
1. Llena el **Formulario de Evolución Médica** detallando el diagnóstico y el tratamiento (nuestro `correctivos_husj`).
2. Registra la orden en la **Hoja de Enfermería** para que se le administre la dosis (nuestro `maintenance_logs`).

Cuando el médico del siguiente turno viene a revisar la Historia Clínica del paciente, no quiere ver dos eventos de enfermedad separados que digan: *"Paciente tiene neumonía"* y justo encima *"Enfermería administró antibiótico para neumonía"*, haciéndole pensar que hay dos diagnósticos diferentes. El médico quiere ver un **único evento consolidado**: la evolución clínica del paciente con el medicamento asociado.

Si mostramos las dos notas como eventos aislados sin cruzarlos, corremos el riesgo de tomar malas decisiones médicas o, en nuestro caso técnico, de confundir al ingeniero biomédico haciéndole creer que se hicieron dos mantenimientos distintos o que el sistema está duplicando datos en la base.

---

## 🛠 Justificación Técnica de la Decisión

1. **Deduplicación en Capa de Presentación (Frontend deduplication):** En lugar de hacer consultas SQL complejas con `JOIN` que puedan degradar el rendimiento al mezclar esquemas tan diferentes, combinamos los listados en memoria y aplicamos un filtro basado en `Set` (utilizando `no_reporte` y `id`). Si el log histórico genérico ya tiene un reporte formal correspondiente en `correctivos_husj`, lo barremos de la UI y dejamos únicamente la versión detallada que permite descargar el PDF y editar.
2. **Normalización e Inserción Completa (Escribir todo de entrada):** Se corrigió la inserción inicial en `Corrective.tsx` para poblar explícitamente `report_id` en `maintenance_logs`. Dejar campos en `null` confiando en que "luego se actualizan" o "está dentro de un JSON" rompe la consistencia relacional y dificulta las consultas eficientes.
3. **Mapeo Robusto con Fallbacks:** En la UI mapeamos el número de reporte usando `l.report_id || l.checks?.report_no`. De esta forma garantizamos que incluso los datos históricos viejos que se insertaron sin la columna directa se muestren correctamente con su número de reporte real en vez del feo `#---`.

> **Nota Académica para Proyecto de Grado:**
> La consolidación de timelines de actividad a partir de fuentes de datos heterogéneas requiere la aplicación de algoritmos de **Desduplicación por Llave Primaria Externa (Foreign Key Deduplication)**. Esto previene las anomalías de lectura fantasma y redundancia de datos en la interfaz de usuario, garantizando el cumplimiento de los principios de diseño de UI/UX respecto a la claridad cognitiva en sistemas de soporte de decisiones clínicas.
