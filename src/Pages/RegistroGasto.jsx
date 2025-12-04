import React, { useState, useEffect } from "react";
import {
  DollarSign,
  FileText,
  Calendar,
  Tag,
  Clock,
  Plus,
  X,
  Save
} from "lucide-react";
import { BACKEND_URL } from '../config';

const RegistroGasto = () => {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [usuarioId, setUsuarioId] = useState(1);
  const [empId, setEmpId] = useState(1);

  const [categorias, setCategorias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [pagos, setPagos] = useState([{ tipo_pago_id: "", monto: "" }]);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar datos de selects
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [catRes, perRes, tipRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/categorias`),
          fetch(`${BACKEND_URL}/api/periodos`),
          fetch(`${BACKEND_URL}/api/tipo_pagos`),
        ]);

        setCategorias(await catRes.json());
        setPeriodos(await perRes.json());
        setTiposPago(await tipRes.json());
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // 🔹 Añadir otro tipo de pago
  const agregarPago = () => {
    setPagos([...pagos, { tipo_pago_id: "", monto: "" }]);
  };

  // 🔹 Remover tipo de pago
  const removerPago = (index) => {
    const nuevosPagos = pagos.filter((_, i) => i !== index);
    setPagos(nuevosPagos);
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      p_descripcion: descripcion,
      p_monto: parseFloat(monto),
      p_fecha: fecha,
      p_categoria_id: parseInt(categoriaId),
      p_periodo_id: parseInt(periodoId),
      p_observaciones: observaciones,
      p_usuario_id: usuarioId,
      p_EmpId: empId,
      p_json_pagos: pagos
        .filter((p) => p.tipo_pago_id && p.monto)
        .map((p) => ({
          tipo_pago_id: parseInt(p.tipo_pago_id),
          monto: parseFloat(p.monto),
        })),
    };

    console.log("📤 Enviando:", data);

    try {
      const res = await fetch(`${BACKEND_URL}/api/gastos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      alert(result.message || "Gasto registrado correctamente ✅");

      // Limpiar formulario después del éxito
      if (res.ok) {
        setDescripcion("");
        setMonto("");
        setFecha("");
        setCategoriaId("");
        setPeriodoId("");
        setObservaciones("");
        setPagos([{ tipo_pago_id: "", monto: "" }]);
      }
    } catch (error) {
      console.error("Error registrando gasto:", error);
      alert("Error al registrar el gasto");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  if (loading && categorias.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Registro de Gasto</h2>
              <p className="text-yellow-100 text-xs">Registra un nuevo gasto en el sistema</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <span>Información del Gasto</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Descripción */}
              <div className="md:col-span-2">
                <label className={labelClass}>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Descripción</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={inputClass}
                  placeholder="Ej: Compra de materiales de oficina"
                  required
                />
              </div>

              {/* Monto */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Monto Total</span>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Fecha</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Categoría y Periodo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Categoría</span>
                  </div>
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((c) => (
                    <option key={c.categoria_id} value={c.categoria_id}>
                      {c.nombre}
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
                  value={periodoId}
                  onChange={(e) => setPeriodoId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Seleccionar periodo</option>
                  {periodos.map((p) => (
                    <option key={p.periodo_id} value={p.periodo_id}>
                      {p.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span>Métodos de Pago</span>
              </h3>
              <button
                type="button"
                onClick={agregarPago}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 font-semibold flex items-center space-x-1 text-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar</span>
              </button>
            </div>

            {pagos.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay métodos de pago</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg">
                  <div className="col-span-8">Tipo de Pago</div>
                  <div className="col-span-3 text-right">Monto</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Pagos */}
                {pagos.map((pago, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-white rounded-lg border border-gray-200">
                    <div className="col-span-8">
                      <select
                        value={pago.tipo_pago_id}
                        onChange={(e) => {
                          const nuevos = [...pagos];
                          nuevos[index].tipo_pago_id = e.target.value;
                          setPagos(nuevos);
                        }}
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-yellow-500 outline-none text-sm"
                        required={index === 0}
                      >
                        <option value="">Tipo de pago</option>
                        {tiposPago.map((t) => (
                          <option key={t.tipo_pago_id} value={t.tipo_pago_id}>
                            {t.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1 text-gray-500 text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Monto"
                          value={pago.monto}
                          onChange={(e) => {
                            const nuevos = [...pagos];
                            nuevos[index].monto = e.target.value;
                            setPagos(nuevos);
                          }}
                          className="w-full border border-gray-300 rounded px-2 py-1 pl-6 text-right focus:ring-1 focus:ring-yellow-500 outline-none text-sm"
                          required={index === 0}
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removerPago(index)}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <span>Observaciones</span>
            </h3>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={`${inputClass} resize-none`}
              rows="3"
              placeholder="Notas adicionales sobre el gasto..."
            />
          </div>

          {/* Botón de Guardar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Monto Total del Gasto</p>
                    <p className="text-lg font-bold text-gray-800">
                      $ {monto ? parseFloat(monto).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-600">Total en Pagos</p>
                    <p className={`text-base font-semibold ${Math.abs(parseFloat(monto || 0) - pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                      }`}>
                      $ {pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 flex items-center space-x-2 text-sm ${!loading
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
};

export default RegistroGasto;