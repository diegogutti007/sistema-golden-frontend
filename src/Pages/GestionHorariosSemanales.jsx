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
  ChevronDown
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
  
  const [asignacionForm, setAsignacionForm] = useState({
    EmpId: "",
    HorarioId: "",
    semana_inicio: "",
    semana_fin: "",
    dias_trabajo: "1,2,3,4,5",
    horas_dia: 8,
    observaciones: ""
  });

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
    return diasStr.split(",").map(d => diasMap[d]).filter(Boolean).join(", ");
  };

  const getTurnoIcon = (esTurnoNoche) => {
    return esTurnoNoche ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />;
  };

  const empleadosFiltrados = empleados.filter(emp =>
    (emp.Nombres || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.Apellidos || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.DocID || "").includes(searchTerm)
  );

  const tieneHorarioAsignado = (empleado) => {
    return empleado.horario_asignado_id && empleado.horario_activo === 1;
  };

  const esSemanaActual = (semana) => {
    const hoy = new Date().toISOString().split('T')[0];
    return semana.inicio <= hoy && semana.fin >= hoy;
  };

  const getMesNombre = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Horarios Semanales
              </h1>
              <p className="text-sm text-gray-500 mt-1">Asignación y gestión de horarios por semana</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchEmpleados}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        {/* Selector de Semana */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Semana:</span>
              
              <div className="flex items-center gap-2">
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
                
                <div className="relative">
                  <select
                    value={semanaSeleccionada?.inicio || ""}
                    onChange={(e) => {
                      const semana = semanas.find(s => s.inicio === e.target.value);
                      setSemanaSeleccionada(semana);
                    }}
                    className="text-sm border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[320px] appearance-none bg-white cursor-pointer"
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
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
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
              <div className="flex items-center gap-3">
                {esSemanaActual(semanaSeleccionada) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Semana actual
                  </span>
                )}
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                  Semana {semanaSeleccionada.numero} · {semanaSeleccionada.anio}
                </div>
              </div>
            )}
          </div>
          
          {/* Barra de progreso */}
          {semanas.length > 0 && semanaSeleccionada && (
            <div className="mt-4 pt-3 border-t border-gray-100">
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

        {/* Resumen de la semana */}
        {semanaSeleccionada && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-5 border border-blue-100">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">SEMANA SELECCIONADA</p>
                  <p className="text-sm font-semibold text-gray-800">{semanaSeleccionada.label}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Empleados</p>
                  <p className="text-lg font-bold text-gray-800">{empleados.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Con horario</p>
                  <p className="text-lg font-bold text-green-600">{empleados.filter(e => tieneHorarioAsignado(e)).length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Sin horario</p>
                  <p className="text-lg font-bold text-orange-600">{empleados.filter(e => !tieneHorarioAsignado(e)).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Tabla de Empleados */}
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
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Empleado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cargo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horario Asignado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Días</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Horas/día</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {empleadosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No se encontraron empleados para la semana seleccionada
                      </td>
                    </tr>
                  ) : (
                    empleadosFiltrados.map((emp) => {
                      const tieneHorario = tieneHorarioAsignado(emp);
                      
                      return (
                        <tr key={emp.EmpId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {emp.Nombres?.charAt(0)}{emp.Apellidos?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 text-sm">{emp.Nombres} {emp.Apellidos}</div>
                                <div className="text-xs text-gray-400">DNI: {emp.DocID}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.cargo_nombre || "Sin cargo"}</td>
                          <td className="px-4 py-3">
                            {tieneHorario ? (
                              <div className="flex items-center gap-2">
                                {getTurnoIcon(emp.EsTurnoNoche)}
                                <span className="text-sm text-gray-700 font-medium">{emp.horario_nombre}</span>
                                <span className="text-xs text-gray-400">
                                  {formatTime(emp.HoraEntrada)}-{formatTime(emp.HoraSalida)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Sin horario asignado</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {tieneHorario ? getDiasTexto(emp.dias_trabajo) : "--"}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {tieneHorario ? `${emp.horas_dia} hrs` : "--"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {tieneHorario ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Asignado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {tieneHorario ? (
                                <>
                                  <button
                                    onClick={() => openEditModal(emp)}
                                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                    title="Editar horario"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openHistoryModal(emp)}
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Ver historial"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openAsignacionModal(emp)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Asignar horario"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Asignación/Edición */}
        {showModal && selectedEmpleado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 rounded-t-xl flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {editandoId ? "Editar Horario" : "Asignar Horario"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Empleado</p>
                  <p className="font-medium text-gray-800">{selectedEmpleado.Nombres} {selectedEmpleado.Apellidos}</p>
                  <p className="text-xs text-gray-400">DNI: {selectedEmpleado.DocID}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semana</label>
                  <div className="bg-blue-50 p-2 rounded-lg text-sm text-gray-700 border border-blue-100">
                    📅 {semanaSeleccionada?.label}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Horario *</label>
                  <select
                    value={asignacionForm.HorarioId}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, HorarioId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horas por día</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="24"
                      value={asignacionForm.horas_dia}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, horas_dia: parseFloat(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Días laborables</label>
                    <select
                      value={asignacionForm.dias_trabajo}
                      onChange={(e) => setAsignacionForm({ ...asignacionForm, dias_trabajo: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1,2,3,4,5">Lunes a Viernes</option>
                      <option value="1,2,3,4,5,6">Lunes a Sábado</option>
                      <option value="2,3,4,5,6">Martes a Sábado</option>
                      <option value="1,2,3,4,5,6,7">Lunes a Domingo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    rows="2"
                    value={asignacionForm.observaciones}
                    onChange={(e) => setAsignacionForm({ ...asignacionForm, observaciones: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Al asignar este horario, se generarán automáticamente los registros de asistencia para cada día laborable de la semana con estado "Ausente".
                  </p>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={editandoId ? actualizarHorario : asignarHorario}
                    disabled={loading || !asignacionForm.HorarioId}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm font-medium"
                  >
                    <Save className="w-4 h-4 inline mr-1" />
                    {editandoId ? "Actualizar" : "Guardar"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Historial */}
        {showHistoryModal && selectedEmpleado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowHistoryModal(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4 rounded-t-xl flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historial de Horarios
                </h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {selectedEmpleado.Nombres?.charAt(0)}{selectedEmpleado.Apellidos?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedEmpleado.Nombres} {selectedEmpleado.Apellidos}</p>
                    <p className="text-xs text-gray-500">DNI: {selectedEmpleado.DocID}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 overflow-y-auto max-h-[50vh]">
                {historial.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay historial de horarios</p>
                ) : (
                  <div className="space-y-3">
                    {historial.map((reg, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{reg.horario_nombre}</p>
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
                          <div className="text-right">
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
              <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    openAsignacionModal(selectedEmpleado);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
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