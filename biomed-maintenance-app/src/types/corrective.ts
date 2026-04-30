export type Correctivo = {
  no_reporte: number;
  periodo: string;
  fecha_creacion: string | null;
  fecha_atencion: string | null;
  fecha_cierre: string | null;

  equipo: string | null;
  marca: string | null;
  modelo: string | null;
  activo_fijo: string | null;
  equipment_id: string | null;

  servicio: string | null;
  ubicacion: string | null;

  descripcion: string | null;
  accion: string | null;

  tecnico: string | null;

  estado: string | null;
  estado_gma: string | null;
  estado_equipo: string | null;
  estado_norm: "CERRADO" | "TRABAJANDO" | "PENDIENTE" | "OTRO" | "SIN_ESTADO";

  causa: string | null;

  accesorio_nuevo: boolean;
  parada_equipo: boolean;
  parada_servicio: boolean;

  oportunidad_horas: number | null;
  parada_dias: number | null;
  capacidad_respuesta: boolean | null;
  
  synced_at: string | null;
  observaciones: string | null;
  comentarios: string | null;
  serie: string | null;
  metadata: any | null;
};
