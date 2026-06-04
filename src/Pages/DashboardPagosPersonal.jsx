import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  Printer,
  Search,
  Eye,
  XCircle,
  Award,
  Gift,
  Briefcase,
  User,
  FileText,
  Wallet,
  AlertCircle
} from "lucide-react";

import { BACKEND_URL } from "../config";

const DashboardPagosPersonal = () => {
  const [empleados, setEmpleados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelected, setPeriodoSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [detallePagos, setDetallePagos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [resumenTipos, setResumenTipos] = useState([]);

  useEffect(() => {
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (periodoSelected) {
      fetchPagosPersonal();
      fetchResumenTipos();
    }
  }, [periodoSelected]);

  const fetchPeriodos = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/periodos-lista`);
      if (response.data.success) {
        setPeriodos(response.data.data);
        if (response.data.data.length > 0) {
          setPeriodoSelected(response.data.data[0].periodo_id);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar periodos");
    }
  };

  const fetchPagosPersonal = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/pagos-personal`, {
        params: { periodo_id: periodoSelected }
      });
      console.log("Respuesta del backend:", response.data); 
      if (response.data.success) {
        setEmpleados(response.data.data.empleados || []);
        setResumen(response.data.data.resumen);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar pagos de personal");
    } finally {
      setLoading(false);
    }
  };

  const fetchResumenTipos = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/pagos-personal/resumen-tipos`, {
        params: { periodo_id: periodoSelected }
      });
      if (response.data.success) {
        setResumenTipos(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetalleEmpleado = async (empleado) => {
    setSelectedEmpleado(empleado);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/pagos-personal/detalle/${empleado.EmpId}`, {
        params: { periodo_id: periodoSelected }
      });
      if (response.data.success) {
        setDetallePagos(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatMoney = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getCategoriaIcon = (categoriaId) => {
    switch(Number(categoriaId)) {
      case 2:
        return <Briefcase className="w-4 h-4" />;
      case 11:
        return <Gift className="w-4 h-4" />;
      case 12:
        return <Award className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getCategoriaColor = (categoriaId) => {
    switch(Number(categoriaId)) {
      case 2:
        return "bg-blue-100 text-blue-700";
      case 11:
        return "bg-green-100 text-green-700";
      case 12:
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filtrar empleados por búsqueda
  const empleadosFiltrados = empleados.filter(emp => 
    (emp.Nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.Apellidos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.DocID || '').includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                  Pagos de Personal
                </h1>
              </div>
              <p className="text-slate-500 mt-2 ml-11">
                Gestión de sueldos, bonos y comisiones por empleado
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <Calendar className="w-4 h-4 text-blue-600" />
                <select
                  value={periodoSelected}
                  onChange={(e) => setPeriodoSelected(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none"
                >
                  {periodos.map(p => (
                    <option key={p.periodo_id} value={p.periodo_id}>
                      {p.nombre || p.periodo}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => fetchPagosPersonal()}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        {resumen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs">Total Sueldos</p>
                  <p className="text-xl font-bold mt-1">{formatMoney(resumen.total_sueldos)}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs">Total Bonos</p>
                  <p className="text-xl font-bold mt-1">{formatMoney(resumen.total_bonos)}</p>
                </div>
                <Gift className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs">Total Comisiones</p>
                  <p className="text-xl font-bold mt-1">{formatMoney(resumen.total_comisiones)}</p>
                </div>
                <Award className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs">Total General</p>
                  <p className="text-xl font-bold mt-1">{formatMoney(resumen.total_general)}</p>
                </div>
                <Wallet className="w-8 h-8 text-emerald-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 text-xs">Empleados</p>
                  <p className="text-xl font-bold mt-1">{resumen.total_empleados}</p>
                </div>
                <Users className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-xs text-slate-200 mt-1">
                {resumen.empleados_con_pagos} con pagos
              </p>
            </div>
          </div>
        )}

        {/* Resumen por Tipo de Pago */}
        {resumenTipos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {resumenTipos.map(tipo => (
              <div key={tipo.categoria_id} className={`rounded-xl p-4 shadow-sm border ${getCategoriaColor(tipo.categoria_id)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoriaIcon(tipo.categoria_id)}
                    <span className="font-semibold">{tipo.tipo_pago}</span>
                  </div>
                  <span className="text-xs">{tipo.empleados_afectados} empleados</span>
                </div>
                <p className="text-2xl font-bold">{formatMoney(tipo.total_monto)}</p>
                <div className="flex justify-between mt-2 text-xs opacity-75">
                  <span>{tipo.total_transacciones} transacciones</span>
                  <span>Prom: {formatMoney(tipo.promedio_monto)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Tabla de Empleados */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Empleado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Sueldo Base</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Sueldo Pagado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Bonos</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Comisiones</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total Recibido</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empleadosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                        No se encontraron empleados
                      </td>
                    </tr>
                  ) : (
                    empleadosFiltrados.map((emp) => {
                      const totalRecibido = Number(emp.total_recibido) || 0;
                      const sueldoBase = Number(emp.sueldo_base) || 0;
                      const porcentaje = sueldoBase > 0 ? (totalRecibido / sueldoBase) * 100 : 0;
                      const estado = totalRecibido >= sueldoBase ? "Completado" : "Pendiente";
                      const estadoColor = totalRecibido >= sueldoBase ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50";
                      
                      return (
                        <tr key={emp.EmpId} className="hover:bg-slate-50 cursor-pointer" onClick={() => fetchDetalleEmpleado(emp)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">
                                  {emp.Nombres} {emp.Apellidos}
                                </div>
                                <div className="text-xs text-slate-400">DNI: {emp.DocID}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatMoney(sueldoBase)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-blue-600 font-medium">
                              {formatMoney(emp.total_sueldo)}
                            </span>
                            {emp.sueldo_pendiente > 0 && (
                              <div className="text-xs text-orange-500">
                                Pendiente: {formatMoney(emp.sueldo_pendiente)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            {formatMoney(emp.total_bonos)}
                          </td>
                          <td className="px-4 py-3 text-right text-purple-600">
                            {formatMoney(emp.total_comisiones)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">
                            {formatMoney(totalRecibido)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor}`}>
                              {estado} ({porcentaje.toFixed(1)}%)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchDetalleEmpleado(emp);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-right font-bold text-slate-700">
                      Total General:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {formatMoney(empleadosFiltrados.reduce((sum, e) => sum + (Number(e.total_recibido) || 0), 0))}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Detalle de Pagos */}
        {selectedEmpleado && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmpleado(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedEmpleado.Nombres} {selectedEmpleado.Apellidos}
                      </h2>
                      <p className="text-blue-100 text-sm">DNI: {selectedEmpleado.DocID}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEmpleado(null)} className="text-white/80 hover:text-white">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Resumen de pagos */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600">Sueldo</p>
                    <p className="text-lg font-bold text-blue-700">{formatMoney(selectedEmpleado.total_sueldo)}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600">Bonos</p>
                    <p className="text-lg font-bold text-green-700">{formatMoney(selectedEmpleado.total_bonos)}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-600">Comisiones</p>
                    <p className="text-lg font-bold text-purple-700">{formatMoney(selectedEmpleado.total_comisiones)}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-100 rounded-xl">
                    <p className="text-xs text-slate-600">Total</p>
                    <p className="text-lg font-bold text-slate-800">{formatMoney(selectedEmpleado.total_recibido)}</p>
                  </div>
                </div>
                
                {/* Tabla de pagos */}
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detalle de Pagos
                </h4>
                
                {detallePagos.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No hay pagos registrados para este empleado en el periodo seleccionado
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detallePagos.map(pago => (
                      <div key={pago.gasto_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded ${getCategoriaColor(pago.categoria_id)}`}>
                            {getCategoriaIcon(pago.categoria_id)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{pago.descripcion}</p>
                            <p className="text-xs text-slate-400">
                              {pago.fecha_gasto ? new Date(pago.fecha_gasto).toLocaleDateString('es-PE') : 'Sin fecha'} • {pago.periodo_nombre}
                            </p>
                            {pago.observaciones && (
                              <p className="text-xs text-slate-500 mt-1">{pago.observaciones}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{formatMoney(pago.monto)}</p>
                          <p className="text-xs text-slate-400">{pago.categoria}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedEmpleado(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Reporte de pagos de personal - Sueldos (cat.2), Bonos (cat.11), Comisiones (cat.12)</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPagosPersonal;