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
