import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';
import {
    Calendar, Users, Clock, Download, Search, Filter, ChevronLeft, ChevronRight,
    MapPin, Wifi, Smartphone, AlertCircle, CheckCircle, XCircle, Menu, X,
    TrendingUp, Sun, Moon, Plus, Save, User, Coffee, Zap, Timer, Award, Edit
} from 'lucide-react';

const PanelAsistencia = () => {
    // Obtener fecha actual en la zona horaria local (Perú)
    const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [fechaInicio, setFechaInicio] = useState(getLocalDate());
    const [fechaFin, setFechaFin] = useState(getLocalDate());
    const [registros, setRegistros] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [empleadoFiltro, setEmpleadoFiltro] = useState('');
    const [horarioFiltro, setHorarioFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(10);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [registrando, setRegistrando] = useState(false);
    const [editandoRegistro, setEditandoRegistro] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarFiltrosMovil, setMostrarFiltrosMovil] = useState(false);
    const [modoVista, setModoVista] = useState('tabla');
    
    const [estadisticas, setEstadisticas] = useState({
        total: 0, presentes: 0, ausentes: 0, tardanzas: 0,
        horasPromedio: 0, minutosTardanzaPromedio: 0, porcentajeTardanzas: 0,
        horasExtras: '0h 0min', empleadosConHorasExtras: 0
    });

    const [nuevoRegistro, setNuevoRegistro] = useState({
        empId: '', fecha: getLocalDate(),
        horaEntrada: '', horaSalidaAlmuerzo: '', horaRegresoAlmuerzo: '', horaSalida: '', observaciones: ''
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Función para convertir horas decimales a formato "Xh Ymin"
    const decimalToHourMinuteString = (horasDecimal) => {
        if (!horasDecimal || horasDecimal === 0) return '0h 0min';
        
        const horas = Math.floor(horasDecimal);
        const minutos = Math.round((horasDecimal - horas) * 60);
        
        if (horas === 0 && minutos === 0) return '0h 0min';
        if (horas === 0) return `${minutos}min`;
        if (minutos === 0) return `${horas}h`;
        return `${horas}h ${minutos}min`;
    };

    // Función para sumar horas decimales y devolver formato legible
    const sumarHorasExtras = (registrosData) => {
        let totalHorasDecimal = 0;
        
        registrosData.forEach(registro => {
            const horasExtras = parseFloat(registro.HorasExtras);
            if (!isNaN(horasExtras) && horasExtras > 0) {
                totalHorasDecimal += horasExtras;
            }
        });
        
        return decimalToHourMinuteString(totalHorasDecimal);
    };

    // Función para calcular el total de horas extras en minutos
    const sumarHorasExtrasEnMinutos = (registrosData) => {
        let totalMinutos = 0;
        
        registrosData.forEach(registro => {
            const horasExtras = parseFloat(registro.HorasExtras);
            if (!isNaN(horasExtras) && horasExtras > 0) {
                totalMinutos += Math.round(horasExtras * 60);
            }
        });
        
        return totalMinutos;
    };

    // Función para formatear horas decimales a "HH:MM"
    const decimalToHourMinute = (horasDecimal) => {
        if (!horasDecimal || horasDecimal === 0) return '—';
        const horas = Math.floor(horasDecimal);
        const minutos = Math.round((horasDecimal - horas) * 60);
        if (minutos === 60) return `${horas + 1}:00`;
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    };

    // Función para formatear horas extras individuales
    const formatearHorasExtrasIndividual = (horasDecimal) => {
        if (!horasDecimal || horasDecimal === 0) return '—';
        const horasNum = parseFloat(horasDecimal);
        const horas = Math.floor(horasNum);
        const minutos = Math.round((horasNum - horas) * 60);
        if (horas > 0 && minutos > 0) return `${horas}h ${minutos}min`;
        if (horas > 0) return `${horas}h`;
        if (minutos > 0) return `${minutos}min`;
        return '—';
    };

    const formatearTardanza = (minutos, esTardanza) => {
        if (!esTardanza) return 'Puntual';
        if (!minutos || minutos === 0) return 'Puntual';
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        if (horas > 0 && mins > 0) return `${horas}h ${mins}min`;
        if (horas > 0) return `${horas}h`;
        return `${mins}min`;
    };

    // Función para formatear fecha local a YYYY-MM-DD sin desfase UTC
    const formatLocalDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Función para mostrar fecha en formato legible local
    const formatDisplayDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Función para enviar fecha al backend en formato correcto
    const formatDateForBackend = (dateString) => {
        if (!dateString) return '';
        return dateString;
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
            if (window.innerWidth < 640) {
                setItemsPorPagina(5);
            } else if (window.innerWidth < 1024) {
                setItemsPorPagina(8);
            } else {
                setItemsPorPagina(10);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            const inicio = formatDateForBackend(fechaInicio);
            const fin = formatDateForBackend(fechaFin);
            
            let url = `${BACKEND_URL}/api/reportes/asistencia?fecha_inicio=${inicio}&fecha_fin=${fin}`;
            if (empleadoFiltro) url += `&empId=${empleadoFiltro}`;
            if (horarioFiltro) url += `&horario_id=${horarioFiltro}`;
            const res = await fetch(url);
            const data = await res.json();
            
            const registrosProcesados = data.map(registro => ({
                ...registro,
                Fecha: formatLocalDate(registro.Fecha)
            }));
            
            setRegistros(registrosProcesados);
            calcularEstadisticas(registrosProcesados);
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
        
        // Calcular total de horas extras correctamente
        const totalHorasExtrasDecimal = data.reduce((s, r) => s + (parseFloat(r.HorasExtras) || 0), 0);
        const horasExtrasFormateadas = decimalToHourMinuteString(totalHorasExtrasDecimal);
        
        setEstadisticas({
            total, presentes, ausentes, tardanzas,
            horasPromedio: presentes > 0 ? (horasTotales / presentes).toFixed(2) : 0,
            minutosTardanzaPromedio: tardanzas > 0 ? (minutosTardanzaTotal / tardanzas).toFixed(0) : 0,
            porcentajeTardanzas: total > 0 ? ((tardanzas / total) * 100).toFixed(1) : 0,
            horasExtras: horasExtrasFormateadas,
            empleadosConHorasExtras: new Set(data.filter(r => parseFloat(r.HorasExtras) > 0).map(r => r.EmpId)).size
        });
    };

    const registrarAsistencia = async () => {
        if (!nuevoRegistro.empId || !nuevoRegistro.horaEntrada) {
            alert('❌ Complete los campos requeridos');
            return;
        }
        setRegistrando(true);
        try {
            const fechaEnvio = formatDateForBackend(nuevoRegistro.fecha);
            
            const res = await fetch(`${BACKEND_URL}/api/asistencia/registro-manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...nuevoRegistro, 
                    fecha: fechaEnvio,
                    empId: parseInt(nuevoRegistro.empId), 
                    metodoValidacion: 'manual' 
                })
            });
            const data = await res.json();
            if (res.ok) {
                let mensaje = `✅ ${data.message}`;
                if (data.data?.horasExtras > 0) {
                    mensaje += `\n📊 Horas extras: ${decimalToHourMinuteString(data.data.horasExtras)}`;
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
                    empId: '', fecha: getLocalDate(),
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
                const registroData = {
                    ...data.data,
                    Fecha: formatLocalDate(data.data.Fecha)
                };
                setEditandoRegistro(registroData);
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
                    mensaje += `\n📊 Horas extras: ${decimalToHourMinuteString(data.data.horasExtras)}`;
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
            formatDisplayDate(r.Fecha),
            `${r.Nombres} ${r.Apellidos}`, r.DocID,
            r.HoraEntrada?.substring(0,5) || '—', r.HoraSalidaAlmuerzo?.substring(0,5) || '—',
            r.HoraRegresoAlmuerzo?.substring(0,5) || '—', r.HoraSalida?.substring(0,5) || '—',
            decimalToHourMinute(r.HorasTrabajadas), formatearHorasExtrasIndividual(r.HorasExtras), 
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

    const getEstadoIcono = (estado, esTardanza) => {
        if (esTardanza) return <AlertCircle className="w-4 h-4" />;
        if (estado === 'Completo') return <CheckCircle className="w-4 h-4" />;
        if (estado === 'Ausente') return <XCircle className="w-4 h-4" />;
        return null;
    };

    const totalPaginas = Math.ceil(registros.length / itemsPorPagina);
    const startIndex = (paginaActual - 1) * itemsPorPagina;
    const registrosPagina = registros.slice(startIndex, startIndex + itemsPorPagina);

    const TarjetaRegistro = ({ registro }) => (
        <div className="bg-white rounded-lg shadow-md p-4 mb-3 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{registro.Nombres} {registro.Apellidos}</h3>
                    <p className="text-xs text-gray-500">{registro.DocID}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDisplayDate(registro.Fecha)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getEstadoColor(registro.Estado, registro.EsTardanza)}`}>
                        {getEstadoIcono(registro.Estado, registro.EsTardanza)}
                        {registro.EsTardanza ? 'Tardanza' : registro.Estado || '—'}
                    </span>
                    <button onClick={() => abrirModalEdicion(registro)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Entrada</p>
                    <p className="font-mono font-medium">{registro.HoraEntrada?.substring(0,5) || '—'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Salida Alm.</p>
                    <p className="font-mono font-medium">{registro.HoraSalidaAlmuerzo?.substring(0,5) || '—'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Regreso Alm.</p>
                    <p className="font-mono font-medium">{registro.HoraRegresoAlmuerzo?.substring(0,5) || '—'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Salida</p>
                    <p className="font-mono font-medium">{registro.HoraSalida?.substring(0,5) || '—'}</p>
                </div>
            </div>
            
            <div className="flex justify-between mt-3 pt-2 border-t">
                <div>
                    <p className="text-xs text-gray-500">Horas Trab.</p>
                    <p className="text-sm font-medium">{decimalToHourMinute(registro.HorasTrabajadas)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Horas Extras</p>
                    <p className="text-sm font-medium text-purple-600">{formatearHorasExtrasIndividual(registro.HorasExtras)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Tardanza</p>
                    <p className="text-sm font-medium">{formatearTardanza(registro.MinutosTardanza, registro.EsTardanza)}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
                {/* Header */}
                <div className="text-center sm:text-left sm:flex sm:justify-between sm:items-center mb-6">
                    <div className="mb-3 sm:mb-0">
                        <h1 className="text-xl sm:text-2xl font-bold">Panel de Asistencia</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Control de horas extras y tardanzas</p>
                    </div>
                    <div className="flex justify-center gap-2">
                        <button 
                            onClick={() => setModoVista(modoVista === 'tabla' ? 'tarjetas' : 'tabla')}
                            className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                        >
                            {modoVista === 'tabla' ? '📱 Vista Móvil' : '📊 Vista Tabla'}
                        </button>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-center gap-3 mb-6">
                    <button 
                        onClick={() => setMostrarFormulario(true)} 
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus className="w-4 h-4" /> 
                        <span className="text-sm font-medium">Registrar</span>
                    </button>
                    <button 
                        onClick={exportarExcel} 
                        disabled={!registros.length} 
                        className="bg-green-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> 
                        <span className="text-sm font-medium">Exportar</span>
                    </button>
                </div>

                {/* Botón filtros móvil */}
                {isMobile && (
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={() => setMostrarFiltrosMovil(!mostrarFiltrosMovil)}
                            className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">{mostrarFiltrosMovil ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                        </button>
                    </div>
                )}

                {/* Filtros */}
                <div className={`bg-white rounded-lg shadow p-4 mb-6 ${isMobile && !mostrarFiltrosMovil ? 'hidden' : ''}`}>
                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-3">
                        <input 
                            type="date" 
                            value={fechaInicio} 
                            onChange={e => setFechaInicio(e.target.value)} 
                            className="w-full p-2 border rounded text-sm"
                        />
                        <input 
                            type="date" 
                            value={fechaFin} 
                            onChange={e => setFechaFin(e.target.value)} 
                            className="w-full p-2 border rounded text-sm"
                        />
                        <select 
                            value={empleadoFiltro} 
                            onChange={e => setEmpleadoFiltro(e.target.value)} 
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="">Todos los empleados</option>
                            {empleados.map(e => <option key={e.EmpId} value={e.EmpId}>{e.Nombres} {e.Apellidos}</option>)}
                        </select>
                        <select 
                            value={horarioFiltro} 
                            onChange={e => setHorarioFiltro(e.target.value)} 
                            className="w-full p-2 border rounded text-sm"
                        >
                            <option value="">Todos los horarios</option>
                            {horarios.map(h => <option key={h.HorarioId} value={h.HorarioId}>{h.Nombre}</option>)}
                        </select>
                        <button 
                            onClick={cargarReporte} 
                            className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition"
                        >
                            Buscar
                        </button>
                    </div>
                </div>

                {/* Estadísticas - Ahora con horas extras formateadas correctamente */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 mb-6">
                    <div className="bg-blue-500 rounded-lg p-3 text-white text-center shadow-sm">
                        <p className="text-xs sm:text-sm">Total</p>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.total}</p>
                    </div>
                    <div className="bg-green-500 rounded-lg p-3 text-white text-center shadow-sm">
                        <p className="text-xs sm:text-sm">Presentes</p>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.presentes}</p>
                    </div>
                    <div className="bg-orange-500 rounded-lg p-3 text-white text-center shadow-sm">
                        <p className="text-xs sm:text-sm">Tardanzas</p>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.tardanzas}</p>
                        <p className="text-xs">{estadisticas.porcentajeTardanzas}%</p>
                    </div>
                    <div className="bg-yellow-500 rounded-lg p-3 text-white text-center shadow-sm">
                        <p className="text-xs sm:text-sm">Min Prom</p>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.minutosTardanzaPromedio}</p>
                    </div>
                    <div className="bg-red-500 rounded-lg p-3 text-white text-center shadow-sm">
                        <p className="text-xs sm:text-sm">Ausentes</p>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.ausentes}</p>
                    </div>
                    <div className="bg-purple-500 rounded-lg p-3 text-white text-center shadow-sm">
                        <p className="text-xs sm:text-sm">Horas Extras</p>
                        <p className="text-lg sm:text-xl font-bold">{estadisticas.horasExtras}</p>
                    </div>
                    <div className="bg-indigo-500 rounded-lg p-3 text-white text-center shadow-sm">
                        <p className="text-xs sm:text-sm">Empleados HE</p>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.empleadosConHorasExtras}</p>
                    </div>
                </div>

                {/* Tabla/Vista de registros */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {cargando ? (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500">Cargando...</p>
                        </div>
                    ) : registros.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No hay registros</p>
                        </div>
                    ) : modoVista === 'tabla' && !isMobile ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left text-xs sm:text-sm">Fecha</th>
                                            <th className="p-3 text-left text-xs sm:text-sm">Empleado</th>
                                            <th className="p-3 text-left text-xs sm:text-sm hidden md:table-cell">Entrada</th>
                                            <th className="p-3 text-left text-xs sm:text-sm hidden lg:table-cell">Salida Alm.</th>
                                            <th className="p-3 text-left text-xs sm:text-sm hidden lg:table-cell">Regreso Alm.</th>
                                            <th className="p-3 text-left text-xs sm:text-sm">Salida</th>
                                            <th className="p-3 text-left text-xs sm:text-sm">Horas Trab.</th>
                                            <th className="p-3 text-left text-xs sm:text-sm">HE</th>
                                            <th className="p-3 text-left text-xs sm:text-sm">Estado</th>
                                            <th className="p-3 text-left text-xs sm:text-sm hidden md:table-cell">Tardanza</th>
                                            <th className="p-3 text-center text-xs sm:text-sm">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {registrosPagina.map((r, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="p-3 text-xs sm:text-sm">{formatDisplayDate(r.Fecha)}</td>
                                                <td className="p-3">
                                                    <div className="font-medium text-xs sm:text-sm">{r.Nombres} {r.Apellidos}</div>
                                                    <div className="text-xs text-gray-500">{r.DocID}</div>
                                                </td>
                                                <td className="p-3 font-mono text-xs sm:text-sm hidden md:table-cell">{r.HoraEntrada?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono text-xs sm:text-sm hidden lg:table-cell">{r.HoraSalidaAlmuerzo?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono text-xs sm:text-sm hidden lg:table-cell">{r.HoraRegresoAlmuerzo?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono text-xs sm:text-sm">{r.HoraSalida?.substring(0,5) || '—'}</td>
                                                <td className="p-3 font-mono text-xs sm:text-sm">
                                                    {r.HorasTrabajadas ? decimalToHourMinute(r.HorasTrabajadas) : '—'}
                                                </td>
                                                <td className="p-3 text-purple-600 font-medium text-xs sm:text-sm">
                                                    {formatearHorasExtrasIndividual(r.HorasExtras)}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(r.Estado, r.EsTardanza)}`}>
                                                        {r.EsTardanza ? 'Tardanza' : r.Estado || '—'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs sm:text-sm hidden md:table-cell">
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
                                <div className="flex justify-center items-center gap-2 p-4 border-t">
                                    <button onClick={() => setPaginaActual(p => Math.max(1, p-1))} disabled={paginaActual === 1} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 py-1 text-sm">Pág {paginaActual} de {totalPaginas}</span>
                                    <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p+1))} disabled={paginaActual === totalPaginas} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="p-4">
                                {registrosPagina.map((r, i) => (
                                    <TarjetaRegistro key={i} registro={r} />
                                ))}
                            </div>
                            {totalPaginas > 1 && (
                                <div className="flex justify-center items-center gap-2 p-4 border-t">
                                    <button onClick={() => setPaginaActual(p => Math.max(1, p-1))} disabled={paginaActual === 1} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 py-1 text-sm">Pág {paginaActual} de {totalPaginas}</span>
                                    <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p+1))} disabled={paginaActual === totalPaginas} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Modal Registrar */}
                {mostrarFormulario && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
                                <h2 className="text-lg font-bold">Registrar Asistencia</h2>
                                <button onClick={() => setMostrarFormulario(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 space-y-3">
                                <select 
                                    value={nuevoRegistro.empId} 
                                    onChange={e => setNuevoRegistro({...nuevoRegistro, empId: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                >
                                    <option value="">Seleccionar empleado</option>
                                    {empleados.map(e => <option key={e.EmpId} value={e.EmpId}>{e.Nombres} {e.Apellidos}</option>)}
                                </select>
                                <input 
                                    type="date" 
                                    value={nuevoRegistro.fecha} 
                                    onChange={e => setNuevoRegistro({...nuevoRegistro, fecha: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                />
                                <input 
                                    type="time" 
                                    value={nuevoRegistro.horaEntrada} 
                                    onChange={e => setNuevoRegistro({...nuevoRegistro, horaEntrada: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                    placeholder="Hora Entrada" 
                                />
                                <input 
                                    type="time" 
                                    value={nuevoRegistro.horaSalidaAlmuerzo} 
                                    onChange={e => setNuevoRegistro({...nuevoRegistro, horaSalidaAlmuerzo: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                    placeholder="Salida Almuerzo" 
                                />
                                <input 
                                    type="time" 
                                    value={nuevoRegistro.horaRegresoAlmuerzo} 
                                    onChange={e => setNuevoRegistro({...nuevoRegistro, horaRegresoAlmuerzo: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                    placeholder="Regreso Almuerzo" 
                                />
                                <input 
                                    type="time" 
                                    value={nuevoRegistro.horaSalida} 
                                    onChange={e => setNuevoRegistro({...nuevoRegistro, horaSalida: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                    placeholder="Hora Salida" 
                                />
                                <textarea 
                                    value={nuevoRegistro.observaciones} 
                                    onChange={e => setNuevoRegistro({...nuevoRegistro, observaciones: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                    rows="3" 
                                    placeholder="Observaciones"
                                />
                            </div>
                            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                                <button onClick={registrarAsistencia} disabled={registrando} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                                    Guardar
                                </button>
                                <button onClick={() => setMostrarFormulario(false)} className="flex-1 bg-gray-200 py-2.5 rounded-lg text-sm font-medium">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Edición */}
                {mostrarModalEdicion && editandoRegistro && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
                                <h2 className="text-lg font-bold">Editar Asistencia</h2>
                                <button onClick={() => setMostrarModalEdicion(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-sm">{editandoRegistro.Nombres} {editandoRegistro.Apellidos}</p>
                                    <p className="text-xs text-gray-500">{formatDisplayDate(editandoRegistro.Fecha)}</p>
                                </div>
                                <input 
                                    type="time" 
                                    value={editandoRegistro.HoraEntrada?.substring(0,5) || ''} 
                                    onChange={e => setEditandoRegistro({...editandoRegistro, HoraEntrada: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                />
                                <input 
                                    type="time" 
                                    value={editandoRegistro.HoraSalidaAlmuerzo?.substring(0,5) || ''} 
                                    onChange={e => setEditandoRegistro({...editandoRegistro, HoraSalidaAlmuerzo: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                />
                                <input 
                                    type="time" 
                                    value={editandoRegistro.HoraRegresoAlmuerzo?.substring(0,5) || ''} 
                                    onChange={e => setEditandoRegistro({...editandoRegistro, HoraRegresoAlmuerzo: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                />
                                <input 
                                    type="time" 
                                    value={editandoRegistro.HoraSalida?.substring(0,5) || ''} 
                                    onChange={e => setEditandoRegistro({...editandoRegistro, HoraSalida: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                />
                                <textarea 
                                    value={editandoRegistro.Observaciones || ''} 
                                    onChange={e => setEditandoRegistro({...editandoRegistro, Observaciones: e.target.value})} 
                                    className="w-full p-2.5 border rounded-lg text-sm" 
                                    rows="3" 
                                    placeholder="Observaciones"
                                />
                                {editandoRegistro.HorasExtras > 0 && (
                                    <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-600">
                                        ⏱️ Horas extras: {decimalToHourMinuteString(editandoRegistro.HorasExtras)}
                                    </div>
                                )}
                                {editandoRegistro.EsTardanza === 1 && (
                                    <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-600">
                                        ⚠️ Tardanza: {formatearTardanza(editandoRegistro.MinutosTardanza, true)}
                                    </div>
                                )}
                            </div>
                            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                                <button onClick={guardarEdicion} disabled={registrando} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                                    Guardar
                                </button>
                                <button onClick={() => setMostrarModalEdicion(false)} className="flex-1 bg-gray-200 py-2.5 rounded-lg text-sm font-medium">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanelAsistencia;