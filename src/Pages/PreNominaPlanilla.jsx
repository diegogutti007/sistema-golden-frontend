import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  Printer,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Briefcase,
  User,
  Wallet,
  AlertCircle,
  Clock,
  Calculator,
  FileText,
  Download,
  Eye,
  X
} from "lucide-react";

import { BACKEND_URL } from "../config";

const PreNominaPlanilla = () => {
  const [empleados, setEmpleados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelected, setPeriodoSelected] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [detalleAsistencias, setDetalleAsistencias] = useState([]);
  const [resumenGeneral, setResumenGeneral] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    fetchPeriodos();
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    setFechaInicio(primerDia.toISOString().split('T')[0]);
    setFechaFin(ultimoDia.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      calcularPlanilla();
    }
  }, [fechaInicio, fechaFin, periodoSelected]);

  const fetchPeriodos = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/periodos-lista`);
      if (response.data.success) {
        setPeriodos(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calcularPlanilla = async () => {
    setCalculando(true);
    setError(null);
    try {
      const params = {};
      if (periodoSelected) params.periodo_id = periodoSelected;
      if (fechaInicio && fechaFin) {
        params.fecha_inicio = fechaInicio;
        params.fecha_fin = fechaFin;
      }
      const response = await axios.get(`${BACKEND_URL}/api/pre-nomina-calculo`, { params });
      if (response.data.success) {
        setEmpleados(response.data.data.empleados || []);
        setResumenGeneral(response.data.data.resumen);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Error al calcular la planilla");
    } finally {
      setCalculando(false);
    }
  };

  const fetchDetalleAsistencias = async (empleado) => {
    setSelectedEmpleado(empleado);
    try {
      const params = {};
      if (periodoSelected) params.periodo_id = periodoSelected;
      if (fechaInicio && fechaFin) {
        params.fecha_inicio = fechaInicio;
        params.fecha_fin = fechaFin;
      }
      const response = await axios.get(`${BACKEND_URL}/api/asistencias-personal/detalle/${empleado.EmpId}`, { params });
      if (response.data.success) {
        setDetalleAsistencias(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const registrarPago = async (empleado, tipo, monto) => {
    if (!monto || monto <= 0) {
      alert("Ingrese un monto válido");
      return;
    }
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/registrar-pago-planilla`, {
        EmpId: empleado.EmpId,
        categoria_id: tipo === 'bono' ? 11 : tipo === 'comision' ? 12 : 2,
        monto: monto,
        fecha_gasto: new Date().toISOString().split('T')[0],
        descripcion: `${tipo === 'bono' ? 'Bono' : tipo === 'comision' ? 'Comisión' : 'Sueldo'} - ${fechaInicio} al ${fechaFin}`,
        periodo_id: periodoSelected || null
      });
      
      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        calcularPlanilla();
      } else {
        alert(`❌ ${response.data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al registrar el pago");
    }
  };

  const formatMoney = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-PE");
  };

  const getDiferenciaColor = (valor) => {
    if (valor > 0) return "text-green-600";
    if (valor < 0) return "text-red-600";
    return "text-gray-600";
  };

  const empleadosFiltrados = empleados.filter(emp =>
    (emp.Nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.Apellidos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.DocID || '').includes(searchTerm)
  );

  const exportarExcel = () => {
    const headers = ['Empleado', 'DNI', 'Sueldo Base', 'Días Trab.', 'Días Aus.', 'Valor Día', 'Descuento', 'Bonos', 'Comisiones', 'Total a Pagar'];
    const rows = empleados.map(emp => [
      `${emp.Nombres} ${emp.Apellidos}`,
      emp.DocID,
      formatMoney(emp.sueldo_base),
      emp.dias_trabajados || 0,
      emp.dias_ausentes || 0,
      formatMoney(emp.valor_dia),
      formatMoney(emp.descuento),
      formatMoney(emp.total_bonos),
      formatMoney(emp.total_comisiones),
      formatMoney(emp.total_pagar)
    ]);
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pre_nomina_${fechaInicio}_${fechaFin}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimirReporte = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Calculator className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Pre-Nómina / Cálculo de Planilla
                </h1>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Cálculo automático de sueldos basado en asistencias, antes de registrar pagos
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
              </button>
              <button
                onClick={calcularPlanilla}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Calcular
              </button>
              <button
                onClick={exportarExcel}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={imprimirReporte}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo (mes)</label>
                <select
                  value={periodoSelected}
                  onChange={(e) => setPeriodoSelected(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar periodo</option>
                  {periodos.map(p => (
                    <option key={p.periodo_id} value={p.periodo_id}>{p.nombre || p.periodo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const hoy = new Date();
                    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                    setFechaInicio(primerDia.toISOString().split('T')[0]);
                    setFechaFin(ultimoDia.toISOString().split('T')[0]);
                    setPeriodoSelected("");
                  }}
                  className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-sm hover:bg-gray-200"
                >
                  Mes Actual
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de Resumen General */}
        {resumenGeneral && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-blue-100 text-xs">Total a Pagar</p>
              <p className="text-xl font-bold">{formatMoney(resumenGeneral.total_pagar)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p className="text-green-100 text-xs">Sueldos Base</p>
              <p className="text-xl font-bold">{formatMoney(resumenGeneral.total_sueldos_base)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-purple-100 text-xs">Bonos + Comisiones</p>
              <p className="text-xl font-bold">{formatMoney(resumenGeneral.total_bonos_comisiones)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
              <p className="text-red-100 text-xs">Descuentos</p>
              <p className="text-xl font-bold">{formatMoney(resumenGeneral.total_descuentos)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <p className="text-orange-100 text-xs">Total Ausencias</p>
              <p className="text-xl font-bold">{resumenGeneral.total_ausencias} días</p>
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Tabla de Empleados */}
        {calculando ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-500">Calculando planilla...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700">{error}</p>
            <button onClick={calcularPlanilla} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Reintentar</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Empleado</th>
                    <th className="px-4 py-3 text-right">Sueldo Base</th>
                    <th className="px-4 py-3 text-center">Días</th>
                    <th className="px-4 py-3 text-center">Ausencias</th>
                    <th className="px-4 py-3 text-right">Valor Día</th>
                    <th className="px-4 py-3 text-right">Descuento</th>
                    <th className="px-4 py-3 text-right">Bonos</th>
                    <th className="px-4 py-3 text-right">Comisiones</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Diferencia</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {empleadosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                        No se encontraron empleados
                      </td>
                    </tr>
                  ) : (
                    empleadosFiltrados.map((emp) => {
                      const diferencia = emp.total_pagar - (emp.sueldo_base || 0);
                      return (
                        <tr key={emp.EmpId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{emp.Nombres} {emp.Apellidos}</p>
                                <p className="text-xs text-gray-400">DNI: {emp.DocID}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{formatMoney(emp.sueldo_base)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-medium">{emp.dias_trabajados || 0}</span>
                            <span className="text-xs text-gray-400 ml-1">/ {emp.dias_laborables || 0}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {emp.dias_ausentes > 0 ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">{emp.dias_ausentes} días</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatMoney(emp.valor_dia)}</td>
                          <td className="px-4 py-3 text-right text-red-600">{formatMoney(emp.descuento)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-green-600">{formatMoney(emp.total_bonos)}</span>
                              <button
                                onClick={() => {
                                  const monto = prompt("Ingrese monto del bono:", 0);
                                  if (monto) registrarPago(emp, 'bono', parseFloat(monto));
                                }}
                                className="p-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
                                title="Agregar Bono"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-purple-600">{formatMoney(emp.total_comisiones)}</span>
                              <button
                                onClick={() => {
                                  const monto = prompt("Ingrese monto de comisión:", 0);
                                  if (monto) registrarPago(emp, 'comision', parseFloat(monto));
                                }}
                                className="p-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                                title="Agregar Comisión"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">{formatMoney(emp.total_pagar)}</td>
                          <td className="px-4 py-3 text-center">
                            <div className={`flex items-center justify-center gap-1 font-medium ${getDiferenciaColor(diferencia)}`}>
                              {diferencia > 0 ? <TrendingUp className="w-4 h-4" /> : diferencia < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                              {formatMoney(Math.abs(diferencia))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => fetchDetalleAsistencias(emp)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Ver detalle de asistencias"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-right font-bold">TOTAL GENERAL:</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      {formatMoney(empleadosFiltrados.reduce((sum, e) => sum + (Number(e.total_pagar) || 0), 0))}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Modal Detalle de Asistencias */}
        {selectedEmpleado && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmpleado(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Detalle de Asistencias</h2>
                    <p className="text-blue-100">{selectedEmpleado.Nombres} {selectedEmpleado.Apellidos}</p>
                  </div>
                  <button onClick={() => setSelectedEmpleado(null)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600">Días Laborables</p>
                    <p className="text-xl font-bold">{selectedEmpleado.dias_laborables || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xs text-green-600">Días Trabajados</p>
                    <p className="text-xl font-bold">{selectedEmpleado.dias_trabajados || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-xs text-red-600">Ausencias</p>
                    <p className="text-xl font-bold">{selectedEmpleado.dias_ausentes || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <p className="text-xs text-yellow-600">Valor por Día</p>
                    <p className="text-xl font-bold">{formatMoney(selectedEmpleado.valor_dia)}</p>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Registro Detallado
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {detalleAsistencias.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay registros de asistencia</p>
                  ) : (
                    detalleAsistencias.map((asis, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{formatDate(asis.Fecha)}</p>
                          <p className="text-xs text-gray-500">
                            {asis.HoraEntrada ? `${asis.HoraEntrada.substring(0,5)} - ${asis.HoraSalida?.substring(0,5) || '—'}` : 'Sin registro'}
                          </p>
                        </div>
                        <div>
                          {asis.Estado === 'Ausente' ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Ausente</span>
                          ) : asis.EsTardanza ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Tardanza ({asis.MinutosTardanza} min)</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Presente</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="border-t p-4 flex justify-end">
                <button onClick={() => setSelectedEmpleado(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreNominaPlanilla;