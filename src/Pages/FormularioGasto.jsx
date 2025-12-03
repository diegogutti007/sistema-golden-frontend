import React, { useEffect, useState } from "react";
import {
  DollarSign,
  FileText,
  Tag,
  Clock,
  User,
  Plus,
  X,
  Save,
  Calendar
} from "lucide-react";

export default function FormularioGasto() {
  const [categorias, setCategorias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    descripcion: "",
    monto: 0,
    categoria_id: "",
    periodo_id: "",
    fecha_gasto: new Date().toISOString().split('T')[0],
    observaciones: "",
    EmpId: "",
    pagos: [],
  });
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Para Create React App usa REACT_APP_API_URL
    const url = "https://sistemagolden-backend-production.up.railway.app"//process.env.REACT_APP_API_URL || "http://localhost:5000"//"https://sistemagolden-backend-production.up.railway.app";//
    //"https://sistemagolden-backend-production.up.railway.app"
    setBackendUrl(url);
    console.log("🔗 URL del backend detectada:", url);
  }, []);

  // ✅ Cargar datos desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [cat, per, tp, emp] = await Promise.all([
          fetch(`https://sistemagolden-backend-production.up.railway.app/api/categorias`).then(r => r.json()),
          fetch(`https://sistemagolden-backend-production.up.railway.app/api/periodos`).then(r => r.json()),
          fetch(`https://sistemagolden-backend-production.up.railway.app/api/tipo_pago`).then(r => r.json()),
          fetch(`https://sistemagolden-backend-production.up.railway.app/api/listaempleado`).then(r => r.json())
        ]);

        setCategorias(cat);
        setPeriodos(per);
        setTiposPago(tp);
        setEmpleados(emp);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // ✅ Calcular monto total automáticamente
  useEffect(() => {
    const total = formData.pagos.reduce((sum, pago) => sum + Number(pago.monto || 0), 0);
    setFormData(prev => ({ ...prev, monto: total }));
  }, [formData.pagos]);

  // ✅ Agregar nuevo tipo de pago
  const agregarPago = () => {
    setFormData(prev => ({
      ...prev,
      pagos: [...prev.pagos, { tipo_pago_id: "", monto: 0 }],
    }));
  };

  // ✅ Actualizar tipo o monto de pago
  const actualizarPago = (index, field, value) => {
    const nuevosPagos = [...formData.pagos];
    nuevosPagos[index][field] = value;
    setFormData({ ...formData, pagos: nuevosPagos });
  };

  // ✅ Eliminar fila de tipo de pago
  const eliminarPago = (index) => {
    const nuevosPagos = formData.pagos.filter((_, i) => i !== index);
    setFormData({ ...formData, pagos: nuevosPagos });
  };

  // ✅ Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/gastos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log(formData);
      if (!res.ok) throw new Error("Error al registrar gasto");

      const data = await res.json();
      alert("✅ Gasto registrado correctamente");

      // Limpiar formulario después del éxito
      setFormData({
        descripcion: "",
        monto: 0,
        categoria_id: "",
        periodo_id: "",
        fecha_gasto: new Date().toISOString().split('T')[0],
        observaciones: "",
        EmpId: "",
        pagos: [],
      });

    } catch (error) {
      console.error("❌ Error:", error);
      alert("Fallo al registrar el gasto");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  if (loading && categorias.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header móvil */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1 rounded-lg">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Registro de Gasto</h2>
              <p className="text-yellow-100 text-xs">Registra un nuevo gasto en el sistema</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <span>Información del Gasto</span>
            </h3>

            <div className="space-y-3">
              {/* Descripción */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Descripción</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className={`${inputClass} text-sm`}
                  placeholder="Ej: Compra de materiales de oficina"
                  required
                />
              </div>

              {/* Categoría, Periodo y Fecha de Compra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">Categoría</span>
                    </div>
                  </label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className={`${inputClass} text-sm`}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.categoria_id} value={cat.categoria_id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">Periodo</span>
                    </div>
                  </label>
                  <select
                    value={formData.periodo_id}
                    onChange={(e) => setFormData({ ...formData, periodo_id: e.target.value })}
                    className={`${inputClass} text-sm`}
                    required
                  >
                    <option value="">Seleccionar periodo</option>
                    {periodos.map((per) => (
                      <option key={per.periodo_id} value={per.periodo_id}>
                        {per.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">Fecha de Compra</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_gasto}
                    onChange={(e) => setFormData({ ...formData, fecha_gasto: e.target.value })}
                    className={`${inputClass} text-sm`}
                    required
                  />
                </div>
              </div>

              {/* Empleado y Observaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">Empleado</span>
                    </div>
                  </label>
                  <select
                    value={formData.EmpId}
                    onChange={(e) => setFormData({ ...formData, EmpId: e.target.value })}
                    className={`${inputClass} text-sm`}
                  >
                    <option value="">Seleccionar empleado</option>
                    {empleados.map((emp) => (
                      <option key={emp.EmpId} value={emp.EmpId}>
                        {emp.Nombres} {emp.Apellidos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">Observaciones</span>
                    </div>
                  </label>
                  <textarea
                    className={`${inputClass} resize-none text-sm`}
                    rows="2"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span>Métodos de Pago</span>
              </h3>
              <button
                type="button"
                onClick={agregarPago}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 font-semibold flex items-center space-x-1 text-xs"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden xs:inline">Agregar</span>
              </button>
            </div>

            {formData.pagos.length === 0 ? (
              <div className="text-center py-3 text-gray-500 text-xs">
                <DollarSign className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                <p>No hay métodos de pago</p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.pagos.map((pago, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-2 space-y-2">
                    {/* Tipo de Pago */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de Pago</label>
                      <select
                        value={pago.tipo_pago_id}
                        onChange={(e) => actualizarPago(index, "tipo_pago_id", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-yellow-500 outline-none text-xs"
                        required={index === 0}
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposPago.map((tp) => (
                          <option key={tp.tipo_pago_id} value={tp.tipo_pago_id}>
                            {tp.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Monto y Eliminar */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Monto</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1 text-gray-500 text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Monto"
                            value={pago.monto}
                            onChange={(e) => actualizarPago(index, "monto", e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 pl-6 text-right focus:ring-1 focus:ring-yellow-500 outline-none text-xs"
                            required={index === 0}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarPago(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200 mb-1"
                        title="Eliminar pago"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totales y Botón */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center space-x-1 mb-1">
                    <DollarSign className="w-3 h-3 text-blue-500" />
                    <p className="text-xs text-gray-600 font-medium">Monto Total</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    $ {formData.monto.toFixed(2)}
                  </p>
                </div>

                <div className={`bg-white rounded-lg p-2 border ${Math.abs(formData.monto - formData.pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0)) < 0.01
                    ? 'border-green-200'
                    : 'border-red-200'
                  }`}>
                  <div className="flex items-center space-x-1 mb-1">
                    <DollarSign className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-gray-600 font-medium">Total Pagos</p>
                  </div>
                  <p className={`text-sm font-bold ${Math.abs(formData.monto - formData.pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0)) < 0.01
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}>
                    $ {formData.pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${!loading
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow transform hover:scale-105"
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Registrar Gasto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}