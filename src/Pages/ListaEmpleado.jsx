import React, { useState, useEffect } from "react";
import ModalModificarEmpleado from "../Modales/ModalModificarEmpleado";
import Swal from 'sweetalert2';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaUsers,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaIdCard,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaBriefcase,
  FaUserCheck
} from "react-icons/fa";
import {
  Users,
  Search,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  User,
  FileText,
  MapPin,
  Cake,
  Briefcase,
  Phone,
  Mail,
  LogOut,
  X,
  UserCircle,
  CreditCard,
  Clock,
  Award
} from "lucide-react";
import Modal from "react-modal";
import { BACKEND_URL } from '../config';

Modal.setAppElement("#root");

function ListaEmpleado() {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalModificarOpen, setModalModificarOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [empleadoDetalle, setEmpleadoDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = () => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/listaempleado`)
      .then((res) => res.json())
      .then((data) => setEmpleados(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("❌ Error al obtener empleados:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los empleados',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      })
      .finally(() => setLoading(false));
  };

  const eliminarEmpleado = (id, nombreCompleto) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${BACKEND_URL}/api/empleado/${id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.mensaje) {
              Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: data.mensaje,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                timer: 2000,
                timerProgressBar: true
              });
              cargarEmpleados();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el empleado',
                confirmButtonColor: '#3085d6'
              });
            }
          })
          .catch((err) => {
            console.error("❌ Error al eliminar empleado:", err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al eliminar el empleado',
              confirmButtonColor: '#3085d6'
            });
          });
      }
    });
  };

  const abrirModalModificar = (emp) => {
    console.log("Empleado seleccionado para modificar:", emp);
    setEmpleadoSeleccionado(emp);
    setModalModificarOpen(true);
  };

  const cerrarModalModificar = () => {
    setModalModificarOpen(false);
    setEmpleadoSeleccionado(null);
  };

  const handleEmpleadoActualizado = (empleadoActualizado) => {
    cargarEmpleados();
    Swal.fire({
      icon: 'success',
      title: '¡Actualizado!',
      text: 'Los datos del empleado han sido actualizados correctamente',
      confirmButtonColor: '#3085d6',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: true
    });
  };

  const verDetalle = (emp) => {
    setEmpleadoDetalle(emp);
    setDetalleModalOpen(true);
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const texto = busqueda.toLowerCase();
    return (
      emp.Nombres.toLowerCase().includes(texto) ||
      emp.Apellidos.toLowerCase().includes(texto) ||
      emp.DocID.toLowerCase().includes(texto) ||
      (emp.Descripcion && emp.Descripcion.toLowerCase().includes(texto))
    );
  });

  const stats = {
    total: empleados.length,
    activos: empleados.filter(emp => !emp.fecha_renuncia).length,
    comision: empleados.filter(emp => emp.Comision > 0).length
  };

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return "No registrada";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mostrar mensaje de éxito al cargar datos
  const mostrarMensajeCarga = () => {
    if (!loading && empleados.length > 0) {
      Swal.fire({
        icon: 'success',
        title: 'Datos cargados',
        text: `Se han cargado ${empleados.length} empleados correctamente`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header con Estadísticas */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Empleados</h1>
            <p className="text-gray-600 text-sm">Administra y gestiona tu equipo de trabajo</p>
          </div>
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Empleados</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Empleados Activos</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.activos}</p>
              </div>
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Con Comisión</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.comision}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, documento o cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            {empleadosFiltrados.length} de {empleados.length} empleados
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
                      Empleado
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Comisión
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sueldo
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {empleadosFiltrados.length > 0 ? (
                    empleadosFiltrados.map((emp, index) => (
                      <tr
                        key={emp.EmpId}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {emp.Nombres.charAt(0)}{emp.Apellidos.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {emp.Nombres} {emp.Apellidos}
                              </div>
                              <div className="text-sm text-gray-500">Doc: {emp.DocID}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-700">
                            <Briefcase className="text-gray-400 mr-2 w-4 h-4" />
                            <span className={emp.Descripcion ? "font-medium text-gray-900" : "text-gray-500 italic"}>
                              {emp.Descripcion || "Sin cargo asignado"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {emp.TipoEmpleado}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {emp.Comision ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {parseFloat(emp.Comision).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {emp.fecha_renuncia ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactivo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-900 font-semibold">
                            <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                            S/ {parseFloat(emp.Sueldo).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => verDetalle(emp)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => abrirModalModificar(emp)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => eliminarEmpleado(emp.EmpId, `${emp.Nombres} ${emp.Apellidos}`)}
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
                      <td colSpan="7" className="py-12 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <Users className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No se encontraron empleados</p>
                          <p className="text-sm">Intenta con otros términos de búsqueda</p>
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
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : empleadosFiltrados.length > 0 ? (
          empleadosFiltrados.map((emp) => (
            <div key={emp.EmpId} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {emp.Nombres.charAt(0)}{emp.Apellidos.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {emp.Nombres} {emp.Apellidos}
                    </h3>
                    <p className="text-xs text-gray-500">Doc: {emp.DocID}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => verDetalle(emp)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => abrirModalModificar(emp)}
                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => eliminarEmpleado(emp.EmpId, `${emp.Nombres} ${emp.Apellidos}`)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Cargo:</span>
                  <span className={emp.Descripcion ? "font-medium text-gray-900 truncate" : "text-gray-500 italic"}>
                    {emp.Descripcion || "Sin cargo"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium text-blue-600">{emp.TipoEmpleado}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Comisión:</span>
                  <span className="font-medium text-green-600">
                    {emp.Comision ? `${parseFloat(emp.Comision).toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Sueldo:</span>
                  <span className="font-medium text-gray-900">S/ {parseFloat(emp.Sueldo).toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Estado:</span>
                  {emp.fecha_renuncia ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactivo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <Users className="w-16 h-16 mb-4 text-gray-300 mx-auto" />
            <p className="text-lg font-medium text-gray-500 mb-2">No se encontraron empleados</p>
            <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de Modificación */}
      <ModalModificarEmpleado
        empleado={empleadoSeleccionado}
        isOpen={modalModificarOpen}
        onClose={cerrarModalModificar}
        onUpdate={handleEmpleadoActualizado}
      />

      {/* Modal Detalle Mejorado con Scroll - Responsive */}
      <Modal
        isOpen={detalleModalOpen}
        onRequestClose={() => setDetalleModalOpen(false)}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative flex flex-col"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            maxHeight: '90vh',
            padding: 0,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header fijo */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg flex-shrink-0">
                <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  {empleadoDetalle?.Nombres} {empleadoDetalle?.Apellidos}
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm truncate flex items-center gap-1">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{empleadoDetalle?.Descripcion || "Sin cargo asignado"}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setDetalleModalOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 flex-shrink-0 ml-2"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-gray-50 to-white">
          {empleadoDetalle && (
            <>
              {/* Tarjeta de Identificación */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaIdCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Documento de Identidad</p>
                      <p className="font-mono font-bold text-gray-800 text-sm sm:text-base break-all">{empleadoDetalle.DocID}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo de Empleado</p>
                      <p className="font-semibold text-purple-600 text-sm sm:text-base break-words">{empleadoDetalle.TipoEmpleado}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Información Principal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Información Económica */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Información Económica</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Sueldo Base</span>
                      <span className="font-bold text-green-600 text-sm">S/ {parseFloat(empleadoDetalle.Sueldo).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-600">Comisión</span>
                      <span className="font-semibold text-blue-600 text-sm">
                        {empleadoDetalle.Comision ? `${empleadoDetalle.Comision}%` : "No aplica"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Información Laboral</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 py-1">
                      <Award className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Cargo / Puesto</p>
                        <p className="text-sm font-medium text-gray-800 break-words">
                          {empleadoDetalle.Descripcion || "Sin cargo asignado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas Importantes */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">Fechas Importantes</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Fecha de Ingreso</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {formatearFecha(empleadoDetalle.fecha_ingreso)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Fecha de Nacimiento</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {formatearFecha(empleadoDetalle.FechaNacimiento)}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${empleadoDetalle.fecha_renuncia ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Estado / Renuncia</p>
                    {empleadoDetalle.fecha_renuncia ? (
                      <>
                        <p className="text-sm font-semibold text-red-600 break-words">
                          {formatearFecha(empleadoDetalle.fecha_renuncia)}
                        </p>
                        <p className="text-xs text-red-500 mt-1">Fecha de renuncia</p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-green-600">
                        Activo en la empresa
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Personal */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">Información Personal</h3>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Dirección</p>
                    <p className="text-sm text-gray-800 leading-relaxed break-words">
                      {empleadoDetalle.Direccion || "No registrada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado del Empleado con diseño mejorado */}
              <div className={`rounded-xl p-4 border shadow-lg ${empleadoDetalle.fecha_renuncia ?
                  "bg-gradient-to-r from-red-50 to-red-100 border-red-200" :
                  "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
                }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${empleadoDetalle.fecha_renuncia ? "bg-red-500" : "bg-green-500"
                    } shadow-md`}>
                    {empleadoDetalle.fecha_renuncia ? (
                      <LogOut className="w-6 h-6 text-white" />
                    ) : (
                      <FaUserCheck className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                      {empleadoDetalle.fecha_renuncia ? "Empleado Inactivo" : "Empleado Activo"}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                      {empleadoDetalle.fecha_renuncia ?
                        `Fecha de renuncia: ${formatearFecha(empleadoDetalle.fecha_renuncia)}` :
                        "Actualmente trabajando en la empresa"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer fijo */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <button
            onClick={() => setDetalleModalOpen(false)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cerrar Detalle</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default ListaEmpleado;