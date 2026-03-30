# Biomed Maintenance App — Diseño del Sistema

## Contexto

Aplicación web de escritorio para el **Hospital Universitario San Jorge de Pereira (HUSJ)** destinada a gestionar el inventario de equipos biomédicos, registrar mantenimientos preventivos y correctivos, y generar los reportes oficiales que actualmente se llenan en Excel (formatos GRF3MAN-*).

Los datos se almacenan **localmente en el navegador** (IndexedDB via Dexie.js). No requiere servidor ni conexión a internet.

---

## Decisiones de diseño confirmadas por el usuario

| Aspecto | Decisión |
|---|---|
| Layout | Sidebar lateral fijo |
| Tema | Institucional claro (azul hospitalario `#0f4c81` + blanco) |
| Dashboard | KPIs + Alertas próximas + Resumen por servicio |
| Módulos | Los 8 definidos abajo |
| Almacenamiento | Local (IndexedDB via Dexie.js) |
| Framework | React + TypeScript + Vite + TailwindCSS v4 |

---

## Stack técnico

- **React 19 + TypeScript** — UI y lógica
- **Vite** — bundler y dev server
- **TailwindCSS v4** — estilos
- **Dexie.js** — wrapper de IndexedDB para persistencia local
- **React Router v6** — navegación entre módulos
- **Recharts** — gráficos del dashboard
- **xlsx (SheetJS)** — importar inventario desde Excel y exportar reportes
- **react-to-print** — impresión de reportes en PDF/papel

---

## Módulos del sistema

### 1. Dashboard (`/`)
- **KPIs**: Total equipos, Activos, En mantenimiento, Dados de baja, Pendientes de mantenimiento, Vencidos
- **Alertas próximas**: tabla con equipos cuyo próximo mantenimiento vence en los próximos 30 días (ordenado por urgencia, con semáforo: 🟢 >15 días, 🟡 7-15 días, 🔴 <7 días)
- **Resumen por servicio**: gráfico de barras con distribución de equipos activos por servicio/área
- **Acceso rápido**: botones para registrar mantenimiento preventivo y correctivo

### 2. Inventario de Equipos (`/inventario`)
- Tabla paginada y buscable con: Activo Fijo, Equipo, Marca, Modelo, Serie, Servicio/Ubicación, Estado, Riesgo, ¿Requiere mantenimiento?, Próximo mantenimiento
- Filtros: por servicio, estado, tipo de equipo, riesgo
- Acciones por equipo: Ver detalle, Editar, Registrar mantenimiento, Ver historial
- Importación masiva desde Excel (formato del inventario HUSJ)
- Agregar equipo manualmente
- Exportar lista filtrada a Excel

**Campos del equipo:**
- Activo Fijo (PK)
- Nombre/tipo de equipo
- Marca
- Modelo
- Serie
- Servicio (ubicación actual)
- Estado: `Activo | En mantenimiento | Dado de baja | No encontrado`
- Clasificación de riesgo: `I (bajo) | IIa (moderado) | IIb (alto) | III (crítico)`
- Clasificación de uso: `Diagnóstico | Prevención | Rehabilitación | Análisis de laboratorio | Tratamiento y mantenimiento de la vida`
- ¿Se realiza mantenimiento?: Sí / No
- ¿Requiere calibración?: Sí / No
- Estado de garantía: `Vigente | Expirada`
- Periodicidad de mantenimiento preventivo (meses)
- Fecha del último mantenimiento preventivo
- Formato de mantenimiento asignado (código GRF3MAN-*)
- Técnico asignado
- Observaciones

### 3. Mantenimiento Preventivo (`/preventivo`)
- Formulario de registro vinculado al equipo por Activo Fijo
- Al seleccionar el activo, **prellenar automáticamente**: Equipo, Marca, Modelo, Serie, Ubicación
- Lista de chequeo dinámica según el formato del equipo (cada equipo tiene su propio set de actividades)
- Resultado de cada actividad: `C (Cumple) | NC (No Cumple) | NA (No Aplica)`
- Sección de **Seguridad Eléctrica** (campos numéricos): Red L1-L2, L1-gnd, L2-gnd, Resistencia cable poder (Ω), Corrientes de fuga a tierra (µA)
- Observaciones generales
- Fecha del mantenimiento
- Técnico que realizó / Quién recibió
- Vista previa imprimible que replica exactamente el formato Excel oficial
- Botón "Guardar y generar reporte"

**Actividades por tipo de equipo** (extraídas de los formatos):
- Cada tipo de equipo tiene su propio array de actividades predefinidas
- Se almacenan como plantillas en la base de datos
- El técnico puede agregar actividades adicionales en el campo de observaciones

### 4. Mantenimiento Correctivo (`/correctivo`)
- Basado en **GRF3MA-FR16**: Control de Mantenimiento Preventivo y Correctivo
- Campos: Activo Fijo, Equipo (autocompletado), Marca, Modelo, Serie, Ubicación
- Tabla de intervenciones con: Fecha Ingreso, Tipo Mtto (P/C/RT/CC/CE), Reporte Técnico, Valor Repuesto, Realizado Por, Valor Mano de Obra, Fecha de Entrega
- Tipos de registro (convenciones del formato):
  - `P` — Mantenimiento Preventivo
  - `C` — Mantenimiento Correctivo
  - `R.T` — Reporte Técnico
  - `C.C` — Certificado de Calibración
  - `C.E` — Correspondencia Externa
- Observaciones
- Vista previa imprimible del formato FR16

### 5. Ubicaciones (`/ubicaciones`)
- CRUD de servicios/áreas del hospital
- Lista de servicios con cantidad de equipos asignados
- Al editar una ubicación, actualiza todos los equipos asignados
- Vista de qué equipos están en cada servicio

### 6. Reportes (`/reportes`)
- **Reporte de mantenimiento preventivo por equipo**: recreación visual del formato Excel (GRF3MAN-FR*) con todos los datos del último mantenimiento registrado. Imprimible.
- **Reporte de mantenimiento correctivo por equipo**: formato FR16. Imprimible.
- **Reporte de inventario general**: tabla exportable a Excel
- **Reporte de cumplimiento mensual**: ¿cuántos mantenimientos se programaron vs ejecutaron este mes?
- **Reporte de alertas vencidas**: equipos cuyo mantenimiento está atrasado
- Filtros: por equipo, servicio, rango de fechas, técnico

### 7. Programación / Calendario (`/calendario`)
- Vista mensual con mantenimientos programados
- Código de colores: 🟢 completado, 🟡 programado, 🔴 vencido
- Al hacer clic en un evento: ver detalle o ir a registrar el mantenimiento
- Agregar/editar programación de mantenimientos futuros

### 8. Técnicos / Usuarios (`/tecnicos`)
- CRUD de técnicos biomédicos
- Campos: Nombre completo, cargo, disponibilidad
- Ver historial de mantenimientos realizados por cada técnico
- Lista predefinida inicial: Victor López, Jeferson Cabrera, Camilo Ramirez, Wilson Torres, Laura Galeano

---

## Modelo de datos (IndexedDB via Dexie.js)

### Tabla: `equipos`
```typescript
{
  activoFijo: string,        // PK
  equipo: string,
  marca: string,
  modelo: string,
  serie: string,
  servicio: string,
  estado: 'Activo' | 'En mantenimiento' | 'Dado de baja' | 'No encontrado',
  riesgo: 'I' | 'IIa' | 'IIb' | 'III',
  clasificacionUso: string,
  realizaMantenimiento: boolean,
  requiereCalibración: boolean,
  garantia: 'Vigente' | 'Expirada',
  periodicidadMeses: number,
  ultimoMantenimientoPreventivo: Date | null,
  codigoFormato: string,      // ej: 'GRF3MAN-FR35'
  tecnicoAsignado: string,
  observaciones: string,
  creadoEn: Date,
  actualizadoEn: Date
}
```

### Tabla: `mantenimientosPreventivos`
```typescript
{
  id: string,                 // UUID auto
  activoFijo: string,         // FK -> equipos
  fecha: Date,
  actividades: {
    descripcion: string,
    resultado: 'C' | 'NC' | 'NA'
  }[],
  seguridadElectrica: {
    redL1L2: number | null,
    redL1gnd: number | null,
    redL2gnd: number | null,
    resistenciaCableOhm: number | null,
    corrienteFugaTierraNormalmA: number | null,
    corrienteFugaTierraNeutroAbiertomA: number | null,
    corrienteFugaChassiNormalmA: number | null,
    corrienteFugaChassiNeutroAbiertomA: number | null,
    corrienteFugaChassiTierraAbiertamA: number | null,
  },
  observaciones: string,
  realizadoPor: string,
  recibidoPor: string,
  creadoEn: Date
}
```

### Tabla: `mantenimientosCorrectivos`
```typescript
{
  id: string,                 // UUID auto
  activoFijo: string,         // FK -> equipos
  fechaIngreso: Date,
  tipoMtto: 'P' | 'C' | 'RT' | 'CC' | 'CE',
  reporteTecnico: string,
  valorRepuesto: number | null,
  realizadoPor: string,
  valorManoObra: number | null,
  fechaEntrega: Date | null,
  observaciones: string,
  creadoEn: Date
}
```

### Tabla: `plantillasMantenimiento`
```typescript
{
  codigoFormato: string,      // PK: 'GRF3MAN-FR35'
  nombreFormato: string,      // 'Monitores de Signos Vitales'
  tiposEquipo: string[],      // lista de tipos de equipo que usan este formato
  actividades: string[]       // lista de actividades del checklist
}
```

### Tabla: `servicios`
```typescript
{
  id: string,
  nombre: string,
  descripcion: string
}
```

### Tabla: `tecnicos`
```typescript
{
  id: string,
  nombre: string,
  cargo: string,
  activo: boolean
}
```

---

## Estructura de archivos del proyecto

```
src/
├── main.tsx
├── App.tsx                    # Router principal
├── index.css
├── lib/
│   └── db.ts                  # Dexie.js — definición de la base de datos
├── types/
│   └── index.ts               # Todos los tipos TypeScript
├── hooks/
│   ├── useEquipos.ts
│   ├── useMantenimientos.ts
│   └── useStats.ts
├── components/
│   └── ui/
│       ├── Sidebar.tsx
│       ├── Badge.tsx
│       ├── StatCard.tsx
│       ├── DataTable.tsx
│       └── PrintLayout.tsx    # Wrapper para vistas imprimibles
├── features/
│   ├── dashboard/
│   │   └── Dashboard.tsx
│   ├── inventario/
│   │   ├── Inventario.tsx
│   │   ├── EquipoForm.tsx
│   │   └── ImportarExcel.tsx
│   ├── preventivo/
│   │   ├── MantenimientoPreventivo.tsx
│   │   └── ChecklistForm.tsx
│   ├── correctivo/
│   │   └── MantenimientoCorrectivo.tsx
│   ├── ubicaciones/
│   │   └── Ubicaciones.tsx
│   ├── reportes/
│   │   ├── Reportes.tsx
│   │   └── ReporteFormato.tsx
│   ├── calendario/
│   │   └── Calendario.tsx
│   └── tecnicos/
│       └── Tecnicos.tsx
└── data/
    └── plantillas.ts          # Actividades predefinidas de cada formato GRF3MAN
```

---

## Plantillas de mantenimiento (al arrancar el sistema)

Los 19 formatos Excel se traducen en plantillas prepobladas en la base de datos, con sus actividades y tipos de equipo asociados. Esto permite que al seleccionar un equipo para mantenimiento preventivo, el checklist se genere automáticamente.

**Formatos identificados:**
| Código | Equipo(s) |
|---|---|
| GRF3MAN-FR52 | Básculas y balanzas |
| GRF3MAN-FR41 | Camas, cunas y sillas eléctricas |
| GRF3MAN-FR96 | Compresor vascular |
| GRF3MAN-FR55 | Desfibriladores |
| GRF3MAN-FR50 | Ecógrafo, Doppler, Monitor fetal, Ultrasonido |
| GRF3MAN-FR40 | Electrobisturí, Electrocauterio |
| GRF3MAN-FR68 | Electroestimulador, Marcapasos |
| GRF3MAN-FR43 | Flujómetros, Reguladores, Vacutrones |
| GRF3MAN-FR63 | Fonendoscopios |
| GRF3MAN-FR16 | Control general preventivo y correctivo |
| GRF3MAN-FR131 | Entrega de insumos, repuestos y accesorios |
| GRF3MAN-FR45 | Laringoscopios |
| GRF3MAN-FR51 | Lámparas (celitica, cuello de cisne, auxiliar) |
| GRF3MAN-FR86 | Mesas de cirugía |
| GRF3MAN-FR44 | Microscopio, Colposcopio, Frontoluz, Lámpara hendidura |
| GRF3MAN-FR35 | Monitores de signos vitales |
| GRF3MAN-FR53 | Tensiómetro, Infusor, Torniquete |
| GRF3MAN-FR106 | Termohigrómetro |
| GRF3MAN-FR102 | Ventilador, Neopuff, Blender |

---

## Flujo principal de trabajo

1. **Importar inventario**: al primer uso, cargar el Excel HUSJ → popula `equipos` y `servicios`
2. **Programar mant. preventivo**: indicar periodicidad por equipo → Dashboard muestra alertas
3. **Registrar mant. preventivo**: seleccionar equipo → se conjura el checklist del formato → registrar resultados + seguridad eléctrica → guardar → generar vista imprimible
4. **Registrar mant. correctivo**: seleccionar equipo → registrar la intervención (FR16) → guardar → imprimir
5. **Reportes**: filtrar por equipo/servicio/fecha → previsualizar → imprimir/exportar

---

## Notas de implementación

- **Sin backend**: todo en IndexedDB. No hay login ni autenticación.
- **Vista de impresión**: los reportes replican visualmente los formatos Excel existentes. CSS `@media print` oculta el sidebar y muestra solo el formulario con el membrete del HUSJ.
- **Importación Excel**: SheetJS lee el archivo del inventario, mapea columnas y popula la tabla `equipos`. Los servicios se crean automáticamente.
- **Datos seed**: al iniciar la app por primera vez, se cargan las plantillas de mantenimiento y los técnicos.
- **Formularios de Búsqueda**: algunos formatos Excel (desfibriladores, monitores) tienen una hoja "BÚSQUEDA" que actúa como lookup por activo fijo. La app replica este comportamiento: al ingresar el activo fijo, se prellenan todos los datos del equipo.
