import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  FaEdit,
  FaTrash,
  FaBan,
  FaUserPlus,
  FaLock,
  FaUnlock,
  FaCalendarCheck,
  FaUser,
  FaUserTie,
  FaCalendarAlt,
  FaClipboardList,
  FaTag,
  FaClock
} from "react-icons/fa";

Modal.setAppElement("#root");

function ModalCita({
  modalCita,
  setModalCita,
  form,
  setForm,
  guardarCita,
  eliminarCita,
  clientes,
  Empleados,
  setModalCliente,
  handleEstadoChange,
}) {

  // Estado local para controlar el bloqueo/desbloqueo
  const [bloqueado, setBloqueado] = useState(true);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(form.Estado);
  
  // Efecto para inicializar el estado de bloqueo cuando se abre el modal
  useEffect(() => {
    if (modalCita && form.CitaID) {
      // Si la cita está completada en la BD, empieza bloqueada
      // Usamos EstadoOriginal para saber cómo está en la base de datos
      if (form.EstadoOriginal === "Completada") {
        setBloqueado(true);
      } else {
        setBloqueado(false);
      }
      setEstadoSeleccionado(form.Estado);
    }
  }, [modalCita, form.CitaID, form.EstadoOriginal, form.Estado]);

  const esNuevaCita = !form.CitaID;

  // Manejador local para cambio de estado
  const handleEstadoChangeLocal = (e) => {
    const nuevoEstado = e.target.value;
    setEstadoSeleccionado(nuevoEstado);
    
    // Actualizar el form localmente
    setForm({
      ...form,
      Estado: nuevoEstado
    });
    
    // También llamar al handleEstadoChange del padre si es necesario
    if (handleEstadoChange) {
      handleEstadoChange(e);
    }
  };

  // Función para alternar el bloqueo
  const toggleBloqueo = () => {
    if (bloqueado) {
      if (window.confirm("¿Estás seguro de desbloquear esta cita? Podrás editarla nuevamente.")) {
        setBloqueado(false);
      }
    } else {
      setBloqueado(true);
    }
  };

  // 🔹 FUNCIÓN: Actualizar fecha fin automáticamente (+1 hora)
  const actualizarFechaFin = (fechaInicio) => {
    if (!fechaInicio) return "";

    try {
      let fechaStr, horaStr;

      if (fechaInicio.includes('T')) {
        [fechaStr, horaStr] = fechaInicio.split("T");
      } else {
        [fechaStr, horaStr] = fechaInicio.split(" ");
      }

      const [year, month, day] = fechaStr.split("-");
      const [hours, minutes] = horaStr.split(":");

      const fechaInicioObj = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(fechaInicioObj.getTime())) {
        console.warn("⚠️ Fecha inválida:", fechaInicio);
        return "";
      }

      const fechaFinObj = new Date(fechaInicioObj.getTime() + (60 * 60 * 1000));

      const formatoFechaHora = (fecha) => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');

        const separator = fechaInicio.includes('T') ? 'T' : ' ';
        return `${year}-${month}-${day}${separator}${hours}:${minutes}`;
      };

      return formatoFechaHora(fechaFinObj);

    } catch (error) {
      console.error("❌ Error al calcular fecha fin:", error);
      return "";
    }
  };

  // 🔹 EFFECT: Para NUEVAS CITAS
  useEffect(() => {
    if (modalCita && esNuevaCita) {
      if (form.FechaInicio) {
        const fechaFinCalculada = actualizarFechaFin(form.FechaInicio);
        setForm(prev => ({ ...prev, FechaFin: fechaFinCalculada }));
      }
    }
  }, [modalCita, esNuevaCita, form.FechaInicio]);

  // 🔹 MANEJADOR: Cambio en fecha inicio
  const handleFechaInicioChange = (e) => {
    if (bloqueado) return;

    const nuevaFechaInicioInput = e.target.value;
    const nuevaFechaInicio = nuevaFechaInicioInput.replace("T", " ");
    const nuevaFechaFin = actualizarFechaFin(nuevaFechaInicio);

    setForm({
      ...form,
      FechaInicio: nuevaFechaInicio,
      FechaFin: nuevaFechaFin
    });
  };

  // 🔹 MANEJADOR: Cambio manual en fecha fin
  const handleFechaFinChange = (e) => {
    if (bloqueado) return;
    setForm({ ...form, FechaFin: e.target.value.replace("T", " ") });
  };

  // 🔹 MANEJADOR: Guardar cita
  const handleGuardarCita = async (e) => {
    e.preventDefault();
    
    // Guardar la cita
    await guardarCita(form, e);
  };

  return (
    <Modal
      isOpen={modalCita}
      onRequestClose={() => setModalCita(false)}
      className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-11/12 sm:w-full max-w-md mx-auto relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] backdrop-blur-sm p-4"
      ariaHideApp={false}
      style={{
        overlay: { zIndex: 60, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        content: { zIndex: 61 }
      }}
    >
      {/* Header con Gradient */}
      <div className={`p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl sticky top-0 z-10 ${
        bloqueado
          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
          : estadoSeleccionado === "Completada"
            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white bg-opacity-20 p-1 sm:p-2 rounded-full">
              <FaCalendarAlt className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {form.CitaID ? "Editar Cita" : "Nueva Cita"}
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm">
                {bloqueado
                  ? "Modo solo lectura - Cita completada"
                  : estadoSeleccionado === "Completada"
                    ? "Modo edición - Cita completada (desbloqueada)"
                    : "Modo edición - Cambios permitidos"
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalCita(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 sm:p-2 rounded-full transition-colors duration-200"
          >
            <FaBan className="text-base sm:text-lg" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* 🔹 TOGGLE SWITCH - SOLO PARA CITAS QUE YA ESTABAN COMPLETADAS EN BD */}
        {form.CitaID && form.EstadoOriginal === "Completada" && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${bloqueado ? 'bg-red-100' : 'bg-green-100'}`}>
                  {bloqueado ? 
                    <FaLock className="text-red-600 text-lg" /> : 
                    <FaUnlock className="text-green-600 text-lg" />
                  }
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">
                    {bloqueado ? 'Cita Bloqueada' : 'Cita Desbloqueada'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {bloqueado 
                      ? 'Esta cita está completada y no permite edición' 
                      : 'Has desbloqueado esta cita, puedes editarla'}
                  </p>
                </div>
              </div>
              
              {/* Switch personalizado */}
              <button
                type="button"
                onClick={toggleBloqueo}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                  bloqueado ? 'bg-gray-300' : 'bg-green-500'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    bloqueado ? 'translate-x-1' : 'translate-x-7'
                  }`}
                />
              </button>
            </div>
            
            {/* Mensaje cuando está desbloqueado */}
            {!bloqueado && (
              <div className="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded flex items-center gap-2">
                <FaUnlock className="flex-shrink-0" />
                <span>
                  <strong>Modo edición:</strong> Esta cita está completada pero desbloqueada. 
                  Puedes modificarla sin crear una venta automática.
                </span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleGuardarCita} className="space-y-3 sm:space-y-4">
          {/* Título */}
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaTag className="text-gray-400 flex-shrink-0" />
              Título
            </label>
            <input
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                bloqueado
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : "border-gray-300"
              }`}
              value={form.Titulo}
              onChange={(e) => !bloqueado && setForm({ ...form, Titulo: e.target.value })}
              readOnly={bloqueado}
              disabled={bloqueado}
              placeholder="Ingresa el título de la cita"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaClipboardList className="text-gray-400 flex-shrink-0" />
              Descripción
            </label>
            <textarea
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base ${
                bloqueado
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : "border-gray-300"
              }`}
              value={form.Descripcion}
              onChange={(e) => !bloqueado && setForm({ ...form, Descripcion: e.target.value })}
              readOnly={bloqueado}
              disabled={bloqueado}
              rows="2"
              placeholder="Describe los detalles de la cita"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaClock className="text-gray-400 flex-shrink-0" />
                Inicio
              </label>
              <input
                type="datetime-local"
                className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  bloqueado
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : "border-gray-300"
                }`}
                value={form.FechaInicio?.replace(" ", "T").slice(0, 16) || ""}
                onChange={handleFechaInicioChange}
                disabled={bloqueado}
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaClock className="text-gray-400 flex-shrink-0" />
                Fin
              </label>
              <input
                type="datetime-local"
                className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  bloqueado
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : "border-gray-300"
                }`}
                value={form.FechaFin?.replace(" ", "T").slice(0, 16) || ""}
                onChange={handleFechaFinChange}
                disabled={bloqueado}
              />
              {!bloqueado && (
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  ⏰ <span>Se ajusta automáticamente +1 hora desde el inicio</span>
                </p>
              )}
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-gray-400 flex-shrink-0" />
              Cliente
            </label>
            <div className="flex gap-2">
              <select
                className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  bloqueado
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : "border-gray-300"
                }`}
                value={form.ClienteID}
                onChange={(e) => !bloqueado && setForm({ ...form, ClienteID: e.target.value })}
                disabled={bloqueado}
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map((c) => (
                  <option key={c.ClienteID} value={c.ClienteID}>
                    {c.Nombre} {c.Apellido}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => !bloqueado && setModalCliente(true)}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                  bloqueado
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                disabled={bloqueado}
                title="Nuevo cliente"
              >
                <FaUserPlus className="text-sm sm:text-base" />
              </button>
            </div>
          </div>

          {/* Empleado */}
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUserTie className="text-gray-400 flex-shrink-0" />
              Empleado
            </label>
            <select
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                bloqueado
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : "border-gray-300"
              }`}
              value={form.EmpId}
              onChange={(e) => !bloqueado && setForm({ ...form, EmpId: e.target.value })}
              disabled={bloqueado}
            >
              <option value="">-- Seleccionar Empleado --</option>
              {Empleados.map((emp) => (
                <option key={emp.EmpId} value={emp.EmpId}>
                  {emp.Nombres} {emp.Apellidos}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:border-transparent transition-all duration-200 font-medium text-sm sm:text-base ${
                bloqueado
                  ? "bg-green-100 text-green-700 border-green-300 cursor-not-allowed"
                  : estadoSeleccionado === "Completada"
                    ? "bg-amber-100 text-amber-700 border-amber-300"
                    : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500"
              }`}
              value={estadoSeleccionado}
              onChange={handleEstadoChangeLocal}
              disabled={bloqueado}
            >
              <option value="Programada">📅 Programada</option>
              <option value="En progreso">🔄 En progreso</option>
              <option value="Completada">✅ Completada</option>
              <option value="Cancelada">❌ Cancelada</option>
            </select>

            {bloqueado ? (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaLock size={10} className="flex-shrink-0" />
                <span>Usa el interruptor para desbloquear</span>
              </p>
            ) : estadoSeleccionado === "Completada" && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <FaUnlock size={10} className="flex-shrink-0" />
                <span>Al actualizar, se mostrará la ventana de Venta</span>
              </p>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col xs:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            {!bloqueado ? (
              <>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                >
                  <FaEdit className="flex-shrink-0" />
                  <span>{form.CitaID ? "Actualizar" : "Guardar"}</span>
                </button>

                {form.CitaID && (
                  <button
                    type="button"
                    onClick={eliminarCita}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                  >
                    <FaTrash className="flex-shrink-0" />
                    <span>Eliminar</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 text-center py-2">
                <div className="text-green-600 font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
                  <FaCalendarCheck className="flex-shrink-0" />
                  <span>Modo solo lectura</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setModalCita(false)}
              className="flex-1 bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaBan className="flex-shrink-0" />
              <span>Cerrar</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default ModalCita;