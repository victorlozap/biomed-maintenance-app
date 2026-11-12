import * as XLSX from 'xlsx';
import { getEnrichedEquipmentSpecs } from './equipmentCatalogSpecs';

/**
 * Generador de Hoja de Vida en formato Excel oficial (.xlsx)
 * Basado en la plantilla institucional GRF3MAN-FR18 VERSION 5.0 del Hospital Universitario San Jorge
 */
export const generateProfileExcel = async (equipment: any) => {
  try {
    // 1. Cargar la plantilla oficial desde /formatos
    const templateUrl = '/formatos/GRF3MAN-FR18_VERSION_5.0.xlsx';
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar la plantilla oficial de Excel: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });
    const sheetName = workbook.SheetNames[0];
    const ws = workbook.Sheets[sheetName];

    // 2. Extraer datos enriquecidos con catálogo técnico oficial (AS-12248)
    const eq = getEnrichedEquipmentSpecs(equipment);

    const calibracionVal = String(eq.RequiereCalibracion || '').toLowerCase();
    const isCalibracionSi = calibracionVal === 'si' || calibracionVal === 'sí' || calibracionVal === 'yes' || calibracionVal === '1' || calibracionVal === 'true' || Boolean(eq.FechaCalibracion);

    const tecControladaVal = String(eq.TecnologiaControlada || '').toLowerCase();
    const isTecControladaSi = tecControladaVal === 'si' || tecControladaVal === 'sí' || tecControladaVal === 'true' || tecControladaVal === '1';

    // Helper para asignar valor en celda sin destruir su formato
    const setCell = (coord: string, val: any) => {
      if (val === undefined || val === null || val === '') return;
      const strVal = String(val);
      ws[coord] = { t: 's', v: strVal };
    };

    // 3. Mapeo riguroso de celdas según plantilla oficial GRF3MAN-FR18 v5.0
    // SECCIÓN 1: IDENTIFICACIÓN DEL EQUIPO
    setCell('D9', eq.Equipo);
    setCell('K9', eq.FechaCompra);
    setCell('D10', eq.Marca);
    setCell('K10', eq.FechaInstalacion);
    setCell('D11', eq.Modelo);
    setCell('K11', eq.FormaAdquisicion);
    setCell('D12', eq.NumeroSerie);
    setCell('K12', eq.Proveedor);
    setCell('D13', eq.Id_Unico);
    setCell('K13', eq.Direccion);
    setCell('D14', eq.Servicio);
    setCell('K14', eq.Ciudad);
    setCell('D15', eq.Ubicacion);
    setCell('K15', eq.Telefono);
    setCell('D16', eq.ValorAdquisicion);
    setCell('K16', eq.Garantia);

    // SECCIÓN 2: USO PREVISTO DE LA TECNOLOGÍA BIOMÉDICA
    setCell('B20', eq.UsoPrevisto || 'EQUIPO DESTINADO PARA LA ATENCIÓN, MONITOREO O SOPORTE CLÍNICO ASISTENCIAL SEGÚN ESPECIFICACIÓN DEL FABRICANTE.');

    // SECCIÓN 3: CLASIFICACIÓN Y RIESGO
    setCell('E27', eq.ClasificacionBiomedica);
    setCell('L27', eq.PermisoComercializacion);
    setCell('E28', eq.Riesgo);
    setCell('L28', eq.FuenteEnergia);
    setCell('E29', eq.RegistroInvima);
    if (isTecControladaSi) {
      setCell('K29', '[X] SI');
      setCell('M29', '[ ] NO');
    } else {
      setCell('K29', '[ ] SI');
      setCell('M29', '[X] NO');
    }

    // SECCIÓN 4: CARACTERÍSTICAS TÉCNICAS Y CONDICIONES DE CALIDAD
    setCell('D34', eq.Voltaje);
    setCell('L34', eq.Frecuencia);
    setCell('D35', eq.Corriente);
    if (isCalibracionSi) {
      setCell('J35', '[X] SI');
      setCell('L35', '[ ] NO');
      if (eq.CalibracionTipo.toLowerCase().includes('legal')) {
        setCell('J36', '[ ] TRAZABLE');
        setCell('L36', '[X] LEGAL');
      } else {
        setCell('J36', '[X] TRAZABLE');
        setCell('L36', '[ ] LEGAL');
      }
    } else {
      setCell('J35', '[ ] SI');
      setCell('L35', '[X] NO');
      setCell('J36', '[ ] TRAZABLE');
      setCell('L36', '[ ] LEGAL');
    }
    setCell('D36', eq.Potencia);
    setCell('D37', eq.FrecuenciaElectrica);
    setCell('J37', eq.VariablesMedir || 'N/A');

    // SECCIÓN 5: PLANOS MANUALES
    setCell('C44', eq.CodigoManual || 'N/A');
    setCell('J44', eq.Planos);
    setCell('M44', eq.Operacion);
    setCell('C45', eq.Idioma);
    setCell('J45', eq.ServicioManual);

    // SECCIÓN 6: ACCESORIOS
    setCell('B49', eq.Accesorios || 'Cables de alimentación, sensores y periféricos correspondientes según dotación estándar.');

    // SECCIÓN 7: CONDICIONES DE USO
    setCell('B52', eq.CondicionesUso || 'Operar bajo condiciones ambientales controladas, red eléctrica regulada y cumplimiento estricto del protocolo de limpieza y desinfección institucional.');

    // 4. Exportar y descargar archivo binario en el navegador
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `HV_GRF3MAN-FR18_v5_${eq.Id_Unico || 'Equipo'}.xlsx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generando Excel de Hoja de Vida:', error);
    throw error;
  }
};

