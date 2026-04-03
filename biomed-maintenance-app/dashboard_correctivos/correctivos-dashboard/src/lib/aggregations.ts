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
  const counts = contarPor(data.map((d) => normalizarEstado(d)));
  const COLORS: Record<string, string> = {
    'CERRADO': '#10b981',
    'TRABAJANDO': '#f59e0b',
    'PENDIENTE': '#ef4444',
  };

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: COLORS[name] || '#64748b'
  }));
}
