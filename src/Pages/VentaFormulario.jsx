import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Calendar,
  FileText,
  Plus,
  X,
  DollarSign,
  CreditCard,
  Save,
  UserPlus
} from "lucide-react";
import ComboBusqueda from "../util/ComboBusqueda";
import ComboMin from "../util/ComboMin";
import ModalCliente from "../Modales/ModalCliente";

export default function VentaFormulario() {
  const [clientes, setClientes] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [citasCompletas, setCitasCompletas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalClienteOpen, setModalClienteOpen] = useState(false);

  const obtenerFechaLocal = () => {
    const ahora = new Date();
    const zonaLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
    return zonaLocal.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    ClienteID: "",
    CitaID: "",
    FechaVenta: obtenerFechaLocal(),
    Observaciones: "",
  });
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Para Create React App usa REACT_APP_API_URL
    const url = "https://sistemagolden-backend-production.up.railway.app"//process.env.REACT_APP_API_URL || "http://localhost:5000"//"https://sistemagolden-backend-production.up.railway.app";//
    //"https://sistemagolden-backend-production.up.railway.app"
    setBackendUrl(url);
    console.log("🔗 URL del backend detectada:", url);
  }, []);

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [clientesRes, articulosRes, pagosRes, citasRes, empleadosRes] = await Promise.all([
          fetch(`${backendUrl}/api/clientes`),
          fetch(`${backendUrl}/api/articulos`),
          fetch(`${backendUrl}/api/tipo_pago`),
          fetch(`${backendUrl}/api/citascombo`),
          fetch(`${backendUrl}/api/listaempleado`),
        ]);

        const [clientesData, articulosData, tiposPagoData, citasData, empleadosData] =
          await Promise.all([
            clientesRes.json(),
            articulosRes.json(),
            pagosRes.json(),
            citasRes.json(),
            empleadosRes.json(),
          ]);

        const clientesOpciones = clientesData.map((c) => ({
          value: c.ClienteID,
          label: `${c.Nombre} ${c.Apellido}`,
        }));

        const citasOpciones = citasData.map((c) => ({
          value: c.CitaID,
          label: c.nombre,
          ClienteID: c.ClienteID,
        }));

        setClientes(clientesOpciones);
        setArticulos(articulosData);
        setTiposPago(tiposPagoData);
        setCitasCompletas(citasOpciones);
        setCitasFiltradas([]);
        setEmpleados(empleadosData);

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // 🔹 Función para recargar clientes después de crear uno nuevo
  const recargarClientes = async () => {
    try {
      const clientesRes = await fetch(`${backendUrl}/api/clientes`);
      const clientesData = await clientesRes.json();
      const clientesOpciones = clientesData.map((c) => ({
        value: c.ClienteID,
        label: `${c.Nombre} ${c.Apellido}`,
      }));
      setClientes(clientesOpciones);
    } catch (error) {
      console.error("Error recargando clientes:", error);
    }
  };

  // 🔹 Filtrar citas cuando cambia el cliente
  useEffect(() => {
    if (form.ClienteID) {
      const citasDelCliente = citasCompletas.filter(
        cita => cita.ClienteID === form.ClienteID
      );
      setCitasFiltradas(citasDelCliente);

      if (form.CitaID && !citasDelCliente.some(c => c.value === form.CitaID)) {
        setForm(prev => ({ ...prev, CitaID: "" }));
      }
    } else {
      setCitasFiltradas([]);
      setForm(prev => ({ ...prev, CitaID: "" }));
    }
  }, [form.ClienteID, citasCompletas]);

  const handleClienteChange = (opcion) => {
    setForm((prev) => ({
      ...prev,
      ClienteID: opcion ? opcion.value : "",
    }));
  };

  const handleCitaChange = (opcion) => {
    setForm((prev) => ({
      ...prev,
      CitaID: opcion ? opcion.value : "",
    }));
  };

  const clienteSeleccionado = clientes.find((c) => c.value === form.ClienteID) || null;
  const citaSeleccionado = citasFiltradas.find((c) => c.value === form.CitaID) || null;

  const [totalArticulos, setTotalArticulos] = useState(0);
  const [totalPagos, setTotalPagos] = useState(0);

  useEffect(() => {
    const total = detalles.reduce(
      (acc, d) => acc + (d.Cantidad || 0) * (d.PrecioUnitario || 0),
      0
    );
    setTotalArticulos(total);
  }, [detalles]);

  useEffect(() => {
    const total = pagos.reduce((acc, p) => acc + (p.Monto || 0), 0);
    setTotalPagos(total);
  }, [pagos]);

  const agregarArticulo = () => {
    setDetalles([
      ...detalles,
      { ArticuloID: "", Cantidad: 1, PrecioUnitario: 0, EmpID: "" },
    ]);
  };

  const eliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[index][campo] = valor;

    if (campo === "ArticuloID") {
      const articulo = articulos.find((a) => a.ArticuloID === valor);
      if (articulo) nuevos[index].PrecioUnitario = articulo.PrecioVenta;
    }

    setDetalles(nuevos);
  };

  const agregarPago = () => {
    setPagos([...pagos, { TipoPagoID: "", Monto: 0 }]);
  };

  const actualizarPago = (index, campo, valor) => {
    const nuevos = [...pagos];
    nuevos[index][campo] = valor;
    setPagos(nuevos);
  };

  const eliminarPago = (index) => {
    setPagos(pagos.filter((_, i) => i !== index));
  };

  const guardarVenta = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.ClienteID || detalles.length === 0 || pagos.length === 0) {
      alert("⚠️ Debes seleccionar cliente, artículos y al menos un método de pago.");
      setLoading(false);
      return;
    }

    if (Math.abs(totalArticulos - totalPagos) > 0.01) {
      alert("⚠️ La suma de los pagos debe ser igual al total de los artículos.");
      setLoading(false);
      return;
    }

    if (detalles.some((d) => !d.EmpID)) {
      alert("⚠️ Debes seleccionar un empleado para cada artículo.");
      setLoading(false);
      return;
    }

    const ventaData = {
      ClienteID: form.ClienteID,
      FechaVenta: form.FechaVenta,
      CitaID: form.CitaID || null,
      Total: totalArticulos,
      Detalles: detalles.map((d) => ({
        ArticuloID: d.ArticuloID,
        Cantidad: d.Cantidad,
        PrecioUnitario: d.PrecioUnitario,
        EmpID: d.EmpID,
      })),
      Pagos: pagos.map((p) => ({
        TipoPagoID: p.TipoPagoID || p.tipo_pago_id,
        Monto: p.Monto,
      })),
      Observaciones: form.Observaciones || "",
    };

    try {
      const res = await fetch(`${backendUrl}/api/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ventaData),
      });

      if (res.ok) {
        alert("✅ Venta registrada correctamente");
        setDetalles([]);
        setPagos([]);
        setForm({
          ClienteID: "",
          CitaID: "",
          FechaVenta: obtenerFechaLocal(),
          Observaciones: "",
        });
        setCitasFiltradas([]);
      } else {
        alert("❌ Error al registrar la venta");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión al registrar la venta");
    } finally {
      setLoading(false);
    }
  };

  const ventaValida =
    form.ClienteID &&
    detalles.length > 0 &&
    pagos.length > 0 &&
    Math.abs(totalArticulos - totalPagos) < 0.01;

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  if (loading && clientes.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header móvil compacto */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Registro de Venta</h2>
              <p className="text-yellow-100 text-xs">Nueva venta en el sistema</p>
            </div>
          </div>
        </div>

        <form onSubmit={guardarVenta} className="p-3 space-y-3">
          {/* Información Básica - Móvil */}
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <span>Información de la Venta</span>
            </h3>

            <div className="space-y-3">
              {/* Cliente con botón de nuevo cliente */}
              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Cliente</span>
                  </div>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <ComboBusqueda
                      opciones={clientes}
                      onSeleccionar={handleClienteChange}
                      valorActual={clienteSeleccionado}
                      placeholder="Buscar cliente..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalClienteOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-2 rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 text-xs font-semibold whitespace-nowrap min-w-[60px]"
                    title="Crear nuevo cliente"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span className="hidden xs:inline">Nuevo</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">Fecha Venta</span>
                    </div>
                  </label>
                  <input
                    type="datetime-local"
                    className={`${inputClass} text-xs`}
                    value={form.FechaVenta}
                    onChange={(e) => setForm({ ...form, FechaVenta: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">Cita</span>
                    </div>
                  </label>
                  <ComboBusqueda
                    opciones={citasFiltradas}
                    onSeleccionar={handleCitaChange}
                    valorActual={citaSeleccionado}
                    placeholder={
                      form.ClienteID
                        ? "Seleccionar cita..."
                        : "Selecciona cliente primero"
                    }
                    isDisabled={!form.ClienteID}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Observaciones</span>
                  </div>
                </label>
                <textarea
                  className={`${inputClass} resize-none text-xs`}
                  rows="2"
                  value={form.Observaciones}
                  onChange={(e) => setForm({ ...form, Observaciones: e.target.value })}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
          </div>

          {/* Artículos - Móvil */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-yellow-500" />
                <span>Productos y Servicios</span>
              </h3>
              <button
                type="button"
                onClick={agregarArticulo}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-1 rounded-lg hover:shadow transform hover:scale-105 transition-all duration-200 font-semibold flex items-center space-x-1 text-xs"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden xs:inline">Agregar</span>
              </button>
            </div>

            {detalles.length === 0 ? (
              <div className="text-center py-3 text-gray-500 text-xs">
                <ShoppingCart className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                <p>No hay productos agregados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {detalles.map((d, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-2 space-y-2">
                    {/* Producto */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Producto</label>
                      <ComboMin
                        opciones={articulos.map((a) => ({
                          value: a.ArticuloID,
                          label: a.Nombre,
                        }))}
                        valorActual={
                          articulos
                            .map((a) => ({ value: a.ArticuloID, label: a.Nombre }))
                            .find((op) => op.value === d.ArticuloID) || null
                        }
                        onSeleccionar={(op) =>
                          actualizarDetalle(i, "ArticuloID", op ? op.value : "")
                        }
                        placeholder="Buscar producto..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Cantidad */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-1 focus:ring-yellow-500 outline-none text-xs"
                          value={d.Cantidad}
                          onChange={(e) =>
                            actualizarDetalle(i, "Cantidad", parseInt(e.target.value) || 0)
                          }
                        />
                      </div>

                      {/* Precio Unitario */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">P. Unitario</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-right focus:ring-1 focus:ring-yellow-500 outline-none text-xs"
                          value={d.PrecioUnitario}
                          onChange={(e) =>
                            actualizarDetalle(i, "PrecioUnitario", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>

                    {/* Empleado */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Empleado</label>
                      <ComboMin
                        opciones={empleados.map((emp) => ({
                          value: emp.EmpId,
                          label: `${emp.Nombres} ${emp.Apellidos}`,
                        }))}
                        valorActual={
                          empleados
                            .map((emp) => ({ value: emp.EmpId, label: `${emp.Nombres} ${emp.Apellidos}` }))
                            .find((op) => op.value === d.EmpID) || null
                        }
                        onSeleccionar={(op) => actualizarDetalle(i, "EmpID", op ? op.value : "")}
                        placeholder="Seleccionar empleado..."
                      />
                    </div>

                    {/* Total y Eliminar */}
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-600">Total: </span>
                        <span className="font-semibold text-green-600 text-xs">
                          S/ {(d.Cantidad * d.PrecioUnitario).toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(i)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                        title="Eliminar producto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Métodos de Pago - Móvil */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-yellow-500" />
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

            {pagos.length === 0 ? (
              <div className="text-center py-3 text-gray-500 text-xs">
                <CreditCard className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                <p>No hay métodos de pago</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pagos.map((p, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-2 space-y-2">
                    {/* Tipo de Pago */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de Pago</label>
                      <ComboMin
                        opciones={tiposPago.map((t) => ({
                          value: t.tipo_pago_id,
                          label: t.nombre,
                        }))}
                        valorActual={
                          tiposPago
                            .map((t) => ({ value: t.tipo_pago_id, label: t.nombre }))
                            .find((op) => op.value === p.tipo_pago_id) || null
                        }
                        onSeleccionar={(op) =>
                          actualizarPago(i, "tipo_pago_id", op ? op.value : "")
                        }
                        placeholder="Seleccionar tipo..."
                      />
                    </div>

                    {/* Monto y Eliminar */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Monto</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-right focus:ring-1 focus:ring-yellow-500 outline-none text-xs"
                          value={p.Monto}
                          onChange={(e) => actualizarPago(i, "Monto", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarPago(i)}
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

          {/* Totales y Botón - Móvil */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center space-x-1 mb-1">
                    <DollarSign className="w-3 h-3 text-blue-500" />
                    <p className="text-xs text-gray-600 font-medium">Total Artículos</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800">S/ {totalArticulos.toFixed(2)}</p>
                </div>

                <div className={`bg-white rounded-lg p-2 border ${Math.abs(totalArticulos - totalPagos) < 0.01
                    ? 'border-green-200'
                    : 'border-red-200'
                  }`}>
                  <div className="flex items-center space-x-1 mb-1">
                    <CreditCard className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-gray-600 font-medium">Total Pagos</p>
                  </div>
                  <p className={`text-sm font-bold ${Math.abs(totalArticulos - totalPagos) < 0.01
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}>
                    S/ {totalPagos.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!ventaValida || loading}
                className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${ventaValida && !loading
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
                    <span>Guardar Venta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal para crear nuevo cliente */}
      <ModalCliente
        isOpen={modalClienteOpen}
        onClose={() => setModalClienteOpen(false)}
        recargarClientes={recargarClientes}
      />
    </div>
  );
}