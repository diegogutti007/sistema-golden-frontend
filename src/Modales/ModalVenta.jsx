import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import ComboMin from "../util/ComboMin";
import { BACKEND_URL } from '../config';

Modal.setAppElement('#root');

export default function ModalVenta({
    isOpen,
    onClose,
    citaInfo,
    onSave
}) {
    const [articulos, setArticulos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);
    const [detalles, setDetalles] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [cargando, setCargando] = useState(false);

    // 🔹 Función CORREGIDA para obtener fecha y hora local en formato correcto
    const obtenerFechaLocal = () => {
        const ahora = new Date();
        
        // Ajustar a la zona horaria local
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        
        return `${año}-${mes}-${dia}T${horas}:${minutos}`;
    };

    // 🔹 Función para formatear fecha de la cita al formato correcto
    const formatearFechaCita = (fechaISO) => {
        if (!fechaISO) return obtenerFechaLocal();
        
        const fecha = new Date(fechaISO);
        
        // Ajustar a la zona horaria local
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        
        return `${año}-${mes}-${dia}T${horas}:${minutos}`;
    };

    const [form, setForm] = useState({
        ClienteID: "",
        CitaID: "",
        FechaVenta: "", // Se inicializará en el useEffect
        Observaciones: "",
    });

    const [totalArticulos, setTotalArticulos] = useState(0);
    const [totalPagos, setTotalPagos] = useState(0);

    // 🔹 Debug de citaInfo
    useEffect(() => {
        console.log("🎯 citaInfo en ModalVenta:", citaInfo);
        if (citaInfo?.FechaFin) {
            console.log("📅 FechaFin original:", citaInfo.FechaFin);
            console.log("🕒 FechaFin formateada:", formatearFechaCita(citaInfo.FechaFin));
        }
    }, [citaInfo]);

    // 🔹 Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                
                const [articulosRes, pagosRes, empleadosRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/articulos`),
                    fetch(`${BACKEND_URL}/api/tipo_pago`),
                    fetch(`${BACKEND_URL}/api/listaempleado`),
                ]);

                const [articulosData, tiposPagoData, empleadosData] = await Promise.all([
                    articulosRes.json(),
                    pagosRes.json(),
                    empleadosRes.json(),
                ]);

                setArticulos(articulosData);
                setTiposPago(tiposPagoData);
                setEmpleados(empleadosData);

            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setCargando(false);
            }
        };

        if (isOpen) {
            cargarDatos();
        }
    }, [isOpen]);

    // 🔹 Cargar datos de la cita seleccionada - CORREGIDO
    useEffect(() => {
        if (citaInfo && isOpen) {
            console.log("🔄 Inicializando form con cita:", citaInfo);
            
            // Usar la fecha de la cita o la fecha actual si no hay cita
            const fechaVenta = citaInfo.FechaFin 
                ? formatearFechaCita(citaInfo.FechaFin)
                : obtenerFechaLocal();
            
            console.log("🕐 Fecha de venta establecida:", fechaVenta);
            
            setForm({
                ClienteID: citaInfo.ClienteID || "",
                CitaID: citaInfo.CitaID || citaInfo.id || "",
                FechaVenta: fechaVenta,
                Observaciones: `Cita: ${citaInfo.Titulo || citaInfo.titulo || ""}`,
            });

            // Limpiar detalles y pagos
            setDetalles([]);
            setPagos([]);
        }
    }, [citaInfo, isOpen]);

    // 🔹 Calcular totales
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

    // 🔹 Funciones de detalle y pago
    const agregarArticulo = () => {
        setDetalles([...detalles, { ArticuloID: "", Cantidad: 1, PrecioUnitario: 0, EmpID: "" }]);
    };

    const eliminarDetalle = (i) => setDetalles(detalles.filter((_, idx) => idx !== i));

    const actualizarDetalle = (i, campo, valor) => {
        const nuevos = [...detalles];
        nuevos[i][campo] = valor;
        if (campo === "ArticuloID") {
            const art = articulos.find((a) => a.ArticuloID === valor);
            if (art) nuevos[i].PrecioUnitario = art.PrecioVenta;
        }
        setDetalles(nuevos);
    };

    const agregarPago = () => {
        setPagos([...pagos, { TipoPagoID: "", Monto: 0 }]);
    };

    const eliminarPago = (i) => setPagos(pagos.filter((_, idx) => idx !== i));

    const actualizarPago = (i, campo, valor) => {
        const nuevos = [...pagos];
        nuevos[i][campo] = valor;
        setPagos(nuevos);
    };

    // 🔹 Guardar venta
    const guardarVenta = async (e) => {
        e.preventDefault();

        if (!form.ClienteID || detalles.length === 0 || pagos.length === 0) {
            alert("⚠️ Debes seleccionar cliente, artículos y al menos un método de pago.");
            return;
        }

        if (Math.abs(totalArticulos - totalPagos) > 0.01) {
            alert("⚠️ La suma de los pagos debe ser igual al total de los artículos.");
            return;
        }

        // Convertir FechaVenta al formato ISO para el backend
        const fechaVentaISO = new Date(form.FechaVenta).toISOString();

        const ventaData = {
            ClienteID: form.ClienteID,
            FechaVenta: fechaVentaISO,
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

        console.log("💾 Enviando datos de venta:", ventaData);

        try {
            setCargando(true);
            
            const res = await fetch(`${BACKEND_URL}/api/ventas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ventaData),
            });

            if (res.ok) {
                alert("✅ Venta registrada correctamente");

                if (form.CitaID) {
                    await fetch(`${BACKEND_URL}/api/citas/${form.CitaID}/estado`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ Estado: "Completada" }),
                    });
                }

                onSave?.();
                onClose();
            } else {
                const errorData = await res.json();
                alert(`❌ Error al registrar la venta: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error de conexión al guardar venta");
        } finally {
            setCargando(false);
        }
    };

    const ventaValida =
        form.ClienteID &&
        detalles.length > 0 &&
        pagos.length > 0 &&
        Math.abs(totalArticulos - totalPagos) < 0.01;

    // 🔹 Estilos personalizados para los ComboMin (SOLUCIÓN AL PROBLEMA)
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
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9CA3AF',
            fontSize: '0.875rem'
        }),
        singleValue: (base) => ({
            ...base,
            color: '#374151',
            fontSize: '0.875rem'
        })
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-6xl mx-4 relative"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            ariaHideApp={false}
            style={{
                content: {
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">💰</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Registrar Venta
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Cliente: <span className="font-semibold text-green-600">
                                {citaInfo?.clienteNombre || citaInfo?.clienteNombre || "No disponible"}
                            </span> | 
                            Cita: <span className="font-semibold text-blue-600">
                                {citaInfo?.Titulo || citaInfo?.titulo || "Sin título"}
                            </span>
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Fecha de venta: {form.FechaVenta}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {cargando ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : (
                <form onSubmit={guardarVenta} className="space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
                            <input
                                type="text"
                                value={citaInfo?.clienteNombre || citaInfo?.clienteNombre || "Cliente no disponible"}
                                readOnly
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-700 text-base font-medium shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Fecha de Venta 
                                <span className="text-xs text-gray-500 ml-1">(Formato local)</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                value={form.FechaVenta}
                                onChange={(e) => {
                                    console.log("📅 Nueva fecha seleccionada:", e.target.value);
                                    setForm({ ...form, FechaVenta: e.target.value });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                value={form.Observaciones}
                                onChange={(e) => setForm({ ...form, Observaciones: e.target.value })}
                                placeholder="Observaciones adicionales..."
                            />
                        </div>
                    </div>

                    {/* Sección de Artículos */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">🛍️</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Artículos y Servicios</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarArticulo}
                                    className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2 shadow-sm"
                                >
                                    <span className="text-lg">+</span>
                                    <span>Agregar Artículo</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {detalles.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-base">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">📦</span>
                                    </div>
                                    <p>No hay artículos agregados</p>
                                    <p className="text-sm text-gray-400">Agrega artículos o servicios a la venta</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Headers */}
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl">
                                        <div className="col-span-4">Artículo</div>
                                        <div className="col-span-2 text-center">Cantidad</div>
                                        <div className="col-span-2 text-right">Precio Unit.</div>
                                        <div className="col-span-3">Empleado</div>
                                        <div className="col-span-1 text-right">Total</div>
                                    </div>
                                    
                                    {/* Detalles */}
                                    {detalles.map((d, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 items-center">
                                            {/* Combo Artículo - CORREGIDO */}
                                            <div className="col-span-4 relative z-[10001]">
                                                <ComboMin
                                                    opciones={articulos.map((a) => ({
                                                        value: a.ArticuloID, 
                                                        label: a.Nombre
                                                    }))}
                                                    valorActual={
                                                        articulos
                                                            .map((a) => ({ value: a.ArticuloID, label: a.Nombre }))
                                                            .find((op) => op.value === d.ArticuloID) || null}
                                                    onSeleccionar={(op) => actualizarDetalle(i, "ArticuloID", op ? op.value : "")}
                                                    placeholder="Seleccionar artículo..."
                                                    className="text-sm"
                                                    menuPortalTarget={document.body}
                                                    styles={customStyles}
                                                />
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
                                                    value={d.Cantidad}
                                                    onChange={(e) => actualizarDetalle(i, "Cantidad", parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">S/</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-8 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
                                                        value={d.PrecioUnitario}
                                                        onChange={(e) =>
                                                            actualizarDetalle(i, "PrecioUnitario", parseFloat(e.target.value) || 0)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Combo Empleado - CORREGIDO */}
                                            <div className="col-span-3 relative z-[10001]">
                                                <ComboMin
                                                    opciones={empleados.map((emp) => ({
                                                        value: emp.EmpId,
                                                        label: `${emp.Nombres} ${emp.Apellidos}`,
                                                    }))}
                                                    valorActual={
                                                        empleados
                                                            .map((emp) => ({ value: emp.EmpId, label: `${emp.Nombres} ${emp.Apellidos}` }))
                                                            .find((op) => op.value === d.EmpID) || null}
                                                    onSeleccionar={(op) => actualizarDetalle(i, "EmpID", op ? op.value : "")}
                                                    placeholder="Seleccionar empleado..."
                                                    className="text-sm"
                                                    menuPortalTarget={document.body}
                                                    styles={customStyles}
                                                />
                                            </div>
                                            
                                            <div className="col-span-1 flex items-center justify-end space-x-2">
                                                <span className="font-bold text-green-600 text-base">
                                                    S/ {(d.Cantidad * d.PrecioUnitario).toFixed(2)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarDetalle(i)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de Pagos */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">💳</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Métodos de Pago</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarPago}
                                    className="bg-white text-green-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition-all duration-200 flex items-center space-x-2 shadow-sm"
                                >
                                    <span className="text-lg">+</span>
                                    <span>Agregar Pago</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {pagos.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-base">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">💵</span>
                                    </div>
                                    <p>No hay métodos de pago agregados</p>
                                    <p className="text-sm text-gray-400">Agrega los métodos de pago utilizados</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl">
                                        <div className="col-span-8">Tipo de Pago</div>
                                        <div className="col-span-3 text-right">Monto</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    
                                    {pagos.map((p, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 items-center">
                                            {/* Combo Tipo de Pago - CORREGIDO */}
                                            <div className="col-span-8 relative z-[10001]">
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
                                                    placeholder="Seleccionar tipo de pago..."
                                                    className="text-sm"
                                                    menuPortalTarget={document.body}
                                                    styles={customStyles}
                                                />
                                            </div>
                                            
                                            <div className="col-span-3">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">S/</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-8 text-right focus:outline-none focus:ring-2 focus:ring-green-500 text-base font-medium"
                                                        value={p.Monto}
                                                        onChange={(e) => actualizarPago(i, "Monto", parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-1 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarPago(i)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resumen y acciones */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                                    <span className="text-base font-semibold text-gray-700">Total Artículos:</span>
                                    <span className="text-xl font-bold text-blue-600">S/ {totalArticulos.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                                    <span className="text-base font-semibold text-gray-700">Total Pagos:</span>
                                    <span className={`text-xl font-bold ${Math.abs(totalArticulos - totalPagos) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                                        S/ {totalPagos.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                                    <span className="text-base font-semibold text-gray-700">Diferencia:</span>
                                    <span className={`text-lg font-semibold ${Math.abs(totalArticulos - totalPagos) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                                        S/ {(totalArticulos - totalPagos).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-center space-y-4">
                                <button
                                    type="submit"
                                    disabled={!ventaValida || cargando}
                                    className={`w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-3 text-base ${
                                        ventaValida && !cargando
                                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl transform hover:scale-105"
                                            : "bg-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {cargando ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Guardando Venta...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xl">💾</span>
                                            <span className="text-lg">Guardar Venta</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={cargando}
                                    className="w-full px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3 text-base"
                                >
                                    <span className="text-xl">✖</span>
                                    <span>Cancelar</span>
                                </button>
                            </div>
                        </div>
                        
                        {!ventaValida && (
                            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-yellow-700 text-sm">
                                    {!form.ClienteID && "⚠️ Selecciona un cliente • "}
                                    {detalles.length === 0 && "⚠️ Agrega al menos un artículo • "}
                                    {pagos.length === 0 && "⚠️ Agrega al menos un pago • "}
                                    {Math.abs(totalArticulos - totalPagos) >= 0.01 && "⚠️ Los pagos deben coincidir con el total"}
                                </p>
                            </div>
                        )}
                    </div>
                </form>
            )}
        </Modal>
    );
}