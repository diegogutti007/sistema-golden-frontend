import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  User,
  Search,
  RefreshCw,
  Printer,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Briefcase,
  Phone,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  Target,
  Star,
  Zap,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  MessageCircle,
  TrendingUp,
  PieChart
} from "lucide-react";

import { BACKEND_URL } from "../config";

const DashboardCitasGerencial = () => {
  // ============ ESTADOS ============
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState("mes"); // dia, semana, mes
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());
  const [mesSelected, setMesSelected] = useState(new Date().getMonth() + 1);
  const [semanaSelected, setSemanaSelected] = useState(1);
  const [datosCitas, setDatosCitas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalCitas: 0,
    citasCompletadas: 0,
    citasPendientes: 0,
    citasCanceladas: 0,
    citasHoy: 0,
    tasaCompletado: 0,
    crecimiento: 0,
    tiempoPromedio: 0
  });
  const [topClientes, setTopClientes] = useState([]);
  const [citasPorServicio, setCitasPorServicio] = useState([]);
  const [citasPorEmpleado, setCitasPorEmpleado] = useState([]);
  const [detalleCitas, setDetalleCitas] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(8);

  // ============ EFECTOS ============
  useEffect(() => {
    fetchDatos();
  }, [periodo, yearSelected, mesSelected, semanaSelected]);

  // ============ FUNCIONES ============
  const fetchDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        periodo, 
        year: yearSelected, 
        mes: mesSelected,
        semana: semanaSelected
      };
      const response = await axios.get(`${BACKEND_URL}/api/dashboard-citas`, { params });

      if (response.data.success) {
        setDatosCitas(response.data.data.citas_diarias || []);
        setEstadisticas(response.data.data.estadisticas || {});
        setTopClientes(response.data.data.top_clientes || []);
        setCitasPorServicio(response.data.data.citas_por_servicio || []);
        setCitasPorEmpleado(response.data.data.citas_por_empleado || []);
        setDetalleCitas(response.data.data.detalle_citas || []);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar datos de citas");
    } finally {
      setLoading(false);
    }
  };

  const verDetalleCita = (cita) => {
    setSelectedCita(cita);
    setShowDetalleModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-PE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short"
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    return timeStr.substring(0, 5);
  };

  const getNombreMes = (mes) => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[mes - 1] || mes;
  };

  // Obtener semanas del mes
  const getSemanasMes = () => {
    const semanas = [];
    const primerDia = new Date(yearSelected, mesSelected - 1, 1);
    const ultimoDia = new Date(yearSelected, mesSelected, 0);
    let diaInicio = 1;
    let semanaNum = 1;

    while (diaInicio <= ultimoDia.getDate()) {
      const diaFin = Math.min(diaInicio + 6, ultimoDia.getDate());
      const inicioDate = new Date(yearSelected, mesSelected - 1, diaInicio);
      const finDate = new Date(yearSelected, mesSelected - 1, diaFin);
      
      semanas.push({
        numero: semanaNum,
        inicio: diaInicio,
        fin: diaFin,
        label: `Semana ${semanaNum}: ${inicioDate.getDate()}/${inicioDate.getMonth() + 1} - ${finDate.getDate()}/${finDate.getMonth() + 1}`
      });
      semanaNum++;
      diaInicio += 7;
    }
    return semanas;
  };

  const semanasDisponibles = getSemanasMes();

  // ============ COMPONENTES INTERNOS ============

  const TarjetaKPI = ({ titulo, valor, subtitulo, icono: Icono, color, tendencia }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-emerald-500 to-emerald-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      red: "from-red-500 to-red-600",
      pink: "from-pink-500 to-pink-600",
      amber: "from-amber-500 to-amber-600"
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full"></div>
        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/5 rounded-full"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{titulo}</p>
              <p className="text-3xl font-bold mt-1">{valor}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
              <Icono className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-white/80 text-xs">{subtitulo}</p>
            {tendencia !== undefined && tendencia !== null && tendencia !== 0 && (
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${
                tendencia >= 0 ? 'bg-green-400/30' : 'bg-red-400/30'
              }`}>
                {tendencia >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span className="text-xs font-bold">{Math.abs(tendencia).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const GaugeCircular = ({ value, size = 130, color = "#3b82f6", label = "" }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{value.toFixed(0)}%</span>
          {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
        </div>
      </div>
    );
  };

  // ============ GRÁFICO DE BARRAS CORREGIDO ============
  const GraficoBarrasCitas = () => {
    if (!datosCitas || datosCitas.length === 0) {
      return (
        <div className="flex items-center justify-center h-72 text-gray-400">
          <div className="text-center">
            <CalendarX className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay citas para mostrar en este periodo</p>
          </div>
        </div>
      );
    }

    const maxValor = Math.max(...datosCitas.map(d => d.total), 1);

    return (
      <div className="w-full">
        {/* Contenedor con scroll horizontal si hay muchos días */}
        <div className="overflow-x-auto pb-2">
          <div 
            className="flex items-end gap-2 min-h-[280px] px-1"
            style={{ minWidth: datosCitas.length > 20 ? `${datosCitas.length * 45}px` : '100%' }}
          >
            {datosCitas.map((dia, idx) => {
              const altura = (dia.total / maxValor) * 200;
              const fecha = new Date(dia.fecha);
              const esHoy = new Date().toDateString() === fecha.toDateString();
              const porcentajeCompletadas = dia.total > 0 ? (dia.completadas / dia.total) * 100 : 0;
              
              return (
                <div 
                  key={idx} 
                  className="flex-1 min-w-[38px] flex flex-col items-center group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 pointer-events-none shadow-lg">
                    <div className="font-bold">{dia.total} citas</div>
                    <div className="text-green-300 text-[10px]">✓ {dia.completadas || 0} completadas</div>
                  </div>
                  
                  {/* Número arriba de la barra */}
                  {dia.total > 0 && (
                    <span className="text-xs font-bold text-slate-700 mb-1">
                      {dia.total}
                    </span>
                  )}

                  {/* Contenedor de la barra */}
                  <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative overflow-hidden ${
                        esHoy
                          ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-200'
                          : dia.total > 0 && dia.completadas === dia.total
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            : dia.total > 0
                              ? 'bg-gradient-to-t from-purple-600 to-purple-400'
                              : 'bg-slate-200'
                      }`}
                      style={{ height: `${Math.max(altura, 8)}px` }}
                      onClick={() => {
                        const citasDelDia = detalleCitas.filter(c => c.fecha && c.fecha.includes(dia.fecha));
                        if (citasDelDia.length > 0) {
                          verDetalleCita(citasDelDia[0]);
                        }
                      }}
                    >
                      {/* Indicador de completadas dentro de la barra */}
                      {porcentajeCompletadas > 0 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-white/30"
                          style={{ height: `${porcentajeCompletadas}%` }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Fecha debajo */}
                  <span className={`text-[10px] mt-2 whitespace-nowrap ${
                    esHoy ? 'text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded' : 'text-slate-500'
                  }`}>
                    {esHoy ? 'HOY' : formatDateShort(dia.fecha)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Línea base */}
        <div className="h-px bg-slate-200 mt-1"></div>
      </div>
    );
  };

  // ============ FILTROS Y PAGINACIÓN ============
  const citasFiltradas = detalleCitas.filter(cita => {
    const coincideBusqueda =
      (cita.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cita.servicio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cita.empleado || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const coincideEstado = filtroEstado === 'todas' || cita.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  const totalPaginas = Math.ceil(citasFiltradas.length / itemsPorPagina);
  const startIndex = (paginaActual - 1) * itemsPorPagina;
  const citasPaginadas = citasFiltradas.slice(startIndex, startIndex + itemsPorPagina);

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* ============ HEADER ============ */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-3.5 shadow-lg">
                <CalendarDays className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                  Dashboard de Citas
                </h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Sistema en línea
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>Gestión gerencial de citas</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchDatos}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* ============ FILTROS DE PERIODO MEJORADOS ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Periodo:</span>
            </div>

            <div className="flex bg-slate-100 rounded-lg p-1">
              {[
                { id: 'dia', label: 'Hoy', icon: Clock },
                { id: 'semana', label: 'Semana', icon: Calendar },
                { id: 'mes', label: 'Mes', icon: CalendarDays }
              ].map(op => (
                <button
                  key={op.id}
                  onClick={() => setPeriodo(op.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    periodo === op.id
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <op.icon className="w-3.5 h-3.5" />
                  {op.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            {/* Selector de Año */}
            <select
              value={yearSelected}
              onChange={(e) => {
                setYearSelected(parseInt(e.target.value));
                setSemanaSelected(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Selector de Mes (para semana y mes) */}
            {periodo !== 'dia' && (
              <select
                value={mesSelected}
                onChange={(e) => {
                  setMesSelected(parseInt(e.target.value));
                  setSemanaSelected(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{getNombreMes(m)}</option>
                ))}
              </select>
            )}

            {/* Selector de Semana (solo para periodo semana) */}
            {periodo === 'semana' && (
              <select
                value={semanaSelected}
                onChange={(e) => setSemanaSelected(parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50 border-purple-200"
              >
                {semanasDisponibles.map(sem => (
                  <option key={sem.numero} value={sem.numero}>{sem.label}</option>
                ))}
              </select>
            )}

            <div className="ml-auto flex items-center gap-2 text-sm">
              <CalendarCheck className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-slate-600">
                {periodo === 'dia' && 'Hoy'}
                {periodo === 'semana' && `Semana ${semanaSelected} de ${getNombreMes(mesSelected)} ${yearSelected}`}
                {periodo === 'mes' && `${getNombreMes(mesSelected)} ${yearSelected}`}
              </span>
            </div>
          </div>
        </div>

        {/* ============ KPIs PRINCIPALES ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <TarjetaKPI
            titulo="Total Citas"
            valor={estadisticas.totalCitas || 0}
            subtitulo="En el periodo"
            icono={Calendar}
            color="purple"
          />
          <TarjetaKPI
            titulo="Completadas"
            valor={estadisticas.citasCompletadas || 0}
            subtitulo={`${estadisticas.tasaCompletado?.toFixed(0) || 0}% del total`}
            icono={CheckCircle}
            color="green"
          />
          <TarjetaKPI
            titulo="Pendientes"
            valor={estadisticas.citasPendientes || 0}
            subtitulo="Por atender"
            icono={Clock}
            color="amber"
          />
          <TarjetaKPI
            titulo="Citas Hoy"
            valor={estadisticas.citasHoy || 0}
            subtitulo="Agenda del día"
            icono={Zap}
            color="pink"
          />
        </div>

        {/* ============ GRÁFICO DE CITAS + GAUGE ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Gráfico de barras */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Distribución de Citas
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {periodo === 'mes' && `Citas por día - ${getNombreMes(mesSelected)} ${yearSelected}`}
                  {periodo === 'semana' && `Citas - Semana ${semanaSelected} de ${getNombreMes(mesSelected)}`}
                  {periodo === 'dia' && 'Citas por hora'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-blue-400 rounded"></div>
                  <span className="text-slate-600">Hoy</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-gradient-to-br from-purple-600 to-purple-400 rounded"></div>
                  <span className="text-slate-600">Citas</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded"></div>
                  <span className="text-slate-600">Completadas</span>
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-72">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-72 text-red-500">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p>{error}</p>
                  <button onClick={fetchDatos} className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <GraficoBarrasCitas />
            )}
          </div>

          {/* Gauge */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-700">Tasa de Completado</h3>
            </div>
            <GaugeCircular
              value={estadisticas.tasaCompletado || 0}
              size={140}
              color="#10b981"
              label="Completadas"
            />
            <div className="mt-4 w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Completadas
                </span>
                <span className="font-bold text-slate-800">{estadisticas.citasCompletadas || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Pendientes
                </span>
                <span className="font-bold text-slate-800">{estadisticas.citasPendientes || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <XCircle className="w-3 h-3 text-red-500" />
                  Canceladas
                </span>
                <span className="font-bold text-slate-800">{estadisticas.citasCanceladas || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ TOP CLIENTES Y SERVICIOS ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Clientes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-2">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Top Clientes</h3>
                <p className="text-xs text-slate-500">Con más citas</p>
              </div>
            </div>

            {topClientes.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topClientes.slice(0, 5).map((cliente, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                        idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                        'bg-gradient-to-br from-blue-400 to-blue-500'
                      }`}>
                        {(cliente.nombre || 'C').charAt(0).toUpperCase()}
                      </div>
                      {idx < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs shadow">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{cliente.nombre}</p>
                      <p className="text-xs text-slate-500">{cliente.total_citas} citas</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Servicios */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Servicios</h3>
                <p className="text-xs text-slate-500">Más solicitados</p>
              </div>
            </div>

            {citasPorServicio.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {citasPorServicio.slice(0, 5).map((servicio, idx) => {
                  const porcentaje = estadisticas.totalCitas > 0 
                    ? (servicio.total / estadisticas.totalCitas) * 100 
                    : 0;
                  const colores = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-700 truncate">{servicio.nombre}</span>
                        <span className="text-xs font-bold text-slate-800">{servicio.total}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${porcentaje}%`, backgroundColor: colores[idx % colores.length] }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Empleados */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Empleados</h3>
                <p className="text-xs text-slate-500">Más citas atendidas</p>
              </div>
            </div>

            {citasPorEmpleado.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {citasPorEmpleado.slice(0, 5).map((emp, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(emp.nombre || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{emp.nombre}</p>
                      <p className="text-xs text-slate-500">{emp.total} citas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">
                        {estadisticas.totalCitas > 0 
                          ? ((emp.total / estadisticas.totalCitas) * 100).toFixed(0) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============ TABLA DE CITAS ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-purple-600" />
                Agenda de Citas
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {citasFiltradas.length} citas encontradas
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente, servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="todas">Todos los estados</option>
                <option value="Completada">Completadas</option>
                <option value="Pendiente de retoque">Pendiente de retoque</option>
                <option value="Cancelada">Canceladas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Servicio</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Hora</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Empleado</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citasPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-16 text-center">
                      <CalendarX className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-400">No se encontraron citas</p>
                    </td>
                  </tr>
                ) : (
                  citasPaginadas.map((cita, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {(cita.cliente || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{cita.cliente}</p>
                            {cita.telefono && (
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {cita.telefono}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                          <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                          {cita.servicio || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700">
                          {new Date(cita.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm bg-purple-50 text-purple-700 rounded-full px-2 py-0.5 font-medium">
                          <Clock className="w-3 h-3" />
                          {formatTime(cita.hora)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">{cita.empleado || '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          cita.estado === 'Completada' ? 'bg-green-100 text-green-700' :
                          cita.estado === 'Pendiente de retoque' ? 'bg-amber-100 text-amber-700' :
                          cita.estado === 'Cancelada' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {cita.estado === 'Completada' && <CheckCircle className="w-3 h-3" />}
                          {cita.estado === 'Pendiente de retoque' && <Clock className="w-3 h-3" />}
                          {cita.estado === 'Cancelada' && <XCircle className="w-3 h-3" />}
                          {cita.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => verDetalleCita(cita)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition opacity-60 group-hover:opacity-100"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="p-4 border-t border-slate-200 flex justify-between items-center">
              <p className="text-xs text-slate-500">
                Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPorPagina, citasFiltradas.length)} de {citasFiltradas.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pageNum;
                  if (totalPaginas <= 5) pageNum = i + 1;
                  else if (paginaActual <= 3) pageNum = i + 1;
                  else if (paginaActual >= totalPaginas - 2) pageNum = totalPaginas - 4 + i;
                  else pageNum = paginaActual - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPaginaActual(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        paginaActual === pageNum
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============ MODAL DETALLE ============ */}
        {showDetalleModal && selectedCita && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetalleModal(false)}>
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Detalle de Cita</h2>
                      <p className="text-purple-100 text-sm">Información completa</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetalleModal(false)}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {(selectedCita.cliente || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Cliente</p>
                    <p className="font-bold text-slate-800">{selectedCita.cliente}</p>
                    {selectedCita.telefono && (
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {selectedCita.telefono}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-slate-500 font-medium">Fecha</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(selectedCita.fecha)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-slate-500 font-medium">Hora</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatTime(selectedCita.hora)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-slate-500 font-medium">Servicio</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedCita.servicio || '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-slate-500 font-medium">Empleado</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedCita.empleado || '—'}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${
                  selectedCita.estado === 'Completada' ? 'bg-green-50 border border-green-200' :
                  selectedCita.estado === 'Pendiente de retoque' ? 'bg-amber-50 border border-amber-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {selectedCita.estado === 'Completada' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {selectedCita.estado === 'Pendiente de retoque' && <Clock className="w-5 h-5 text-amber-600" />}
                    {selectedCita.estado === 'Cancelada' && <XCircle className="w-5 h-5 text-red-600" />}
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Estado</p>
                      <p className={`text-sm font-bold ${
                        selectedCita.estado === 'Completada' ? 'text-green-700' :
                        selectedCita.estado === 'Pendiente de retoque' ? 'text-amber-700' :
                        'text-red-700'
                      }`}>
                        {selectedCita.estado}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedCita.observaciones && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium">Observaciones</p>
                    </div>
                    <p className="text-sm text-slate-700">{selectedCita.observaciones}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowDetalleModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-pink-500" />
            Dashboard de Citas Gerencial • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCitasGerencial;