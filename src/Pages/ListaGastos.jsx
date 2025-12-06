import React, { useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Tag,
  Clock,
  CheckCircle,
  CreditCard,
  Building,
  User,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { BACKEND_URL } from '../config';
import ModalFormularioGasto from "../Modales/ModalFormularioGasto";

export default function ListaGastos() {
  const [gastos, setGastos] = useState([]);
  const [gastosOriginales, setGastosOriginales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);

  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    nombre: "",
    periodo: "",
    fechaDesde: "",
    fechaHasta: "",
    categoria: "",
    empleado: ""
  });

  // Opciones para los select
  const [opciones, setOpciones] = useState({
    periodos: [],
    categorias: [],
    empleados: []
  });

  // ✅ Cargar lista de gastos y extraer opciones únicas
  const cargarGastos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/gastos`);
      const data = await res.json();
      setGastos(data);
      setGastosOriginales(data);

      // Extraer opciones únicas para los filtros
      const periodosUnicos = [...new Set(data.map(g => g.periodo_nombre).filter(Boolean))].sort();
      const categoriasUnicas = [...new Set(data.map(g => g.categoria_nombre).filter(Boolean))].sort();
      const empleadosUnicos = [...new Set(data.map(g => g.empleado_nombre || g.empleado).filter(Boolean))].sort();

      setOpciones({
        periodos: periodosUnicos,
        categorias: categoriasUnicas,
        empleados: empleadosUnicos
      });
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(BACKEND_URL);
    cargarGastos();
  }, []);

  // ✅ Aplicar filtros
  const aplicarFiltros = () => {
    let resultados = [...gastosOriginales];

    // Filtro por nombre/descripción
    if (filtros.nombre) {
      resultados = resultados.filter(gasto =>
        gasto.descripcion.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    // Filtro por período
    if (filtros.periodo) {
      resultados = resultados.filter(gasto =>
        gasto.periodo_nombre === filtros.periodo
      );
    }

    // Filtro por categoría
    if (filtros.categoria) {
      resultados = resultados.filter(gasto =>
        gasto.categoria_nombre === filtros.categoria
      );
    }

    // Filtro por empleado
    if (filtros.empleado) {
      resultados = resultados.filter(gasto =>
        (gasto.empleado_nombre || gasto.empleado) === filtros.empleado
      );
    }

    // Filtro por fechas
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultados = resultados.filter(gasto =>
        new Date(gasto.fecha_gasto) >= fechaDesde
      );
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      resultados = resultados.filter(gasto =>
        new Date(gasto.fecha_gasto) <= fechaHasta
      );
    }

    setGastos(resultados);
  };

  // ✅ Resetear filtros
  const resetearFiltros = () => {
    setFiltros({
      nombre: "",
      periodo: "",
      fechaDesde: "",
      fechaHasta: "",
      categoria: "",
      empleado: ""
    });
    setGastos(gastosOriginales);
    setShowFiltros(false);
  };

  // ✅ Limpiar filtro específico
  const limpiarFiltro = (campo) => {
    setFiltros(prev => ({ ...prev, [campo]: "" }));
  };

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    aplicarFiltros();
  }, [filtros]);

  // ✅ Eliminar gasto
  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este gasto?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/gastos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Gasto eliminado correctamente");
        cargarGastos();
      } else {
        alert("❌ Error al eliminar gasto");
      }
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
    }
  };

  // ✅ Ver detalle
  const openDetalle = (gasto) => {
    setSelectedGasto(gasto);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedGasto(null);
    setModalVisible(false);
  };

  // ✅ Crear o editar
  const openFormulario = (gasto = null) => {
    setSelectedGasto(gasto);
    setShowForm(true);
  };

  const closeFormulario = () => {
    setSelectedGasto(null);
    setShowForm(false);
    cargarGastos();
  };

  // Contar filtros activos
  const filtrosActivos = Object.values(filtros).filter(val => val !== "").length;

  // Estadísticas (usando gastos filtrados)
  const stats = {
    total: gastos.length,
    montoTotal: gastos.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0),
    promedio: gastos.length > 0 ? gastos.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0) / gastos.length : 0,
    filtrados: gastosOriginales.length - gastos.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 p-3 sm:p-4 md:p-6">
      {/* Header con Estadísticas */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">Administra y controla todos los gastos del negocio</p>
            </div>
          </div>

          {/*           <button
            onClick={() => openFormulario()}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Nuevo Gasto</span>
          </button> */}
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm md:text-base">Total Gastos</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</p>
                {stats.filtrados > 0 && (
                  <p className="text-blue-200 text-xs mt-1">
                    {stats.filtrados} ocultos por filtros
                  </p>
                )}
              </div>
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm md:text-base">Monto Total</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">S/.{stats.montoTotal.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm md:text-base">Promedio</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">S/.{stats.promedio.toFixed(2)}</p>
              </div>
              <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs sm:text-sm md:text-base">Filtros Activos</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{filtrosActivos}</p>
              </div>
              <Filter className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-amber-200" />
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mt-6 space-y-3">
          {/* Barra de búsqueda principal */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={filtros.nombre}
                onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              {filtros.nombre && (
                <button
                  onClick={() => limpiarFiltro('nombre')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Filtros Avanzados</span>
              {filtrosActivos > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {filtrosActivos}
                </span>
              )}
              {showFiltros ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Filtros avanzados */}
          {showFiltros && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro por período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Período
                  </label>
                  <div className="relative">
                    <select
                      value={filtros.periodo}
                      onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Todos los períodos</option>
                      {opciones.periodos.map((periodo, index) => (
                        <option key={index} value={periodo}>{periodo}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {filtros.periodo && (
                    <button
                      onClick={() => limpiarFiltro('periodo')}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar filtro de período
                    </button>
                  )}
                </div>

                {/* Filtro por categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      value={filtros.categoria}
                      onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Todas las categorías</option>
                      {opciones.categorias.map((categoria, index) => (
                        <option key={index} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {filtros.categoria && (
                    <button
                      onClick={() => limpiarFiltro('categoria')}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar filtro de categoría
                    </button>
                  )}
                </div>

                {/* Filtro por empleado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Empleado
                  </label>
                  <div className="relative">
                    <select
                      value={filtros.empleado}
                      onChange={(e) => setFiltros({ ...filtros, empleado: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Todos los empleados</option>
                      {opciones.empleados.map((empleado, index) => (
                        <option key={index} value={empleado}>{empleado}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {filtros.empleado && (
                    <button
                      onClick={() => limpiarFiltro('empleado')}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar filtro de empleado
                    </button>
                  )}
                </div>

                {/* Filtro por fecha desde */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {filtros.fechaDesde && (
                    <button
                      onClick={() => limpiarFiltro('fechaDesde')}
                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar fecha desde
                    </button>
                  )}
                </div>

                {/* Filtro por fecha hasta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {filtros.fechaHasta && (
                    <button
                      onClick={() => limpiarFiltro('fechaHasta')}
                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar fecha hasta
                    </button>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex items-end">
                  <button
                    onClick={resetearFiltros}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Limpiar todos los filtros</span>
                  </button>
                </div>
              </div>

              {/* Indicadores de filtros activos */}
              {filtrosActivos > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Filtros aplicados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {filtros.nombre && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Nombre: {filtros.nombre}
                        <button
                          onClick={() => limpiarFiltro('nombre')}
                          className="ml-1 hover:text-yellow-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filtros.periodo && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Período: {filtros.periodo}
                        <button
                          onClick={() => limpiarFiltro('periodo')}
                          className="ml-1 hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filtros.categoria && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Categoría: {filtros.categoria}
                        <button
                          onClick={() => limpiarFiltro('categoria')}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filtros.empleado && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Empleado: {filtros.empleado}
                        <button
                          onClick={() => limpiarFiltro('empleado')}
                          className="ml-1 hover:text-indigo-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filtros.fechaDesde && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Desde: {new Date(filtros.fechaDesde).toLocaleDateString("es-PE")}
                        <button
                          onClick={() => limpiarFiltro('fechaDesde')}
                          className="ml-1 hover:text-emerald-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filtros.fechaHasta && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Hasta: {new Date(filtros.fechaHasta).toLocaleDateString("es-PE")}
                        <button
                          onClick={() => limpiarFiltro('fechaHasta')}
                          className="ml-1 hover:text-emerald-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-3 sm:mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="text-sm sm:text-base text-gray-700">
                Mostrando <span className="font-bold text-gray-900">{gastos.length}</span> de{' '}
                <span className="font-bold text-gray-900">{gastosOriginales.length}</span> gastos
              </span>
            </div>
            {filtrosActivos > 0 && (
              <button
                onClick={resetearFiltros}
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla - Versión Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
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
                      Descripción
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gastos.length > 0 ? (
                    gastos.map((gasto) => (
                      <tr
                        key={gasto.gasto_id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm mr-3">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {gasto.descripcion}
                              </div>
                              <div className="text-sm text-gray-500">#{gasto.gasto_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {gasto.categoria_nombre || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center text-gray-900 font-semibold">
                            <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                            S/.{Number(gasto.monto).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {gasto.periodo_nombre || "Sin período"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-sm text-gray-700">
                          <div className="flex items-center justify-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(gasto.fecha_gasto).toLocaleDateString("es-PE")}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => openDetalle(gasto)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openFormulario(gasto)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => eliminarGasto(gasto.gasto_id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <Filter className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">
                            {filtrosActivos > 0 ? "No se encontraron gastos con los filtros aplicados" : "No se encontraron gastos"}
                          </p>
                          <p className="text-sm">
                            {filtrosActivos > 0 ? "Intenta con otros criterios de búsqueda" : "Comienza registrando tu primer gasto"}
                          </p>
                          {filtrosActivos > 0 && (
                            <button
                              onClick={resetearFiltros}
                              className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
                            >
                              Limpiar todos los filtros
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Lista - Versión Móvil y Tablet */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : gastos.length > 0 ? (
          gastos.map((gasto) => (
            <div key={gasto.gasto_id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 hover:shadow-xl transition-shadow duration-200">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {gasto.descripcion}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {/*  <p className="text-xs text-gray-500">ID: #{gasto.gasto_id}</p> */}
                      {gasto.periodo_nombre && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                          {gasto.periodo_nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Botón detalle eliminado de aquí */}
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 truncate">Categoría</p>
                    <p className="font-medium text-blue-600 truncate">{gasto.categoria_nombre || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 truncate">Monto</p>
                    <p className="font-bold text-green-600">S/.{Number(gasto.monto).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg sm:col-span-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 truncate">Período</p>
                    <p className="font-medium text-purple-700 truncate">{gasto.periodo_nombre || "Sin período"}</p>
                  </div>
                </div>
              </div>

              {/* Fecha */}
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {new Date(gasto.fecha_gasto).toLocaleDateString("es-PE")}
                </span>
              </div>

              {/* Acciones - TODOS los botones en la misma fila */}
              <div className="flex justify-end space-x-2 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={() => openDetalle(gasto)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                  title="Ver detalle"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Detalle</span>
                </button>
                
                <button
                  onClick={() => openFormulario(gasto)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200 flex items-center space-x-1 border border-yellow-200"
                  title="Editar"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Editar</span>
                </button>
                
                <button
                  onClick={() => eliminarGasto(gasto.gasto_id)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center space-x-1 border border-red-200"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Eliminar</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center">
            <Filter className="w-16 h-16 sm:w-20 sm:h-20 mb-4 text-gray-300 mx-auto" />
            <p className="text-lg sm:text-xl font-medium text-gray-500 mb-2">
              {filtrosActivos > 0 ? "No se encontraron gastos con los filtros aplicados" : "No se encontraron gastos"}
            </p>
            <p className="text-sm sm:text-base text-gray-400 mb-4">
              {filtrosActivos > 0 ? "Intenta con otros criterios de búsqueda" : "Comienza registrando tu primer gasto"}
            </p>
            {filtrosActivos > 0 && (
              <button
                onClick={resetearFiltros}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalle Mejorado - Totalmente Responsive */}
      {modalVisible && selectedGasto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mx-auto relative max-h-[95vh] overflow-y-auto animate-fade-in">
            {/* Header móvil */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-5 md:px-6 py-4 md:py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                      Detalle del Gasto
                    </h2>
                    <p className="text-amber-100 text-xs sm:text-sm truncate">
                      Información completa registrada
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white/90 hover:text-white transition-all p-1.5 sm:p-2 hover:bg-white/10 rounded-xl backdrop-blur-sm flex-shrink-0 ml-2"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              {/* Encabezado con descripción y monto */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">
                      {selectedGasto.descripcion}
                    </h3>
                    {/*                     <p className="text-gray-600 text-xs sm:text-sm">
                      ID: <span className="font-mono text-gray-800">#{selectedGasto.gasto_id}</span>
                    </p> */}
                  </div>
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 sm:py-3 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-sm sm:text-base md:text-lg font-semibold">
                      S/.{Number(selectedGasto.monto).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid de información principal - Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Columna izquierda */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Categoría */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <Tag className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Categoría</h4>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {selectedGasto.categoria_nombre || "Sin categoría"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Período */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <Calendar className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Período</h4>
                        <div className="mt-1">
                          {selectedGasto.periodo_nombre ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-base sm:text-lg font-bold text-gray-900">
                                {selectedGasto.periodo_nombre}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded self-start">
                                {selectedGasto.periodo_nombre.includes('/') ? 'Mes/Año' : 'Mensual'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 italic text-sm">No especificado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usuario */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <Users className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Registrado por</h4>
                        <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">
                          {selectedGasto.usuario || "Sistema"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Fecha */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <Calendar className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha del Gasto</h4>
                        <div className="mt-1">
                          <p className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                            {new Date(selectedGasto.fecha_gasto).toLocaleDateString("es-PE", {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {/*                          <p className="text-xs text-gray-600">
                            {new Date(selectedGasto.fecha_gasto).toLocaleTimeString("es-PE", {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Pago */}
                  {selectedGasto.TipoPago && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                          <CreditCard className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Método de Pago</h4>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                              {selectedGasto.TipoPago}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empleado (reemplazando Estado) */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <User className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Empleado</h4>
                        <div className="mt-1">
                          {selectedGasto.empleado_nombre || selectedGasto.empleado ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                {selectedGasto.empleado_nombre || selectedGasto.empleado}
                              </span>
                              {selectedGasto.empleado_cargo && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {selectedGasto.empleado_cargo}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-sm">No asignado</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl border border-amber-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border-b border-amber-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs sm:text-sm font-semibold text-amber-900 uppercase tracking-wide">Observaciones</h4>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    {selectedGasto.observaciones ? (
                      <div className="max-w-none">
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                          {selectedGasto.observaciones}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center">
                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-2 sm:mb-3" />
                        <p className="text-gray-500 font-medium text-sm sm:text-base">Sin observaciones registradas</p>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">Puedes agregar observaciones al editar este gasto</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen estadístico */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
                <h4 className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4">Resumen del Período</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  <div className="text-center p-2 sm:p-3">
                    <p className="text-gray-400 text-xs mb-1">Monto</p>
                    <p className="text-white text-base sm:text-lg md:text-xl font-bold">S/.{Number(selectedGasto.monto).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3">
                    <p className="text-gray-400 text-xs mb-1">Período</p>
                    <p className="text-white text-sm sm:text-base font-semibold">
                      {selectedGasto.periodo_nombre || "N/A"}
                    </p>
                  </div>
                  <div className="text-center p-2 sm:p-3 md:col-span-1">
                    <p className="text-gray-400 text-xs mb-1">Fecha Registro</p>
                    <p className="text-white text-xs sm:text-sm">
                      {new Date(selectedGasto.fecha_gasto).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-3 sm:pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-3 sm:mb-0 text-center sm:text-left w-full sm:w-auto">
                  <p className="text-xs">Consultado el {new Date().toLocaleDateString("es-PE", {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <ModalFormularioGasto
            gastoSeleccionado={selectedGasto}
            onClose={closeFormulario}
          />
        </div>
      )}
    </div>
  );
}