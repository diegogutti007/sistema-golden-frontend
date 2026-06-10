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
  Calendar,
  AlertCircle,
  CreditCard,
  Building2
} from "lucide-react";
import { BACKEND_URL } from '../config';

export default function FormularioGasto() {
  const [categorias, setCategorias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    descripcion: "",
    monto: 0,
    categoria_id: "",
    periodo_id: "",
    fecha_gasto: new Date().toISOString().split('T')[0],
    observaciones: "",
    EmpId: "",
    proveedor_id: "",
    pagos: [],
  });

  // Cargar datos desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [cat, per, tp, emp, prov] = await Promise.all([
          fetch(`${BACKEND_URL}/api/categorias`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/periodos`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/tipo_pago`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/listaempleadoactivo`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/proveedores`).then(r => r.json()).catch(() => [])
        ]);

        setCategorias(Array.isArray(cat) ? cat : []);
        setPeriodos(Array.isArray(per) ? per : []);
        setTiposPago(Array.isArray(tp) ? tp : []);
        setEmpleados(Array.isArray(emp) ? emp : []);
        setProveedores(Array.isArray(prov) ? prov : []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError("Error al cargar los datos necesarios");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Calcular monto total automáticamente
  useEffect(() => {
    const total = formData.pagos.reduce((sum, pago) => sum + (Number(pago.monto) || 0), 0);
    setFormData(prev => ({ ...prev, monto: total }));
  }, [formData.pagos]);

  // Agregar nuevo tipo de pago
  const agregarPago = () => {
    setFormData(prev => ({
      ...prev,
      pagos: [...prev.pagos, { tipo_pago_id: "", monto: 0 }],
    }));
  };

  // Actualizar tipo o monto de pago
  const actualizarPago = (index, field, value) => {
    const nuevosPagos = [...formData.pagos];
    nuevosPagos[index][field] = value;
    setFormData({ ...formData, pagos: nuevosPagos });
  };

  // Eliminar fila de tipo de pago
  const eliminarPago = (index) => {
    const nuevosPagos = formData.pagos.filter((_, i) => i !== index);
    setFormData({ ...formData, pagos: nuevosPagos });
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!formData.descripcion.trim()) {
      setError("❌ La descripción es requerida");
      return false;
    }
    if (!formData.categoria_id) {
      setError("❌ Seleccione una categoría");
      return false;
    }
    if (!formData.periodo_id) {
      setError("❌ Seleccione un período");
      return false;
    }
    if (!formData.fecha_gasto) {
      setError("❌ La fecha de gasto es requerida");
      return false;
    }
    if (formData.pagos.length === 0) {
      setError("❌ Agregue al menos un método de pago");
      return false;
    }
    
    // Validar que todos los pagos tengan tipo y monto
    for (let i = 0; i < formData.pagos.length; i++) {
      if (!formData.pagos[i].tipo_pago_id) {
        setError(`❌ Seleccione tipo de pago para el pago ${i + 1}`);
        return false;
      }
      if (!formData.pagos[i].monto || parseFloat(formData.pagos[i].monto) <= 0) {
        setError(`❌ Ingrese un monto válido para el pago ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);

    const datosEnvio = {
      descripcion: formData.descripcion.trim(),
      monto: parseFloat(formData.monto),
      categoria_id: parseInt(formData.categoria_id),
      periodo_id: parseInt(formData.periodo_id),
      fecha_gasto: formData.fecha_gasto,
      observaciones: formData.observaciones.trim() || null,
      EmpId: formData.EmpId ? parseInt(formData.EmpId) : null,
      proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null,
      pagos: formData.pagos.map(pago => ({
        tipo_pago_id: parseInt(pago.tipo_pago_id),
        monto: parseFloat(pago.monto)
      }))
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/gastos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnvio),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Error al registrar gasto");
      }

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
        proveedor_id: "",
        pagos: [],
      });
      setError("");

    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.message || "Fallo al registrar el gasto");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 bg-white text-sm";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1";

  if (loading && categorias.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-5 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Registro de Gasto</h2>
              <p className="text-yellow-100 text-xs mt-0.5">Registra un nuevo gasto en el sistema</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <span>Información del Gasto</span>
            </h3>

            <div className="space-y-4">
              {/* Descripción */}
              <div>
                <label className={labelClass}>
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className={inputClass}
                  placeholder="Ej: Compra de materiales de oficina"
                  required
                />
              </div>

              {/* Categoría, Periodo y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-yellow-500" />
                      <span>Categoría *</span>
                    </div>
                  </label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className={inputClass}
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
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span>Período *</span>
                    </div>
                  </label>
                  <select
                    value={formData.periodo_id}
                    onChange={(e) => setFormData({ ...formData, periodo_id: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="">Seleccionar período</option>
                    {periodos.map((per) => (
                      <option key={per.periodo_id} value={per.periodo_id}>
                        {per.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-yellow-500" />
                      <span>Fecha de Compra *</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_gasto}
                    onChange={(e) => setFormData({ ...formData, fecha_gasto: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Empleado, Proveedor y Observaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-yellow-500" />
                      <span>Empleado (opcional)</span>
                    </div>
                  </label>
                  <select
                    value={formData.EmpId}
                    onChange={(e) => setFormData({ ...formData, EmpId: e.target.value })}
                    className={inputClass}
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
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-yellow-500" />
                      <span>Proveedor (opcional)</span>
                    </div>
                  </label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map((prov) => (
                      <option key={prov.proveedor_id} value={prov.proveedor_id}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-yellow-500" />
                    <span>Observaciones</span>
                  </div>
                </label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows="2"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-yellow-500" />
                <span>Métodos de Pago *</span>
              </h3>
              <button
                type="button"
                onClick={agregarPago}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 font-semibold flex items-center gap-1 text-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar</span>
              </button>
            </div>

            {formData.pagos.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay métodos de pago</p>
                <p className="text-xs mt-1">Haga clic en "Agregar" para incluir un método de pago</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.pagos.map((pago, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Tipo de Pago *
                        </label>
                        <select
                          value={pago.tipo_pago_id}
                          onChange={(e) => actualizarPago(index, "tipo_pago_id", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-yellow-500 outline-none text-sm"
                          required
                        >
                          <option value="">Seleccionar tipo</option>
                          {tiposPago.map((tp) => (
                            <option key={tp.tipo_pago_id} value={tp.tipo_pago_id}>
                              {tp.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Monto *
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={pago.monto}
                              onChange={(e) => actualizarPago(index, "monto", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-7 text-right focus:ring-1 focus:ring-yellow-500 outline-none text-sm"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarPago(index)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            title="Eliminar pago"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totales y Botón */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-blue-500" />
                  <p className="text-xs text-gray-600 font-medium">Monto Total</p>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  S/ {formData.monto.toFixed(2)}
                </p>
              </div>

              <div className={`bg-white rounded-lg p-3 border ${Math.abs(formData.monto - formData.pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0)) < 0.01
                  ? 'border-green-200'
                  : 'border-red-200'
                }`}>
                <div className="flex items-center gap-1 mb-1">
                  <CreditCard className="w-3 h-3 text-green-500" />
                  <p className="text-xs text-gray-600 font-medium">Total Pagos</p>
                </div>
                <p className={`text-xl font-bold ${Math.abs(formData.monto - formData.pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0)) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                  }`}>
                  S/ {formData.pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                !loading
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow-lg transform hover:scale-[1.02]"
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
        </form>
      </div>
    </div>
  );
}