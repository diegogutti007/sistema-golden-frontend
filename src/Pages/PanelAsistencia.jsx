import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';
import {
    Calendar, Users, Clock, Download, Search, Filter, ChevronLeft, ChevronRight,
    MapPin, Wifi, Smartphone, AlertCircle, CheckCircle, XCircle, Menu, X,
    TrendingUp, Sun, Moon, Plus, Save, User, Coffee, Zap, Timer, Award, Edit
} from 'lucide-react';

const PanelAsistencia = () => {
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
    const [registros, setRegistros] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [empleadoFiltro, setEmpleadoFiltro] = useState('');
    const [horarioFiltro, setHorarioFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina] = useState(10);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [registrando, setRegistrando] = useState(false);
    const [editandoRegistro, setEditandoRegistro] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    
    const [estadisticas, setEstadisticas] = useState({
        total: 0, presentes: 0, ausentes: 0, tardanzas: 0,
        horasPromedio: 0, minutosTardanzaPromedio: 0, porcentajeTardanzas: 0,
        horasExtras: 0, empleadosConHorasExtras: 0
    });

    const [nuevoRegistro, setNuevoRegistro] = useState({
        empId: '', fecha: new Date().toISOString().split('T')[0],
        horaEntrada: '', horaSalidaAlmuerzo: '', horaRegresoAlmuerzo: '', horaSalida: '', observaciones: ''
    });

    useEffect(() => {
        cargarEmpleados();
        cargarHorarios();
    }, []);

    useEffect(() => {
        cargarReporte();
    }, [fechaInicio, fechaFin, empleadoFiltro, horarioFiltro]);

    const cargarEmpleados = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/listaempleadoactivo`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setEmpleados(data.map(emp => ({ EmpId: emp.EmpId, Nombres: emp.Nombres, Apellidos: emp.Apellidos, Codigo: emp.DocID })));
            }
        } catch (error) {
            console.error('Error cargando empleados:', error);
        }
    };

    const cargarHorarios = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/horario/activos`);
            if (res.ok) {
                const data = await res.json();
                setHorarios(data.map(h => ({ HorarioId: h.HorarioId, Nombre: h.Nombre })));
            }
        } catch (error) {
            console.error('Error cargando horarios:', error);
        }
    };

    const cargarReporte = async () => {
        setCargando(true);
        try {
            let url = `${BACKEND_URL}/api/reportes/asistencia?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            if (empleadoFiltro) url += `&empId=${empleadoFiltro}`;
            if (horarioFiltro) url += `&horario_id=${horarioFiltro}`;
            const res = await fetch(url);
            const data = await res.json();
            setRegistros(data);
            calcularEstadisticas(data);
            setPaginaActual(1);
        } catch (error) {
            console.error('Error cargando reporte:', error);
        } finally {
            setCargando(false);
        }
    };

    const calcularEstadisticas = (data) => {
        const total = data.length;
        const presentes = data.filter(r => r.Estado === 'Completo').length;
        const ausentes = data.filter(r => r.Estado === 'Ausente').length;
        const tardanzas = data.filter(r => r.EsTardanza === 1).length;
        const minutosTardanzaTotal = data.reduce((s, r) => s + (parseInt(r.MinutosTardanza) || 0), 0);
        const horasTotales = data.reduce((s, r) => s + (parseFloat(r.HorasTrabajadas) || 0), 0);
        const horasExtrasTotal = data.reduce((s, r) => s + (parseFloat(r.HorasExtras) || 0), 0);
        
        setEstadisticas({
            total, presentes, ausentes, tardanzas,
            horasPromedio: presentes > 0 ? (horasTotales / presentes).toFixed(2) : 0,
            minutosTardanzaPromedio: tardanzas > 0 ? (minutosTardanzaTotal / tardanzas).toFixed(0) : 0,
            porcentajeTardanzas: total > 0 ? ((tardanzas / total) * 100).toFixed(1) : 0,
            horasExtras: horasExtrasTotal.toFixed(1),
            empleadosConHorasExtras: new Set(data.filter(r => parseFloat(r.HorasExtras) > 0).map(r => r.EmpId)).size
        });
    };

    // ==================== FUNCIONES DE FORMATEO ====================
    
    // Convertir horas decimales a formato "HH:MM"
    const decimalToHourMinute = (horasDecimal) => {
        if (!horasDecimal || horasDecimal === 0) return '—';
        
        const horas = Math.floor(horasDecimal);
        const minutos = Math.round((horasDecimal - horas) * 60);
        
        // Ajustar cuando minutos llegan a 60
        if (minutos === 60) {
            return `${horas + 1}:00`;
        }
        
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    };

    // Convertir minutos a formato "HH:MM"
    const minutesToHourMinute = (minutos) => {
        if (!minutos || minutos === 0) return '—';
        
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // Formatear horas extras a "Xh Ymin"
    const formatearHorasExtras = (horasDecimal) => {
        if (!horasDecimal || horasDecimal === 0) return '—';
        
        const horasNum = parseFloat(horasDecimal);
        const horas = Math.floor(horasNum);
        const minutos = Math.round((horasNum - horas) * 60);
        
        if (horas > 0 && minutos > 0) {
            return `${horas}h ${minutos}min`;
        } else if (horas > 0) {
            return `${horas}h`;
        } else {
            return `${minutos}min`;
        }
    };

    // Formatear tardanza a texto legible
    const formatearTardanza = (minutos, esTardanza) => {
        if (!esTardanza) return 'Puntual';
        if (!minutos || minutos === 0) return 'Puntual';
        
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        
        if (horas > 0 && mins > 0) return `${horas}h ${mins}min`;
        if (horas > 0) return `${horas}h`;
        return `${mins}min`;
    };

    const registrarAsistencia = async () => {
        if (!nuevoRegistro.empId || !nuevoRegistro.horaEntrada) {
            alert('❌ Complete los campos requeridos');
            return;
        }
        setRegistrando(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/asistencia/registro-manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...nuevoRegistro, 
                    empId: parseInt(nuevoRegistro.empId), 
                    metodoValidacion: 'manual' 
                })
            });
            const data = await res.json();
            if (res.ok) {
                let mensaje = `✅ ${data.message}`;
                if (data.data?.horasExtras > 0) {
                    mensaje += `\n📊 Horas extras: ${formatearHorasExtras(data.data.horasExtras)}`;
                }
                if (data.data?.horasTrabajadas > 0) {
                    mensaje += `\n⏱️ Horas trabajadas: ${decimalToHourMinute(data.data.horasTrabajadas)}`;
                }
                if (data.data?.esTardanza) {
                    mensaje += `\n⚠️ Tardanza: ${formatearTardanza(data.data.minutosTardanza, true)}`;
                }
                alert(mensaje);
                setMostrarFormulario(false);
                setNuevoRegistro({ 
                    empId: '', fecha: new Date().toISOString().split('T')[0],
                    horaEntrada: '', horaSalidaAlmuerzo: '', horaRegresoAlmuerzo: '', horaSalida: '', observaciones: '' 
                });
                cargarReporte();
            } else {
                alert(`❌ ${data.message}`);
            }
        } catch (error) {
            alert('❌ Error al conectar con el servidor');
        } finally {
            setRegistrando(false);
        }
    };

    const abrirModalEdicion = async (registro) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/asistencia/registro/${registro.AsistenciaID}`);
            const data = await res.json();
            if (data.success) {
                setEditandoRegistro(data.data);
                setMostrarModalEdicion(true);
            }
        } catch (error) {
            alert('Error al cargar el registro');
        }
    };

    const guardarEdicion = async () => {
        if (!editandoRegistro) return;
        setRegistrando(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/asistencia/registro/${editandoRegistro.AsistenciaID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    horaEntrada: editandoRegistro.HoraEntrada?.substring(0,5) || '',
                    horaSalidaAlmuerzo: editandoRegistro.HoraSalidaAlmuerzo?.substring(0,5) || '',
                    horaRegresoAlmuerzo: editandoRegistro.HoraRegresoAlmuerzo?.substring(0,5) || '',
                    horaSalida: editandoRegistro.HoraSalida?.substring(0,5) || '',
                    observaciones: editandoRegistro.Observaciones || ''
                })
            });
            const data = await res.json();
            if (res.ok) {
                let mensaje = `✅ ${data.message}`;
                if (data.data?.horasExtras > 0) {
                    mensaje += `\n📊 Horas extras: ${formatearHorasExtras(data.data.horasExtras)}`;
                }
                alert(mensaje);
                setMostrarModalEdicion(false);
                setEditandoRegistro(null);
                cargarReporte();
            } else {
                alert(`❌ ${data.message}`);
            }
        } catch (error) {
            alert('Error al actualizar');
        } finally {
            setRegistrando(false);
        }
    };

    const exportarExcel = () => {
        const headers = ['Fecha', 'Empleado', 'Documento', 'Entrada', 'Salida Alm.', 'Regreso Alm.', 'Salida', 'Horas Trab.', 'Horas Extras', 'Estado', 'Tardanza'];
        const rows = registros.map(r => [
            new Date(r.Fecha).toLocaleDateString('es-PE'),
            `${r.Nombres} ${r.Apellidos}`, r.DocID,
            r.HoraEntrada?.substring(0,5) || '—', r.HoraSalidaAlmuerzo?.substring(0,5) || '—',
            r.HoraRegresoAlmuerzo?.substring(0,5) || '—', r.HoraSalida?.substring(0,5) || '—',
            decimalToHourMinute(r.HorasTrabajadas), formatearHorasExtras(r.HorasExtras), 
            r.Estado || '—', formatearTardanza(r.MinutosTardanza, r.EsTardanza)
        ]);
        const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${fechaInicio}_${fechaFin}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getEstadoColor = (estado, esTardanza) => {
        if (esTardanza) return 'bg-orange-100 text-orange-800';
        if (estado === 'Completo') return 'bg-green-100 text-green-800';
        if (estado === 'Incompleto') return 'bg-yellow-100 text-yellow-800';
        if (estado === 'Ausente') return 'bg-red-100 text-red-800';
        return 'bg-gray-100';
    };

    const totalPaginas = Math.ceil(registros.length / itemsPorPagina);
    const startIndex = (paginaActual - 1) * itemsPorPagina;
    const registrosPagina = registros.slice(startIndex, startIndex + itemsPorPagina);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Panel de Asistencia</h1>
                        <p className="text-gray-500 text-sm">Control de horas extras y tardanzas</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setMostrarFormulario(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Registrar
                        </button>
                        <button onClick={exportarExcel} disabled={!registros.length} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50">
                            <Download className="w-4 h-4" /> Exportar
                        </button>
                    </div>
                </div>

                {/* Modal Registrar */}
                {mostrarFormulario && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Registrar Asistencia</h2>
                                <button onClick={() => setMostrarFormulario(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <select value={nuevoRegistro.empId} onChange={e => setNuevoRegistro({...nuevoRegistro, empId: e.target.value})} className="w-full p-2 border rounded">
                                    <option value="">Seleccionar empleado</option>
                                    {empleados.map(e => <option key={e.EmpId} value={e.EmpId}>{e.Nombres} {e.Apellidos}</option>)}
                                </select>
                                <input type="date" value={nuevoRegistro.fecha} onChange={e => setNuevoRegistro({...nuevoRegistro, fecha: e.target.value})} className="w-full p-2 border rounded" />
                                <input type="time" value={nuevoRegistro.horaEntrada} onChange={e => setNuevoRegistro({...nuevoRegistro, horaEntrada: e.target.value})} className="w-full p-2 border rounded" placeholder="Hora Entrada" />
                                <input type="time" value={nuevoRegistro.horaSalidaAlmuerzo} onChange={e => setNuevoRegistro({...nuevoRegistro, horaSalidaAlmuerzo: e.target.value})} className="w-full p-2 border rounded" placeholder="Salida Almuerzo" />
                                <input type="time" value={nuevoRegistro.horaRegresoAlmuerzo} onChange={e => setNuevoRegistro({...nuevoRegistro, horaRegresoAlmuerzo: e.target.value})} className="w-full p-2 border rounded" placeholder="Regreso Almuerzo" />
                                <input type="time" value={nuevoRegistro.horaSalida} onChange={e => setNuevoRegistro({...nuevoRegistro, horaSalida: e.target.value})} className="w-full p-2 border rounded" placeholder="Hora Salida" />
                                <textarea value={nuevoRegistro.observaciones} onChange={e => setNuevoRegistro({...nuevoRegistro, observaciones: e.target.value})} className="w-full p-2 border rounded" rows="2" placeholder="Observaciones"></textarea>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button onClick={registrarAsistencia} disabled={registrando} className="flex-1 bg-blue-600 text-white py-2 rounded">Guardar</button>
                                <button onClick={() => setMostrarFormulario(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Edición */}
                {mostrarModalEdicion && editandoRegistro && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Editar Asistencia</h2>
                                <button onClick={() => setMostrarModalEdicion(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-2 rounded">
                                    <p className="font-medium">{editandoRegistro.Nombres} {editandoRegistro.Apellidos}</p>
                                    <p className="text-xs text-gray-500">{new Date(editandoRegistro.Fecha).toLocaleDateString('es-PE')}</p>
                                </div>
                                <input type="time" value={editandoRegistro.HoraEntrada?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraEntrada: e.target.value})} className="w-full p-2 border rounded" />
                                <input type="time" value={editandoRegistro.HoraSalidaAlmuerzo?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraSalidaAlmuerzo: e.target.value})} className="w-full p-2 border rounded" />
                                <input type="time" value={editandoRegistro.HoraRegresoAlmuerzo?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraRegresoAlmuerzo: e.target.value})} className="w-full p-2 border rounded" />
                                <input type="time" value={editandoRegistro.HoraSalida?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraSalida: e.target.value})} className="w-full p-2 border rounded" />
                                <textarea value={editandoRegistro.Observaciones || ''} onChange={e => setEditandoRegistro({...editandoRegistro, Observaciones: e.target.value})} className="w-full p-2 border rounded" rows="2" placeholder="Observaciones"></textarea>
                                {editandoRegistro.HorasExtras > 0 && (
                                    <div className="bg-purple-50 p-2 rounded text-xs text-purple-600">
                                        ⏱️ Horas extras: {formatearHorasExtras(editandoRegistro.HorasExtras)}
                                    </div>
                                )}
                                {editandoRegistro.EsTardanza === 1 && (
                                    <div className="bg-orange-50 p-2 rounded text-xs text-orange-600">
                                        ⚠️ Tardanza: {formatearTardanza(editandoRegistro.MinutosTardanza, true)}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button onClick={guardarEdicion} disabled={registrando} className="flex-1 bg-blue-600 text-white py-2 rounded">Guardar</button>
                                <button onClick={() => setMostrarModalEdicion(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="p-2 border rounded" />
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="p-2 border rounded" />
                        <select value={empleadoFiltro} onChange={e => setEmpleadoFiltro(e.target.value)} className="p-2 border rounded">
                            <option value="">Todos los empleados</option>
                            {empleados.map(e => <option key={e.EmpId} value={e.EmpId}>{e.Nombres} {e.Apellidos}</option>)}
                        </select>
                        <select value={horarioFiltro} onChange={e => setHorarioFiltro(e.target.value)} className="p-2 border rounded">
                            <option value="">Todos los horarios</option>
                            {horarios.map(h => <option key={h.HorarioId} value={h.HorarioId}>{h.Nombre}</option>)}
                        </select>
                        <button onClick={cargarReporte} className="bg-blue-600 text-white py-2 rounded">Buscar</button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
                    <div className="bg-blue-500 rounded-lg p-3 text-white text-center">
                        <p className="text-xs">Total</p>
                        <p className="text-xl font-bold">{estadisticas.total}</p>
                    </div>
                    <div className="bg-green-500 rounded-lg p-3 text-white text-center">
                        <p className="text-xs">Presentes</p>
                        <p className="text-xl font-bold">{estadisticas.presentes}</p>
                    </div>
                    <div className="bg-orange-500 rounded-lg p-3 text-white text-center">
                        <p className="text-xs">Tardanzas</p>
                        <p className="text-xl font-bold">{estadisticas.tardanzas}</p>
                        <p className="text-xs">{estadisticas.porcentajeTardanzas}%</p>
                    </div>
                    <div className="bg-yellow-500 rounded-lg p-3 text-white text-center">
                        <p className="text-xs">Min Tardanza</p>
                        <p className="text-xl font-bold">{estadisticas.minutosTardanzaPromedio}</p>
                    </div>
                    <div className="bg-red-500 rounded-lg p-3 text-white text-center">
                        <p className="text-xs">Ausentes</p>
                        <p className="text-xl font-bold">{estadisticas.ausentes}</p>
                    </div>
                    <div className="bg-purple-500 rounded-lg p-3 text-white text-center">
                        <p className="text-xs">Horas Extras</p>
                        <p className="text-xl font-bold">{estadisticas.horasExtras}</p>
                    </div>
                    <div className="bg-indigo-500 rounded-lg p-3 text-white text-center">
                        <p className="text-xs">Empleados HE</p>
                        <p className="text-xl font-bold">{estadisticas.empleadosConHorasExtras}</p>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {cargando ? (
                        <div className="text-center py-10">Cargando...</div>
                    ) : registros.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No hay registros</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left">Fecha</th>
                                            <th className="p-3 text-left">Empleado</th>
                                            <th className="p-3 text-left">Entrada</th>
                                            <th className="p-3 text-left">Salida Alm.</th>
                                            <th className="p-3 text-left">Regreso Alm.</th>
                                            <th className="p-3 text-left">Salida</th>
                                            <th className="p-3 text-left">Horas Trab.</th>
                                            <th className="p-3 text-left">HE</th>
                                            <th className="p-3 text-left">Estado</th>
                                            <th className="p-3 text-left">Tardanza</th>
                                            <th className="p-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {registrosPagina.map((r, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="p-3">{new Date(r.Fecha).toLocaleDateString('es-PE')}</td>
                                                <td className="p-3">
                                                    <div className="font-medium">{r.Nombres} {r.Apellidos}</div>
                                                    <div className="text-xs text-gray-500">{r.DocID}</div>
                                                </td>
                                                <td className="p-3 font-mono">{r.HoraEntrada?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono">{r.HoraSalidaAlmuerzo?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono">{r.HoraRegresoAlmuerzo?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono">{r.HoraSalida?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono">
                                                    {r.HorasTrabajadas ? decimalToHourMinute(r.HorasTrabajadas) : '—'}
                                                </td>
                                                <td className="p-3 text-purple-600 font-medium">
                                                    {formatearHorasExtras(r.HorasExtras)}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(r.Estado, r.EsTardanza)}`}>
                                                        {r.EsTardanza ? 'Tardanza' : r.Estado || '—'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {formatearTardanza(r.MinutosTardanza, r.EsTardanza)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => abrirModalEdicion(r)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPaginas > 1 && (
                                <div className="flex justify-center gap-2 p-4 border-t">
                                    <button onClick={() => setPaginaActual(p => Math.max(1, p-1))} disabled={paginaActual === 1} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 py-1">Pág {paginaActual} de {totalPaginas}</span>
                                    <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p+1))} disabled={paginaActual === totalPaginas} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PanelAsistencia;