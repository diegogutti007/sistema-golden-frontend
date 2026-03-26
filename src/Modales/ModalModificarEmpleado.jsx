import React, { useState, useEffect } from "react";
import { User, UserPlus, Calendar, MapPin, DollarSign, IdCard, X, Save, LogOut, Briefcase } from "lucide-react";
import Swal from 'sweetalert2';
import { BACKEND_URL } from '../config';

function ModalModificarEmpleado({ empleado, isOpen, onClose, onUpdate }) {
  const [tipos, setTipos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [cargoSeleccionado, setCargoSeleccionado] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [docId, setDocId] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaRenuncia, setFechaRenuncia] = useState("");
  const [direccion, setDireccion] = useState("");
  const [sueldo, setSueldo] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar tipos de empleado, cargos y datos del empleado cuando el modal se abre
  useEffect(() => {
    if (isOpen && empleado) {
      // Mostrar loading mientras se cargan los datos
      Swal.fire({
        title: 'Cargando datos...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Cargar tipos de empleado
      Promise.all([
        fetch(`${BACKEND_URL}/api/tipos-empleado`).then(res => res.json()),
        fetch(`${BACKEND_URL}/api/cargos-empleado`).then(res => res.json())
      ])
        .then(([tiposData, cargosData]) => {
          setTipos(tiposData);
          setCargos(cargosData);
          
          // Cargar datos del empleado seleccionado
          setNombres(empleado.Nombres || "");
          setApellidos(empleado.Apellidos || "");
          setDocId(empleado.DocID || "");
          setTipoSeleccionado(empleado.Tipo_EmpId || "");
          setCargoSeleccionado(empleado.Cargo_EmpId || "");
          setFechaNacimiento(empleado.FechaNacimiento ? empleado.FechaNacimiento.split('T')[0] : "");
          setFechaIngreso(empleado.fecha_ingreso ? empleado.fecha_ingreso.split('T')[0] : "");
          setFechaRenuncia(empleado.fecha_renuncia ? empleado.fecha_renuncia.split('T')[0] : "");
          setDireccion(empleado.Direccion || "");
          setSueldo(empleado.Sueldo || "");
          
          Swal.close();
        })
        .catch((err) => {
          console.error("❌ Error al obtener datos:", err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los datos necesarios',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
        });
    }
  }, [isOpen, empleado]);

  const handleTipoChange = (e) => setTipoSeleccionado(e.target.value);
  const handleCargoChange = (e) => setCargoSeleccionado(e.target.value);

  const validarFormulario = () => {
    if (!nombres.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese los nombres del empleado',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!apellidos.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese los apellidos del empleado',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!docId.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese el documento de identidad',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!tipoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor seleccione el tipo de empleado',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!cargoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor seleccione el cargo del empleado',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!fechaNacimiento) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese la fecha de nacimiento',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!fechaIngreso) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese la fecha de ingreso',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    if (!sueldo || parseFloat(sueldo) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese un sueldo válido mayor a 0',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empleado) return;
    
    if (!validarFormulario()) {
      return;
    }
    
    // Solo UNA confirmación antes de actualizar
    const result = await Swal.fire({
      title: '¿Confirmar actualización?',
      text: `¿Estás seguro de actualizar los datos de ${nombres} ${apellidos}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    setLoading(true);
    
    // Mostrar loading mientras se procesa la actualización
    Swal.fire({
      title: 'Actualizando empleado...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const empleadoActualizado = {
      empleadoId: empleado.EmpId,
      nombres,
      apellidos,
      docId,
      tipo_EmpId: tipoSeleccionado,
      cargo_EmpId: cargoSeleccionado,
      fechaNacimiento,
      fechaIngreso,
      fechaRenuncia: fechaRenuncia || null,
      direccion,
      sueldo: parseFloat(sueldo),
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/empleado/${empleado.EmpId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empleadoActualizado),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Cerrar el loading y mostrar éxito
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: data.mensaje || 'Empleado actualizado correctamente',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          onUpdate(empleadoActualizado);
          onClose();
        });
      } else {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.mensaje || "No se pudo actualizar el empleado",
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      console.error("❌ Error al actualizar empleado:", err);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Ocurrió un error al actualizar el empleado. Por favor, verifica tu conexión a internet.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Si hay cambios sin guardar, preguntar
    const hayCambios = 
      nombres !== (empleado?.Nombres || "") ||
      apellidos !== (empleado?.Apellidos || "") ||
      docId !== (empleado?.DocID || "") ||
      tipoSeleccionado !== (empleado?.Tipo_EmpId || "") ||
      cargoSeleccionado !== (empleado?.Cargo_EmpId || "") ||
      fechaNacimiento !== (empleado?.FechaNacimiento?.split('T')[0] || "") ||
      fechaIngreso !== (empleado?.fecha_ingreso?.split('T')[0] || "") ||
      fechaRenuncia !== (empleado?.fecha_renuncia?.split('T')[0] || "") ||
      direccion !== (empleado?.Direccion || "") ||
      sueldo !== (empleado?.Sueldo || "");
    
    if (hayCambios) {
      Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Limpiar formulario al cerrar
          limpiarFormulario();
          onClose();
        }
      });
    } else {
      limpiarFormulario();
      onClose();
    }
  };

  const limpiarFormulario = () => {
    setNombres("");
    setApellidos("");
    setDocId("");
    setTipoSeleccionado("");
    setCargoSeleccionado("");
    setFechaNacimiento("");
    setFechaIngreso("");
    setFechaRenuncia("");
    setDireccion("");
    setSueldo("");
    setLoading(false);
  };

  // Función para limpiar fecha de renuncia
  const limpiarFechaRenuncia = async () => {
    const result = await Swal.fire({
      title: '¿Limpiar fecha de renuncia?',
      text: 'Esto marcará al empleado como activo nuevamente si la fecha estaba establecida.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      setFechaRenuncia("");
      Swal.fire({
        icon: 'success',
        title: 'Fecha limpiada',
        text: 'La fecha de renuncia ha sido eliminada',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 bg-white";
  const labelClass = "block text-gray-700 font-semibold mb-2 text-sm";
  const iconClass = "text-yellow-500";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl">
              <UserPlus className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Modificar Empleado</h2>
              <p className="text-yellow-100 text-sm">
                Editando: {empleado?.Nombres} {empleado?.Apellidos}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-yellow-600 p-2 rounded-xl transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                {/* Nombres */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <User className={`w-4 h-4 ${iconClass}`} />
                      <span>Nombres *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ingrese nombres completos"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Apellidos */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <User className={`w-4 h-4 ${iconClass}`} />
                      <span>Apellidos *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ingrese apellidos completos"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Documento de Identidad */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <IdCard className={`w-4 h-4 ${iconClass}`} />
                      <span>Documento de Identidad *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    placeholder="Ingrese número de documento"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Tipo de Empleado */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <User className={`w-4 h-4 ${iconClass}`} />
                      <span>Tipo de Empleado *</span>
                    </div>
                  </label>
                  <select
                    value={tipoSeleccionado}
                    onChange={handleTipoChange}
                    className={inputClass}
                    required
                  >
                    <option value="">-- Seleccionar tipo --</option>
                    {tipos.map((tipo) => (
                      <option key={tipo.Tipo_EmpId} value={tipo.Tipo_EmpId}>
                        {tipo.Descripcion} {tipo.Comision && `- ${tipo.Comision}% comisión`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cargo del Empleado */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <Briefcase className={`w-4 h-4 ${iconClass}`} />
                      <span>Cargo del Empleado *</span>
                    </div>
                  </label>
                  <select
                    value={cargoSeleccionado}
                    onChange={handleCargoChange}
                    className={inputClass}
                    required
                  >
                    <option value="">-- Seleccionar cargo --</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.Cargo_EmpId} value={cargo.Cargo_EmpId}>
                        {cargo.Descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-4">
                {/* Fecha de Nacimiento */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${iconClass}`} />
                      <span>Fecha de Nacimiento *</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Fecha de Ingreso */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${iconClass}`} />
                      <span>Fecha de Ingreso *</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={fechaIngreso}
                    onChange={(e) => setFechaIngreso(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Fecha de Renuncia */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <LogOut className={`w-4 h-4 ${iconClass}`} />
                      <span>Fecha de Renuncia</span>
                    </div>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={fechaRenuncia}
                      onChange={(e) => setFechaRenuncia(e.target.value)}
                      className={`${inputClass} flex-1`}
                      placeholder="Si aplica"
                    />
                    {fechaRenuncia && (
                      <button
                        type="button"
                        onClick={limpiarFechaRenuncia}
                        className="bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
                        title="Limpiar fecha de renuncia"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {fechaRenuncia ? "⚠️ Empleado dado de baja" : "✅ Dejar vacío si sigue activo"}
                  </p>
                </div>

                {/* Dirección */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <MapPin className={`w-4 h-4 ${iconClass}`} />
                      <span>Dirección</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ingrese dirección completa"
                    className={inputClass}
                  />
                </div>

                {/* Sueldo */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-2">
                      <DollarSign className={`w-4 h-4 ${iconClass}`} />
                      <span>Sueldo Base *</span>
                    </div>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sueldo}
                    onChange={(e) => setSueldo(e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold px-6 py-4 rounded-xl hover:bg-gray-400 transition-all duration-200 flex items-center justify-center space-x-2"
                disabled={loading}
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Actualizar Empleado</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalModificarEmpleado;