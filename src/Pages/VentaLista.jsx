import React, { useEffect, useState } from "react";
import ModalVentaEditar from "../Modales/ModalVentaEditar";
import ModalVentaDetalle from "../Modales/ModalVentaDetalle";
import {
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
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
  const [modo, setModo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasPagadas: 0,
    ventasAnuladas: 0
  });
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [primeraCarga, setPrimeraCarga] = useState(true);

  const LIMITE = 8;

  // Función para cargar las ventas con paginación
  const cargarVentas = async (forzarCarga = false) => {
    // Si es primera carga y no hay filtros, no cargar
    if (primeraCarga && !forzarCarga && !tieneFiltros()) {
      return;
    }

    setCargando(true);
    try {
      const params = new URLSearchParams({
        search: busqueda
      });

      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      const res = await fetch(
        `${BACKEND_URL}/api/venta?${params.toString()}`
      );
      const data = await res.json();
      setVentas(data.ventas || []);
      setTotalPaginas(data.totalPaginas || 1);
      console.log('datoooo', data.ventas);

      // Marcar que ya no es la primera carga
      if (primeraCarga) {
        setPrimeraCarga(false);
      }
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      alert("Error al cargar las ventas");
    } finally {
      setCargando(false);
    }
  };

  // Función para cargar estadísticas - SOLO CON FILTROS
  const cargarEstadisticas = async (forzarCarga = false) => {
    // Si es primera carga y no hay filtros, no cargar estadísticas
    if (primeraCarga && !forzarCarga && !tieneFiltros()) {
      return;
    }

    setCargandoEstadisticas(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append('search', busqueda);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      const url = `${BACKEND_URL}/api/estadisticas/ventas?${params.toString()}`;

      console.log('📊 Solicitando estadísticas desde:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Estadísticas cargadas:', data);
      setEstadisticas(data);

      // Marcar que ya no es la primera carga
      if (primeraCarga) {
        setPrimeraCarga(false);
      }

    } catch (error) {
      console.warn('⚠️ Endpoint de estadísticas no disponible, usando cálculo local:', error.message);
      calcularEstadisticasLocales();
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  // Fallback para calcular estadísticas
  const calcularEstadisticasLocales = async () => {
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append('search', busqueda);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      const res = await fetch(
        `${BACKEND_URL}/api/venta/todas?${params.toString()}`
      );

      if (res.ok) {
        const todasLasVentas = await res.json();
        const total = todasLasVentas.reduce((sum, v) => sum + (parseFloat(v.Total) || 0), 0);
        const pagadas = todasLasVentas.filter(v => v.Estado === "Pagada").length;
        const anuladas = todasLasVentas.filter(v => v.Estado === "Anulada").length;

        setEstadisticas({
          totalVentas: total,
          ventasPagadas: pagadas,
          ventasAnuladas: anuladas
        });
      }
    } catch (error) {
      console.error("Error al calcular estadísticas locales:", error);
    }
  };


  const aplicarFiltros = () => {
    console.log('🎯 APLICANDO FILTROS:', {
      busqueda: busqueda || '(vacío)',
      fechaInicio: fechaInicio || '(no definida)',
      fechaFin: fechaFin || '(no definida)'
    });

    // Validar fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (inicio > fin) {
        alert('❌ La fecha de inicio no puede ser mayor que la fecha fin');
        return;
      }
    }

    setPagina(1);
    setPrimeraCarga(false);

    // Forzar recarga de ambos
    cargarVentas(true);
    cargarEstadisticas(true);
  };

  // Función para verificar filtros activos
  const tieneFiltros = () => {
    const hayFiltros = !!(busqueda || fechaInicio || fechaFin);
    console.log('🔍 Verificando filtros:', {
      busqueda,
      fechaInicio,
      fechaFin,
      hayFiltros
    });
    return hayFiltros;
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setBusqueda("");
    setPagina(1);
    setPrimeraCarga(true); // Resetear a estado inicial
    setEstadisticas({
      totalVentas: 0,
      ventasPagadas: 0,
      ventasAnuladas: 0
    });
    setVentas([]);
  };

  // Cargar datos solo cuando cambie la página (no por filtros automáticos)
  useEffect(() => {
    if (!primeraCarga) {
      cargarVentas();
    }
  }, [pagina]);

  // Función para eliminar venta
  const eliminarVenta = async (ventaID) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta venta?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/venta/${ventaID}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Venta eliminada correctamente");
        // Recargar solo si ya hay datos cargados
        if (!primeraCarga) {
          cargarVentas(true);
          cargarEstadisticas(true);
        }
      } else {
        alert("❌ No se pudo eliminar la venta");
      }
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      alert("Error al eliminar la venta");
    }
  };

  // Funciones de formato
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';

    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    let fechaParte = fechaStr;

    // Si viene con T (formato ISO: 2026-03-16T05:00:00.000Z)
    if (fechaStr.includes('T')) {
      fechaParte = fechaStr.split('T')[0]; // Tomar solo lo que está antes de T
    }

    // Ahora fechaParte debe ser "2026-03-16"
    if (fechaParte.includes('-')) {
      const partes = fechaParte.split('-');
      if (partes.length === 3) {
        const año = partes[0];
        const mes = partes[1];
        const dia = partes[2];

        // Reordenar a DD-MM-YYYY
        return `${dia}-${mes}-${año}`;
      }
    }

    return fechaStr; // Si no tiene el formato esperado, devolver original
  };

  const formatearMoneda = (n) =>
    `S/ ${Number(n || 0).toFixed(2)}`;

  // Funciones para modales
  const abrirEdicion = (ventaID) => {
    console.log("📝 Abriendo edición para venta:", ventaID);
    setModo("editar");
    setVentaSeleccionada(ventaID);
  };

  const abrirDetalle = (ventaID) => {
    console.log("👁️ Abriendo detalle para venta:", ventaID);
    setModo("");
    setVentaSeleccionada(ventaID);
  };

  const cerrarModales = () => {
    console.log("🚪 Cerrando modales");
    setVentaSeleccionada(null);
    setModo("");
  };

  // Función para recargar todo (solo si hay datos cargados)
  const recargarTodo = () => {
    if (!primeraCarga || tieneFiltros()) {
      cargarVentas(true);
      cargarEstadisticas(true);
    }
  };

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
          {/* Total Ventas */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Ventas</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {primeraCarga && !tieneFiltros() ? (
                    <span className="text-blue-200 text-sm">Usa filtros para ver datos</span>
                  ) : cargandoEstadisticas ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    formatearMoneda(estadisticas.totalVentas)
                  )}
                </p>
                {tieneFiltros() && (
                  <p className="text-blue-200 text-xs mt-1">Filtros aplicados</p>
                )}
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>

          {/* Ventas Pagadas */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Ventas Pagadas</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {primeraCarga && !tieneFiltros() ? (
                    <span className="text-green-200 text-sm">Usa filtros para ver datos</span>
                  ) : cargandoEstadisticas ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    estadisticas.ventasPagadas.toLocaleString()
                  )}
                </p>
                {tieneFiltros() && (
                  <p className="text-green-200 text-xs mt-1">Filtros aplicados</p>
                )}
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
            </div>
          </div>

          {/* Ventas Anuladas */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs sm:text-sm">Ventas Anuladas</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {primeraCarga && !tieneFiltros() ? (
                    <span className="text-red-200 text-sm">Usa filtros para ver datos</span>
                  ) : cargandoEstadisticas ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    estadisticas.ventasAnuladas.toLocaleString()
                  )}
                </p>
                {tieneFiltros() && (
                  <p className="text-red-200 text-xs mt-1">Filtros aplicados</p>
                )}
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-200" />
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
                placeholder="Buscar por cliente, fecha o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* Botón para mostrar/ocultar filtros */}
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

            {/* Botón Aplicar Filtros */}
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

          {/* Filtros de Fecha - Se muestran condicionalmente */}
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
                  disabled={!tieneFiltros() && primeraCarga}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          )}

          {/* Botón Actualizar */}
          <div className="flex gap-3">
            <button
              onClick={recargarTodo}
              disabled={(cargando || cargandoEstadisticas) || (primeraCarga && !tieneFiltros())}
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
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Venta
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    {/* 🔹 NUEVA COLUMNA DETALLE */}
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FileTextIcon className="w-3 h-3" />
                        Detalle
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ventas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No se encontraron ventas</p>
                          <p className="text-sm">Intenta con otros términos de búsqueda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ventas.map((v) => (
                      <tr
                        key={v.VentaID}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                              #{v.VentaID}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {v.VentaID}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {v.ClienteNombre || "—"}
                            </span>
                          </div>
                        </td>
                        {/* 🔹 NUEVA CELDA DETALLE */}
                        <td className="py-4 px-6">
                          <div className="flex items-start">
                            <FileTextIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span
                              className={`text-sm max-w-xs truncate ${v.Detalle ? 'text-gray-700' : 'text-red-500 font-medium'}`}
                              title={v.Detalle || ''}
                            >
                              {v.Detalle || "No se encontró la cita"}
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${v.Estado === "Pagada"
                            ? "bg-green-100 text-green-800"
                            : v.Estado === "Anulada"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {v.Estado}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => abrirDetalle(v.VentaID)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => abrirEdicion(v.VentaID)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => eliminarVenta(v.VentaID)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
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
        ) : ventas.length > 0 ? (
          ventas.map((v) => (
            <div key={v.VentaID} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    #{v.VentaID}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {v.ClienteNombre || "—"}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {v.VentaID}</p>
                  </div>
                </div>
                <button
                  onClick={() => abrirDetalle(v.VentaID)}
                  className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* 🔹 NUEVA FILA DETALLE - OCUPA TODAS LAS COLUMNAS */}
                <div className="col-span-2 flex items-start space-x-2 bg-gray-50 p-2 rounded-lg mb-1">
                  <FileTextIcon className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 flex-1 break-words">
                    <span className="font-medium">Detalle:</span> {v.Detalle || "Sin detalle"}
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
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${v.Estado === "Pagada"
                    ? "bg-green-100 text-green-800"
                    : v.Estado === "Anulada"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {v.Estado}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-2 pt-3 mt-3 border-t border-gray-200">
                <button
                  onClick={() => abrirEdicion(v.VentaID)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminarVenta(v.VentaID)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
            <p className="text-lg font-medium text-gray-500 mb-2">No se encontraron ventas</p>
            <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {ventaSeleccionada && !modo && (
        <ModalVentaDetalle
          ventaId={ventaSeleccionada}
          onClose={cerrarModales}
        />
      )}

      {/* Modal de edición */}
      {ventaSeleccionada && modo === "editar" && (
        <ModalVentaEditar
          ventaId={ventaSeleccionada}
          onClose={cerrarModales}
          onGuardado={() => {
            cerrarModales();
            cargarVentas();
            cargarEstadisticas();
          }}
        />
      )}
    </div>
  );
}