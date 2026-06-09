import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Wallet,
  Calendar,
  PieChart,
  Bell,
  CheckSquare,
  RefreshCw,
  Printer,
  Target,
  Gauge,
  CircleDollarSign,
  Ban,
  Flame,
  Award,
  ThumbsUp,
  ThumbsDown,
  LayoutDashboard,
  Eye,
  XCircle,
  FileText,
  Clock,
  User,
  Search
} from "lucide-react";

import { BACKEND_URL } from "../config";

const DashboardGastos = () => {
  const [categorias, setCategorias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelected, setPeriodoSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  
  // Estados para el detalle de gastos
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detalleGastos, setDetalleGastos] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [searchTermGasto, setSearchTermGasto] = useState("");

  useEffect(() => {
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (periodoSelected) {
      fetchDashboard();
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

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/presupuestos-alertas`, {
        params: { periodo_id: periodoSelected }
      });
      if (response.data.success) {
        setCategorias(response.data.data.categorias || []);
        setResumen(response.data.data.resumen);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener detalle de gastos por categoría
  const fetchDetalleGastos = async (categoria) => {
    setLoadingDetalle(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/gastos-por-categoria`, {
        params: { 
          categoria_id: categoria.categoria_id,
          periodo_id: periodoSelected,
          limite: 100
        }
      });
      if (response.data.success) {
        setDetalleGastos(response.data.data || []);
      } else {
        setDetalleGastos([]);
      }
    } catch (err) {
      console.error(err);
      setDetalleGastos([]);
    } finally {
      setLoadingDetalle(false);
      setShowDetailModal(true);
    }
  };

  const handleCardClick = (categoria) => {
    setSelectedCategoria(categoria);
    fetchDetalleGastos(categoria);
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

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Filtrar gastos por búsqueda
  const gastosFiltrados = detalleGastos.filter(gasto => 
    gasto.descripcion?.toLowerCase().includes(searchTermGasto.toLowerCase()) ||
    gasto.categoria?.toLowerCase().includes(searchTermGasto.toLowerCase()) ||
    gasto.observaciones?.toLowerCase().includes(searchTermGasto.toLowerCase())
  );

  // Configuración de íconos y colores por estado
  const getEstadoConfig = (estado, porcentaje = 0) => {
    switch(estado) {
      case 'SOBREPASADO':
        return {
          nombre: 'Sobrepasado',
          icono: <Flame className="w-6 h-6" />,
          color: 'red',
          bgGradiente: 'from-red-600 to-red-700',
          bgLight: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-700',
          indicador: '🔴',
          mensaje: '¡Has superado el presupuesto!',
          accion: 'Revisar gastos urgentemente'
        };
      case 'COMPLETADO':
        return {
          nombre: 'Completado',
          icono: <Award className="w-6 h-6" />,
          color: 'blue',
          bgGradiente: 'from-blue-600 to-blue-700',
          bgLight: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700',
          indicador: '🔵',
          mensaje: 'Presupuesto ejecutado al 100%',
          accion: 'Presupuesto cumplido'
        };
      case 'CERCANO':
        return {
          nombre: 'Cercano al límite',
          icono: <Bell className="w-6 h-6" />,
          color: 'yellow',
          bgGradiente: 'from-yellow-500 to-yellow-600',
          bgLight: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-700',
          indicador: '🟡',
          mensaje: `Estás al ${porcentaje.toFixed(0)}% del presupuesto`,
          accion: 'Moderar gastos'
        };
      case 'NORMAL':
        return {
          nombre: 'Normal',
          icono: <ThumbsUp className="w-6 h-6" />,
          color: 'green',
          bgGradiente: 'from-green-500 to-green-600',
          bgLight: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-700',
          indicador: '🟢',
          mensaje: 'Dentro del presupuesto',
          accion: 'Continuar así'
        };
      default:
        return {
          nombre: 'Sin presupuesto',
          icono: <Ban className="w-6 h-6" />,
          color: 'gray',
          bgGradiente: 'from-gray-400 to-gray-500',
          bgLight: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-500',
          badge: 'bg-gray-100 text-gray-500',
          indicador: '⚪',
          mensaje: 'No tiene presupuesto asignado',
          accion: 'Asignar presupuesto'
        };
    }
  };

  // Calcular estado basado en porcentaje
  const calcularEstado = (porcentaje, presupuesto, alertaPorcentaje) => {
    if (presupuesto === 0) return 'SIN_PRESUPUESTO';
    if (porcentaje > 100) return 'SOBREPASADO';
    if (porcentaje === 100) return 'COMPLETADO';
    if (porcentaje >= alertaPorcentaje) return 'CERCANO';
    return 'NORMAL';
  };

  // Ícono de gauge circular
  const GaugeIndicator = ({ value, size = 80, estado }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    
    const getStrokeColor = () => {
      if (estado === 'SOBREPASADO') return '#ef4444';
      if (estado === 'COMPLETADO') return '#3b82f6';
      if (estado === 'CERCANO') return '#eab308';
      if (estado === 'NORMAL') return '#22c55e';
      return '#9ca3af';
    };
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${estado === 'SOBREPASADO' ? 'text-red-600' : 
                           estado === 'COMPLETADO' ? 'text-blue-600' :
                           estado === 'CERCANO' ? 'text-yellow-600' :
                           estado === 'NORMAL' ? 'text-green-600' : 'text-gray-600'}`}>
            {value > 100 ? '>100' : value}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Gerencial */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                  Dashboard de Control de Gastos
                </h1>
              </div>
              <p className="text-slate-500 mt-2 ml-11">
                Monitoreo ejecutivo de presupuestos por categoría
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
                onClick={fetchDashboard}
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

        {/* Tarjetas KPI - Resumen Gerencial */}
        {resumen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm">Presupuesto Total</p>
                  <p className="text-2xl font-bold mt-1">{formatMoney(resumen.total_presupuesto)}</p>
                </div>
                <Target className="w-8 h-8 text-blue-200" />
              </div>
              <div className="mt-3 flex items-center gap-2 text-blue-100 text-xs">
                <span>Base presupuestal del periodo</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100 text-sm">Gasto Real</p>
                  <p className="text-2xl font-bold mt-1">{formatMoney(resumen.total_gastos)}</p>
                </div>
                <CircleDollarSign className="w-8 h-8 text-red-200" />
              </div>
              <div className="mt-3 flex items-center gap-2 text-red-100 text-xs">
                <span>Ejecutado: {resumen.porcentaje_ejecucion?.toFixed(1) || 0}%</span>
              </div>
            </div>
            
            <div className={`bg-gradient-to-br rounded-xl p-5 text-white shadow-lg ${
              resumen.diferencia >= 0 
                ? 'from-green-500 to-green-600' 
                : 'from-orange-500 to-orange-600'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm">Diferencia</p>
                  <p className="text-2xl font-bold mt-1">{formatMoney(Math.abs(resumen.diferencia))}</p>
                </div>
                {resumen.diferencia >= 0 ? (
                  <ThumbsUp className="w-8 h-8 text-green-200" />
                ) : (
                  <ThumbsDown className="w-8 h-8 text-orange-200" />
                )}
              </div>
              <div className="mt-3 text-green-100 text-xs">
                {resumen.diferencia >= 0 ? 'Saldo disponible' : 'Saldo excedido'}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm">Estado General</p>
                  <p className="text-2xl font-bold mt-1">
                    {resumen.porcentaje_ejecucion >= 100 
                      ? 'Excedido' 
                      : resumen.porcentaje_ejecucion >= 80 
                        ? 'Alerta' 
                        : 'Controlado'}
                  </p>
                </div>
                <Gauge className="w-8 h-8 text-purple-200" />
              </div>
              <div className="mt-3 h-1.5 bg-purple-400 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(resumen.porcentaje_ejecucion || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Grid de Tarjetas Gerenciales */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="ml-4 text-slate-500">Cargando datos financieros...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchDashboard}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : categorias.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Ban className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No hay datos disponibles</h3>
            <p className="text-slate-500">No se encontraron categorías o gastos para este periodo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categorias.map((categoria) => {
              const porcentaje = categoria.porcentaje_ejecucion || 0;
              const estado = calcularEstado(
                porcentaje, 
                categoria.presupuesto_mensual, 
                categoria.alerta_porcentaje || 80
              );
              const config = getEstadoConfig(estado, porcentaje);
              
              return (
                <div
                  key={categoria.categoria_id}
                  className={`bg-white rounded-xl border-2 ${config.border} shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}
                  onClick={() => handleCardClick(categoria)}
                >
                  {/* Header con color de estado */}
                  <div className={`bg-gradient-to-r ${config.bgGradiente} p-4 text-white relative overflow-hidden`}>
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full"></div>
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2">
                          {config.icono}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{categoria.nombre}</h3>
                          <p className="text-white/80 text-xs">{config.nombre}</p>
                        </div>
                      </div>
                      <div className="text-2xl">{config.indicador}</div>
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-4">
                    {/* Indicador Circular */}
                    <div className="flex justify-center mb-4">
                      <GaugeIndicator value={Math.min(porcentaje, 150)} size={100} estado={estado} />
                    </div>
                    
                    {/* Montos */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Presupuesto</p>
                        <p className="text-sm font-bold text-slate-700">{formatMoney(categoria.presupuesto_mensual)}</p>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Gasto Real</p>
                        <p className={`text-sm font-bold ${porcentaje > 100 ? 'text-red-600' : 'text-slate-700'}`}>
                          {formatMoney(categoria.gasto_real_mensual)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Mensaje de estado */}
                    <div className={`p-2 rounded-lg text-center text-sm ${config.badge} mb-3`}>
                      {config.mensaje}
                    </div>
                    
                    {/* Diferencia */}
                    <div className={`flex items-center justify-between p-2 rounded-lg ${
                      categoria.diferencia >= 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <span className="text-xs font-medium">Diferencia</span>
                      <div className={`flex items-center gap-1 font-bold ${
                        categoria.diferencia >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {categoria.diferencia >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatMoney(Math.abs(categoria.diferencia))}
                      </div>
                    </div>
                    
                    {/* Acción sugerida */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-slate-400">{config.accion}</span>
                    </div>
                  </div>
                  
                  {/* Footer con número de gastos */}
                  <div className="border-t border-slate-100 px-4 py-2 bg-slate-50 flex justify-between text-xs text-slate-500">
                    <span>{categoria.cantidad_gastos || 0} transacciones</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Ver detalles
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Detalle de Gastos */}
        {showDetailModal && selectedCategoria && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-bold">{selectedCategoria.nombre}</h2>
                      <p className="text-purple-200 text-sm">Detalle de gastos del periodo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Resumen de la categoría */}
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Presupuesto</p>
                    <p className="text-lg font-bold text-blue-600">{formatMoney(selectedCategoria.presupuesto_mensual)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gasto Real</p>
                    <p className={`text-lg font-bold ${(selectedCategoria.porcentaje_ejecucion || 0) > 100 ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatMoney(selectedCategoria.gasto_real_mensual)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Ejecución</p>
                    <p className={`text-lg font-bold ${
                      (selectedCategoria.porcentaje_ejecucion || 0) > 100 ? 'text-red-600' :
                      (selectedCategoria.porcentaje_ejecucion || 0) >= 80 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {(selectedCategoria.porcentaje_ejecucion || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Diferencia</p>
                    <p className={`text-lg font-bold ${selectedCategoria.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatMoney(Math.abs(selectedCategoria.diferencia))}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Buscador de gastos */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar gasto por descripción..."
                    value={searchTermGasto}
                    onChange={(e) => setSearchTermGasto(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {/* Lista de gastos */}
              <div className="p-5 overflow-y-auto max-h-[50vh]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Lista de Gastos
                  </h3>
                  <span className="text-xs text-gray-500">
                    {gastosFiltrados.length} gastos encontrados
                  </span>
                </div>
                
                {loadingDetalle ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : gastosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay gastos registrados en esta categoría</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gastosFiltrados.map((gasto, index) => (
                      <div key={gasto.gasto_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{gasto.descripcion}</span>
                            {gasto.categoria && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                                {gasto.categoria}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {gasto.fecha_gasto && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(gasto.fecha_gasto)}
                              </span>
                            )}
                            {gasto.periodo_nombre && (
                              <span className="text-xs text-gray-400">
                                Periodo: {gasto.periodo_nombre}
                              </span>
                            )}
                            {gasto.usuario && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {gasto.usuario}
                              </span>
                            )}
                          </div>
                          {gasto.observaciones && (
                            <p className="text-xs text-gray-400 mt-1">{gasto.observaciones}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{formatMoney(gasto.monto)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer del Modal */}
              <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda de Estados */}
        <div className="mt-8 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Tabla de Estados Gerenciales
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-700">Normal (&lt;80%)</span>
              <ThumbsUp className="w-3 h-3 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-yellow-700">Cercano (80%-99%)</span>
              <Bell className="w-3 h-3 text-yellow-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-700">Completado (100%)</span>
              <Award className="w-3 h-3 text-blue-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-red-700">Sobrepasado (&gt;100%)</span>
              <Flame className="w-3 h-3 text-red-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <span className="text-xs text-slate-600">Sin presupuesto</span>
              <Ban className="w-3 h-3 text-slate-400 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGastos;