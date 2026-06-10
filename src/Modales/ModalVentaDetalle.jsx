import React, { useEffect, useState, useCallback } from "react";
import ModalVentaEditar from "../Modales/ModalVentaEditar";
import ModalVentaDetalle from "../Modales/ModalVentaDetalle";
import {
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  User,
  Calendar,
  DollarSign,
  FileText,
  Filter,
  X,
  FileText as FileTextIcon
} from "lucide-react";
import { BACKEND_URL } from '../config';

export default function VentaLista() {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasPagadas: 0,
    ventasAnuladas: 0
  });
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [cargadoInicial, setCargadoInicial] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    try {
      await Promise.all([
        cargarVentas(true),
        cargarEstadisticas(true)
      ]);
      setCargadoInicial(true);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función para cargar las ventas
  const cargarVentas = async (forzarCarga = false) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        search: busqueda,
        page: pagina,
        limit: 8
      });

      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      const res = await fetch(`${BACKEND_URL}/api/venta?${params.toString()}`);
      const data = await res.json();
      
      setVentas(data.ventas || []);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      setVentas([]);
    } finally {
      setCargando(false);
    }
  };

  // Función para cargar estadísticas
  const cargarEstadisticas = async (forzarCarga = false) => {
    setCargandoEstadisticas(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append('search', busqueda);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      const url = `${BACKEND_URL}/api/estadisticas/ventas?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      console.warn('⚠️ Error al cargar estadísticas:', error.message);
      setEstadisticas({
        totalVentas: 0,
        ventasPagadas: 0,
        ventasAnuladas: 0
      });
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  const aplicarFiltros = () => {
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (inicio > fin) {
        alert('❌ La fecha de inicio no puede ser mayor que la fecha fin');
        return;
      }
    }
    setPagina(1);
    cargarVentas(true);
    cargarEstadisticas(true);
  };

  const tieneFiltros = () => {
    return !!(busqueda || fechaInicio || fechaFin);
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setBusqueda("");
    setPagina(1);
    cargarVentas(true);
    cargarEstadisticas(true);
  };

  useEffect(() => {
    if (cargadoInicial) {
      cargarVentas();
    }
  }, [pagina]);

  const eliminarVenta = async (ventaID) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta venta?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/venta/${ventaID}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Venta eliminada correctamente");
        cargarVentas(true);
        cargarEstadisticas(true);
      } else {
        alert("❌ No se pudo eliminar la venta");
      }
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      alert("Error al eliminar la venta");
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      let fechaParte = fechaStr;
      if (fechaStr.includes('T')) {
        fechaParte = fechaStr.split('T')[0];
      }
      if (fechaParte.includes('-')) {
        const partes = fechaParte.split('-');
        if (partes.length === 3) {
          return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
      }
      return fechaStr;
    } catch (error) {
      return fechaStr;
    }
  };

  const formatearMoneda = (n) => `S/ ${Number(n || 0).toFixed(2)}`;

  const abrirDetalle = (ventaID) => {
    setVentaSeleccionada(ventaID);
    setModalAbierto('detalle');
  };

  const abrirEdicion = (ventaID) => {
    setVentaSeleccionada(ventaID);
    setModalAbierto('editar');
  };

  const cerrarModales = () => {
    setVentaSeleccionada(null);
    setModalAbierto(null);
  };

  const recargarTodo = () => {
    cargarVentas(true);
    cargarEstadisticas(true);
  };

  // Mostrar loading mientras carga inicial
  if (!cargadoInicial && cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Ventas</h1>
            <p className="text-gray-600 text-sm">Consulta y administra el historial de ventas</p>
          </div>
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Ventas</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {cargandoEstadisticas ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    formatearMoneda(estadisticas.totalVentas)
                  )}
                </p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Ventas Pagadas</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {cargandoEstadisticas ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    estadisticas.ventasPagadas?.toLocaleString() || 0
                  )}
                </p>
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs sm:text-sm">Ventas Anuladas</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {cargandoEstadisticas ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    estadisticas.ventasAnuladas?.toLocaleString() || 0
                  )}
                </p>
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por cliente, fecha o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center space-x-2 px-4 py-2 sm:py-3 rounded-xl border transition-all duration-200 ${mostrarFiltros || tieneFiltros()
                ? "bg-yellow-50 border-yellow-500 text-yellow-700"
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm sm:text-base">Filtros</span>
              {tieneFiltros() && (
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              )}
            </button>

            <button
              onClick={aplicarFiltros}
              disabled={cargando || cargandoEstadisticas}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {(cargando || cargandoEstadisticas) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Aplicando...</span>
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Aplicar Filtros</span>
                </>
              )}
            </button>
          </div>

          {mostrarFiltros && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={limpiarFiltros}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={recargarTodo}
              disabled={cargando || cargandoEstadisticas}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {(cargando || cargandoEstadisticas) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Cargando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Actualizar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla - Versión Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : ventas && ventas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Venta</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Detalle</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ventas.map((v) => (
                  <tr key={v.VentaID} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          #{v.VentaID}
                        </div>
                        <div className="text-sm text-gray-500">ID: {v.VentaID}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{v.ClienteNombre || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-start">
                        <FileTextIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate max-w-xs" title={v.detalle || ''}>
                          {v.detalle || "Sin detalle"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatearFecha(v.FechaVenta)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-900 font-bold">
                        <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                        {formatearMoneda(v.Total)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        v.Estado === "Pagada" ? "bg-green-100 text-green-800" :
                        v.Estado === "Anulada" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {v.Estado}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => abrirDetalle(v.VentaID)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirEdicion(v.VentaID)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarVenta(v.VentaID)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No hay ventas registradas</p>
            <p className="text-gray-400 text-sm mt-2">Las ventas aparecerán aquí cuando se registren</p>
          </div>
        )}
      </div>

      {/* Lista - Versión Móvil */}
      <div className="lg:hidden space-y-4">
        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : ventas && ventas.length > 0 ? (
          ventas.map((v) => (
            <div key={v.VentaID} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    #{v.VentaID}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{v.ClienteNombre || "—"}</h3>
                    <p className="text-xs text-gray-500">ID: {v.VentaID}</p>
                  </div>
                </div>
                <button
                  onClick={() => abrirDetalle(v.VentaID)}
                  className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2 flex items-start space-x-2 bg-gray-50 p-2 rounded-lg mb-1">
                  <FileTextIcon className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 flex-1 break-words">
                    <span className="font-medium">Detalle:</span> {v.detalle || "Sin detalle"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium text-gray-900">{formatearFecha(v.FechaVenta)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-green-600">{formatearMoneda(v.Total)}</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    v.Estado === "Pagada" ? "bg-green-100 text-green-800" :
                    v.Estado === "Anulada" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {v.Estado}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 mt-3 border-t border-gray-200">
                <button
                  onClick={() => abrirEdicion(v.VentaID)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminarVenta(v.VentaID)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <ShoppingCart className="w-16 h-16 mb-4 text-gray-300 mx-auto" />
            <p className="text-lg font-medium text-gray-500 mb-2">No hay ventas registradas</p>
            <p className="text-sm text-gray-400">Las ventas aparecerán aquí cuando se registren</p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {modalAbierto === 'detalle' && ventaSeleccionada && (
        <ModalVentaDetalle
          ventaId={ventaSeleccionada}
          onClose={cerrarModales}
        />
      )}

      {/* Modal de edición */}
      {modalAbierto === 'editar' && ventaSeleccionada && (
        <ModalVentaEditar
          ventaId={ventaSeleccionada}
          onClose={cerrarModales}
          onGuardado={() => {
            cerrarModales();
            cargarVentas(true);
            cargarEstadisticas(true);
          }}
        />
      )}
    </div>
  );
}