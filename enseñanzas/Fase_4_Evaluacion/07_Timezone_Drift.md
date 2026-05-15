# 📚 Conceptos de Ingeniería: Timezone Drift (Desfase Horario)

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Manejo de fechas en aplicaciones Web y Bases de Datos.

## ¿Qué es el Timezone Drift?
Es un error clásico y muy peligroso en el desarrollo de software donde las fechas registradas en el sistema se "desplazan" (generalmente un día hacia atrás o hacia adelante) debido a la diferencia entre el meridiano base (UTC, en Londres) y la zona horaria local donde se encuentra el usuario (en nuestro caso, Colombia que es UTC-5).

### El problema exacto que sufrimos:
Cuando en JavaScript le decíamos al sistema: *"Guarda la fecha 2026-05-15"*, el motor de código lo interpretaba automáticamente como **"2026-05-15 a la Medianoche (00:00:00) en el Meridiano Cero (UTC)"**. 
Al intentar mostrar esa misma fecha en la pantalla de un usuario en Colombia, el navegador restaba 5 horas (UTC-5) para ajustarse a la hora local.
¿El resultado? El sistema terminaba mostrando **2026-05-14 a las 19:00 horas**. La fecha se había desfasado un día entero hacia atrás.

---

## 🏥 Analogía Biomédica/Hospitalaria

Imaginate que configurás un **Monitor Holter** o un **Desfibrilador** con la fecha y hora correctas de tu hospital en Pereira. Si ocurre un paro cardíaco, el equipo registra el evento el 15 de Mayo a las 02:00 AM. 

Pero cuando conectás ese equipo a una central de monitoreo extranjera que lee los datos usando la hora de Europa (sin compensación), el sistema extranjero va a pensar que el paro cardíaco ocurrió el 14 de Mayo a las 21:00 PM. 

Si llega una auditoría clínica o un proceso legal por negligencia médica, **tu reporte no va a coincidir con el turno de enfermería**. Eso es un *Timezone Drift* en la vida real.

---

## 🛠 La Solución Arquitectónica

Para evitar esto, en la ingeniería de software implementamos dos soluciones estrictas:
1. **Compensación Explícita:** Usamos funciones que extraigan directamente la fecha en su estado UTC (Ej: `getUTCDate()`) ignorando la zona horaria de la computadora del usuario.
2. **Almacenamiento Estándar:** Las fechas se guardan siempre de forma estandarizada en la nube (ISO 8601) y solo se "traducen" a la hora local en la capa visual (Frontend) al momento exacto en el que el usuario va a leerlas.

> **Nota Académica para Proyecto de Grado:**
> El control riguroso de *Timezones* es un requerimiento no funcional de seguridad de la información. Asegura la **Trazabilidad Cronológica** de las bitácoras de mantenimiento, garantizando que los informes generados por la aplicación posean plena validez probatoria ante auditorías de entidades de salud (Secretaría de Salud, INVIMA).
