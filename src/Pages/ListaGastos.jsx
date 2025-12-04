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
  Filter,
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import FormularioGasto from "./FormularioGasto";
import urlLink from "../config/config";

export default function ListaGastos() {
  const [gastos, setGastos] = useState([]);
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // ✅ Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: "",
    categoria: "",
    fechaDesde: "",
    fechaHasta: "",
    montoMin: "",
    montoMax: "",
    usuario: ""
  });
  
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [datosCargados, setDatosCargados] = useState(false);

  // ✅ Cargar datos iniciales (categorías y usuarios)
  useEffect(() => {
    console.log("la tuya ",urlLink.toString);
    cargarCategorias();
    cargarUsuarios();
  }, []);

  // ✅ Cargar categorías desde la API
  const cargarCategorias = async () => {
    try {
      const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/gastos/categorias`);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  // ✅ Cargar usuarios desde la API
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/usuarios`);
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  // ✅ Cargar lista de gastos solo cuando se filtre
  const cargarGastos = async () => {
    if (!datosCargados) {
      setLoading(true);
      try {
        const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/gastos`);
        const data = await res.json();
        setGastos(data);
        setGastosFiltrados(data);
        setDatosCargados(true);
      } catch (error) {
        console.error("Error cargando gastos:", error);
        alert("Error al cargar los gastos");
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ Función para aplicar filtros
  const aplicarFiltros = () => {
    if (!datosCargados) {
      alert("Primero debes cargar los datos presionando el botón 'Cargar Datos'");
      return;
    }

    let resultado = [...gastos];

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(gasto =>
        gasto.descripcion?.toLowerCase().includes(busqueda) ||
        gasto.observaciones?.toLowerCase().includes(busqueda) ||
        gasto.usuario?.toLowerCase().includes(busqueda) ||
        gasto.gasto_id?.toString().includes(busqueda)
      );
    }

    // Filtrar por categoría
    if (filtros.categoria) {
      resultado = resultado.filter(gasto => 
        gasto.Nombre === filtros.categoria
      );
    }

    // Filtrar por usuario
    if (filtros.usuario) {
      resultado = resultado.filter(gasto => 
        gasto.usuario === filtros.usuario
      );
    }

    // Filtrar por rango de fechas
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(gasto => 
        new Date(gasto.fecha_gasto) >= fechaDesde
      );
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(gasto => 
        new Date(gasto.fecha_gasto) <= fechaHasta
      );
    }

    // Filtrar por rango de montos
    if (filtros.montoMin) {
      resultado = resultado.filter(gasto => 
        Number(gasto.monto) >= Number(filtros.montoMin)
      );
    }

    if (filtros.montoMax) {
      resultado = resultado.filter(gasto => 
        Number(gasto.monto) <= Number(filtros.montoMax)
      );
    }

    setGastosFiltrados(resultado);
  };

  // ✅ Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      categoria: "",
      fechaDesde: "",
      fechaHasta: "",
      montoMin: "",
      montoMax: "",
      usuario: ""
    });
    if (datosCargados) {
      setGastosFiltrados(gastos);
    }
  };

  // ✅ Eliminar gasto
  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este gasto?")) return;
    try {
      const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/gastos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Gasto eliminado correctamente");
        // Recargar datos
        const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/gastos`);
        const data = await res.json();
        setGastos(data);
        setGastosFiltrados(data);
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
    // Recargar datos después de guardar
    cargarGastos();
  };

  // ✅ Descargar reporte
  const descargarReporte = () => {
    if (gastosFiltrados.length === 0) {
      alert("No hay datos para generar el reporte");
      return;
    }

    const datosReporte = gastosFiltrados.map(gasto => ({
      ID: gasto.gasto_id,
      Descripción: gasto.descripcion,
      Categoría: gasto.Nombre || "-",
      Monto: `$${Number(gasto.monto).toFixed(2)}`,
      Usuario: gasto.usuario || "Sistema",
      Fecha: new Date(gasto.fecha_gasto).toLocaleDateString("es-PE"),
      Observaciones: gasto.observaciones || ""
    }));

    const csvContent = [
      Object.keys(datosReporte[0]).join(","),
      ...datosReporte.map(row => Object.values(row).map(value => `"${value}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_gastos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Estadísticas basadas en datos filtrados
  const stats = {
    total: gastosFiltrados.length,
    montoTotal: gastosFiltrados.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0),
    promedio: gastosFiltrados.length > 0 ? 
      gastosFiltrados.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0) / gastosFiltrados.length : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 p-4 sm:p-6">
      {/* Header con Estadísticas */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Administra y controla todos los gastos del negocio</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {!datosCargados ? (
              <button
                onClick={cargarGastos}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Cargar Datos</span>
              </button>
            ) : (
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
                {mostrarFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={() => openFormulario()}
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nuevo Gasto</span>
            </button>
          </div>
        </div>

        {/* Panel de Filtros */}
        {mostrarFiltros && datosCargados && (
          <div className="mt-4 sm:mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Búsqueda general */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                    placeholder="Buscar por descripción, ID..."
                    className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat.categoria_id} value={cat.Nombre}>
                      {cat.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Usuario</label>
                <select
                  value={filtros.usuario}
                  onChange={(e) => setFiltros({...filtros, usuario: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map((user) => (
                    <option key={user.usuario_id} value={user.nombre || user.usuario}>
                      {user.nombre || user.usuario}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto mínimo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monto Mínimo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filtros.montoMin}
                    onChange={(e) => setFiltros({...filtros, montoMin: e.target.value})}
                    placeholder="Monto mínimo"
                    className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Monto máximo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monto Máximo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filtros.montoMax}
                    onChange={(e) => setFiltros({...filtros, montoMax: e.target.value})}
                    placeholder="Monto máximo"
                    className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                    className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                    className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2 justify-end">
                <button
                  onClick={aplicarFiltros}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-sm flex items-center justify-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Aplicar Filtros</span>
                </button>
                <button
                  onClick={limpiarFiltros}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold text-sm flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar Filtros</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Gastos</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-200" />
            </div>
            {!datosCargados && (
              <p className="text-blue-200 text-xs mt-2">Presiona "Cargar Datos" para ver información</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Monto Total</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">${stats.montoTotal.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-200" />
            </div>
            {!datosCargados && (
              <p className="text-green-200 text-xs mt-2">Presiona "Cargar Datos" para ver información</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Promedio</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">${stats.promedio.toFixed(2)}</p>
              </div>
              <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-200" />
            </div>
            {!datosCargados && (
              <p className="text-purple-200 text-xs mt-2">Presiona "Cargar Datos" para ver información</p>
            )}
          </div>
        </div>

        {/* Botón de descarga de reporte */}
        {datosCargados && gastosFiltrados.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={descargarReporte}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-sm flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Reporte ({gastosFiltrados.length} registros)</span>
            </button>
          </div>
        )}
      </div>

      {/* Mensaje cuando no hay datos cargados */}
      {!datosCargados ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <DollarSign className="w-20 h-20 mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-700 mb-3">Datos no cargados</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Presiona el botón "Cargar Datos" para obtener la información de gastos del sistema.
            </p>
            <button
              onClick={cargarGastos}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-3"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Cargar Datos de Gastos</span>
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <span className="ml-3 text-gray-600">Cargando datos...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Tabla - Versión Desktop */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {gastosFiltrados.length > 0 ? (
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
                        Usuario
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
                    {gastosFiltrados.map((gasto) => (
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
                            {gasto.Nombre || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center text-gray-900 font-semibold">
                            <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                            ${Number(gasto.monto).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-gray-700">
                          {gasto.usuario || "Sistema"}
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
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center text-gray-500">
                  <Search className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No se encontraron gastos con los filtros aplicados</p>
                  <p className="text-sm">Intenta con otros criterios de búsqueda</p>
                  <button
                    onClick={limpiarFiltros}
                    className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lista - Versión Móvil */}
          <div className="lg:hidden space-y-4">
            {gastosFiltrados.length > 0 ? (
              gastosFiltrados.map((gasto) => (
                <div key={gasto.gasto_id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                  {/* Header de la tarjeta */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {gasto.descripcion}
                        </h3>
                        <p className="text-xs text-gray-500">ID: #{gasto.gasto_id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openDetalle(gasto)}
                      className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Información detallada */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Categoría:</span>
                      <span className="font-medium text-blue-600">{gasto.Nombre || "-"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Monto:</span>
                      <span className="font-bold text-green-600">${Number(gasto.monto).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Usuario:</span>
                      <span className="font-medium text-gray-900">{gasto.usuario || "Sistema"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(gasto.fecha_gasto).toLocaleDateString("es-PE")}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end space-x-2 pt-3 mt-3 border-t border-gray-200">
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
                </div>
              ))
            ) : datosCargados ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                <Search className="w-16 h-16 mb-4 text-gray-300 mx-auto" />
                <p className="text-lg font-medium text-gray-500 mb-2">No se encontraron gastos</p>
                <p className="text-sm text-gray-400 mb-4">Intenta con otros filtros o crea un nuevo gasto</p>
                <button
                  onClick={limpiarFiltros}
                  className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}

      {/* Modal de Detalle (mantener igual) */}
      {modalVisible && selectedGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mx-auto relative max-h-[95vh] overflow-y-auto">
            {/* ... (mantener el mismo contenido del modal) ... */}
          </div>
        </div>
      )}

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {selectedGasto ? "Editar Gasto" : "Nuevo Gasto"}
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {selectedGasto ? "Actualiza la información del gasto" : "Registra un nuevo gasto en el sistema"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeFormulario}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <FormularioGasto
                gastoSeleccionado={selectedGasto}
                onClose={closeFormulario}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}