# Dashboard Correctivos — Marzo 2026 (React + Vite + Tailwind + Recharts)

> Proyecto listo para copiar/pegar. Incluye **estructura**, **código completo** y **estilo Glassmorphism**.

---

## 0) Requisitos

- Node.js (LTS)
- VS Code

---

## 1) Crear el proyecto

```bash
npm create vite@latest correctivos-dashboard -- --template react-ts
cd correctivos-dashboard
npm install
```

Instalar dependencias:

```bash
npm i recharts lucide-react dayjs @tanstack/react-table clsx tailwind-merge
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Correr:

```bash
npm run dev
```

---

## 2) Estructura de carpetas

```text
correctivos-dashboard/
  src/
    components/
      charts/
        DamageTypeBar.tsx
        ReportsLine.tsx
        StatusPie.tsx
        chartTooltip.tsx
      kpis/
        KpiCard.tsx
      layout/
        Background.tsx
        Header.tsx
        GlassCard.tsx
      table/
        CorrectivosTable.tsx
        DetailsDrawer.tsx
        FilterBar.tsx
    data/
      mockCorrectivos.ts
    hooks/
      useDebounce.ts
    lib/
      aggregations.ts
      utils.ts
    types/
      correctivo.ts
    App.tsx
    main.tsx
    index.css
  tailwind.config.js
  postcss.config.js
```

---

## 3) Configuración Tailwind

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070A1A",
        glass: "rgba(255,255,255,0.10)",
        glassBorder: "rgba(255,255,255,0.18)",
        gold: "#F7C948",
        neonCyan: "#22D3EE",
        neonTeal: "#14B8A6",
        neonViolet: "#8B5CF6",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.45)",
        glowGold: "0 0 18px rgba(247,201,72,0.55)",
        glowCyan: "0 0 18px rgba(34,211,238,0.40)",
      },
      dropShadow: {
        gold: "0 0 12px rgba(247,201,72,0.65)",
      },
      backdropBlur: {
        xl: "24px",
      },
    },
  },
  plugins: [],
};
```

---

## 4) Estilos globales

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fondo con “noise” suave + look cinematográfico */
.bg-cinematic {
  position: relative;
  overflow: hidden;
}

.bg-cinematic::before {
  content: "";
  position: absolute;
  inset: -60px;
  background:
    radial-gradient(900px 500px at 15% 20%, rgba(34,211,238,0.20), transparent 55%),
    radial-gradient(800px 450px at 70% 25%, rgba(139,92,246,0.18), transparent 60%),
    radial-gradient(900px 500px at 55% 85%, rgba(20,184,166,0.18), transparent 60%);
  filter: blur(10px);
  pointer-events: none;
}

.bg-cinematic::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E");
  opacity: 0.25;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* Scrollbar discreta */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 999px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.22); }

/* Texto “glow” dorado */
.text-gold-glow {
  color: #F7C948;
  text-shadow:
    0 0 14px rgba(247,201,72,0.55),
    0 0 32px rgba(247,201,72,0.25);
}
```

---

## 5) Entrada React

### `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 6) Tipos

### `src/types/correctivo.ts`

```ts
export type Correctivo = {
  id: number;
  fechaCreacion: string | null; // ISO yyyy-mm-dd
  fechaAtencion: string | null;
  fechaCierre: string | null;

  equipo: string | null;
  marca: string | null;
  modelo: string | null;
  activoFijo: string | null;

  servicio: string | null;
  ubicacion: string | null;

  descripcion: string | null;
  accion: string | null;

  tecnico: string | null;

  estado: string | null;       // Estado (CERRADO, PENDIENTE...)
  estadoGMA: string | null;    // Estado GMA soporte
  estadoEquipo: string | null; // 🟢 FUNCIONAL, 🔴 FUERA DE SERVICIO

  causa: string | null;

  accesorioNuevo: string | null; // SÍ/NO
  paradaEquipo: string | null;    // SI/NO
  paradaServicio: string | null;  // SI/NO

  oportunidadHoras: number | null;
  paradaDias: number | null;
  capacidadRespuestaLt3Dias: number | null; // 1/0
};

export type EstadoNormalizado =
  | "CERRADO"
  | "TRABAJANDO"
  | "PENDIENTE"
  | "OTRO"
  | "SIN_ESTADO";
```

---

## 7) Datos simulados (mock)

### `src/data/mockCorrectivos.ts`

> Puedes reemplazar este arreglo por datos reales desde JSON/API cuando lo necesites.

```ts
import { Correctivo } from "../types/correctivo";

export const correctivosMarzo2026: Correctivo[] = [
  {
    id: 25655,
    fechaCreacion: "2026-03-01",
    fechaAtencion: "2026-03-01",
    fechaCierre: "2026-03-01",
    equipo: "DOPPLER FETAL",
    marca: null,
    modelo: null,
    activoFijo: null,
    servicio: "HOSPITALIZACIÓN GINECO-OBSTETRICIA",
    ubicacion: "Sala de Partos",
    descripcion: "se solicita revisar doppler fetal de sala de partos, no carga, gracias",
    accion:
      "Se realiza revisión del equipo y se encuentra en buenas condiciones funcionales, se verifica estado del cargador y de las baterías y se hacen pruebas funcionales, se retorna al servicio en buenas condiciones.",
    tecnico: "Victor Lopez",
    estado: "CERRADO",
    estadoGMA: "⚠ PTE POR CONFIRMAR",
    estadoEquipo: "🟢 FUNCIONAL",
    causa: "DESAJUSTE",
    accesorioNuevo: "NO",
    paradaEquipo: "NO",
    paradaServicio: "NO",
    oportunidadHoras: 0,
    paradaDias: 0,
    capacidadRespuestaLt3Dias: 1,
  },
  {
    id: 25659,
    fechaCreacion: "2026-03-01",
    fechaAtencion: "2026-03-01",
    fechaCierre: "2026-03-01",
    equipo: "BOMBA DE INFUSIÓN",
    marca: null,
    modelo: null,
    activoFijo: null,
    servicio: "HOSPITALIZACIÓN PEDIATRÍA",
    ubicacion: null,
    descripcion:
      "se solicita revision de bomba de infusion ubicada en el cuarto de equipos de expansion pediatria ,gracias",
    accion:
      "Se revisa equipo y se encuentra en buenas condiciones funcionales, se realiza pruebas con test y se verifican configuraciones y alarmas.",
    tecnico: "Victor Lopez",
    estado: "CERRADO",
    estadoGMA: "⚠ PTE POR CONFIRMAR",
    estadoEquipo: "🟢 FUNCIONAL",
    causa: "NO PRESENTA DAÑO",
    accesorioNuevo: "NO",
    paradaEquipo: "NO",
    paradaServicio: "NO",
    oportunidadHoras: 0,
    paradaDias: 0,
    capacidadRespuestaLt3Dias: 1,
  },
  {
    id: 25660,
    fechaCreacion: "2026-03-01",
    fechaAtencion: "2026-03-02",
    fechaCierre: "2026-03-02",
    equipo: "CAMA ELÉCTRICA",
    marca: "Stryker",
    modelo: "SV2",
    activoFijo: "571768",
    servicio: "HOSPITALIZACIÓN ADULTO 5° PISO",
    ubicacion: null,
    descripcion:
      "se solicita por favor revisar cama en pasillo 5to piso, no funciona el botón para bajar la parte inferior (pies).",
    accion:
      "Se revisa cama, estaba con bloqueo mecánico de pies; recomendaciones de uso. Equipo OK.",
    tecnico: "Victor Lopez",
    estado: "CERRADO",
    estadoGMA: "⚠ PTE POR CONFIRMAR",
    estadoEquipo: "🟢 FUNCIONAL",
    causa: "DESCONOCIMIENTO DEL EQUIPO",
    accesorioNuevo: "NO",
    paradaEquipo: "NO",
    paradaServicio: "NO",
    oportunidadHoras: 24,
    paradaDias: 1,
    capacidadRespuestaLt3Dias: 1,
  },
  {
    id: 25677,
    fechaCreacion: "2026-03-02",
    fechaAtencion: "2026-03-02",
    fechaCierre: "2026-03-02",
    equipo: "MONITOR DE SIGNOS VITALES",
    marca: "Edan",
    modelo: "M50",
    activoFijo: "545370",
    servicio: "HOSPITALIZACIÓN ADULTO 4° PISO",
    ubicacion: null,
    descripcion: "se solicita arreglo/cambio de saturador estación 3 medicina interna.",
    accion:
      "Daño en sensor SPO2, requiere cambio; se inicia adquisición de repuesto.",
    tecnico: "Victor Lopez",
    estado: "PENDIENTE",
    estadoGMA: "⚙ TRABAJANDO",
    estadoEquipo: "🟡 EN ESPERA DE REPUESTO",
    causa: "FALTA DE CONSUMIBLE",
    accesorioNuevo: "NO",
    paradaEquipo: "NO",
    paradaServicio: "NO",
    oportunidadHoras: 0,
    paradaDias: 0,
    capacidadRespuestaLt3Dias: 1,
  },
  {
    id: 25745,
    fechaCreacion: "2026-03-03",
    fechaAtencion: "2026-03-09",
    fechaCierre: "2026-03-29",
    equipo: "DESFIBRILADOR",
    marca: "Comen",
    modelo: "S5",
    activoFijo: "572076",
    servicio: "CUIDADO INTENSIVO ADULTO",
    ubicacion: null,
    descripcion: "falla prueba fuente de energía (carro de paro UCI).",
    accion:
      "Daño en palas de descarga; se inicia adquisición. Equipo fuera de servicio en taller.",
    tecnico: "Camilo Ramirez",
    estado: "PENDIENTE COTIZAR",
    estadoGMA: "⚙ TRABAJANDO",
    estadoEquipo: "🔴 FUERA DE SERVICIO",
    causa: "FALLA INTERNA",
    accesorioNuevo: "NO",
    paradaEquipo: "SI",
    paradaServicio: "NO",
    oportunidadHoras: 144,
    paradaDias: 6,
    capacidadRespuestaLt3Dias: 0,
  },
];
```

---

## 8) Utilidades

### `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 9) Hook debounce

### `src/hooks/useDebounce.ts`

```ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
```

---

## 10) Agregaciones (KPIs + series + normalización)

### `src/lib/aggregations.ts`

```ts
import dayjs from "dayjs";
import { Correctivo, EstadoNormalizado } from "../types/correctivo";

export function normalizarEstado(c: Correctivo): EstadoNormalizado {
  const e = (c.estado ?? "").toUpperCase().trim();
  const g = (c.estadoGMA ?? "").toUpperCase();

  if (e.includes("CERRADO")) return "CERRADO";
  if (e.includes("PENDIENTE")) return "PENDIENTE";
  if (g.includes("TRABAJANDO") || g.includes("⚙")) return "TRABAJANDO";
  if (!e && !g) return "SIN_ESTADO";
  return "OTRO";
}

export function aplicarFiltros(
  data: Correctivo[],
  filters: {
    q: string;
    estado: string;
    tecnico: string;
    desde: string;
    hasta: string;
  }
) {
  const q = filters.q.trim().toLowerCase();

  return data.filter((c) => {
    const estadoNorm = normalizarEstado(c);
    const fecha = c.fechaCreacion ? dayjs(c.fechaCreacion) : null;

    const inQ =
      !q ||
      [c.equipo, c.servicio, c.ubicacion, c.descripcion, c.causa, c.tecnico]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));

    const inEstado = !filters.estado || estadoNorm === filters.estado;
    const inTecnico = !filters.tecnico || (c.tecnico ?? "") === filters.tecnico;

    const inDesde =
      !filters.desde || (fecha && !fecha.isBefore(dayjs(filters.desde), "day"));
    const inHasta =
      !filters.hasta || (fecha && !fecha.isAfter(dayjs(filters.hasta), "day"));

    return inQ && inEstado && inTecnico && inDesde && inHasta;
  });
}

export function contarPor<T extends string>(arr: T[]) {
  return arr.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});
}

export function topN(map: Record<string, number>, n = 5) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

export function kpis(data: Correctivo[]) {
  const total = data.length;

  const equipos = contarPor(data.map((d) => (d.equipo ?? "SIN EQUIPO").trim()));
  const topEquipo = topN(equipos, 1)[0] ?? { name: "—", value: 0 };

  const estados = contarPor(data.map((d) => normalizarEstado(d)));
  const cerrados = estados["CERRADO"] ?? 0;
  const abiertos = total - cerrados;

  const sla = data.filter((d) => d.capacidadRespuestaLt3Dias === 1).length;
  const slaPct = total ? Math.round((sla / total) * 100) : 0;

  return { total, topEquipo, cerrados, abiertos, slaPct };
}

export function seriePorFecha(data: Correctivo[]) {
  const map: Record<string, number> = {};
  data.forEach((d) => {
    if (!d.fechaCreacion) return;
    map[d.fechaCreacion] = (map[d.fechaCreacion] ?? 0) + 1;
  });

  return Object.keys(map)
    .sort()
    .map((date) => ({ date, value: map[date] }));
}

export function barrasPorCausa(data: Correctivo[]) {
  const causas = contarPor(data.map((d) => (d.causa ?? "SIN CAUSA").trim()));
  return topN(causas, 10);
}

export function piePorEstado(data: Correctivo[]) {
  const estados = contarPor(data.map((d) => normalizarEstado(d)));
  return Object.entries(estados).map(([name, value]) => ({ name, value }));
}
```

---

## 11) Layout Glassmorphism

### `src/components/layout/Background.tsx`

```tsx
import { ReactNode } from "react";

export default function Background({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cinematic bg-gradient-to-br from-[#071026] via-[#2a1263] to-[#0aa6a0] text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
```

### `src/components/layout/GlassCard.tsx`

```tsx
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

export default function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-glassBorder bg-glass/70 backdrop-blur-xl shadow-glass",
        "relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
      <div className="relative p-5">{children}</div>
    </div>
  );
}
```

### `src/components/layout/Header.tsx`

```tsx
import { Activity } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-neonCyan/60 to-neonViolet/60 shadow-glowCyan flex items-center justify-center">
            <Activity className="text-white drop-shadow" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gold-glow">
            Dashboard Correctivos — Marzo 2026
          </h1>
        </div>
        <p className="mt-2 text-sm text-white/75 max-w-2xl">
          Visualización interactiva de reportes correctivos con análisis por causa, estado, tendencia y detalle por ticket.
        </p>
      </div>

      <div className="hidden md:block text-right">
        <div className="text-xs text-white/60">Estilo</div>
        <div className="text-sm font-medium text-white/90">
          Glassmorphism • Futurista • Cinemático
        </div>
      </div>
    </div>
  );
}
```

---

## 12) KPIs

### `src/components/kpis/KpiCard.tsx`

```tsx
import GlassCard from "../layout/GlassCard";
import { cn } from "../../lib/utils";
import { ReactNode } from "react";

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  tone = "cyan",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  tone?: "cyan" | "violet" | "green" | "orange";
}) {
  const toneMap = {
    cyan: "from-neonCyan/70 to-white/10 shadow-glowCyan",
    violet: "from-neonViolet/70 to-white/10",
    green: "from-emerald-400/60 to-white/10",
    orange: "from-orange-400/60 to-white/10",
  };

  return (
    <GlassCard className="h-full">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-2xl bg-gradient-to-br",
            toneMap[tone],
            "flex items-center justify-center border border-white/15"
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-white/60">{title}</div>
          <div className="text-2xl font-semibold text-gold-glow">{value}</div>
          {subtitle && <div className="mt-1 text-sm text-white/75 truncate">{subtitle}</div>}
        </div>
      </div>
    </GlassCard>
  );
}
```

---

## 13) Charts

### `src/components/charts/chartTooltip.tsx`

```tsx
import GlassCard from "../layout/GlassCard";

export function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="max-w-xs">
      <GlassCard className="p-0">
        <div className="p-3">
          <div className="text-xs text-white/60">{label}</div>
          <div className="mt-1 text-sm font-semibold text-gold-glow">
            {payload[0].name ?? "Valor"}: {payload[0].value}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
```

### `src/components/charts/DamageTypeBar.tsx`

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import GlassCard from "../layout/GlassCard";
import { GlassTooltip } from "./chartTooltip";

export default function DamageTypeBar({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <GlassCard className="h-[360px]">
      <div className="mb-3">
        <div className="text-sm font-semibold text-gold-glow">Daños por tipo (Causa)</div>
        <div className="text-xs text-white/60">Top 10 causas más frecuentes</div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 11 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 11 }} />
          <Tooltip content={<GlassTooltip />} />
          <Bar dataKey="value" fill="rgba(34,211,238,0.75)" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
```

### `src/components/charts/ReportsLine.tsx`

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import GlassCard from "../layout/GlassCard";
import { GlassTooltip } from "./chartTooltip";

export default function ReportsLine({
  data,
}: {
  data: { date: string; value: number }[];
}) {
  return (
    <GlassCard className="h-[360px]">
      <div className="mb-3">
        <div className="text-sm font-semibold text-gold-glow">Evolución de reportes por fecha</div>
        <div className="text-xs text-white/60">Conteo diario (según fecha de creación)</div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 11 }} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 11 }} />
          <Tooltip content={<GlassTooltip />} />
          <Line type="monotone" dataKey="value" stroke="rgba(139,92,246,0.95)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
```

### `src/components/charts/StatusPie.tsx`

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import GlassCard from "../layout/GlassCard";
import { GlassTooltip } from "./chartTooltip";

const COLORS: Record<string, string> = {
  CERRADO: "rgba(16,185,129,0.80)",
  PENDIENTE: "rgba(245,158,11,0.80)",
  TRABAJANDO: "rgba(59,130,246,0.80)",
  OTRO: "rgba(168,85,247,0.80)",
  SIN_ESTADO: "rgba(148,163,184,0.70)",
};

export default function StatusPie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <GlassCard className="h-[360px]">
      <div className="mb-3">
        <div className="text-sm font-semibold text-gold-glow">Distribución por estado</div>
        <div className="text-xs text-white/60">Estado normalizado (Cerrado / Pendiente / Trabajando)</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[85%]">
        <div className="md:col-span-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<GlassTooltip />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] ?? "rgba(34,211,238,0.75)"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-2 flex flex-col justify-center gap-2">
          {data
            .sort((a, b) => b.value - a.value)
            .map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[d.name] ?? "rgba(34,211,238,0.75)" }} />
                  <span className="text-sm text-white/85">{d.name}</span>
                </div>
                <span className="text-sm font-semibold text-gold-glow">{d.value}</span>
              </div>
            ))}
        </div>
      </div>
    </GlassCard>
  );
}
```

---

## 14) Tabla + filtros + drawer

### `src/components/table/FilterBar.tsx`

```tsx
import GlassCard from "../layout/GlassCard";

export default function FilterBar({
  q,
  setQ,
  estado,
  setEstado,
  tecnico,
  setTecnico,
  desde,
  setDesde,
  hasta,
  setHasta,
  estados,
  tecnicos,
}: any) {
  return (
    <GlassCard>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4">
          <label className="text-xs text-white/60">Búsqueda</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Equipo, servicio, ubicación, causa, descripción..."
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-neonCyan/60"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-white/60">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-neonCyan/60"
          >
            <option value="">Todos</option>
            {estados.map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-white/60">Técnico</label>
          <select
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-neonCyan/60"
          >
            <option value="">Todos</option>
            {tecnicos.map((t: string) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-white/60">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-neonCyan/60"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-white/60">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-neonCyan/60"
          />
        </div>

        <div className="md:col-span-1 flex items-end">
          <button
            onClick={() => {
              setQ("");
              setEstado("");
              setTecnico("");
              setDesde("");
              setHasta("");
            }}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Limpiar
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
```

### `src/components/table/DetailsDrawer.tsx`

```tsx
import GlassCard from "../layout/GlassCard";
import { Correctivo } from "../../types/correctivo";

export default function DetailsDrawer({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: Correctivo | null;
}) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl p-4">
        <GlassCard className="h-full">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-white/60">Ticket</div>
              <div className="text-xl font-semibold text-gold-glow">
                #{item.id} — {item.equipo ?? "—"}
              </div>
              <div className="mt-1 text-sm text-white/70">
                {item.servicio ?? "—"} • {item.ubicacion ?? "—"}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <div className="text-xs text-white/60">Descripción de daño</div>
              <div className="mt-1 text-white/85 whitespace-pre-wrap">{item.descripcion ?? "—"}</div>
            </div>

            <div>
              <div className="text-xs text-white/60">Acción realizada</div>
              <div className="mt-1 text-white/85 whitespace-pre-wrap">{item.accion ?? "—"}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Técnico</div>
                <div className="mt-1 font-medium text-white/90">{item.tecnico ?? "—"}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Causa</div>
                <div className="mt-1 font-medium text-white/90">{item.causa ?? "—"}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Fecha creación</div>
                <div className="mt-1 font-medium text-white/90">{item.fechaCreacion ?? "—"}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Fecha cierre</div>
                <div className="mt-1 font-medium text-white/90">{item.fechaCierre ?? "—"}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
```

### `src/components/table/CorrectivosTable.tsx`

```tsx
import { useMemo, useState } from "react";
import GlassCard from "../layout/GlassCard";
import DetailsDrawer from "./DetailsDrawer";
import { Correctivo } from "../../types/correctivo";
import { normalizarEstado } from "../../lib/aggregations";

export default function CorrectivosTable({ data }: { data: Correctivo[] }) {
  const [selected, setSelected] = useState<Correctivo | null>(null);

  const rows = useMemo(() => data, [data]);

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-gold-glow">Tabla detallada</div>
            <div className="text-xs text-white/60">{rows.length} registros (según filtros)</div>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-white/10">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-white/70">
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Equipo</th>
                <th className="px-3 py-2">Servicio</th>
                <th className="px-3 py-2">Ubicación</th>
                <th className="px-3 py-2">Técnico</th>
                <th className="px-3 py-2">Causa</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const e = normalizarEstado(r);
                const badge =
                  e === "CERRADO"
                    ? "bg-emerald-400/20 text-emerald-200 border-emerald-300/20"
                    : e === "TRABAJANDO"
                    ? "bg-blue-400/20 text-blue-200 border-blue-300/20"
                    : "bg-amber-400/20 text-amber-200 border-amber-300/20";

                return (
                  <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2 text-white/85">{r.fechaCreacion ?? "—"}</td>
                    <td className="px-3 py-2 text-white/90 font-medium">{r.equipo ?? "—"}</td>
                    <td className="px-3 py-2 text-white/80">{r.servicio ?? "—"}</td>
                    <td className="px-3 py-2 text-white/80">{r.ubicacion ?? "—"}</td>
                    <td className="px-3 py-2 text-white/80">{r.tecnico ?? "—"}</td>
                    <td className="px-3 py-2 text-white/80">{r.causa ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${badge}`}>{e}</span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-white/60">
                    Sin resultados con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <DetailsDrawer open={!!selected} item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
```

---

## 15) App principal

### `src/App.tsx`

```tsx
import { useMemo, useState } from "react";
import Background from "./components/layout/Background";
import Header from "./components/layout/Header";
import KpiCard from "./components/kpis/KpiCard";
import DamageTypeBar from "./components/charts/DamageTypeBar";
import ReportsLine from "./components/charts/ReportsLine";
import StatusPie from "./components/charts/StatusPie";
import FilterBar from "./components/table/FilterBar";
import CorrectivosTable from "./components/table/CorrectivosTable";

import { correctivosMarzo2026 } from "./data/mockCorrectivos";
import {
  aplicarFiltros,
  barrasPorCausa,
  kpis,
  piePorEstado,
  seriePorFecha,
  normalizarEstado,
} from "./lib/aggregations";
import { useDebounce } from "./hooks/useDebounce";

import { FileText, Wrench, Layers, Sparkles } from "lucide-react";

export default function App() {
  const [q, setQ] = useState("");
  const qDebounced = useDebounce(q, 250);

  const [estado, setEstado] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const estadosDisponibles = useMemo(() => {
    const set = new Set(correctivosMarzo2026.map(normalizarEstado));
    return Array.from(set).sort();
  }, []);

  const tecnicosDisponibles = useMemo(() => {
    const set = new Set(
      correctivosMarzo2026.map((d) => d.tecnico).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return aplicarFiltros(correctivosMarzo2026, {
      q: qDebounced,
      estado,
      tecnico,
      desde,
      hasta,
    });
  }, [qDebounced, estado, tecnico, desde, hasta]);

  const k = useMemo(() => kpis(filtered), [filtered]);
  const bar = useMemo(() => barrasPorCausa(filtered), [filtered]);
  const line = useMemo(() => seriePorFecha(filtered), [filtered]);
  const pie = useMemo(() => piePorEstado(filtered), [filtered]);

  return (
    <Background>
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <KpiCard
          title="Total de reportes"
          value={`${k.total}`}
          subtitle="Correctivos registrados (según filtros)"
          icon={<FileText className="text-white" />}
          tone="cyan"
        />
        <KpiCard
          title="Equipo más afectado"
          value={k.topEquipo.name}
          subtitle={`${k.topEquipo.value} reportes`}
          icon={<Wrench className="text-white" />}
          tone="violet"
        />
        <KpiCard
          title="Estado de correctivos"
          value={`${k.cerrados} cerrados / ${k.abiertos} abiertos`}
          subtitle={`SLA < 3 días: ${k.slaPct}%`}
          icon={<Sparkles className="text-white" />}
          tone="orange"
        />
      </div>

      <div className="mb-4">
        <FilterBar
          q={q}
          setQ={setQ}
          estado={estado}
          setEstado={setEstado}
          tecnico={tecnico}
          setTecnico={setTecnico}
          desde={desde}
          setDesde={setDesde}
          hasta={hasta}
          setHasta={setHasta}
          estados={estadosDisponibles}
          tecnicos={tecnicosDisponibles}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-1">
          <StatusPie data={pie} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <DamageTypeBar data={bar} />
          <ReportsLine data={line} />
        </div>
      </div>

      <CorrectivosTable data={filtered} />

      <div className="mt-6 text-xs text-white/55 flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Arquitectura modular lista para conectar a JSON/API.
      </div>
    </Background>
  );
}
```

---

## 16) Conectar datos reales (cuando lo necesites)

- Reemplaza `correctivosMarzo2026` por un `fetch()` a una API o un JSON.
- Sugerencia: exporta Excel → JSON y carga desde `public/`.

---

## 17) Mejoras recomendadas

- Filtro por **Servicio** y **Ubicación**
- Exportar resultados filtrados a **CSV**
- Gráfico Pareto (80/20) para causas
- Paginación/virtualización si crece a miles de filas

