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
import { BACKEND_URL } from '../config';

export default function ModalFormularioGasto({ gastoSeleccionado, onClose }) {
  const [categorias, setCategorias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ✅ Función para formatear número a 2 decimales
  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // ✅ Función para formatear el número para mostrar
  const formatDisplay = (value) => {
    const num = formatNumber(value);
    return num.toFixed(2);
  };

  // ✅ Cargar datos desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [cat, per, tp, emp] = await Promise.all([
          fetch(`${BACKEND_URL}/api/categorias`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/periodos`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/tipo_pago`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/listaempleado`).then(r => r.json())
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

  // ✅ Si hay un gasto seleccionado (edición), cargar sus datos completos incluyendo pagos
  useEffect(() => {
    const cargarDatosGasto = async () => {
      if (gastoSeleccionado) {
        try {
          setLoading(true);
          
          // Usar los datos básicos que ya vienen en gastoSeleccionado
          // y cargar solo los pagos específicos desde la API
          const pagosRes = await fetch(`${BACKEND_URL}/api/gastos/${gastoSeleccionado.gasto_id}/pagos`);
          if (!pagosRes.ok) throw new Error("Error al cargar pagos del gasto");
          const pagosData = await pagosRes.json();
          
          // Formatear los pagos para el formulario - asegurando que montos sean números
          const pagosFormateados = pagosData.map(pago => ({
            tipo_pago_id: pago.tipo_pago_id ? pago.tipo_pago_id.toString() : "",
            monto: formatNumber(pago.monto) // Convertir a número
          }));
          
          // Asegurar que el monto principal sea un número
          const montoPrincipal = formatNumber(gastoSeleccionado.monto);
          
          setFormData({
            descripcion: gastoSeleccionado.descripcion || "",
            monto: montoPrincipal, // Convertir a número
            categoria_id: gastoSeleccionado.categoria_id || "",
            periodo_id: gastoSeleccionado.periodo_id || "",
            fecha_gasto: gastoSeleccionado.fecha_gasto 
              ? new Date(gastoSeleccionado.fecha_gasto).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            observaciones: gastoSeleccionado.observaciones || "",
            EmpId: gastoSeleccionado.EmpId || "",
            pagos: pagosFormateados,
          });
          
        } catch (error) {
          console.error("❌ Error cargando pagos del gasto:", error);
          // Si hay error al cargar pagos, iniciar con un pago vacío
          const montoPrincipal = formatNumber(gastoSeleccionado.monto);
          
          setFormData(prev => ({
            ...prev,
            descripcion: gastoSeleccionado.descripcion || "",
            monto: montoPrincipal,
            categoria_id: gastoSeleccionado.categoria_id || "",
            periodo_id: gastoSeleccionado.periodo_id || "",
            fecha_gasto: gastoSeleccionado.fecha_gasto 
              ? new Date(gastoSeleccionado.fecha_gasto).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            observaciones: gastoSeleccionado.observaciones || "",
            EmpId: gastoSeleccionado.EmpId || "",
            pagos: [{ tipo_pago_id: "", monto: 0 }],
          }));
        } finally {
          setLoading(false);
        }
      }
    };

    cargarDatosGasto();
  }, [gastoSeleccionado]);

  // ✅ Si no hay gasto seleccionado (creación), inicializar con un pago vacío
  useEffect(() => {
    if (!gastoSeleccionado && formData.pagos.length === 0) {
      setFormData(prev => ({
        ...prev,
        pagos: [{ tipo_pago_id: "", monto: 0 }]
      }));
    }
  }, [gastoSeleccionado]);

  // ✅ Calcular monto total automáticamente
  useEffect(() => {
    const total = formData.pagos.reduce((sum, pago) => sum + formatNumber(pago.monto), 0);
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
    // Si es el campo monto, convertir a número
    if (field === "monto") {
      nuevosPagos[index][field] = formatNumber(value);
    } else {
      nuevosPagos[index][field] = value;
    }
    setFormData({ ...formData, pagos: nuevosPagos });
  };

  // ✅ Eliminar fila de tipo de pago
  const eliminarPago = (index) => {
    const nuevosPagos = formData.pagos.filter((_, i) => i !== index);
    setFormData({ ...formData, pagos: nuevosPagos });
  };

  // ✅ Manejar cambios en el monto principal (si es que lo quieres editable)
  const handleMontoChange = (e) => {
    const value = formatNumber(e.target.value);
    setFormData(prev => ({ ...prev, monto: value }));
  };

  // ✅ Enviar formulario (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = gastoSeleccionado 
        ? `${BACKEND_URL}/api/gastos/${gastoSeleccionado.gasto_id}`  // PUT para editar
        : `${BACKEND_URL}/api/gastos`;  // POST para crear

      const method = gastoSeleccionado ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Datos enviados:", formData);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al procesar la solicitud");
      }

      const data = await res.json();
      alert(`✅ ${gastoSeleccionado ? "Gasto actualizado" : "Gasto registrado"} correctamente`);

      // Cerrar modal y limpiar formulario
      onClose();

    } catch (error) {
      console.error("❌ Error:", error);
      alert(`Fallo al ${gastoSeleccionado ? "actualizar" : "registrar"} el gasto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  // Calcular diferencias
  const totalPagos = formData.pagos.reduce((sum, p) => sum + formatNumber(p.monto), 0);
  const diferencia = Math.abs(formatNumber(formData.monto) - totalPagos);
  const montosCoinciden = diferencia < 0.01;

  if (loading && categorias.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-3 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header móvil */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {gastoSeleccionado ? "Editar Gasto" : "Nuevo Gasto"}
                  </h2>
                  <p className="text-yellow-100 text-xs">
                    {gastoSeleccionado ? "Actualiza la información del gasto" : "Registra un nuevo gasto en el sistema"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white transition-all p-1.5 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-yellow-500" />
                <span>Información del Gasto</span>
              </h3>

              <div className="space-y-4">
                {/* Descripción */}
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-yellow-500" />
                      <span>Descripción</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-yellow-500" />
                        <span>Categoría</span>
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
                        <span>Periodo</span>
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
                        <span>Fecha de Compra</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-yellow-500" />
                        <span>Empleado</span>
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
                        <span>Observaciones</span>
                      </div>
                    </label>
                    <textarea
                      className={`${inputClass} resize-none text-sm`}
                      rows="3"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <span>Métodos de Pago</span>
                </h3>
                <button
                  type="button"
                  onClick={agregarPago}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 font-semibold flex items-center space-x-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Pago</span>
                </button>
              </div>

              {formData.pagos.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <DollarSign className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay métodos de pago registrados</p>
                  <p className="text-xs text-gray-400 mt-1">Agrega al menos un método de pago</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.pagos.map((pago, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-gray-700">Método de Pago #{index + 1}</h4>
                        {formData.pagos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarPago(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                            title="Eliminar pago"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de Pago</label>
                          <select
                            value={pago.tipo_pago_id}
                            onChange={(e) => actualizarPago(index, "tipo_pago_id", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-yellow-500 outline-none text-sm"
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

                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Monto</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={pago.monto}
                              onChange={(e) => actualizarPago(index, "monto", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-8 text-right focus:ring-1 focus:ring-yellow-500 outline-none text-sm"
                              required={index === 0}
                            />
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-gray-600 font-medium">Monto Total</p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      $ {formatDisplay(formData.monto)}
                    </p>
                  </div>

                  <div className={`bg-white rounded-lg p-3 border ${
                    montosCoinciden
                      ? 'border-green-200'
                      : 'border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <p className="text-sm text-gray-600 font-medium">Total Pagos</p>
                    </div>
                    <p className={`text-lg font-bold ${
                      montosCoinciden
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      $ {formatDisplay(totalPagos)}
                    </p>
                  </div>
                </div>

                {!montosCoinciden && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ Los montos no coinciden. Diferencia: ${formatDisplay(diferencia)}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/3 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || formData.pagos.length === 0 || !montosCoinciden}
                    className={`w-full sm:w-2/3 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !isSubmitting && formData.pagos.length > 0 && montosCoinciden
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow transform hover:scale-105"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{gastoSeleccionado ? "Actualizar Gasto" : "Registrar Gasto"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}