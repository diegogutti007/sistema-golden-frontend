import React, { useEffect } from "react";
import Modal from "react-modal";
import {
  FaEdit,
  FaTrash,
  FaBan,
  FaUserPlus,
  FaLock,
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

  const esCitaCompletadaEnBD = form.EstadoOriginal === "Completada" && form.CitaID;
  const esNuevaCita = !form.CitaID;

  // 🔹 FUNCIÓN: Actualizar fecha fin automáticamente (+1 hora)
  const actualizarFechaFin = (fechaInicio) => {
    if (!fechaInicio) return "";

    try {
      // Manejar ambos formatos: "YYYY-MM-DD HH:MM" y "YYYY-MM-DDTHH:MM"
      let fechaStr, horaStr;

      if (fechaInicio.includes('T')) {
        // Formato: "YYYY-MM-DDTHH:MM"
        [fechaStr, horaStr] = fechaInicio.split("T");
      } else {
        // Formato: "YYYY-MM-DD HH:MM"  
        [fechaStr, horaStr] = fechaInicio.split(" ");
      }

      const [year, month, day] = fechaStr.split("-");
      const [hours, minutes] = horaStr.split(":");

      const fechaInicioObj = new Date(year, month - 1, day, hours, minutes);

      // Validar que la fecha sea válida
      if (isNaN(fechaInicioObj.getTime())) {
        console.warn("⚠️ Fecha inválida:", fechaInicio);
        return "";
      }

      // Agregar 1 hora
      const fechaFinObj = new Date(fechaInicioObj.getTime() + (60 * 60 * 1000));

      // Formatear al mismo formato que recibió (mantener T o espacio)
      const formatoFechaHora = (fecha) => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');

        // Usar el mismo separador que tenía la fecha original
        const separator = fechaInicio.includes('T') ? 'T' : ' ';
        return `${year}-${month}-${day}${separator}${hours}:${minutes}`;
      };

      const fechaFin = formatoFechaHora(fechaFinObj);
      console.log("🔄 Fecha fin calculada:", fechaFin);
      return fechaFin;

    } catch (error) {
      console.error("❌ Error al calcular fecha fin:", error, "Fecha recibida:", fechaInicio);
      return "";
    }
  };

  // 🔹 EFFECT: Para NUEVAS CITAS - Usar la fecha desde el calendario
  useEffect(() => {
    if (modalCita && esNuevaCita && !esCitaCompletadaEnBD) {
      console.log("🆕 Nueva cita - Fecha desde calendario:", form.FechaInicio);

      // Si ya viene con fecha desde el calendario, calcular fecha fin automáticamente
      if (form.FechaInicio) {
        const fechaFinCalculada = actualizarFechaFin(form.FechaInicio);

        setForm(prev => ({
          ...prev,
          FechaFin: fechaFinCalculada
        }));

        console.log("📅 Fecha fin calculada:", fechaFinCalculada);
      }
    }
  }, [modalCita, esNuevaCita, form.FechaInicio]);

  // 🔹 MANEJADOR: Para cambios en fecha inicio (TODAS las citas actualizan automáticamente)
  const handleFechaInicioChange = (e) => {
    if (esCitaCompletadaEnBD) return;

    const nuevaFechaInicioInput = e.target.value;
    const nuevaFechaInicio = nuevaFechaInicioInput.replace("T", " ");

    console.log("🎯 Cambio en fecha inicio:", nuevaFechaInicio);

    // Para TODAS las citas (nuevas y existentes), calcular fecha fin automáticamente
    const nuevaFechaFin = actualizarFechaFin(nuevaFechaInicio);
    console.log("🎯 Nueva fecha fin calculada:", nuevaFechaFin);

    setForm({
      ...form,
      FechaInicio: nuevaFechaInicio,
      FechaFin: nuevaFechaFin
    });
  };

  // 🔹 MANEJADOR: Para cambios manuales en fecha fin
  const handleFechaFinChange = (e) => {
    if (esCitaCompletadaEnBD) return;

    setForm({
      ...form,
      FechaFin: e.target.value.replace("T", " ")
    });
  };

  return (
    <Modal
      isOpen={modalCita}
      onRequestClose={() => setModalCita(false)}
      className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-11/12 sm:w-full max-w-md mx-auto relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] backdrop-blur-sm p-4"
      ariaHideApp={false}
      style={{
        overlay: {
          zIndex: 60,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        },
        content: {
          zIndex: 61
        }
      }}
    >
      {/* Header con Gradient */}
      <div className={`p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl sticky top-0 z-10 ${esCitaCompletadaEnBD
          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
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
                {esCitaCompletadaEnBD
                  ? "Cita completada - Solo lectura"
                  : "Fechas se sincronizan automáticamente"
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

      <form onSubmit={guardarCita} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Título */}
        <div className="space-y-1 sm:space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <FaTag className="text-gray-400 flex-shrink-0" />
            Título
          </label>
          <input
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${esCitaCompletadaEnBD
                ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                : "border-gray-300"
              }`}
            value={form.Titulo}
            onChange={(e) => !esCitaCompletadaEnBD && setForm({ ...form, Titulo: e.target.value })}
            readOnly={esCitaCompletadaEnBD}
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
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base ${esCitaCompletadaEnBD
                ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                : "border-gray-300"
              }`}
            value={form.Descripcion}
            onChange={(e) => !esCitaCompletadaEnBD && setForm({ ...form, Descripcion: e.target.value })}
            readOnly={esCitaCompletadaEnBD}
            rows="2"
            placeholder="Describe los detalles de la cita"
          />
        </div>

        {/* Fechas - Responsive */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaClock className="text-gray-400 flex-shrink-0" />
              Inicio
            </label>
            <input
              type="datetime-local"
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${esCitaCompletadaEnBD
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : "border-gray-300"
                }`}
              value={form.FechaInicio?.replace(" ", "T").slice(0, 16) || ""}
              onChange={handleFechaInicioChange}
              readOnly={esCitaCompletadaEnBD}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaClock className="text-gray-400 flex-shrink-0" />
              Fin
            </label>
            <input
              type="datetime-local"
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${esCitaCompletadaEnBD
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : "border-gray-300"
                }`}
              value={form.FechaFin?.replace(" ", "T").slice(0, 16) || ""}
              onChange={handleFechaFinChange}
              readOnly={esCitaCompletadaEnBD}
            />
            {!esCitaCompletadaEnBD && (
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
              className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${esCitaCompletadaEnBD
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : "border-gray-300"
                }`}
              value={form.ClienteID}
              onChange={(e) =>
                !esCitaCompletadaEnBD && setForm({ ...form, ClienteID: e.target.value })
              }
              disabled={esCitaCompletadaEnBD}
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
              onClick={() => !esCitaCompletadaEnBD && setModalCliente(true)}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 flex-shrink-0 ${esCitaCompletadaEnBD
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
                }`}
              disabled={esCitaCompletadaEnBD}
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
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${esCitaCompletadaEnBD
                ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                : "border-gray-300"
              }`}
            value={form.EmpId}
            onChange={(e) => !esCitaCompletadaEnBD && setForm({ ...form, EmpId: e.target.value })}
            disabled={esCitaCompletadaEnBD}
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
            className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:border-transparent transition-all duration-200 font-medium text-sm sm:text-base ${esCitaCompletadaEnBD
                ? "bg-green-100 text-green-700 border-green-300 cursor-not-allowed"
                : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500"
              }`}
            value={form.Estado}
            onChange={handleEstadoChange}
            disabled={esCitaCompletadaEnBD}
          >
            <option value="Programada">📅 Programada</option>
            <option value="En progreso">🔄 En progreso</option>
            <option value="Completada">✅ Completada</option>
            <option value="Cancelada">❌ Cancelada</option>
          </select>

          {esCitaCompletadaEnBD ? (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <FaLock size={10} className="flex-shrink-0" />
              <span className="text-xs">Estado bloqueado - Cita ya completada</span>
            </p>
          ) : form.Estado === "Completada" && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              💡 <span className="text-xs">Al guardar, se abrirá el registro de venta</span>
            </p>
          )}
        </div>

        {/* Botones de Acción - Responsive */}
        <div className="flex flex-col xs:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
          {!esCitaCompletadaEnBD ? (
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
                <span>Cita Completada - No editable</span>
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
    </Modal>
  );
}

export default ModalCita;