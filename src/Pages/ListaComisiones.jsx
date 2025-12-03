import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Calendar, 
  Search, 
  Users, 
  TrendingUp,
  FileText,
  Eye,
  Briefcase,
  User,
  BarChart3,
  Target
} from "lucide-react";
import ComisionDetalleModal from "../Modales/ComisionDetalleModal";

export default function ListaComisiones() {
  const [comisiones, setComisiones] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    setFechaInicio(primerDiaMes.toISOString().split('T')[0]);
    setFechaFin(ultimoDiaMes.toISOString().split('T')[0]);
  }, []);

  const cargarComisiones = async () => {
    if (!fechaInicio || !fechaFin) return alert("Selecciona un rango de fechas");
    setCargando(true);
    try {
      const res = await fetch(
        `https://sistemagolden-backend-production.up.railway.app/api/comisiones?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      const data = await res.json();
      
      // Agrupar y sumar ventas y comisiones por empleado
      const empleadosAgrupados = data.reduce((acc, current) => {
        const existe = acc.find(item => item.EmpId === current.EmpId);
        
        if (!existe) {
          // Si no existe, agregar el empleado
          acc.push({
            ...current,
            TotalVentas: parseFloat(current.TotalVentas || 0) || 0,
            TotalComision: parseFloat(current.TotalComision || 0) || 0
          });
        } else {
          // Si ya existe, sumar las ventas y comisiones
          existe.TotalVentas += parseFloat(current.TotalVentas || 0) || 0;
          existe.TotalComision += parseFloat(current.TotalComision || 0) || 0;
        }
        
        return acc;
      }, []);
      
      setComisiones(empleadosAgrupados);
      console.log('Datos agrupados:', empleadosAgrupados);
    } catch (err) {
      console.error("Error al cargar comisiones:", err);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar comisiones por búsqueda
  const comisionesFiltradas = comisiones.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      c.Empleado?.toLowerCase().includes(texto) ||
      c.Cargo?.toLowerCase().includes(texto) ||
      c.TipoEmpleado?.toLowerCase().includes(texto)
    );
  });

  // Asegurar que los totales sean números
  const totalComisiones = comisionesFiltradas.reduce((sum, c) => {
    const comision = Number(c.TotalComision) || 0;
    return sum + comision;
  }, 0);

  const totalVentas = comisionesFiltradas.reduce((sum, c) => {
    const venta = Number(c.TotalVentas) || 0;
    return sum + venta;
  }, 0);

  const empleadosConComision = comisionesFiltradas.filter(c => c.Porcentaje && c.Porcentaje != 0).length;

  // Función para manejar el clic en "Detalle"
  const handleVerDetalle = (comision) => {
    console.log('Datos de comisión al abrir modal:', comision);
    
    setEmpleadoSeleccionado({
      empId: comision.EmpId,
      nombre: comision.Empleado,
      cargo: comision.Cargo,
      tipo: comision.TipoEmpleado,
      porcentaje: comision.Porcentaje,
      totalVentas: Number(comision.TotalVentas) || 0,
      totalComision: Number(comision.TotalComision) || 0
    });
  };

  // Función segura para formatear números
  const formatNumber = (value) => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Comisiones</h1>
            <p className="text-gray-600 text-sm">Control y seguimiento de comisiones por empleado</p>
          </div>
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Total Comisiones</p>
                <p className="text-xl sm:text-2xl font-bold">S/ {formatNumber(totalComisiones)}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Ventas Totales</p>
                <p className="text-xl sm:text-2xl font-bold">S/ {formatNumber(totalVentas)}</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Empleados con Comisión</p>
                <p className="text-xl sm:text-2xl font-bold">{empleadosConComision}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por empleado, cargo o tipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {comisionesFiltradas.length} empleados encontrados
            </div>
          </div>

          {/* Fechas */}
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    <span>Fecha Inicio</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 sm:py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    <span>Fecha Fin</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 sm:py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cargarComisiones}
                disabled={cargando}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {cargando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">Cargando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Buscar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla - Versión Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      % Comisión
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ventas Totales
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Comisión Total
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comisionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <FileText className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No se encontraron registros</p>
                          <p className="text-sm">Selecciona un rango de fechas y haz clic en Buscar</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    comisionesFiltradas.map((c) => (
                      <tr
                        key={c.EmpId}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {c.Empleado?.charAt(0) || "E"}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {c.Empleado}
                              </div>
                              <div className="text-sm text-gray-500">ID: {c.EmpId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-700">
                            <Briefcase className="text-gray-400 mr-2 w-4 h-4" />
                            <span className={c.Cargo ? "font-medium text-gray-900" : "text-gray-500 italic"}>
                              {c.Cargo || "Sin cargo"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {c.TipoEmpleado}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {c.Porcentaje && c.Porcentaje != 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Target className="w-3 h-3 mr-1" />
                              {c.Porcentaje}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-900 font-semibold">
                            <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                            S/ {formatNumber(c.TotalVentas)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {c.TotalComision ? (
                            <div className="flex items-center text-green-600 font-bold">
                              <DollarSign className="w-4 h-4 mr-1" />
                              S/ {formatNumber(c.TotalComision)}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleVerDetalle(c)}
                              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Detalle</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Lista - Versión Móvil */}
      <div className="lg:hidden space-y-4">
        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : comisionesFiltradas.length > 0 ? (
          comisionesFiltradas.map((c) => (
            <div key={c.EmpId} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {c.Empleado?.charAt(0) || "E"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {c.Empleado}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {c.EmpId}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleVerDetalle(c)}
                  className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Cargo:</span>
                  <span className={c.Cargo ? "font-medium text-gray-900 truncate" : "text-gray-500 italic"}>
                    {c.Cargo || "Sin cargo"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium text-blue-600">{c.TipoEmpleado}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Comisión:</span>
                  <span className="font-medium text-green-600">
                    {c.Porcentaje ? `${c.Porcentaje}%` : "—"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Ventas:</span>
                  <span className="font-medium text-gray-900">S/ {formatNumber(c.TotalVentas)}</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Total Comisión:</span>
                  <span className="font-bold text-green-600">
                    S/ {formatNumber(c.TotalComision)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <FileText className="w-16 h-16 mb-4 text-gray-300 mx-auto" />
            <p className="text-lg font-medium text-gray-500 mb-2">No se encontraron registros</p>
            <p className="text-sm text-gray-400">Selecciona un rango de fechas y haz clic en Buscar</p>
          </div>
        )}
      </div>

      {/* Resumen Móvil */}
      {comisionesFiltradas.length > 0 && (
        <div className="lg:hidden bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 mt-4">
          <div className="text-center">
            <h4 className="font-semibold text-green-800 text-sm mb-2">Resumen del Periodo</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-green-600">Total Comisiones</p>
                <p className="font-bold text-green-800">S/ {formatNumber(totalComisiones)}</p>
              </div>
              <div>
                <p className="text-blue-600">Ventas Totales</p>
                <p className="font-bold text-blue-800">S/ {formatNumber(totalVentas)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {empleadoSeleccionado && (
        <ComisionDetalleModal
          empleado={empleadoSeleccionado}
          onClose={() => setEmpleadoSeleccionado(null)}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )}
    </div>
  );
}