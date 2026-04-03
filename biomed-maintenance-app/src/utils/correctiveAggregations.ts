import dayjs from "dayjs";
import type { Correctivo } from "../types/corrective";

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
    const estadoNorm = c.estado_norm;
    const fecha = c.fecha_creacion ? dayjs(c.fecha_creacion) : null;

    const inQ =
      !q ||
      [c.no_reporte?.toString(), c.equipo, c.servicio, c.ubicacion, c.descripcion, c.causa, c.tecnico]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));

    const inEstado = !filters.estado || estadoNorm === filters.estado;
    const inTecnico = !filters.tecnico || (c.tecnico || "") === filters.tecnico;

    const inDesde =
      !filters.desde || (fecha && !fecha.isBefore(dayjs(filters.desde), "day"));
    const inHasta =
      !filters.hasta || (fecha && !fecha.isAfter(dayjs(filters.hasta), "day"));

    return inQ && inEstado && inTecnico && inDesde && inHasta;
  });
}

function contarPor<T extends string>(arr: T[]) {
  return arr.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
}

function topN(map: Record<string, number>, n = 5) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

export function kpis(data: Correctivo[]) {
  const total = data.length;

  const equipos = contarPor(data.map((d) => (d.equipo || "SIN EQUIPO").trim()));
  const topEquipo = topN(equipos, 1)[0] || { name: "—", value: 0 };

  const estados = contarPor(data.map((d) => d.estado_norm || "SIN_ESTADO"));
  const cerrados = (estados["CERRADO"] || 0);
  const abiertos = total - (estados["CERRADO"] || 0);

  const sla = data.filter((d) => d.capacidad_respuesta === true).length;
  const slaPct = total ? Math.round((sla / total) * 100) : 0;

  return { total, topEquipo, cerrados, abiertos, slaPct };
}

export function seriePorFecha(data: Correctivo[]) {
  const map: Record<string, number> = {};
  data.forEach((d) => {
    if (!d.fecha_creacion) return;
    map[d.fecha_creacion] = (map[d.fecha_creacion] || 0) + 1;
  });

  return Object.keys(map)
    .sort()
    .map((date) => ({ date, value: map[date] }));
}

export function barrasPorCausa(data: Correctivo[]) {
  const causas = contarPor(data.map((d) => (d.causa || "SIN CAUSA").trim()));
  return topN(causas, 10);
}

export function piePorEstado(data: Correctivo[]) {
  const counts = contarPor(data.map((d) => d.estado_norm || "SIN_ESTADO"));
  const COLORS: Record<string, string> = {
    'CERRADO': '#10b981',     // emerald-500
    'TRABAJANDO': '#f59e0b',  // amber-500
    'PENDIENTE': '#ef4444',   // red-500
    'SIN_ESTADO': '#64748b',
    'OTRO': '#8b5cf6'         // violet-500
  };

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: COLORS[name] || '#64748b'
  }));
}
