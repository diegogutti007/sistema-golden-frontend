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
  PieChart,
  Timer,
  Activity,
  List,
  PlayCircle,
  PauseCircle
} from "lucide-react";

import { BACKEND_URL } from "../config";

const DashboardCitasGerencial = () => {
  // ============ ESTADOS ============
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState("mes"); // dia, semana, mes, rango
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());
  const [mesSelected, setMesSelected] = useState(new Date().getMonth() + 1);
  const [semanaSelected, setSemanaSelected] = useState(1);
  const [fechaInicioRango, setFechaInicioRango] = useState("");
  const [fechaFinRango, setFechaFinRango] = useState("");
  const [datosCitas, setDatosCitas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalCitas: 0,
    citasCompletadas: 0,
    citasProgramadas: 0,
    citasPendientes: 0,
    citasCanceladas: 0,
    citasEnProgreso: 0,
    citasHoy: 0,
    tasaCompletado: 0,
    crecimiento: 0
  });
  const [topClientes, setTopClientes] = useState([]);
  const [citasPorServicio, setCitasPorServicio] = useState([]);
  const [citasPorEmpleado, setCitasPorEmpleado] = useState([]);
  const [detalleCitas, setDetalleCitas] = useState([]);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [citasDelDiaSeleccionado, setCitasDelDiaSeleccionado] = useState([]);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(8);

  // ============ ESTADOS DE CITAS ============
  const ESTADOS_CITA = {
    COMPLETADA: "Completada",
    PROGRAMADA: "Programada",
    CANCELADA: "Cancelada",
    PENDIENTE_RETOQUE: "Pendiente de retoque",
    EN_PROGRESO: "En progreso"
  };

  // ============ FUNCIÓN PARA OBTENER FECHA LOCAL (Perú) ============
  // Soluciona el problema de zona horaria con Railway (UTC)
  const getFechaLocal = (date = new Date()) => {
    // Ajustar a zona horaria de Perú (UTC-5)
    const opciones = { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaStr = date.toLocaleDateString('en-CA', opciones); // en-CA da formato YYYY-MM-DD
    return fechaStr;
  };

  const getFechaHoraLocal = (date = new Date()) => {
    const opciones = { 
      timeZone: 'America/Lima', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleString('en-CA', opciones).replace(',', '');
  };

  // ============ EFECTOS ============
  useEffect(() => {
    // Inicializar rango con la semana actual
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    
    setFechaInicioRango(getFechaLocal(lunes));
    setFechaFinRango(getFechaLocal(domingo));
  }, []);

  useEffect(() => {
    fetchDatos();
  }, [periodo, yearSelected, mesSelected, semanaSelected, fechaInicioRango, fechaFinRango]);

  // ============ FUNCIONES ============
  const fetchDatos = async () => {
    // No cargar si estamos en modo rango y las fechas no están listas
    if (periodo === 'rango' && (!fechaInicioRango || !fechaFinRango)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = { 
        periodo, 
        year: yearSelected, 
        mes: mesSelected,
        semana: semanaSelected,
        fecha_inicio: fechaInicioRango,
        fecha_fin: fechaFinRango,
        timezone: 'America/Lima' // Enviar zona horaria al backend
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

  // Ver detalle de TODAS las citas del día
  const verCitasDelDia = (fecha) => {
    setSelectedFecha(fecha);
    // Filtrar todas las citas de ese día
    const citasDelDia = detalleCitas.filter(c => {
      const fechaCita = c.fecha ? c.fecha.split('T')[0] : '';
      return fechaCita === fecha;
    });
    setCitasDelDiaSeleccionado(citasDelDia);
    setShowDetalleModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      // Extraer solo la fecha sin zona horaria
      const fechaLimpia = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [year, month, day] = fechaLimpia.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-PE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const fechaLimpia = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [year, month, day] = fechaLimpia.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    return timeStr.substring(0, 5);
  };

  const getNombreMes = (mes) => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[mes - 1] || mes;
  };

  // ============ GET SEMANAS DEL MES ============
  const getSemanasMes = () => {
    const semanas = [];
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

  // ============ CONFIGURACIÓN DE ESTADOS ============
  const getEstadoConfig = (estado) => {
    switch (estado) {
      case ESTADOS_CITA.COMPLETADA:
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
          bgLight: 'bg-green-50',
          icon: CheckCircle,
          color: '#10b981'
        };
      case ESTADOS_CITA.PROGRAMADA:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200',
          bgLight: 'bg-blue-50',
          icon: Calendar,
          color: '#3b82f6'
        };
      case ESTADOS_CITA.EN_PROGRESO:
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-200',
          bgLight: 'bg-purple-50',
          icon: PlayCircle,
          color: '#8b5cf6'
        };
      case ESTADOS_CITA.PENDIENTE_RETOQUE:
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-200',
          bgLight: 'bg-amber-50',
          icon: Clock,
          color: '#f59e0b'
        };
      case ESTADOS_CITA.CANCELADA:
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          bgLight: 'bg-red-50',
          icon: XCircle,
          color: '#ef4444'
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          bgLight: 'bg-slate-50',
          icon: AlertCircle,
          color: '#64748b'
        };
    }
  };

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

  // ============ GRÁFICO DE BARRAS CORREGIDO CON FECHAS ============
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
    const hoyLocal = getFechaLocal();

    return (
      <div className="w-full">
        <div className="overflow-x-auto pb-2">
          <div 
            className="flex items-end gap-2 min-h-[280px] px-1"
            style={{ minWidth: datosCitas.length > 20 ? `${datosCitas.length * 45}px` : '100%' }}
          >
            {datosCitas.map((dia, idx) => {
              const altura = (dia.total / maxValor) * 200;
              const esHoy = dia.fecha === hoyLocal;
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
                    <div className="text-blue-300 text-[10px]">📅 {dia.fecha}</div>
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
                        if (dia.total > 0) {
                          verCitasDelDia(dia.fecha);
                        }
                      }}
                    >
                      {porcentajeCompletadas > 0 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-white/30"
                          style={{ height: `${porcentajeCompletadas}%` }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Fecha debajo - CORREGIDA sin problemas de zona horaria */}
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

        {/* ============ FILTROS DE PERIODO CON RANGO ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Periodo:</span>
            </div>

            <div className="flex bg-slate-100 rounded-lg p-1 flex-wrap">
              {[
                { id: 'dia', label: 'Hoy', icon: Clock },
                { id: 'semana', label: 'Semana', icon: Calendar },
                { id: 'mes', label: 'Mes', icon: CalendarDays },
                { id: 'rango', label: 'Rango', icon: Timer }
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

            {/* Selector de Año (para dia, semana, mes) */}
            {periodo !== 'rango' && (
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
            )}

            {/* Selector de Mes */}
            {(periodo === 'semana' || periodo === 'mes') && (
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

            {/* Selector de Semana */}
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

            {/* Selector de Rango de Fechas */}
            {periodo === 'rango' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <input
                    type="date"
                    value={fechaInicioRango}
                    onChange={(e) => setFechaInicioRango(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none"
                  />
                </div>
                <span className="text-slate-400 text-sm">hasta</span>
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <input
                    type="date"
                    value={fechaFinRango}
                    onChange={(e) => setFechaFinRango(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2 text-sm">
              <CalendarCheck className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-slate-600">
                {periodo === 'dia' && 'Hoy'}
                {periodo === 'semana' && `Semana ${semanaSelected} de ${getNombreMes(mesSelected)}`}
                {periodo === 'mes' && `${getNombreMes(mesSelected)} ${yearSelected}`}
                {periodo === 'rango' && `${formatDateShort(fechaInicioRango)} - ${formatDateShort(fechaFinRango)}`}
              </span>
            </div>
          </div>
        </div>

        {/* ============ KPIs PRINCIPALES ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
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
            titulo="Programadas"
            valor={estadisticas.citasProgramadas || 0}
            subtitulo="Por atender"
            icono={Calendar}
            color="blue"
          />
          <TarjetaKPI
            titulo="En Progreso"
            valor={estadisticas.citasEnProgreso || 0}
            subtitulo="En atención"
            icono={PlayCircle}
            color="pink"
          />
          <TarjetaKPI
            titulo="Citas Hoy"
            valor={estadisticas.citasHoy || 0}
            subtitulo="Agenda del día"
            icono={Zap}
            color="amber"
          />
        </div>

        {/* ============ GRÁFICO DE CITAS + GAUGE ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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
                  {periodo === 'rango' && `${formatDateShort(fechaInicioRango)} - ${formatDateShort(fechaFinRango)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap">
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
                  <Calendar className="w-3 h-3 text-blue-500" />
                  Programadas
                </span>
                <span className="font-bold text-slate-800">{estadisticas.citasProgramadas || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <PlayCircle className="w-3 h-3 text-purple-500" />
                  En Progreso
                </span>
                <span className="font-bold text-slate-800">{estadisticas.citasEnProgreso || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Pendiente retoque
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
                <option value="Completada">Completada</option>
                <option value="Programada">Programada</option>
                <option value="En progreso">En progreso</option>
                <option value="Pendiente de retoque">Pendiente de retoque</option>
                <option value="Cancelada">Cancelada</option>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citasPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-16 text-center">
                      <CalendarX className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-400">No se encontraron citas</p>
                    </td>
                  </tr>
                ) : (
                  citasPaginadas.map((cita, idx) => {
                    const estadoConfig = getEstadoConfig(cita.estado);
                    const IconoEstado = estadoConfig.icon;
                    
                    return (
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
                            {formatDateShort(cita.fecha)}
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
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${estadoConfig.bg} ${estadoConfig.text}`}>
                            <IconoEstado className="w-3 h-3" />
                            {cita.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })
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

        {/* ============ MODAL DETALLE - MUESTRA TODAS LAS CITAS DEL DÍA ============ */}
        {showDetalleModal && selectedFecha && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetalleModal(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Citas del Día</h2>
                      <p className="text-purple-100 text-sm">{formatDate(selectedFecha)}</p>
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

              {/* Contenido */}
              <div className="p-6 overflow-y-auto max-h-[65vh]">
                {/* Resumen del día */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-600 font-medium">Total</p>
                    <p className="text-2xl font-bold text-purple-700">{citasDelDiaSeleccionado.length}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600 font-medium">Completadas</p>
                    <p className="text-2xl font-bold text-green-700">
                      {citasDelDiaSeleccionado.filter(c => c.estado === 'Completada').length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600 font-medium">Programadas</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {citasDelDiaSeleccionado.filter(c => c.estado === 'Programada').length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-600 font-medium">P. Retoque</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {citasDelDiaSeleccionado.filter(c => c.estado === 'Pendiente de retoque').length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <p className="text-xs text-red-600 font-medium">Canceladas</p>
                    <p className="text-2xl font-bold text-red-700">
                      {citasDelDiaSeleccionado.filter(c => c.estado === 'Cancelada').length}
                    </p>
                  </div>
                </div>

                {/* Lista de citas del día */}
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Listado de Citas
                </h3>

                {citasDelDiaSeleccionado.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarX className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-400">No hay citas registradas para este día</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citasDelDiaSeleccionado.map((cita, idx) => {
                      const estadoConfig = getEstadoConfig(cita.estado);
                      const IconoEstado = estadoConfig.icon;
                      
                      return (
                        <div key={idx} className={`p-4 rounded-xl ${estadoConfig.bgLight} border ${estadoConfig.border}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {(cita.cliente || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{cita.cliente}</p>
                                {cita.telefono && (
                                  <p className="text-xs text-slate-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {cita.telefono}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${estadoConfig.bg} ${estadoConfig.text}`}>
                              <IconoEstado className="w-3 h-3" />
                              {cita.estado}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-slate-500">Hora</p>
                                <p className="text-sm font-semibold text-slate-800">{formatTime(cita.hora)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-slate-500">Servicio</p>
                                <p className="text-sm font-semibold text-slate-800">{cita.servicio || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-slate-500">Empleado</p>
                                <p className="text-sm font-semibold text-slate-800">{cita.empleado || '—'}</p>
                              </div>
                            </div>
                          </div>

                          {cita.observaciones && (
                            <div className="mt-3 p-2 bg-white/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="w-3 h-3 text-blue-600" />
                                <p className="text-xs text-blue-600 font-medium">Observaciones</p>
                              </div>
                              <p className="text-xs text-slate-700">{cita.observaciones}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
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