import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { CalibrationRecord } from '../../types/metrology';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: CalibrationRecord | null;
  onSuccess: () => void;
}

const EditCalibrationModal: React.FC<Props> = ({ isOpen, onClose, record, onSuccess }) => {
  const [fechaCalibracion, setFechaCalibracion] = useState('');
  const [fechaProxima, setFechaProxima] = useState('');
  const [nroCertificado, setNroCertificado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record && isOpen) {
      setFechaCalibracion(record.fecha_calibracion ? dayjs(record.fecha_calibracion).format('YYYY-MM-DD') : '');
      setFechaProxima(record.fecha_proxima_calibracion ? dayjs(record.fecha_proxima_calibracion).format('YYYY-MM-DD') : '');
      setNroCertificado(record.nro_certificado || '');
      setError(null);
    }
  }, [record, isOpen]);

  // Si cambia la fecha de calibración, actualizamos automáticamente la próxima sumando 1 año
  const handleFechaCalibracionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setFechaCalibracion(newVal);
    if (newVal) {
      const nextYear = dayjs(newVal).add(1, 'year').format('YYYY-MM-DD');
      setFechaProxima(nextYear);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Actualizar Metrología (calibrations)
      const { error: calError } = await supabase
        .from('calibrations')
        .update({
          fecha_calibracion: fechaCalibracion || null,
          fecha_proxima_calibracion: fechaProxima || null,
          nro_certificado: nroCertificado || null,
        })
        .eq('id', record.id);

      if (calError) throw calError;

      // 2. Actualizar Inventario Maestro (equipments) si tiene codigo_equipo
      if (record.codigo_equipo) {
        const { error: eqError } = await supabase
          .from('equipments')
          .update({
            fecha_calibracion: fechaCalibracion || null,
            fecha_vencimiento_calibracion: fechaProxima || null,
            certificado_calibracion: nroCertificado || null,
          })
          .eq('id_unico', record.codigo_equipo);
          
        if (eqError) throw eqError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving calibration:', err);
      setError(err.message || 'Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Editar Calibración</h3>
          <button 
            onClick={onClose}
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="text-white/80 font-medium">{record.equipo}</p>
            <p className="text-white/50 text-sm">{record.marca} {record.modelo} | AF: {record.codigo_equipo}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Fecha de Calibración</label>
            <input 
              type="date" 
              value={fechaCalibracion}
              onChange={handleFechaCalibracionChange}
              className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Fecha de Próximo Vencimiento</label>
            <input 
              type="date" 
              value={fechaProxima}
              onChange={(e) => setFechaProxima(e.target.value)}
              className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Nro. de Certificado (Opcional)</label>
            <input 
              type="text" 
              value={nroCertificado}
              onChange={(e) => setNroCertificado(e.target.value)}
              placeholder="Ej: J0890925"
              className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCalibrationModal;
