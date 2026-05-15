# 📚 Conceptos de Ingeniería: ETL y Saneamiento de Datos

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Integridad de datos y scripts de automatización en Python.

## ¿Qué es el Saneamiento de Datos (Data Sanitization) y ETL?
En la industria del software existe una regla de oro: **"Garbage In, Garbage Out"** (Si entra basura, sale basura). Si tu base de datos recibe información corrupta, duplicada o mal escrita, tu aplicación mostrará errores por más perfecta que sea su interfaz.

Para resolver esto, utilizamos procesos **ETL (Extract, Transform, Load - Extraer, Transformar, Cargar)**. Escribimos scripts de Python (`clean_csv.py`, `fix_garbage.py`) que actúan como "filtros". Estos scripts toman los archivos Excel crudos, corrigen las mayúsculas, eliminan los equipos duplicados (los famosos ".0" en los números de serie), estandarizan los nombres de los servicios y finalmente suben la información limpia a Supabase.

---

## 🏥 Analogía Hospitalaria

Imaginate la **Central de Esterilización (CEYE)** del hospital. 
Termina una cirugía de urgencia y los instrumentos quirúrgicos (bisturís, pinzas) quedan llenos de fluidos. Vos no agarrás esa misma bandeja sucia (Excel crudo) y la metés directamente al cajón de un quirófano limpio (Base de Datos). Si hacés eso, vas a infectar al próximo paciente (tu aplicación va a fallar).

El proceso ETL es la Central de Esterilización:
1. **Extraer (Extract):** Recogés el instrumental sucio de la sala de urgencias.
2. **Transformar (Transform):** Pasás todo por el autoclave, el jabón enzimático y retirás los desechos biológicos (nuestros scripts de Python eliminando datos basura y duplicados).
3. **Cargar (Load):** Guardás el instrumental brillante y estéril en los estantes del quirófano listo para usar (el envío final a Supabase).

---

## 🛠 Justificación Técnica de la Decisión

1. **Integridad Referencial:** Al limpiar los datos antes de inyectarlos, aseguramos que el ID de cada equipo sea verdaderamente único, evitando colisiones en la base de datos relacional.
2. **Desacoplamiento Tecnológico:** Usar **Python** exclusivamente para procesar datos pesados permite liberar a la aplicación web (React/Node.js) de ese estrés computacional. Python es el líder indiscutible en ciencia y manipulación de datos (Data Science).
3. **Mantenibilidad de la App:** Al estandarizar términos ("UCI" en vez de "u.c.i." o "CUIDADOS INTENSIVOS"), los gráficos (Dashboards) del frontend pueden agrupar y contar los datos estadísticos con total exactitud.

> **Nota Académica para Proyecto de Grado:**
> La implementación de pipelines ETL (Extract, Transform, Load) utilizando scripts de automatización externos (Python) asegura la **Normalización de la Base de Datos** hasta la Tercera Forma Normal (3NF). Esto garantiza la atomicidad y consistencia de la información (ACID), previniendo la degradación de datos (Data Decay) en sistemas críticos de gestión hospitalaria.
