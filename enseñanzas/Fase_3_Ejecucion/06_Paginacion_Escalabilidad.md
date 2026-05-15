# 📚 Conceptos de Ingeniería: Escalabilidad de Datos y Paginación

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Rendimiento de Base de Datos y Experiencia de Usuario (UI/UX).

## ¿Qué es la Escalabilidad de Datos y la Paginación?
Cuando una aplicación pasa de ser un prototipo a un producto real, el volumen de datos explota. El problema surge cuando intentamos descargar toda la información de la base de datos al mismo tiempo. Las bases de datos en la nube (como Supabase) tienen bloqueos de seguridad que impiden descargar más de 1,000 registros de un solo golpe para evitar saturar los servidores. 

La solución arquitectónica se llama **Paginación** (o carga por lotes). Consiste en dividir la información en "páginas" o "bloques" y pedirle a la base de datos que entregue los datos de a poco (ejemplo: del 1 al 1,000, luego del 1,001 al 2,000).

### El problema exacto que sufrimos:
En nuestro sistema HUSJ, el archivo maestro creció a **3,023 equipos biomédicos**. Cuando abríamos el módulo de Inventario, la aplicación intentaba traerlos todos de una vez. Supabase nos frenaba a los 1,000 exactos, dejándonos con 2,023 equipos invisibles y un sistema que no reflejaba la realidad del hospital. Tuvimos que crear un bucle de paginación (`Pagination Loop`) que pide bloque por bloque hasta completar los 3,023 de manera fluida y ensamblarlos en la memoria de la aplicación.

---

## 🏥 Analogía Biomédica/Hospitalaria

Imaginate que el hospital te exige realizar un inventario físico anual de todos los equipos biomédicos, y deciden enviarte los 3,023 equipos a la puerta de tu taller biomédico **al mismo tiempo**, en el mismo instante. 
¿Qué pasaría? El pasillo colapsaría, no podrías caminar, te quedarías sin espacio para revisar nada y, probablemente, la puerta de tu taller se rompería. Es un desastre logístico.

La **Paginación** es el equivalente a decirle al almacén: *"Mandame los equipos en tandas de 10. Yo reviso esos 10, y cuando termino, te aviso para que me mandes los siguientes 10"*. 

De esta manera, procesás exactamente los mismos 3,023 equipos, pero sin saturar la capacidad de recepción de tu taller (la memoria de la computadora del usuario) ni estresar a los camilleros que te los traen (el servidor de la base de datos en la nube).

---

## 🛠 La Solución Arquitectónica

Para manejar cargas masivas de datos implementamos:
1. **Peticiones Asíncronas con Límite y Desplazamiento (Limit / Offset):** Le decimos a la base de datos `limit(1000)` y en la siguiente ronda le decimos `offset(1000)` para que salte los primeros que ya trajo.
2. **Infinite Scrolling o Carga Diferida (Lazy Loading):** Solo descargamos la información pesada (como fotos de los equipos) cuando el usuario baja la pantalla para mirarlos, ahorrando gigabytes de internet.

> **Nota Académica para Proyecto de Grado:**
> La incorporación de algoritmos de paginación asíncrona demuestra una arquitectura orientada a la **Escalabilidad Horizontal**. Garantiza que el sistema conserve tiempos de respuesta óptimos (baja latencia) independientemente de si el inventario institucional crece a 10,000 o 50,000 activos físicos en los próximos años.
