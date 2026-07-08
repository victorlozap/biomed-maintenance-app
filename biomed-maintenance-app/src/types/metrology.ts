export interface CalibrationRecord {
  id: string;
  created_at: string;
  equipo: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  codigo_equipo?: string;
  servicio: string;
  riesgo?: string;
  invima?: string;
  periodicidad?: string;
  responsable?: string;
  nro_certificado?: string;
  fecha_calibracion?: string;
  fecha_proxima_calibracion?: string;
  pdf_url?: string;
}
