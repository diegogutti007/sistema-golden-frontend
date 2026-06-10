import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  UserCog,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  Hash,
  DollarSign,
  FileText
} from "lucide-react";
import Modal from "react-modal";
import ModalCita from "../Modales/ModalCita";
import ModalCliente from "../Modales/ModalCliente";
import { BACKEND_URL } from '../config';

Modal.setAppElement("#root");

export default function HistorialCitas() {
  const [citas, setCitas] = useState([]);
  const [citasOriginales, setCitasOriginales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalCita, setModalCita] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [showFiltros, setShowFiltros] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    search: "",
    estado: "",
    cliente: "",
    empleado: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  // Opciones para los filtros
  const [opciones, setOpciones] = useState({
    estados: ["Programada", "En progreso", "Completada", "Cancelada"],
    clientes: [],
    empleados: []
  });

  // Estado para el formulario de cita
  const [form, setForm] = useState({
    CitaID: null,
    ClienteID: "",
    EmpId: "",
    Titulo: "",
    clienteNombre: "",
    Descripcion: "",
    FechaInicio: "",
    FechaFin: "",
    Estado: "Programada"
  });

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "No especificada";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PE', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatearFechaCorta = (fechaISO) => {
    if (!fechaISO) return "N/E";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const calcularDuracion = (inicio, fin) => {
    if (!inicio || !fin) return "0 min";
    const start = new Date(inicio);
    const end = new Date(fin);
    const diffMins = Math.round((end - start) / (1000 * 60));
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatearMonto = (monto) => {
    if (monto === null || monto === undefined) return "0.00";
    const num = Number(monto);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  // Cargar citas
  const cargarCitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/citas`);
      const data = await res.json();

      const citasFormateadas = data.map(cita => ({
        id: cita.id,
        titulo: cita.title,
        descripcion: cita.descripcion,
        fechaInicio: cita.start,
        fechaFin: cita.end,
        estado: cita.extendedProps?.estado || "Programada",
        clienteID: cita.extendedProps?.clienteID,
        clienteNombre: cita.extendedProps?.clienteNombre || "Cliente no especificado",
        empleadoID: cita.extendedProps?.EmpId,
        empleadoNombre: cita.extendedProps?.empleadoNombre || "Empleado no asignado",
        duracion: calcularDuracion(cita.start, cita.end),
        monto: cita.extendedProps?.Monto || 0
      }));

      setCitasOriginales(citasFormateadas);
      setCitas(citasFormateadas);

      // Extraer opciones únicas para filtros
      const clientesUnicos = [...new Map(citasFormateadas.map(c => [c.clienteID, c.clienteNombre])).entries()].map(([id, nombre]) => ({ id, nombre }));
      const empleadosUnicos = [...new Map(citasFormateadas.map(c => [c.empleadoID, c.empleadoNombre])).entries()].map(([id, nombre]) => ({ id, nombre }));

      setOpciones(prev => ({
        ...prev,
        clientes: clientesUnicos.filter(c => c.id),
        empleados: empleadosUnicos.filter(e => e.id)
      }));
    } catch (error) {
      console.error("❌ Error al cargar citas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes y empleados para modales
  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  }, []);

  const cargarEmpleados = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/listaempleadoactivo`);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("❌ Error al cargar empleados:", error);
    }
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = useCallback(() => {
    let resultados = [...citasOriginales];

    // Filtro por búsqueda de texto
    if (filtros.search && filtros.search.trim() !== "") {
      const searchLower = filtros.search.toLowerCase().trim();
      resultados = resultados.filter(cita =>
        (cita.titulo || "").toLowerCase().includes(searchLower) ||
        (cita.descripcion || "").toLowerCase().includes(searchLower) ||
        (cita.clienteNombre || "").toLowerCase().includes(searchLower) ||
        (cita.empleadoNombre || "").toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filtros.estado && filtros.estado !== "") {
      resultados = resultados.filter(cita => cita.estado === filtros.estado);
    }

    // Filtro por cliente
    if (filtros.cliente && filtros.cliente !== "") {
      resultados = resultados.filter(cita => cita.clienteID === filtros.cliente);
    }

    // Filtro por empleado
    if (filtros.empleado && filtros.empleado !== "") {
      resultados = resultados.filter(cita => cita.empleadoID === filtros.empleado);
    }

    // Filtro por fecha desde
    if (filtros.fechaDesde && filtros.fechaDesde !== "") {
      const fechaDesde = new Date(filtros.fechaDesde);
      fechaDesde.setHours(0, 0, 0, 0);
      resultados = resultados.filter(cita => {
        const fechaCita = new Date(cita.fechaInicio);
        return fechaCita >= fechaDesde;
      });
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta && filtros.fechaHasta !== "") {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      resultados = resultados.filter(cita => {
        const fechaCita = new Date(cita.fechaInicio);
        return fechaCita <= fechaHasta;
      });
    }

    setCitas(resultados);
  }, [filtros, citasOriginales]);

  // Resetear filtros
  const resetearFiltros = () => {
    setFiltros({
      search: "",
      estado: "",
      cliente: "",
      empleado: "",
      fechaDesde: "",
      fechaHasta: ""
    });
    setCitas(citasOriginales);
    setShowFiltros(false);
  };

  // Limpiar un filtro específico
  const limpiarFiltro = (campo) => {
    setFiltros(prev => ({ ...prev, [campo]: "" }));
  };

  // Manejar cambio en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  useEffect(() => {
    cargarCitas();
    cargarClientes();
    cargarEmpleados();
  }, [cargarCitas, cargarClientes, cargarEmpleados]);

  // Aplicar filtros cuando cambian los filtros o las citas originales
  useEffect(() => {
    if (citasOriginales.length > 0) {
      aplicarFiltros();
    }
  }, [aplicarFiltros, citasOriginales]);

  const getEstadoStyles = (estado) => {
    const styles = {
      Programada: "bg-blue-100 text-blue-800 border-blue-200",
      "En progreso": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Completada: "bg-green-100 text-green-800 border-green-200",
      Cancelada: "bg-red-100 text-red-800 border-red-200"
    };
    return styles[estado] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      Programada: CalendarDays,
      "En progreso": AlertCircle,
      Completada: CheckCircle,
      Cancelada: XCircle
    };
    return icons[estado] || CalendarIcon;
  };

  const handleEditarCita = (cita) => {
    const formData = {
      CitaID: cita.id,
      ClienteID: cita.clienteID || "",
      EmpId: cita.empleadoID || "",
      Titulo: cita.titulo || "",
      clienteNombre: cita.clienteNombre || "",
      Descripcion: cita.descripcion || "",
      FechaInicio: formatDateForInput(cita.fechaInicio),
      FechaFin: formatDateForInput(cita.fechaFin),
      Estado: cita.estado || "Programada",
      EstadoOriginal: cita.estado || "Programada"
    };
    setForm(formData);
    setModalKey(prev => prev + 1);
    setModalCita(true);
  };

  const openDetalle = (cita) => {
    setSelectedCita(cita);
    setModalDetalle(true);
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  };

  const closeDetalle = () => {
    setSelectedCita(null);
    setModalDetalle(false);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  };

  const handleEliminarCita = async (cita) => {
    if (!window.confirm(`¿Estás seguro de eliminar la cita "${cita.titulo}"?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/citas/${cita.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("✅ Cita eliminada correctamente.");
        cargarCitas();
      } else {
        alert("❌ Error al eliminar la cita.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Error al eliminar la cita.");
    }
  };

  const handleGuardarCita = async (e) => {
    e.preventDefault();
    if (!form.Titulo || !form.FechaInicio || !form.ClienteID) {
      alert("⚠️ Completa el título, la fecha y el cliente.");
      return;
    }

    const metodo = form.CitaID ? "PUT" : "POST";
    const url = form.CitaID ? `${BACKEND_URL}/api/citas/${form.CitaID}` : `${BACKEND_URL}/api/citas`;

    const cuerpoCita = {
      ...form,
      title: form.Titulo,
      descripcion: form.Descripcion,
      start: form.FechaInicio,
      end: form.FechaFin,
      extendedProps: {
        clienteID: form.ClienteID,
        EmpId: form.EmpId,
        estado: form.Estado
      }
    };

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpoCita),
      });
      if (!respuesta.ok) throw new Error("Error al guardar cita");
      alert(form.CitaID ? "✅ Cita actualizada." : "✅ Cita registrada.");
      setModalCita(false);
      cargarCitas();
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ No se pudo guardar la cita.");
    }
  };

  const handleEliminarCitaModal = async () => {
    if (!form.CitaID) return;
    if (window.confirm("¿Estás seguro de eliminar esta cita?")) {
      try {
        await fetch(`${BACKEND_URL}/api/citas/${form.CitaID}`, { method: "DELETE" });
        setModalCita(false);
        cargarCitas();
        alert("✅ Cita eliminada correctamente.");
      } catch (error) {
        alert("❌ Error al eliminar la cita.");
      }
    }
  };

  const filtrosActivos = Object.values(filtros).filter(val => val !== "").length;

  const stats = {
    total: citas.length,
    programadas: citas.filter(c => c.estado === 'Programada').length,
    enProgreso: citas.filter(c => c.estado === 'En progreso').length,
    completadas: citas.filter(c => c.estado === 'Completada').length,
    canceladas: citas.filter(c => c.estado === 'Cancelada').length,
    filtrados: citasOriginales.length - citas.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 p-3 sm:p-4 md:p-6">
      {/* Header con Estadísticas */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Historial de Citas</h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">Gestiona y revisa todas las citas del negocio</p>
            </div>
          </div>
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm md:text-base">Total Citas</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</p>
                {stats.filtrados > 0 && (
                  <p className="text-blue-200 text-xs mt-1">{stats.filtrados} ocultos</p>
                )}
              </div>
              <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm md:text-base">Programadas</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.programadas}</p>
              </div>
              <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs sm:text-sm md:text-base">En progreso</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.enProgreso}</p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm md:text-base">Completadas</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.completadas}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs sm:text-sm md:text-base">Canceladas</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.canceladas}</p>
              </div>
              <XCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-200" />
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, cliente o empleado..."
                value={filtros.search}
                onChange={(e) => handleFiltroChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              {filtros.search && (
                <button
                  onClick={() => limpiarFiltro("search")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Filtros</span>
              {filtrosActivos > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {filtrosActivos}
                </span>
              )}
              {showFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Filtros avanzados */}
          {showFiltros && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => handleFiltroChange("estado", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Todos los estados</option>
                    {opciones.estados.map((estado, index) => (
                      <option key={index} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                  <select
                    value={filtros.cliente}
                    onChange={(e) => handleFiltroChange("cliente", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los clientes</option>
                    {opciones.clientes.map((cliente, index) => (
                      <option key={index} value={cliente.id}>{cliente.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
                  <select
                    value={filtros.empleado}
                    onChange={(e) => handleFiltroChange("empleado", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todos los empleados</option>
                    {opciones.empleados.map((empleado, index) => (
                      <option key={index} value={empleado.id}>{empleado.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
                  <input
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => handleFiltroChange("fechaDesde", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
                  <input
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => handleFiltroChange("fechaHasta", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetearFiltros}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Limpiar todos</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-3 sm:mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="text-sm sm:text-base text-gray-700">
                Mostrando <span className="font-bold text-gray-900">{citas.length}</span> de{' '}
                <span className="font-bold text-gray-900">{citasOriginales.length}</span> citas
              </span>
            </div>
            {filtrosActivos > 0 && (
              <button onClick={resetearFiltros} className="text-xs sm:text-sm text-red-600 hover:text-red-800 flex items-center space-x-1">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Cita</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Cliente</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Empleado</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase hidden xl:table-cell">Fecha</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {citas.length > 0 ? (
                  citas.map((cita) => {
                    const EstadoIcon = getEstadoIcon(cita.estado);
                    return (
                      <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mr-3">
                              <CalendarDays className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{cita.titulo}</div>
                              <div className="text-xs text-gray-500">#{cita.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm">{cita.clienteNombre}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden lg:table-cell">
                          <div className="flex items-center space-x-2">
                            <UserCog className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm">{cita.empleadoNombre}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden xl:table-cell">
                          <div className="flex items-center justify-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-700">{formatearFechaCorta(cita.fechaInicio)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoStyles(cita.estado)}`}>
                            <EstadoIcon className="w-3 h-3 mr-1" />
                            {cita.estado}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => openDetalle(cita)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver detalle">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditarCita(cita)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Editar">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEliminarCita(cita)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <CalendarDays className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No se encontraron citas</p>
                        <p className="text-sm">Intenta con otros criterios de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lista - Versión Móvil y Tablet */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : citas.length > 0 ? (
          citas.map((cita) => {
            const EstadoIcon = getEstadoIcon(cita.estado);
            return (
              <div key={cita.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cita.titulo}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getEstadoStyles(cita.estado)}`}>
                        <EstadoIcon className="w-3 h-3 mr-1" />
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{cita.clienteNombre}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCog className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{cita.empleadoNombre}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 text-xs">{formatearFecha(cita.fechaInicio)}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                  <button onClick={() => openDetalle(cita)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>Detalle</span>
                  </button>
                  <button onClick={() => handleEditarCita(cita)} className="px-3 py-1.5 text-yellow-600 border border-yellow-200 rounded-lg text-sm flex items-center space-x-1">
                    <Edit className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  <button onClick={() => handleEliminarCita(cita)} className="px-3 py-1.5 text-red-600 border border-red-200 rounded-lg text-sm flex items-center space-x-1">
                    <Trash2 className="w-3 h-3" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <CalendarDays className="w-16 h-16 mb-4 text-gray-300 mx-auto" />
            <p className="text-lg font-medium text-gray-500">No se encontraron citas</p>
            <p className="text-sm text-gray-400">Intenta con otros criterios de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de Detalle (igual que antes) */}
      {modalDetalle && selectedCita && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-8" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-t-2xl px-6 py-5 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <CalendarDays className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Detalle de la Cita</h2>
                    <p className="text-amber-100 text-sm">Información completa del registro</p>
                  </div>
                </div>
                <button onClick={closeDetalle} className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-xl">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Título de la cita</p>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCita.titulo}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">ID: #{selectedCita.id}</span>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${getEstadoStyles(selectedCita.estado)}`}>
                    {(() => {
                      const Icon = getEstadoIcon(selectedCita.estado);
                      return <Icon className="w-4 h-4 mr-2" />;
                    })()}
                    {selectedCita.estado}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Cliente</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{selectedCita.clienteNombre}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <UserCog className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Empleado</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{selectedCita.empleadoNombre}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Fecha y Hora</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{formatearFecha(selectedCita.fechaInicio)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Duración</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{selectedCita.duracion}</p>
                    </div>
                  </div>
                </div>

                {selectedCita.monto && Number(selectedCita.monto) > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:col-span-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Monto</p>
                        <p className="text-lg font-bold text-green-600 mt-1">S/. {formatearMonto(selectedCita.monto)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedCita.descripcion && (
                <div className="mb-6">
                  <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
                    <div className="bg-amber-100 px-5 py-3 border-b border-amber-200">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-900">Descripción</h4>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-700">{selectedCita.descripcion}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button onClick={closeDetalle} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    closeDetalle();
                    handleEditarCita(selectedCita);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:shadow-lg font-medium flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar cita</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <ModalCita
        key={modalKey}
        modalCita={modalCita}
        setModalCita={setModalCita}
        form={form}
        setForm={setForm}
        guardarCita={handleGuardarCita}
        eliminarCita={handleEliminarCitaModal}
        clientes={clientes}
        Empleados={empleados}
        setModalCliente={() => {}}
        handleEstadoChange={(e) => setForm(prev => ({ ...prev, Estado: e.target.value }))}
      />

      <ModalCliente
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        recargarClientes={cargarClientes}
      />
    </div>
  );
}