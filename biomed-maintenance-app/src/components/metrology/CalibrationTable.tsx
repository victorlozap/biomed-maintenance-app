import React from 'react';
import type { CalibrationRecord } from '../../types/metrology';
import { Calendar, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';

interface Props {
  data: CalibrationRecord[];
  loading: boolean;
  onEdit?: (record: CalibrationRecord) => void;
}

const CalibrationTable: React.FC<Props> = ({ data, loading, onEdit }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-slate-500/20 border-t-slate-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        <FileText size={48} className="mx-auto text-slate-500/50 mb-4" />
        <p className="text-white/60">No hay registros de calibración para mostrar.</p>
      </div>
    );
  }

  const getStatusBadge = (nextDateStr?: string) => {
    if (!nextDateStr) return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">Sin Fecha</span>;
    
    const today = dayjs();
    const nextDate = dayjs(nextDateStr);
    const diffDays = nextDate.diff(today, 'day');

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <AlertCircle size={12} /> Vencido
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Clock size={12} /> Próximo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle size={12} /> Vigente
        </span>
      );
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="text-xs uppercase bg-white/5 text-white/60 border-b border-white/10">
          <tr>
            <th className="px-6 py-4 font-semibold tracking-wider">Equipo / Modelo</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Serie / Código</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Servicio</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Certificado</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Última Calibración</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Próx. Calibración</th>
            <th className="px-6 py-4 font-semibold tracking-wider text-center">Estado</th>
            <th className="px-6 py-4 font-semibold tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((record) => (
            <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-white">{record.equipo}</p>
                <p className="text-xs text-white/50">{record.marca} {record.modelo}</p>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium text-slate-300">{record.serie || 'S/N'}</p>
                <p className="text-xs text-slate-500">{record.codigo_equipo}</p>
              </td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {record.servicio}
                </span>
              </td>
              <td className="px-6 py-4">
                {record.nro_certificado || record.pdf_url ? (
                  record.pdf_url ? (
                    <a href={record.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-200 transition-colors group">
                      <FileText size={16} className="text-indigo-400 group-hover:text-indigo-300" />
                      <span className="text-indigo-300 font-mono text-xs group-hover:underline cursor-pointer">
                        {record.nro_certificado || 'Ver PDF'}
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-slate-300 font-mono text-xs">{record.nro_certificado}</span>
                    </div>
                  )
                ) : (
                  <span className="text-white/30 text-xs">N/A</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar size={14} className="text-slate-500" />
                  {record.fecha_calibracion ? dayjs(record.fecha_calibracion).format('DD/MM/YYYY') : <span className="text-slate-500">N/A</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar size={14} className="text-slate-500" />
                  {record.fecha_proxima_calibracion ? dayjs(record.fecha_proxima_calibracion).format('DD/MM/YYYY') : <span className="text-slate-500">N/A</span>}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                {getStatusBadge(record.fecha_proxima_calibracion)}
              </td>
              <td className="px-6 py-4 text-right">
                {onEdit && (
                  <button
                    onClick={() => onEdit(record)}
                    className="p-2 bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors border border-transparent hover:border-indigo-500/30"
                    title="Editar fechas de calibración"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalibrationTable;
