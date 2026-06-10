import React, { useState, useEffect } from "react";
import { User, UserPlus, Calendar, MapPin, DollarSign, IdCard, Briefcase, Phone, Mail, Shield, AlertCircle } from "lucide-react";
import { BACKEND_URL } from '../config';

function FormEmpleado() {
  const [tipos, setTipos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [cargoSeleccionado, setCargoSeleccionado] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [docId, setDocId] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [direccion, setDireccion] = useState("");
  const [sueldo, setSueldo] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTipos();
    fetchCargos();
  }, []);

  const fetchTipos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tipo-empleado`);
      const data = await res.json();
      setTipos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error al obtener tipos:", err);
      setError("Error al cargar tipos de empleado");
    }
  };

  const fetchCargos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/cargos-empleado`);
      const data = await res.json();
      setCargos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error al obtener cargos:", err);
      setError("Error al cargar cargos de empleado");
    }
  };

  const handleTipoChange = (e) => setTipoSeleccionado(e.target.value);
  const handleCargoChange = (e) => setCargoSeleccionado(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones
    if (!nombres.trim()) {
      setError("❌ El nombre es requerido");
      setLoading(false);
      return;
    }
    if (!apellidos.trim()) {
      setError("❌ El apellido es requerido");
      setLoading(false);
      return;
    }
    if (!docId.trim()) {
      setError("❌ El documento de identidad es requerido");
      setLoading(false);
      return;
    }
    if (!tipoSeleccionado) {
      setError("❌ Seleccione un tipo de empleado");
      setLoading(false);
      return;
    }
    if (!cargoSeleccionado) {
      setError("❌ Seleccione un cargo");
      setLoading(false);
      return;
    }
    if (!fechaNacimiento) {
      setError("❌ La fecha de nacimiento es requerida");
      setLoading(false);
      return;
    }
    if (!fechaIngreso) {
      setError("❌ La fecha de ingreso es requerida");
      setLoading(false);
      return;
    }
    if (!sueldo || parseFloat(sueldo) <= 0) {
      setError("❌ Ingrese un sueldo válido");
      setLoading(false);
      return;
    }

    const empleado = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      docId: docId.trim(),
      tipo_EmpId: parseInt(tipoSeleccionado),
      cargo_EmpId: parseInt(cargoSeleccionado),
      fechaNacimiento,
      fechaIngreso,
      direccion: direccion.trim(),
      sueldo: parseFloat(sueldo),
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      estado: 1 // Activo por defecto
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/empleado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empleado),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.mensaje || "✅ Empleado registrado correctamente");
        
        // Limpiar formulario
        setNombres("");
        setApellidos("");
        setDocId("");
        setTipoSeleccionado("");
        setCargoSeleccionado("");
        setFechaNacimiento("");
        setFechaIngreso("");
        setDireccion("");
        setSueldo("");
        setEmail("");
        setTelefono("");
        setError("");
      } else {
        setError(data.mensaje || "❌ Error al registrar empleado");
      }
    } catch (err) {
      console.error("❌ Error al registrar empleado:", err);
      setError("❌ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 bg-white text-gray-700";
  const labelClass = "block text-gray-700 font-semibold mb-2 text-sm";
  const iconClass = "text-yellow-500";

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header del Formulario */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2.5 rounded-xl shadow-md">
              <UserPlus className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Registro de Empleado</h2>
              <p className="text-yellow-100 text-sm mt-0.5">Complete la información del nuevo empleado</p>
            </div>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-5">
              {/* Nombres */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
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
                  <div className="flex items-center space-x-2 mb-1">
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
                  <div className="flex items-center space-x-2 mb-1">
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

              {/* Email */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Mail className={`w-4 h-4 ${iconClass}`} />
                    <span>Correo Electrónico</span>
                  </div>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  className={inputClass}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Phone className={`w-4 h-4 ${iconClass}`} />
                    <span>Teléfono</span>
                  </div>
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ingrese número de teléfono"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-5">
              {/* Tipo de Empleado */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className={`w-4 h-4 ${iconClass}`} />
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
                      {tipo.Descripcion} {tipo.Comision ? `(${tipo.Comision}% comisión)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cargo del Empleado */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
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

              {/* Fecha de Nacimiento */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
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
                  <div className="flex items-center space-x-2 mb-1">
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

              {/* Dirección */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className={`w-4 h-4 ${iconClass}`} />
                    <span>Dirección *</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ingrese dirección completa"
                  className={inputClass}
                  required
                />
              </div>

              {/* Sueldo */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2 mb-1">
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

          {/* Botón de Envío */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Registrar Empleado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormEmpleado;