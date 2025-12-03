import React, { useState, useEffect } from "react";
//import { fetchArrayWithAuth } from '../utils/api';
import { User, UserPlus, Calendar, MapPin, DollarSign, IdCard, Briefcase } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Para Create React App usa REACT_APP_API_URL
    const url = "https://sistemagolden-backend-production.up.railway.app"//process.env.REACT_APP_API_URL || "http://localhost:5000"//"https://sistemagolden-backend-production.up.railway.app";//
    //"https://sistemagolden-backend-production.up.railway.app"
    setBackendUrl(url);
    console.log("🔗 URL del backend detectada:", url);
  }, []);

  useEffect(() => {
    fetch(`https://sistemagolden-backend-production.up.railway.app/api/tipo-empleado`)
      .then((res) => res.json())
      .then((data) => setTipos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Error al obtener tipos:", err));
  }, []);

  useEffect(() => {
    fetch(`https://sistemagolden-backend-production.up.railway.app/api/cargo-empleado`)
      .then((res) => res.json())
      .then((data) => setCargos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Error al obtener cargos:", err));
  }, []);

  const handleTipoChange = (e) => setTipoSeleccionado(e.target.value);
  const handleCargoChange = (e) => setCargoSeleccionado(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const empleado = {
      nombres,
      apellidos,
      docId,
      tipo_EmpId: tipoSeleccionado,
      cargo_EmpId: cargoSeleccionado,
      fechaNacimiento,
      fechaIngreso,
      direccion,
      sueldo,
    };

    try {
      const response = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/empleado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empleado),
      });
      console.log(empleado);
      const data = await response.json();
      alert(data.mensaje);

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
    } catch (err) {
      console.error("❌ Error al registrar empleado:", err);
      alert("Error al registrar empleado");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 bg-white";
  const labelClass = "block text-gray-700 font-semibold mb-2 text-sm";
  const iconClass = "text-yellow-500";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header del Formulario */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl">
              <UserPlus className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Registro de Empleado</h2>
              <p className="text-yellow-100 text-sm">Complete la información del nuevo empleado</p>
            </div>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Nombres */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2">
                    <User className={`w-4 h-4 ${iconClass}`} />
                    <span>Nombres</span>
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
                    <span>Apellidos</span>
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
                    <span>Documento de Identidad</span>
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
                    <span>Tipo de Empleado</span>
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

              {/* Cargo del Empleado - NUEVO COMBOBOX */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2">
                    <Briefcase className={`w-4 h-4 ${iconClass}`} />
                    <span>Cargo del Empleado</span>
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
                    <span>Fecha de Nacimiento</span>
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
                    <span>Fecha de Ingreso</span>
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
                  required
                />
              </div>

              {/* Sueldo */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-2">
                    <DollarSign className={`w-4 h-4 ${iconClass}`} />
                    <span>Sueldo Base</span>
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
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
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