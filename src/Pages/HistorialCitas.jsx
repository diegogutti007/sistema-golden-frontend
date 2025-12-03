import React, { useState, useEffect, useCallback } from "react";
import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaSyncAlt,
  FaTimes,
  FaCheck,
  FaClock,
  FaUser,
  FaUserTie,
  FaCalendarDay,
  FaIdBadge
} from "react-icons/fa";
import Modal from "react-modal";
import ModalCita from "../Modales/ModalCita";
import ModalCliente from "../Modales/ModalCliente";

Modal.setAppElement("#root");

export default function HistorialCitas() {
  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalCita, setModalCita] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Para Create React App usa REACT_APP_API_URL
    const url = "https://sistemagolden-backend-production.up.railway.app"//process.env.REACT_APP_API_URL || "http://localhost:5000"//"https://sistemagolden-backend-production.up.railway.app";//
    //"https://sistemagolden-backend-production.up.railway.app"
    setBackendUrl(url);
    console.log("🔗 URL del backend detectada:", url);
  }, []);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    estado: "",
    cliente: "",
    empleado: "",
    search: ""
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

  // Función auxiliar para formatear fechas para inputs datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:mm
  };

  // Cargar datos iniciales
  const cargarCitas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/citas`);
      const data = await res.json();

      // Convertir a formato de historial
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
        duracion: calcularDuracion(cita.start, cita.end)
      }));

      setCitas(citasFormateadas);
    } catch (error) {
      console.error("❌ Error al cargar citas:", error);
      alert("Error al cargar las citas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  }, []);

  const cargarEmpleados = useCallback(async () => {
    try {
      const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/listaempleado`);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("❌ Error al cargar empleados:", error);
    }
  }, []);

  const calcularDuracion = (inicio, fin) => {
    if (!inicio || !fin) return "0 min";

    const start = new Date(inicio);
    const end = new Date(fin);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const aplicarFiltros = useCallback(() => {
    let resultado = [...citas];

    // Filtro por fechas
    if (filtros.fechaInicio) {
      resultado = resultado.filter(cita =>
        new Date(cita.fechaInicio) >= new Date(filtros.fechaInicio)
      );
    }

    if (filtros.fechaFin) {
      // Ajustar la fecha fin para incluir todo el día
      const fechaFin = new Date(filtros.fechaFin);
      fechaFin.setHours(23, 59, 59, 999);

      resultado = resultado.filter(cita =>
        new Date(cita.fechaInicio) <= fechaFin
      );
    }

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(cita =>
        cita.estado === filtros.estado
      );
    }

    // Filtro por cliente
    if (filtros.cliente) {
      resultado = resultado.filter(cita =>
        cita.clienteID === filtros.cliente
      );
    }

    // Filtro por empleado
    if (filtros.empleado) {
      resultado = resultado.filter(cita =>
        cita.empleadoID === filtros.empleado
      );
    }

    // Filtro por búsqueda de texto
    if (filtros.search) {
      const searchLower = filtros.search.toLowerCase();
      resultado = resultado.filter(cita =>
        cita.titulo.toLowerCase().includes(searchLower) ||
        cita.descripcion.toLowerCase().includes(searchLower) ||
        cita.clienteNombre.toLowerCase().includes(searchLower) ||
        cita.empleadoNombre.toLowerCase().includes(searchLower)
      );
    }

    setCitasFiltradas(resultado);
  }, [filtros, citas]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarCitas();
    cargarClientes();
    cargarEmpleados();
  }, [cargarCitas, cargarClientes, cargarEmpleados]);

  // Aplicar filtros cuando cambien los filtros o las citas
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      estado: "",
      cliente: "",
      empleado: "",
      search: ""
    });
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "No especificada";

    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaCorta = (fechaISO) => {
    if (!fechaISO) return "N/E";

    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      Programada: FaCalendarDay,
      "En progreso": FaSyncAlt,
      Completada: FaCheck,
      Cancelada: FaTimes
    };
    return icons[estado] || FaCalendarAlt;
  };

  const handleEditarCita = (cita) => {
    console.log("📝 Editando cita:", cita); // Para debug

    // Mapeo correcto de propiedades
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

    console.log("📋 Form data:", formData); // Para debug

    setForm(formData);
    setModalKey(prev => prev + 1);
    setModalCita(true);
  };

  const handleVerDetalle = (cita) => {
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

  const handleEliminarCita = async (cita) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la cita "${cita.titulo}"?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/citas/${cita.id}`, {
        method: "DELETE"
      });

      if (!respuesta.ok) throw new Error("Error al eliminar cita");

      alert("✅ Cita eliminada correctamente.");
      cargarCitas();
    } catch (error) {
      console.error("❌ Error al eliminar cita:", error);
      alert("❌ No se pudo eliminar la cita.");
    }
  };

  const handleGuardarCita = async (e) => {
    e.preventDefault();
    console.log("💾 Guardando cita:", form);

    try {
      if (!form.Titulo || !form.FechaInicio || !form.ClienteID) {
        alert("⚠️ Completa el título, la fecha y el cliente.");
        return;
      }

      const metodo = form.CitaID ? "PUT" : "POST";
      const url = form.CitaID
        ? `https://sistemagolden-backend-production.up.railway.app/api/citas/${form.CitaID}`
        : `https://sistemagolden-backend-production.up.railway.app/api/citas`;

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
      console.error("❌ Error al guardar cita:", error);
      alert("❌ No se pudo guardar la cita.");
    }
  };

  const handleEliminarCitaModal = async () => {
    if (!form.CitaID) return;

    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        await fetch(`https://sistemagolden-backend-production.up.railway.app/api/citas/${form.CitaID}`, {
          method: "DELETE"
        });
        setModalCita(false);
        cargarCitas();
        alert("✅ Cita eliminada correctamente.");
      } catch (error) {
        alert("❌ Error al eliminar la cita.");
      }
    }
  };

  // Debug: Verificar cuando el modal se abre y qué datos tiene
  useEffect(() => {
    if (modalCita) {
      console.log("🔍 Modal abierto con datos:", form);
      console.log("📊 Clientes disponibles:", clientes.length);
      console.log("👥 Empleados disponibles:", empleados.length);
    }
  }, [modalCita, form, clientes.length, empleados.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 rounded-xl">
              <FaCalendarAlt className="text-white text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Historial de Citas</h1>
              <p className="text-gray-600 text-sm sm:text-base">Gestiona y revisa todas tus citas</p>
            </div>
          </div>

          <button
            onClick={cargarCitas}
            disabled={isLoading}
            className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full lg:w-auto justify-center"
          >
            <FaSyncAlt className={`${isLoading ? 'animate-spin' : ''} text-sm sm:text-base`} />
            <span className="text-sm sm:text-base">
              {isLoading ? "Cargando..." : "Actualizar"}
            </span>
          </button>
        </div>
      </div>

      {/* Filtros - Diseño Mobile First */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-600 text-sm sm:text-base" />
          <h2 className="text-lg font-semibold text-gray-800 text-sm sm:text-base">Filtros</h2>
        </div>

        {/* Búsqueda general - Siempre arriba */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar en citas
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Título, descripción, cliente..."
              value={filtros.search}
              onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filtros en grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha desde
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha hasta
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="Programada">Programada</option>
              <option value="En progreso">En progreso</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <select
              value={filtros.cliente}
              onChange={(e) => setFiltros(prev => ({ ...prev, cliente: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos</option>
              {clientes.map(cliente => (
                <option key={cliente.ClienteID} value={cliente.ClienteID}>
                  {cliente.Nombre} {cliente.Apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Empleado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado
            </label>
            <select
              value={filtros.empleado}
              onChange={(e) => setFiltros(prev => ({ ...prev, empleado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos</option>
              {empleados.map(empleado => (
                <option key={empleado.EmpId} value={empleado.EmpId}>
                  {empleado.Nombre} {empleado.Apellido}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        <div className="flex justify-end mt-4">
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-sm"
          >
            <FaTimes className="text-xs" />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Estadísticas - Diseño Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-blue-100">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{citasFiltradas.length}</div>
          <div className="text-gray-600 text-xs sm:text-sm">Total citas</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-green-100">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {citasFiltradas.filter(c => c.estado === 'Completada').length}
          </div>
          <div className="text-gray-600 text-xs sm:text-sm">Completadas</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-yellow-100">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">
            {citasFiltradas.filter(c => c.estado === 'En progreso').length}
          </div>
          <div className="text-gray-600 text-xs sm:text-sm">En progreso</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-red-100">
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            {citasFiltradas.filter(c => c.estado === 'Cancelada').length}
          </div>
          <div className="text-gray-600 text-xs sm:text-sm">Canceladas</div>
        </div>
      </div>

      {/* Lista de citas - Diseño Mobile First */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <FaSyncAlt className="animate-spin text-blue-500 text-xl sm:text-2xl mr-3" />
            <span className="text-gray-600 text-sm sm:text-base">Cargando citas...</span>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FaCalendarAlt className="text-gray-400 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No se encontraron citas</h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
              {citas.length === 0
                ? "No hay citas registradas en el sistema."
                : "No hay citas que coincidan con los filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
            {/* Vista Mobile - Cards */}
            <div className="block sm:hidden space-y-3 p-3">
              {citasFiltradas.map((cita) => {
                const EstadoIcon = getEstadoIcon(cita.estado);
                return (
                  <div key={cita.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    {/* Header de la card */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {cita.titulo}
                        </h3>
                        {cita.descripcion && (
                          <p className="text-gray-600 text-xs line-clamp-2">
                            {cita.descripcion}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-2 flex-shrink-0 ${getEstadoStyles(cita.estado)}`}>
                        <EstadoIcon className="mr-1 text-xs" />
                        {cita.estado === 'Programada' ? 'Prog.' :
                          cita.estado === 'En progreso' ? 'Progreso' :
                            cita.estado === 'Completada' ? 'Comp.' : 'Canc.'}
                      </span>
                    </div>

                    {/* Información de la cita */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center text-gray-700">
                        <FaUser className="text-gray-400 mr-2 flex-shrink-0" />
                        <span className="truncate">{cita.clienteNombre}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaUserTie className="text-gray-400 mr-2 flex-shrink-0" />
                        <span className="truncate">{cita.empleadoNombre}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaClock className="text-gray-400 mr-2 flex-shrink-0" />
                        <span>{formatearFechaCorta(cita.fechaInicio)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaIdBadge className="text-gray-400 mr-2 flex-shrink-0" />
                        <span>{cita.duracion}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerDetalle(cita)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1"
                          title="Ver detalles"
                        >
                          <FaEye className="text-base" />
                        </button>
                        <button
                          onClick={() => handleEditarCita(cita)}
                          className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1"
                          title="Editar cita"
                        >
                          <FaEdit className="text-base" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleEliminarCita(cita)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1"
                        title="Eliminar cita"
                      >
                        <FaTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vista Desktop - Tabla */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cita
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {citasFiltradas.map((cita) => {
                    const EstadoIcon = getEstadoIcon(cita.estado);
                    return (
                      <tr key={cita.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{cita.titulo}</div>
                            {cita.descripcion && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {cita.descripcion}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center">
                            <FaUser className="text-gray-400 mr-2 text-xs" />
                            <span className="text-gray-900 text-sm">{cita.clienteNombre}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center">
                            <FaUserTie className="text-gray-400 mr-2 text-xs" />
                            <span className="text-gray-900 text-sm">{cita.empleadoNombre}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center">
                            <FaClock className="text-gray-400 mr-2 text-xs" />
                            <span className="text-gray-900 text-sm">{formatearFecha(cita.fechaInicio)}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-gray-900 text-sm">
                          {cita.duracion}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoStyles(cita.estado)}`}>
                            <EstadoIcon className="mr-1 text-xs" />
                            {cita.estado}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVerDetalle(cita)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1"
                              title="Ver detalles"
                            >
                              <FaEye className="text-base" />
                            </button>
                            <button
                              onClick={() => handleEditarCita(cita)}
                              className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1"
                              title="Editar cita"
                            >
                              <FaEdit className="text-base" />
                            </button>
                            <button
                              onClick={() => handleEliminarCita(cita)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1"
                              title="Eliminar cita"
                            >
                              <FaTrash className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

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
        setModalCliente={setModalCliente}
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