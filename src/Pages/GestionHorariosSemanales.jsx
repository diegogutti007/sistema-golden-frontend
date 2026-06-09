import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Clock,
  Calendar,
  RefreshCw,
  Search,
  Edit,
  Plus,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  History,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ChevronDown,
  Filter,
  Users,
  Briefcase,
  Eye
} from "lucide-react";

import { BACKEND_URL } from "../config";

const GestionHorariosSemanales = () => {
  const [empleados, setEmpleados] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [vistaTarjetas, setVistaTarjetas] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos"); // todos, asignado, pendiente
  
  const [asignacionForm, setAsignacionForm] = useState({
    EmpId: "",
    HorarioId: "",
    semana_inicio: "",
    semana_fin: "",
    dias_trabajo: "1,2,3,4,5",
    horas_dia: 8,
    observaciones: ""
  });

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      const tablet = window.innerWidth >= 640 && window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      setVistaTarjetas(mobile || (tablet && window.innerWidth < 768));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchHorarios();
    fetchSemanas();
  }, []);

  useEffect(() => {
    if (semanaSeleccionada) {
      fetchEmpleados();
    }
  }, [semanaSeleccionada]);

  const fetchEmpleados = async () => {
    if (!semanaSeleccionada) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/empleados-con-horario`, {
        params: { fecha_referencia: semanaSeleccionada.inicio }
      });
      if (response.data.success) {
        setEmpleados(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const fetchHorarios = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/horarios-lista`);
      if (response.data.success) {
        setHorarios(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSemanas = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/semanas-disponibles`);
      if (response.data.success) {
        setSemanas(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          setSemanaSeleccionada(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistorial = async (empId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/empleado-horario/historial/${empId}`);
      if (response.data.success) {
        setHistorial(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const asignarHorario = async () => {
    if (!asignacionForm.HorarioId) {
      setError("Seleccione un tipo de horario");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/empleado-horario`, asignacionForm);
      await fetchEmpleados();
      setShowModal(false);
      setSelectedEmpleado(null);
      resetForm();
      
      if (response.data.asistencias_generadas) {
        alert(`✅ Horario asignado correctamente.\n📅 Se generaron ${response.data.asistencias_generadas} registros de asistencia para la semana.`);
      } else {
        alert(`✅ Horario asignado correctamente.`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al asignar horario");
    } finally {
      setLoading(false);
    }
  };

  const actualizarHorario = async () => {
    if (!editandoId) return;
    
    setLoading(true);
    try {
      const response = await axios.put(`${BACKEND_URL}/api/empleado-horario/${editandoId}`, asignacionForm);
      await fetchEmpleados();
      setShowModal(false);
      setSelectedEmpleado(null);
      setEditandoId(null);
      resetForm();
      
      if (response.data.asistencias_generadas) {
        alert(`✅ Horario actualizado correctamente.\n📅 Se actualizaron ${response.data.asistencias_generadas} registros de asistencia.`);
      } else {
        alert(`✅ Horario actualizado correctamente.`);
      }
    } catch (err) {
      console.error(err);
      setError("Error al actualizar horario");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAsignacionForm({
      EmpId: "",
      HorarioId: "",
      semana_inicio: "",
      semana_fin: "",
      dias_trabajo: "1,2,3,4,5",
      horas_dia: 8,
      observaciones: ""
    });
  };

  const openAsignacionModal = (empleado) => {
    setSelectedEmpleado(empleado);
    setEditandoId(null);
    setAsignacionForm({
      EmpId: empleado.EmpId,
      HorarioId: empleado.HorarioId || "",
      semana_inicio: semanaSeleccionada?.inicio || "",
      semana_fin: semanaSeleccionada?.fin || "",
      dias_trabajo: empleado.dias_trabajo || "1,2,3,4,5",
      horas_dia: empleado.horas_dia || 8,
      observaciones: empleado.observaciones || ""
    });
    setShowModal(true);
  };

  const openEditModal = (empleado) => {
    setSelectedEmpleado(empleado);
    setEditandoId(empleado.horario_asignado_id);
    setAsignacionForm({
      EmpId: empleado.EmpId,
      HorarioId: empleado.HorarioId || "",
      semana_inicio: empleado.semana_inicio || semanaSeleccionada?.inicio,
      semana_fin: empleado.semana_fin || semanaSeleccionada?.fin,
      dias_trabajo: empleado.dias_trabajo || "1,2,3,4,5",
      horas_dia: empleado.horas_dia || 8,
      observaciones: empleado.observaciones || ""
    });
    setShowModal(true);
  };

  const openHistoryModal = async (empleado) => {
    setSelectedEmpleado(empleado);
    await fetchHistorial(empleado.EmpId);
    setShowHistoryModal(true);
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    return time.slice(0, 5);
  };

  const getDiasTexto = (diasStr) => {
    const diasMap = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom" };
    if (!diasStr) return "Lun a Vie";
    const dias = diasStr.split(",").map(d => diasMap[d]).filter(Boolean);
    if (dias.length === 5 && dias[0] === "Lun" && dias[4] === "Vie") return "Lun a Vie";
    if (dias.length === 6 && dias[0] === "Lun" && dias[5] === "Sáb") return "Lun a Sáb";
    return dias.join(", ");
  };

  const getTurnoIcon = (esTurnoNoche) => {
    return esTurnoNoche ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />;
  };

  const tieneHorarioAsignado = (empleado) => {
    return empleado.horario_asignado_id && empleado.horario_activo === 1;
  };

  const esSemanaActual = (semana) => {
    const hoy = new Date().toISOString().split('T')[0];
    return semana.inicio <= hoy && semana.fin >= hoy;
  };

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter(emp => {
    const matchSearch = (emp.Nombres || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.Apellidos || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.DocID || "").includes(searchTerm);
    
    const matchEstado = filtroEstado === "todos" || 
      (filtroEstado === "asignado" && tieneHorarioAsignado(emp)) ||
      (filtroEstado === "pendiente" && !tieneHorarioAsignado(emp));
    
    return matchSearch && matchEstado;
  });

  // Componente Tarjeta para móvil
  const TarjetaEmpleado = ({ emp }) => {
    const tieneHorario = tieneHorarioAsignado(emp);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {emp.Nombres?.charAt(0)}{emp.Apellidos?.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{emp.Nombres} {emp.Apellidos}</h3>
              <p className="text-xs text-gray-500">DNI: {emp.DocID}</p>
              <p className="text-xs text-gray-400 mt-0.5">{emp.cargo_nombre || "Sin cargo"}</p>
            </div>
          </div>
          <div>
            {tieneHorario ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <CheckCircle className="w-3 h-3" />
                Asignado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                Pendiente
              </span>
            )}
          </div>
        </div>
        
        {tieneHorario ? (
          <>
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTurnoIcon(emp.EsTurnoNoche)}
                  <span className="font-medium text-sm text-gray-800">{emp.horario_nombre}</span>
                </div>
                <span className="text-xs text-gray-600">
                  {formatTime(emp.HoraEntrada)}-{formatTime(emp.HoraSalida)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>📅 {getDiasTexto(emp.dias_trabajo)}</span>
                <span>⏱️ {emp.horas_dia} hrs/día</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(emp)}
                className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => openHistoryModal(emp)}
                className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center justify-center gap-1"
              >
                <History className="w-4 h-4" />
                Historial
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => openAsignacionModal(emp)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Asignar Horario
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Responsive */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                Horarios Semanales
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Asignación y gestión de horarios por semana</p>
            </div>
            <div className="flex justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={fetchEmpleados}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              {(isMobile || isTablet) && (
                <button
                  onClick={() => setVistaTarjetas(!vistaTarjetas)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs sm:text-sm"
                >
                  {vistaTarjetas ? "📊 Tabla" : "📱 Tarjetas"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Selector de Semana - Responsive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Semana:</span>
              
              <div className="flex items-center gap-1 flex-1 md:flex-none">
                <button 
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  onClick={() => {
                    const idx = semanas.findIndex(s => s.inicio === semanaSeleccionada?.inicio);
                    if (idx > 0) setSemanaSeleccionada(semanas[idx - 1]);
                  }}
                  disabled={!semanaSeleccionada || semanas.findIndex(s => s.inicio === semanaSeleccionada?.inicio) === 0}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                
                <div className="relative flex-1 md:min-w-[280px]">
                  <select
                    value={semanaSeleccionada?.inicio || ""}
                    onChange={(e) => {
                      const semana = semanas.find(s => s.inicio === e.target.value);
                      setSemanaSeleccionada(semana);
                    }}
                    className="w-full text-xs sm:text-sm border border-gray-200 rounded-lg px-3 py-1.5 sm:py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                  >
                    {semanas.map((semana, idx) => {
                      const actual = esSemanaActual(semana);
                      return (
                        <option key={idx} value={semana.inicio}>
                          {actual ? "📍 " : "📅 "} {semana.label}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                </div>
                
                <button 
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  onClick={() => {
                    const idx = semanas.findIndex(s => s.inicio === semanaSeleccionada?.inicio);
                    if (idx < semanas.length - 1) setSemanaSeleccionada(semanas[idx + 1]);
                  }}
                  disabled={!semanaSeleccionada || semanas.findIndex(s => s.inicio === semanaSeleccionada?.inicio) === semanas.length - 1}
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {semanaSeleccionada && (
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                {esSemanaActual(semanaSeleccionada) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    Semana actual
                  </span>
                )}
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                  Semana {semanaSeleccionada.numero} · {semanaSeleccionada.anio}
                </div>
              </div>
            )}
          </div>
          
          {/* Barra de progreso - Ocultar en móvil muy pequeño */}
          {semanas.length > 0 && semanaSeleccionada && !isMobile && (
            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Hace 12 semanas</span>
                <span className="text-blue-600 font-medium">Semana actual</span>
                <span>Próximas 4 semanas</span>
              </div>
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((semanas.findIndex(s => s.inicio === semanaSeleccionada.inicio) + 1) / semanas.length) * 100}%` 
                  }}
                />
                <div 
                  className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full -mt-0.5 transition-all duration-300 shadow-sm"
                  style={{ 
                    left: `${((semanas.findIndex(s => s.inicio === semanaSeleccionada.inicio) + 1) / semanas.length) * 100}%`,
                    top: '-2px',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resumen de la semana - Grid responsiva */}
        {semanaSeleccionada && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border border-blue-100">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">SEMANA SELECCIONADA</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{semanaSeleccionada.label}</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div className="text-center min-w-[60px]">
                  <p className="text-xs text-gray-500">Empleados</p>
                  <p className="text-base sm:text-lg font-bold text-gray-800">{empleados.length}</p>
                </div>
                <div className="text-center min-w-[70px]">
                  <p className="text-xs text-gray-500">Con horario</p>
                  <p className="text-base sm:text-lg font-bold text-green-600">{empleados.filter(e => tieneHorarioAsignado(e)).length}</p>
                </div>
                <div className="text-center min-w-[70px]">
                  <p className="text-xs text-gray-500">Sin horario</p>
                  <p className="text-base sm:text-lg font-bold text-orange-600">{empleados.filter(e => !tieneHorarioAsignado(e)).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buscador y Filtros - Responsive */}
        <div className="mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
              
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="todos">Todos</option>
                <option value="asignado">Con horario</option>
                <option value="pendiente">Sin horario</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido Principal - Tabla o Tarjetas */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <button onClick={fetchEmpleados} className="mt-3 text-sm text-blue-600">Reintentar</button>
          </div>
        ) : empleadosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron empleados</p>
          </div>
        ) : vistaTarjetas || isMobile ? (
          // Vista Tarjetas
          <div className="space-y-3">
            {empleadosFiltrados.map((emp) => (
              <TarjetaEmpleado key={emp.EmpId} emp={emp} />
            ))}
          </div>
        ) : (
          // Vista Tabla (Desktop y Tablet)
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Empleado</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Cargo</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horario</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Días</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Horas/día</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {empleadosFiltrados.map((emp) => {
                    const tieneHorario = tieneHorarioAsignado(emp);
                    
                    return (
                      <tr key={emp.EmpId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {emp.Nombres?.charAt(0)}{emp.Apellidos?.charAt(0)}
                            </div>
                            <div className="min-w-[120px]">
                              <div className="font-medium text-gray-800 text-xs sm:text-sm">{emp.Nombres} {emp.Apellidos}</div>
                              <div className="text-xs text-gray-400">DNI: {emp.DocID}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                          {emp.cargo_nombre || "Sin cargo"}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          {tieneHorario ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                {getTurnoIcon(emp.EsTurnoNoche)}
                                <span className="text-xs sm:text-sm text-gray-700 font-medium">{emp.horario_nombre}</span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatTime(emp.HoraEntrada)}-{formatTime(emp.HoraSalida)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-400 italic">Sin horario</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center text-xs text-gray-500 hidden lg:table-cell">
                          {tieneHorario ? getDiasTexto(emp.dias_trabajo) : "--"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                          {tieneHorario ? `${emp.horas_dia} hrs` : "--"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center">
                          {tieneHorario ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs whitespace-nowrap">
                              <CheckCircle className="w-3 h-3" />
                              Asignado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs whitespace-nowrap">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            {tieneHorario ? (
                              <>
                                <button
                                  onClick={() => openEditModal(emp)}
                                  className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                  title="Editar horario"
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => openHistoryModal(emp)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Ver historial"
                                >
                                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => openAsignacionModal(emp)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Asignar horario"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Asignación/Edición - Responsive */}
        {showModal && selectedEmpleado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-5 py-3 sm:py-4 rounded-t-xl flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  {editandoId ? "Editar Horario" : "Asignar Horario"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500">Empleado</p>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{selectedEmpleado.Nombres} {selectedEmpleado.Apellidos}</p>
                  <p className="text-xs text-gray-400">DNI: {selectedEmpleado.DocID}</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Semana</label>
                  <div className="bg-blue-50 p-2 rounded-lg text-xs sm:text-sm text-gray-700 border border-blue-100">
                    📅 {semanaSeleccionada?.label}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tipo de Horario *</label>
                  <select
                    value={asignacionForm.HorarioId}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, HorarioId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar horario</option>
                    {horarios.map((h, idx) => (
                      <option key={idx} value={h.HorarioId}>
                        {h.Nombre} ({formatTime(h.HoraEntrada)}-{formatTime(h.HoraSalida)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Horas por día</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="24"
                      value={asignacionForm.horas_dia}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, horas_dia: parseFloat(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Días laborables</label>
                    <select
                      value={asignacionForm.dias_trabajo}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, dias_trabajo: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1,2,3,4,5">Lunes a Viernes</option>
                      <option value="1,2,3,4,5,6">Lunes a Sábado</option>
                      <option value="2,3,4,5,6">Martes a Sábado</option>
                      <option value="1,2,3,4,5,6,7">Lunes a Domingo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    rows={isMobile ? 2 : 3}
                    value={asignacionForm.observaciones}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, observaciones: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Al asignar este horario, se generarán automáticamente los registros de asistencia.
                  </p>
                </div>

                <div className="flex gap-3 pt-2 sm:pt-3">
                  <button
                    onClick={editandoId ? actualizarHorario : asignarHorario}
                    disabled={loading || !asignacionForm.HorarioId}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    {editandoId ? "Actualizar" : "Guardar"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all text-xs sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Historial - Responsive */}
        {showHistoryModal && selectedEmpleado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowHistoryModal(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-gray-700 to-gray-800 px-4 sm:px-5 py-3 sm:py-4 rounded-t-xl flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                  Historial de Horarios
                </h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {selectedEmpleado.Nombres?.charAt(0)}{selectedEmpleado.Apellidos?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{selectedEmpleado.Nombres} {selectedEmpleado.Apellidos}</p>
                    <p className="text-xs text-gray-500">DNI: {selectedEmpleado.DocID}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 overflow-y-auto max-h-[50vh]">
                {historial.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">No hay historial de horarios</p>
                ) : (
                  <div className="space-y-3">
                    {historial.map((reg, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{reg.horario_nombre}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              📅 {reg.semana_inicio} al {reg.semana_fin}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Días: {getDiasTexto(reg.dias_trabajo)} · {reg.horas_dia} hrs/día
                            </p>
                            {reg.observaciones && (
                              <p className="text-xs text-gray-400 mt-1">📝 {reg.observaciones}</p>
                            )}
                          </div>
                          <div className="text-left sm:text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${reg.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {reg.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    openAsignacionModal(selectedEmpleado);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Nuevo Horario
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionHorariosSemanales;