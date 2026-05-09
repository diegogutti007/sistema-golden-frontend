import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X, Save, ShoppingCart, FileText, CreditCard, Plus, Trash2, User, Calendar, AlertCircle
} from "lucide-react";
import ComboBusqueda from "../util/ComboBusqueda";
import ComboMin from "../util/ComboMin";
import { BACKEND_URL } from '../config';

export default function ModalVentaEditar({ ventaId, onClose, onGuardado }) {
    const [clientes, setClientes] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);
    const [detalles, setDetalles] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loadingDatos, setLoadingDatos] = useState(true);
    const [venta, setVenta] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [form, setForm] = useState({
        ClienteID: "",
        FechaVenta: "",
        Observaciones: "",
    });

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // 🔹 Función para formatear fecha a DD-MM-YYYY
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';

        // Extraer solo la parte de la fecha (YYYY-MM-DD)
        let fechaParte = fechaStr;

        // Si viene con T (formato ISO: 2026-03-16T05:00:00.000Z)
        if (fechaStr.includes('T')) {
            fechaParte = fechaStr.split('T')[0]; // Tomar solo lo que está antes de T
        }

        // Ahora fechaParte debe ser "2026-03-16"
        if (fechaParte.includes('-')) {
            const partes = fechaParte.split('-');
            if (partes.length === 3) {
                const año = partes[0];
                const mes = partes[1];
                const dia = partes[2];

                // Reordenar a DD-MM-YYYY
                return `${dia}-${mes}-${año}`;
            }
        }
        return fechaStr;
    };

    // 🔹 Función para formatear fecha para el input date (YYYY-MM-DD)
    const formatearFechaInput = (fechaStr) => {
        if (!fechaStr) return '';

        // Si ya está en formato YYYY-MM-DD, devolverlo
        if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return fechaStr;
        }

        // Si viene en formato DD-MM-YYYY
        if (fechaStr.includes('-')) {
            const partes = fechaStr.split('-');
            if (partes.length === 3 && partes[0].length === 2) {
                const dia = partes[0];
                const mes = partes[1];
                const año = partes[2];
                return `${año}-${mes}-${dia}`;
            }
        }

        // Si viene en formato ISO
        if (fechaStr.includes('T')) {
            return fechaStr.split('T')[0];
        }

        return fechaStr;
    };

    // 🔹 Función para obtener fecha actual en formato YYYY-MM-DD
    const obtenerFechaActual = () => {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    };

    useEffect(() => {
        const cargarTodosLosDatos = async () => {
            try {
                setLoadingDatos(true);

                const [clientesRes, articulosRes, pagosRes, empleadosRes, ventaRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/clientes`),
                    fetch(`${BACKEND_URL}/api/articulos`),
                    fetch(`${BACKEND_URL}/api/tipo_pago`),
                    fetch(`${BACKEND_URL}/api/listaempleadoactivo`),
                    fetch(`${BACKEND_URL}/api/venta/${ventaId}`)
                ]);

                const [clientesData, articulosData, tiposPagoData, empleadosData, ventaData] =
                    await Promise.all([
                        clientesRes.json(),
                        articulosRes.json(),
                        pagosRes.json(),
                        empleadosRes.json(),
                        ventaRes.json(),
                    ]);

                const ventaReal = ventaData.venta || ventaData;
                const detallesData = ventaData.detalles || [];
                const pagosData = ventaData.pagos || [];

                setClientes(clientesData.map(c => ({
                    value: c.ClienteID,
                    label: `${c.Nombre || ''} ${c.Apellido || ''}`.trim() || 'Cliente sin nombre'
                })));
                setArticulos(articulosData);
                setTiposPago(tiposPagoData);
                setEmpleados(empleadosData);
                setVenta(ventaReal);

                // Formatear fecha para mostrar (DD-MM-YYYY) y para el input (YYYY-MM-DD)
                const fechaOriginal = ventaReal.FechaVenta || obtenerFechaActual();
                const fechaFormateadaMostrar = formatearFecha(fechaOriginal);
                const fechaFormateadaInput = formatearFechaInput(fechaOriginal);

                setForm({
                    ClienteID: ventaReal.ClienteID || "",
                    FechaVenta: fechaFormateadaInput, // Para el input date
                    Observaciones: ventaReal.Observaciones || "",
                });

                if (detallesData && Array.isArray(detallesData) && detallesData.length > 0) {
                    const detallesFormateados = detallesData.map(det => ({
                        ArticuloID: det.ArticuloID || "",
                        Cantidad: det.Cantidad || 1,
                        PrecioUnitario: parseFloat(det.PrecioUnitario || det.Importe || 0),
                        EmpID: det.EmpID || det.empId || det.EmpleadoID || det.empleado_id || det.EmpId || "",
                        DetalleID: det.DetalleID
                    }));
                    setDetalles(detallesFormateados);
                } else {
                    setDetalles([{ ArticuloID: "", Cantidad: 1, PrecioUnitario: 0, EmpID: "" }]);
                }

                if (pagosData && Array.isArray(pagosData) && pagosData.length > 0) {
                    const pagosFormateados = pagosData.map(pago => {
                        let tipoPagoID = null;
                        if (pago.TipoPagoID) tipoPagoID = pago.TipoPagoID;
                        else if (pago.TipoPago) {
                            const tipoPagoEncontrado = tiposPagoData.find(tp =>
                                tp.nombre === pago.TipoPago || tp.nombre.toLowerCase() === pago.TipoPago.toLowerCase()
                            );
                            tipoPagoID = tipoPagoEncontrado ? tipoPagoEncontrado.tipo_pago_id : null;
                        }
                        return {
                            TipoPagoID: tipoPagoID,
                            Monto: parseFloat(pago.Monto || pago.monto || 0),
                            venta_pago_id: pago.venta_pago_id
                        };
                    });
                    setPagos(pagosFormateados);
                } else {
                    setPagos([{ TipoPagoID: "", Monto: 0 }]);
                }

            } catch (error) {
                console.error('Error:', error);
                alert(`Error al cargar los datos: ${error.message}`);
            } finally {
                setLoadingDatos(false);
            }
        };

        if (ventaId) {
            cargarTodosLosDatos();
        }
    }, [ventaId]);

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
        setDetalles([...detalles, { ArticuloID: "", Cantidad: 1, PrecioUnitario: 0, EmpID: "" }]);
    };

    const eliminarDetalle = (i) => {
        if (detalles.length > 1) {
            setDetalles(detalles.filter((_, idx) => idx !== i));
        } else {
            alert("Debe haber al menos un artículo en la venta");
        }
    };

    const agregarPago = () => {
        setPagos([...pagos, { TipoPagoID: "", Monto: 0 }]);
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

    const totalArticulos = detalles.reduce((acc, d) => acc + (d.Cantidad || 0) * (d.PrecioUnitario || 0), 0);
    const totalPagos = pagos.reduce((acc, p) => acc + (p.Monto || 0), 0);
    const diferencia = totalArticulos - totalPagos;

    /*     const handleGuardar = async (e) => {
            e.preventDefault();
            
            if (!form.ClienteID) {
                alert("Debe seleccionar un cliente");
                return;
            }
    
            if (detalles.length === 0) {
                alert("Debe agregar al menos un artículo");
                return;
            }
    
            if (pagos.length === 0) {
                alert("Debe agregar al menos un método de pago");
                return;
            }
    
            if (Math.abs(diferencia) > 0.01) {
                alert("La suma de pagos debe igualar el total de artículos");
                return;
            }
    
            setGuardando(true);
            
            // Formatear la fecha para enviar al servidor en formato ISO
            const fechaParaEnviar = form.FechaVenta ? `${form.FechaVenta}T00:00:00.000Z` : new Date().toISOString();
            
            const data = {
                ...form,
                FechaVenta: fechaParaEnviar,
                Total: totalArticulos,
                Detalles: detalles.map(d => ({
                    ArticuloID: d.ArticuloID,
                    Cantidad: d.Cantidad,
                    PrecioUnitario: d.PrecioUnitario,
                    EmpID: d.EmpID,
                    DetalleID: d.DetalleID
                })),
                Pagos: pagos.map(p => ({
                    TipoPagoID: p.TipoPagoID,
                    Monto: p.Monto,
                    venta_pago_id: p.venta_pago_id
                })),
            };
    
            try {
                const res = await fetch(`${BACKEND_URL}/api/venta/${ventaId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
    
                if (res.ok) {
                    alert("Venta actualizada correctamente");
                    onGuardado();
                    onClose();
                } else {
                    const errorData = await res.json();
                    alert(`Error al actualizar venta: ${errorData.error || res.status}`);
                }
            } catch (error) {
                alert("Error de conexión");
            } finally {
                setGuardando(false);
            }
        }; */

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (!form.ClienteID) {
            alert("Debe seleccionar un cliente");
            return;
        }

        if (detalles.length === 0) {
            alert("Debe agregar al menos un artículo");
            return;
        }

        if (pagos.length === 0) {
            alert("Debe agregar al menos un método de pago");
            return;
        }

        if (Math.abs(diferencia) > 0.01) {
            alert("La suma de pagos debe igualar el total de artículos");
            return;
        }

        setGuardando(true);

        // SOLO yyyy-mm-dd
        const fechaParaEnviar = form.FechaVenta
            || new Date().toISOString().split('T')[0];

        const data = {
            ...form,
            FechaVenta: fechaParaEnviar,
            Total: totalArticulos,
            Detalles: detalles.map(d => ({
                ArticuloID: d.ArticuloID,
                Cantidad: d.Cantidad,
                PrecioUnitario: d.PrecioUnitario,
                EmpID: d.EmpID,
                DetalleID: d.DetalleID
            })),
            Pagos: pagos.map(p => ({
                TipoPagoID: p.TipoPagoID,
                Monto: p.Monto,
                venta_pago_id: p.venta_pago_id
            })),
        };

        try {
            const res = await fetch(`${BACKEND_URL}/api/venta/${ventaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                alert("Venta actualizada correctamente");
                onGuardado();
                onClose();
            } else {
                const errorData = await res.json();
                alert(`Error al actualizar venta: ${errorData.error || res.status}`);
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setGuardando(false);
        }
    };
    const clienteSel = clientes.find(c => c.value === form.ClienteID) || null;

    const customStyles = {
        control: (base) => ({
            ...base,
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            padding: '4px 8px',
            fontSize: '0.875rem',
            minHeight: '42px',
            boxShadow: 'none',
            '&:hover': { borderColor: '#F59E0B' },
            '&:focus-within': { borderColor: '#F59E0B', boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)' }
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '0.5rem',
            border: '1px solid #E5E7EB',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 999999,
            fontSize: '0.875rem'
        }),
        menuPortal: (base) => ({ ...base, zIndex: 999999 }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#F59E0B' : state.isFocused ? '#FEF3C7' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            padding: '10px 12px',
            cursor: 'pointer',
            '&:active': { backgroundColor: '#F59E0B', color: 'white' }
        })
    };

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
            style={{ zIndex: 999999 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Editar Venta #{ventaId}</h2>
                            {venta && (
                                <p className="text-sm text-white text-opacity-90">
                                    Cliente: {venta.ClienteNombre || "No especificado"} |
                                    Total: S/ {Number(venta.Total || 0).toFixed(2)} |
                                    Fecha: {formatearFecha(venta.FechaVenta)}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loadingDatos ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mb-4"></div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cargando venta</h3>
                                <p className="text-sm text-gray-500">Por favor espere un momento...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleGuardar} className="space-y-6">
                            {/* Información básica */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                    Información de la Venta
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            <User className="w-4 h-4 inline mr-1" /> Cliente *
                                        </label>
                                        <div className="relative z-10">
                                            <ComboBusqueda
                                                opciones={clientes}
                                                valorActual={clienteSel}
                                                onSeleccionar={(op) => setForm({ ...form, ClienteID: op ? op.value : "" })}
                                                placeholder="Seleccionar cliente..."
                                                styles={customStyles}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            <Calendar className="w-4 h-4 inline mr-1" /> Fecha de Venta *
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                            value={form.FechaVenta}
                                            onChange={(e) => setForm({ ...form, FechaVenta: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Observaciones</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                        rows="3"
                                        value={form.Observaciones}
                                        onChange={(e) => setForm({ ...form, Observaciones: e.target.value })}
                                        placeholder="Observaciones adicionales sobre la venta..."
                                    />
                                </div>
                            </div>

                            {/* Artículos */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                        <FileText className="w-5 h-5 text-yellow-500" />
                                        Artículos y Servicios ({detalles.length})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={agregarArticulo}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar Artículo
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {detalles.map((d, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-5 relative z-[100]">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Artículo *</label>
                                                    <ComboMin
                                                        opciones={articulos.map(a => ({ value: a.ArticuloID, label: a.Nombre }))}
                                                        valorActual={articulos.find(a => a.ArticuloID === d.ArticuloID) ? { value: d.ArticuloID, label: articulos.find(a => a.ArticuloID === d.ArticuloID)?.Nombre } : null}
                                                        onSeleccionar={(op) => actualizarDetalle(i, "ArticuloID", op ? op.value : "")}
                                                        placeholder="Seleccionar artículo..."
                                                        styles={customStyles}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Cantidad</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={d.Cantidad}
                                                        onChange={(e) => actualizarDetalle(i, "Cantidad", +e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Precio Unitario</label>
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
                                                <div className="md:col-span-2">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Empleado</label>
                                                    <ComboMin
                                                        opciones={empleados.map(emp => ({
                                                            value: emp.EmpId,
                                                            label: `${emp.Nombres} ${emp.Apellidos}`,
                                                        }))}
                                                        valorActual={empleados.find(emp => emp.EmpId === d.EmpID) ? { value: d.EmpID, label: empleados.find(emp => emp.EmpId === d.EmpID)?.Nombres } : null}
                                                        onSeleccionar={(op) => actualizarDetalle(i, "EmpID", op ? op.value : "")}
                                                        placeholder="Seleccionar"
                                                        styles={customStyles}
                                                    />
                                                </div>
                                                <div className="md:col-span-1 flex flex-col justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarDetalle(i)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    Subtotal: S/ {(d.Cantidad * d.PrecioUnitario).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pagos */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                                        <CreditCard className="w-5 h-5 text-green-500" />
                                        Métodos de Pago ({pagos.length})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={agregarPago}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar Pago
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {pagos.map((p, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-5 relative z-[100]">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de Pago *</label>
                                                    <ComboMin
                                                        opciones={tiposPago.map(t => ({ value: t.tipo_pago_id, label: t.nombre }))}
                                                        valorActual={tiposPago.find(t => t.tipo_pago_id === p.TipoPagoID) ? { value: p.TipoPagoID, label: tiposPago.find(t => t.tipo_pago_id === p.TipoPagoID)?.nombre } : null}
                                                        onSeleccionar={(op) => actualizarPago(i, "TipoPagoID", op ? op.value : "")}
                                                        placeholder="Seleccionar tipo de pago"
                                                        styles={customStyles}
                                                    />
                                                </div>
                                                <div className="md:col-span-6">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Monto *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        /* min="0" */
                                                        value={p.Monto}
                                                        onChange={(e) => actualizarPago(i, "Monto", +e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-1 flex flex-col justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarPago(i)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resumen */}
                            <div className={`rounded-xl p-6 shadow-lg ${Math.abs(diferencia) < 0.01
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                                    : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
                                }`}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Total Artículos</p>
                                        <p className="text-3xl font-bold text-gray-800">S/ {totalArticulos.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Total Pagos</p>
                                        <p className="text-3xl font-bold text-gray-800">S/ {totalPagos.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Diferencia</p>
                                        <p className={`text-3xl font-bold ${Math.abs(diferencia) < 0.01 ? "text-green-600" : "text-red-600"}`}>
                                            S/ {Math.abs(diferencia).toFixed(2)}
                                            {Math.abs(diferencia) >= 0.01 && (
                                                <span className="text-sm ml-1">{diferencia > 0 ? "(pendiente)" : "(sobrante)"}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {Math.abs(diferencia) >= 0.01 && (
                                    <div className="mt-4 p-3 bg-red-100 rounded-lg flex items-center gap-2 text-red-700">
                                        <AlertCircle className="w-5 h-5" />
                                        <p className="text-sm font-medium">El total de pagos debe igualar el total de artículos</p>
                                    </div>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-gray-50 py-4 -mb-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando || detalles.length === 0 || pagos.length === 0 || Math.abs(diferencia) >= 0.01}
                                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {guardando ? (
                                        <>
                                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
                    )}
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}