import React, { useState, useEffect } from "react";
import {
    X, Save, ShoppingCart, FileText, CreditCard, Plus
} from "lucide-react";
import ComboBusqueda from "../util/ComboBusqueda";
import ComboMin from "../util/ComboMin";

export default function ModalVentaEditar({ ventaId, onClose, onGuardado }) {
    const [clientes, setClientes] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);
    const [detalles, setDetalles] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDatos, setLoadingDatos] = useState(true);
    const [venta, setVenta] = useState(null);

    const [form, setForm] = useState({
        ClienteID: "",
        FechaVenta: "",
        Observaciones: "",
    });

    // 🔹 Función para formatear fecha
    const obtenerFechaLocal = (fechaISO) => {
        if (!fechaISO) {
            const ahora = new Date();
            const año = ahora.getFullYear();
            const mes = String(ahora.getMonth() + 1).padStart(2, '0');
            const dia = String(ahora.getDate()).padStart(2, '0');
            const horas = String(ahora.getHours()).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            return `${año}-${mes}-${dia}T${horas}:${minutos}`;
        }
        
        const fecha = new Date(fechaISO);
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        
        return `${año}-${mes}-${dia}T${horas}:${minutos}`;
    };

    // 🔹 Cargar todos los datos
    useEffect(() => {
        const cargarTodosLosDatos = async () => {
            try {
                setLoadingDatos(true);
                console.log('🔄 Iniciando carga de datos para venta:', ventaId);

                // Cargar datos maestros y la venta principal
                const [clientesRes, articulosRes, pagosRes, empleadosRes, ventaRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/clientes`),
                    fetch(`${BACKEND_URL}/api/articulos`),
                    fetch(`${BACKEND_URL}/api/tipo_pago`),
                    fetch(`${BACKEND_URL}/api/listaempleado`),
                    fetch(`${BACKEND_URL}/api/venta/${ventaId}`)
                ]);

                // Verificar si la respuesta de la venta es OK
                if (!ventaRes.ok) {
                    throw new Error(`Error al cargar venta: ${ventaRes.status}`);
                }

                const [clientesData, articulosData, tiposPagoData, empleadosData, ventaData] =
                    await Promise.all([
                        clientesRes.json(),
                        articulosRes.json(),
                        pagosRes.json(),
                        empleadosRes.json(),
                        ventaRes.json(),
                    ]);

                console.log('📊 Venta cargada:', ventaData);

                // Establecer datos maestros
                setClientes(clientesData.map(c => ({ 
                    value: c.ClienteID, 
                    label: `${c.Nombre || ''} ${c.Apellido || ''}`.trim() || 'Cliente sin nombre'
                })));
                setArticulos(articulosData);
                setTiposPago(tiposPagoData);
                setEmpleados(empleadosData);
                setVenta(ventaData);

                // Establecer datos del formulario
                setForm({
                    ClienteID: ventaData.ClienteID || "",
                    FechaVenta: obtenerFechaLocal(ventaData.FechaVenta),
                    Observaciones: ventaData.Observaciones || "",
                });

                // 🔹 INICIALIZAR DETALLES Y PAGOS VACÍOS
                // Como los endpoints separados no funcionan, empezamos con arrays vacíos
                console.log('🆕 Inicializando detalles y pagos vacíos');
                setDetalles([]);
                setPagos([]);

            } catch (error) {
                console.error('❌ Error crítico cargando datos:', error);
                alert('Error al cargar los datos de la venta');
            } finally {
                setLoadingDatos(false);
            }
        };

        if (ventaId) {
            cargarTodosLosDatos();
        }
    }, [ventaId]);

    // 🔹 Funciones para detalles
    const actualizarDetalle = (i, campo, valor) => {
        const nuevos = [...detalles];
        nuevos[i][campo] = valor;
        if (campo === "ArticuloID") {
            const art = articulos.find(a => a.ArticuloID === valor);
            if (art) nuevos[i].PrecioUnitario = art.PrecioVenta;
        }
        setDetalles(nuevos);
    };

    const agregarArticulo = () => {
        setDetalles([...detalles, { 
            ArticuloID: "", 
            Cantidad: 1, 
            PrecioUnitario: 0, 
            EmpID: "" 
        }]);
    };

    const eliminarDetalle = (i) => {
        if (detalles.length > 1) {
            setDetalles(detalles.filter((_, idx) => idx !== i));
        } else {
            alert("Debe haber al menos un artículo en la venta");
        }
    };

    // 🔹 Funciones para pagos
    const agregarPago = () => {
        setPagos([...pagos, { 
            TipoPagoID: "", 
            Monto: 0 
        }]);
    };

    const actualizarPago = (i, campo, valor) => {
        const nuevos = [...pagos];
        nuevos[i][campo] = valor;
        setPagos(nuevos);
    };

    const eliminarPago = (i) => {
        if (pagos.length > 1) {
            setPagos(pagos.filter((_, idx) => idx !== i));
        } else {
            alert("Debe haber al menos un método de pago");
        }
    };

    // 🔹 Cálculos de totales
    const totalArticulos = detalles.reduce(
        (acc, d) => acc + (d.Cantidad || 0) * (d.PrecioUnitario || 0), 0
    );
    const totalPagos = pagos.reduce((acc, p) => acc + (p.Monto || 0), 0);

    // 🔹 Guardar cambios
    const handleGuardar = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log('💾 Intentando guardar cambios...', {
            form,
            detalles,
            pagos,
            totalArticulos,
            totalPagos
        });

        // Validaciones
        if (!form.ClienteID) {
            alert("⚠️ Debe seleccionar un cliente");
            setLoading(false);
            return;
        }

        if (detalles.length === 0) {
            alert("⚠️ Debe agregar al menos un artículo");
            setLoading(false);
            return;
        }

        if (pagos.length === 0) {
            alert("⚠️ Debe agregar al menos un método de pago");
            setLoading(false);
            return;
        }

        if (Math.abs(totalArticulos - totalPagos) > 0.01) {
            alert("⚠️ La suma de pagos debe igualar el total de artículos");
            setLoading(false);
            return;
        }

        // Preparar datos para enviar
        const data = {
            ...form,
            Total: totalArticulos,
            Detalles: detalles,
            Pagos: pagos,
        };

        console.log('📤 Enviando datos al servidor:', data);

        try {
            const res = await fetch(`${BACKEND_URL}/api/venta/${ventaId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                alert("✅ Venta actualizada correctamente");
                onGuardado();
                onClose();
            } else {
                const errorText = await res.text();
                console.error('❌ Error del servidor:', errorText);
                alert(`❌ Error al actualizar venta: ${res.status} ${res.statusText}`);
            }
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            alert("❌ Error de conexión al actualizar la venta");
        } finally {
            setLoading(false);
        }
    };

    const clienteSel = clientes.find(c => c.value === form.ClienteID) || null;

    // 🔹 Estilos personalizados para combos
    const customStyles = {
        control: (base) => ({
            ...base,
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            padding: '2px 4px',
            fontSize: '0.875rem',
            minHeight: '38px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#3B82F6'
            }
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '0.5rem',
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 10000,
            fontSize: '0.875rem'
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 10000
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            fontSize: '0.875rem',
            padding: '8px 12px',
            '&:active': {
                backgroundColor: '#3B82F6',
                color: 'white'
            }
        })
    };

    // 🔹 Renderizado condicional
    if (loadingDatos) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-y-auto relative p-4 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando datos de la venta #{ventaId}...</p>
                        <p className="text-sm text-gray-500 mt-2">Por favor espere</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!venta) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-y-auto relative p-4 flex justify-center items-center">
                    <div className="text-center">
                        <div className="text-red-500 text-lg font-semibold mb-4">
                            ❌ No se pudieron cargar los datos de la venta
                        </div>
                        <p className="text-gray-600 mb-4">Venta ID: {ventaId}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-yellow-600 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" /> 
                            Editar Venta #{ventaId}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-red-600 transition-colors duration-200 p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    {venta && (
                        <div className="text-sm text-gray-600 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                    <span className="font-semibold">Cliente:</span> {venta.ClienteNombre || "No especificado"}
                                </div>
                                <div>
                                    <span className="font-semibold">Fecha original:</span> {new Date(venta.FechaVenta).toLocaleDateString('es-PE')}
                                </div>
                                <div>
                                    <span className="font-semibold">Total original:</span> S/ {Number(venta.Total || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                    <form onSubmit={handleGuardar} className="space-y-4">
                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Cliente *</label>
                                <div className="relative z-[10001]">
                                    <ComboBusqueda
                                        opciones={clientes}
                                        valorActual={clienteSel}
                                        onSeleccionar={(op) => setForm({ ...form, ClienteID: op ? op.value : "" })}
                                        placeholder="Seleccionar cliente..."
                                        styles={customStyles}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Fecha de Venta *</label>
                                <input
                                    type="datetime-local"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200"
                                    value={form.FechaVenta}
                                    onChange={(e) => setForm({ ...form, FechaVenta: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Observaciones</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200"
                                rows="3"
                                value={form.Observaciones}
                                onChange={(e) => setForm({ ...form, Observaciones: e.target.value })}
                                placeholder="Observaciones adicionales sobre la venta..."
                            />
                        </div>

                        {/* Sección de Artículos */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-yellow-500" /> 
                                    Artículos y Servicios ({detalles.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={agregarArticulo}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> 
                                    Agregar Artículo
                                </button>
                            </div>

                            {detalles.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No hay artículos agregados</p>
                                    <p className="text-sm">Haz clic en "Agregar Artículo" para comenzar</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {detalles.map((d, i) => (
                                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                            <div className="relative z-[10001]">
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Artículo *</label>
                                                <ComboMin
                                                    opciones={articulos.map(a => ({ 
                                                        value: a.ArticuloID, 
                                                        label: a.Nombre 
                                                    }))}
                                                    valorActual={
                                                        articulos
                                                            .map(a => ({ value: a.ArticuloID, label: a.Nombre }))
                                                            .find(op => op.value === d.ArticuloID) || null
                                                    }
                                                    onSeleccionar={(op) => actualizarDetalle(i, "ArticuloID", op ? op.value : "")}
                                                    placeholder="Seleccionar artículo..."
                                                    styles={customStyles}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Cantidad *</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={d.Cantidad}
                                                        onChange={(e) => actualizarDetalle(i, "Cantidad", +e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Precio Unitario *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={d.PrecioUnitario}
                                                        onChange={(e) => actualizarDetalle(i, "PrecioUnitario", +e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Empleado</label>
                                                    <div className="relative z-[10001]">
                                                        <ComboMin
                                                            opciones={empleados.map(emp => ({
                                                                value: emp.EmpId,
                                                                label: `${emp.Nombres} ${emp.Apellidos}`,
                                                            }))}
                                                            valorActual={
                                                                empleados
                                                                    .map(emp => ({
                                                                        value: emp.EmpId,
                                                                        label: `${emp.Nombres} ${emp.Apellidos}`,
                                                                    }))
                                                                    .find(op => op.value === d.EmpID) || null
                                                            }
                                                            onSeleccionar={(op) => actualizarDetalle(i, "EmpID", op ? op.value : "")}
                                                            placeholder="Seleccionar empleado"
                                                            styles={customStyles}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <span className="font-semibold text-gray-800">
                                                    Subtotal: S/ {(d.Cantidad * d.PrecioUnitario).toFixed(2)}
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={() => eliminarDetalle(i)} 
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors duration-200"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sección de Pagos */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-green-500" /> 
                                    Métodos de Pago ({pagos.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={agregarPago}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> 
                                    Agregar Pago
                                </button>
                            </div>

                            {pagos.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No hay métodos de pago</p>
                                    <p className="text-sm">Haz clic en "Agregar Pago" para comenzar</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pagos.map((p, i) => (
                                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                            <div className="relative z-[10001]">
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Pago *</label>
                                                <ComboMin
                                                    opciones={tiposPago.map(t => ({ 
                                                        value: t.tipo_pago_id, 
                                                        label: t.nombre 
                                                    }))}
                                                    valorActual={
                                                        tiposPago
                                                            .map(t => ({ value: t.tipo_pago_id, label: t.nombre }))
                                                            .find(op => op.value === p.TipoPagoID) || null
                                                    }
                                                    onSeleccionar={(op) => actualizarPago(i, "TipoPagoID", op ? op.value : "")}
                                                    placeholder="Seleccionar tipo de pago"
                                                    styles={customStyles}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">Monto *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={p.Monto}
                                                    onChange={(e) => actualizarPago(i, "Monto", +e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                                                    required
                                                />
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarPago(i)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors duration-200"
                                                >
                                                    Eliminar pago
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resumen */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Total Artículos</p>
                                    <p className="text-2xl font-bold text-gray-800">S/ {totalArticulos.toFixed(2)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Total Pagos</p>
                                    <p className={`text-2xl font-bold ${
                                        Math.abs(totalArticulos - totalPagos) < 0.01 
                                            ? "text-green-600" 
                                            : "text-red-600"
                                    }`}>
                                        S/ {totalPagos.toFixed(2)}
                                    </p>
                                    {Math.abs(totalArticulos - totalPagos) >= 0.01 && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Diferencia: S/ {(totalArticulos - totalPagos).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botón de guardar */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || detalles.length === 0 || pagos.length === 0 || Math.abs(totalArticulos - totalPagos) >= 0.01}
                                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> 
                                        Actualizar Venta
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