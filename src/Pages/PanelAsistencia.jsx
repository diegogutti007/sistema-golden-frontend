import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';
import {
    Calendar, Users, Clock, Download, Search, Filter, ChevronLeft, ChevronRight,
    MapPin, Wifi, Smartphone, AlertCircle, CheckCircle, XCircle, Menu, X,
    TrendingUp, TrendingDown, Sun, Moon, Plus, Save, User, Coffee, Zap, Timer, Award, Edit, Target
} from 'lucide-react';

const PanelAsistencia = () => {
    // Obtener fecha actual en formato YYYY-MM-DD usando la zona horaria local
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
        total: 0,
        totalHorasTrabajadas: '0h',
        totalHorasExtras: '0h',
        horasEsperadas: '0h',
        horasFaltantes: '0h',
        porcentajeCumplimiento: 0,
        diferenciaHoras: '0h',
        diferenciaHorasValor: 0,
        tardanzas: 0,
        ausentes: 0,
        porcentajeTardanzas: 0
    });

    const [nuevoRegistro, setNuevoRegistro] = useState({
        empId: '', fecha: getLocalDate(),
        horaEntrada: '', horaSalidaAlmuerzo: '', horaRegresoAlmuerzo: '', horaSalida: '', observaciones: ''
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Extraer solo la fecha YYYY-MM-DD de cualquier formato ISO
    const extraerFechaYYYYMMDD = (fechaISO) => {
        if (!fechaISO) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return fechaISO;
        const parteFecha = fechaISO.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(parteFecha)) return parteFecha;
        try {
            const date = new Date(fechaISO);
            if (!isNaN(date.getTime())) {
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (e) {
            console.error('Error parseando fecha:', fechaISO);
        }
        return fechaISO;
    };

    const formatDisplayDate = (fechaISO) => {
        if (!fechaISO) return '—';
        const fechaYYYYMMDD = extraerFechaYYYYMMDD(fechaISO);
        const partes = fechaYYYYMMDD.split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return fechaYYYYMMDD;
    };

    // Función para formatear minutos a "Xh Ymin"
    const formatMinutos = (minutos) => {
        if (!minutos || minutos === 0) return '0h';
        const horas = Math.floor(Math.abs(minutos) / 60);
        const mins = Math.abs(minutos) % 60;
        const signo = minutos < 0 ? '-' : '';
        
        if (horas > 0 && mins > 0) return `${signo}${horas}h ${mins}min`;
        if (horas > 0) return `${signo}${horas}h`;
        if (mins > 0) return `${signo}${mins}min`;
        return '0h';
    };

    const decimalToHourMinute = (horasDecimal) => {
        if (!horasDecimal || horasDecimal === 0) return '—';
        const horas = Math.floor(horasDecimal);
        const minutos = Math.round((horasDecimal - horas) * 60);
        if (minutos === 60) return `${horas + 1}:00`;
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    };

    const formatearHorasExtrasIndividual = (horasDecimal) => {
        if (!horasDecimal || horasDecimal === 0) return '—';
        const minutos = Math.round(horasDecimal * 60);
        return formatMinutos(minutos);
    };

    const formatearTardanza = (minutos, esTardanza) => {
        if (!esTardanza) return 'Puntual';
        if (!minutos || minutos === 0) return 'Puntual';
        return formatMinutos(minutos);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
            setItemsPorPagina(window.innerWidth < 640 ? 5 : window.innerWidth < 1024 ? 8 : 10);
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
            let url = `${BACKEND_URL}/api/reportes/asistencia?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            if (empleadoFiltro) url += `&empId=${empleadoFiltro}`;
            if (horarioFiltro) url += `&horario_id=${horarioFiltro}`;
            const res = await fetch(url);
            const data = await res.json();
            const registrosProcesados = data.map(registro => ({ ...registro, Fecha: extraerFechaYYYYMMDD(registro.Fecha) }));
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
        const tardanzas = data.filter(r => r.EsTardanza === 1).length;
        const ausentes = data.filter(r => r.Estado === 'Ausente').length;
        const registrosConHoras = data.filter(r => r.HorasTrabajadas > 0);
        
        // Calcular total de minutos trabajados
        const totalMinutosTrabajados = registrosConHoras.reduce((s, r) => s + (parseFloat(r.HorasTrabajadas) * 60), 0);
        
        // Calcular total de minutos extras
        const totalMinutosExtras = registrosConHoras.reduce((s, r) => s + (parseFloat(r.HorasExtras) * 60), 0);
        
        // Días con horas
        const diasConHoras = registrosConHoras.length;
        const minutosEsperados = diasConHoras * 8 * 60;
        
        // Minutos faltantes
        const minutosFaltantes = Math.max(0, minutosEsperados - totalMinutosTrabajados);
        
        // Porcentaje de cumplimiento
        const porcentajeCumplimiento = minutosEsperados > 0 ? (totalMinutosTrabajados / minutosEsperados) * 100 : 0;
        
        // Diferencia (total trabajado - esperado)
        const diferenciaMinutos = totalMinutosTrabajados - minutosEsperados;
        
        const porcentajeTardanzas = total > 0 ? ((tardanzas / total) * 100).toFixed(1) : 0;
        
        setEstadisticas({
            total,
            totalHorasTrabajadas: formatMinutos(totalMinutosTrabajados),
            totalHorasExtras: formatMinutos(totalMinutosExtras),
            horasEsperadas: formatMinutos(minutosEsperados),
            horasFaltantes: formatMinutos(minutosFaltantes),
            porcentajeCumplimiento: porcentajeCumplimiento.toFixed(1),
            diferenciaHoras: formatMinutos(diferenciaMinutos),
            diferenciaHorasValor: diferenciaMinutos,
            tardanzas,
            ausentes,
            porcentajeTardanzas
        });
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
                body: JSON.stringify({ ...nuevoRegistro, empId: parseInt(nuevoRegistro.empId), metodoValidacion: 'manual' })
            });
            const data = await res.json();
            if (res.ok) {
                let mensaje = `✅ ${data.message}`;
                if (data.data?.horasExtras > 0) mensaje += `\n📊 Horas extras: ${formatMinutos(Math.round(data.data.horasExtras * 60))}`;
                if (data.data?.horasTrabajadas > 0) mensaje += `\n⏱️ Horas trabajadas: ${decimalToHourMinute(data.data.horasTrabajadas)}`;
                if (data.data?.esTardanza) mensaje += `\n⚠️ Tardanza: ${formatearTardanza(data.data.minutosTardanza, true)}`;
                alert(mensaje);
                setMostrarFormulario(false);
                setNuevoRegistro({ empId: '', fecha: getLocalDate(), horaEntrada: '', horaSalidaAlmuerzo: '', horaRegresoAlmuerzo: '', horaSalida: '', observaciones: '' });
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
                setEditandoRegistro({ ...data.data, Fecha: extraerFechaYYYYMMDD(data.data.Fecha) });
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
                if (data.data?.horasExtras > 0) mensaje += `\n📊 Horas extras: ${formatMinutos(Math.round(data.data.horasExtras * 60))}`;
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
            formatDisplayDate(r.Fecha), `${r.Nombres} ${r.Apellidos}`, r.DocID,
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
                <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Entrada</p><p className="font-mono font-medium">{registro.HoraEntrada?.substring(0,5) || '—'}</p></div>
                <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Salida Alm.</p><p className="font-mono font-medium">{registro.HoraSalidaAlmuerzo?.substring(0,5) || '—'}</p></div>
                <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Regreso Alm.</p><p className="font-mono font-medium">{registro.HoraRegresoAlmuerzo?.substring(0,5) || '—'}</p></div>
                <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Salida</p><p className="font-mono font-medium">{registro.HoraSalida?.substring(0,5) || '—'}</p></div>
            </div>
            <div className="flex justify-between mt-3 pt-2 border-t">
                <div><p className="text-xs text-gray-500">Horas Trab.</p><p className="text-sm font-medium">{decimalToHourMinute(registro.HorasTrabajadas)}</p></div>
                <div><p className="text-xs text-gray-500">Horas Extras</p><p className="text-sm font-medium text-purple-600">{formatearHorasExtrasIndividual(registro.HorasExtras)}</p></div>
                <div><p className="text-xs text-gray-500">Tardanza</p><p className="text-sm font-medium">{formatearTardanza(registro.MinutosTardanza, registro.EsTardanza)}</p></div>
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
                        <p className="text-gray-500 text-xs sm:text-sm">Control de horas extras y cumplimiento laboral</p>
                    </div>
                    <div className="flex justify-center gap-2">
                        <button onClick={() => setModoVista(modoVista === 'tabla' ? 'tarjetas' : 'tabla')} className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                            {modoVista === 'tabla' ? '📱 Vista Móvil' : '📊 Vista Tabla'}
                        </button>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-center gap-3 mb-6">
                    <button onClick={() => setMostrarFormulario(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                        <Plus className="w-4 h-4" /> <span className="text-sm font-medium">Registrar</span>
                    </button>
                    <button onClick={exportarExcel} disabled={!registros.length} className="bg-green-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                        <Download className="w-4 h-4" /> <span className="text-sm font-medium">Exportar</span>
                    </button>
                </div>

                {/* Botón filtros móvil */}
                {isMobile && (
                    <div className="flex justify-center mb-4">
                        <button onClick={() => setMostrarFiltrosMovil(!mostrarFiltrosMovil)} className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">{mostrarFiltrosMovil ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                        </button>
                    </div>
                )}

                {/* Filtros */}
                <div className={`bg-white rounded-lg shadow p-4 mb-6 ${isMobile && !mostrarFiltrosMovil ? 'hidden' : ''}`}>
                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-3">
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full p-2 border rounded text-sm" />
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full p-2 border rounded text-sm" />
                        <select value={empleadoFiltro} onChange={e => setEmpleadoFiltro(e.target.value)} className="w-full p-2 border rounded text-sm">
                            <option value="">Todos los empleados</option>
                            {empleados.map(e => <option key={e.EmpId} value={e.EmpId}>{e.Nombres} {e.Apellidos}</option>)}
                        </select>
                        <select value={horarioFiltro} onChange={e => setHorarioFiltro(e.target.value)} className="w-full p-2 border rounded text-sm">
                            <option value="">Todos los horarios</option>
                            {horarios.map(h => <option key={h.HorarioId} value={h.HorarioId}>{h.Nombre}</option>)}
                        </select>
                        <button onClick={cargarReporte} className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition">Buscar</button>
                    </div>
                </div>

                {/* Estadísticas - 5 tarjetas */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-sm">
                        <div className="flex items-center justify-between mb-2"><p className="text-xs sm:text-sm opacity-90">Total Horas Trabajadas</p><Clock className="w-5 h-5 opacity-80" /></div>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.totalHorasTrabajadas}</p>
                        <p className="text-xs opacity-80 mt-1">Horas registradas</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-sm">
                        <div className="flex items-center justify-between mb-2"><p className="text-xs sm:text-sm opacity-90">Horas Extras</p><Zap className="w-5 h-5 opacity-80" /></div>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.totalHorasExtras}</p>
                        <p className="text-xs opacity-80 mt-1">Horas adicionales</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-sm">
                        <div className="flex items-center justify-between mb-2"><p className="text-xs sm:text-sm opacity-90">Cumplimiento de Horas</p><Target className="w-5 h-5 opacity-80" /></div>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.porcentajeCumplimiento}%</p>
                        <p className="text-xs opacity-80 mt-1">Faltan: {estadisticas.horasFaltantes}</p>
                    </div>
                    <div className={`bg-gradient-to-br rounded-lg p-4 text-white shadow-sm ${estadisticas.diferenciaHorasValor < 0 ? 'from-red-500 to-red-600' : estadisticas.diferenciaHorasValor > 0 ? 'from-emerald-500 to-emerald-600' : 'from-gray-500 to-gray-600'}`}>
                        <div className="flex items-center justify-between mb-2"><p className="text-xs sm:text-sm opacity-90">Diferencia (Debe/Haber)</p>
                            {estadisticas.diferenciaHorasValor < 0 ? <TrendingDown className="w-5 h-5 opacity-80" /> : estadisticas.diferenciaHorasValor > 0 ? <TrendingUp className="w-5 h-5 opacity-80" /> : <Target className="w-5 h-5 opacity-80" />}
                        </div>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.diferenciaHoras}</p>
                        <p className="text-xs opacity-80 mt-1">{estadisticas.diferenciaHorasValor < 0 ? 'Debe horas a la empresa' : estadisticas.diferenciaHorasValor > 0 ? 'A favor del empleado' : 'Horas exactas'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-sm">
                        <div className="flex items-center justify-between mb-2"><p className="text-xs sm:text-sm opacity-90">Tardanzas</p><Timer className="w-5 h-5 opacity-80" /></div>
                        <p className="text-xl sm:text-2xl font-bold">{estadisticas.tardanzas}</p>
                        <p className="text-xs opacity-80 mt-1">{estadisticas.porcentajeTardanzas}% del total</p>
                    </div>
                </div>

                {/* Segunda fila */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-2"><Calendar className="w-5 h-5 text-gray-500" /><p className="text-sm font-medium text-gray-700">Total Registros</p></div>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
                        <p className="text-xs text-gray-500 mt-1">Ausentes: {estadisticas.ausentes}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-gray-500" /><p className="text-sm font-medium text-gray-700">Horas Esperadas</p></div>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.horasEsperadas}</p>
                        <p className="text-xs text-gray-500 mt-1">Base 8 horas por día laborado</p>
                    </div>
                </div>

                {/* Tabla de registros */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {cargando ? (
                        <div className="text-center py-10"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p className="mt-2 text-gray-500">Cargando...</p></div>
                    ) : registros.length === 0 ? (
                        <div className="text-center py-10 text-gray-500"><p>No hay registros</p></div>
                    ) : modoVista === 'tabla' && !isMobile ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr><th className="p-3 text-left text-xs sm:text-sm">Fecha</th><th className="p-3 text-left text-xs sm:text-sm">Empleado</th><th className="p-3 text-left text-xs sm:text-sm hidden md:table-cell">Entrada</th><th className="p-3 text-left text-xs sm:text-sm hidden lg:table-cell">Salida Alm.</th><th className="p-3 text-left text-xs sm:text-sm hidden lg:table-cell">Regreso Alm.</th><th className="p-3 text-left text-xs sm:text-sm">Salida</th><th className="p-3 text-left text-xs sm:text-sm">Horas Trab.</th><th className="p-3 text-left text-xs sm:text-sm">HE</th><th className="p-3 text-left text-xs sm:text-sm">Estado</th><th className="p-3 text-left text-xs sm:text-sm hidden md:table-cell">Tardanza</th><th className="p-3 text-center text-xs sm:text-sm">Acciones</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {registrosPagina.map((r, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="p-3 text-xs sm:text-sm">{formatDisplayDate(r.Fecha)}</td>
                                            <td className="p-3"><div className="font-medium text-xs sm:text-sm">{r.Nombres} {r.Apellidos}</div><div className="text-xs text-gray-500">{r.DocID}</div></td>
                                            <td className="p-3 font-mono text-xs sm:text-sm hidden md:table-cell">{r.HoraEntrada?.substring(0,5) || '—'}</td>
                                            <td className="p-3 font-mono text-xs sm:text-sm hidden lg:table-cell">{r.HoraSalidaAlmuerzo?.substring(0,5) || '—'}</td>
                                            <td className="p-3 font-mono text-xs sm:text-sm hidden lg:table-cell">{r.HoraRegresoAlmuerzo?.substring(0,5) || '—'}</td>
                                            <td className="p-3 font-mono text-xs sm:text-sm">{r.HoraSalida?.substring(0,5) || '—'}</td>
                                            <td className="p-3 font-mono text-xs sm:text-sm">{r.HorasTrabajadas ? decimalToHourMinute(r.HorasTrabajadas) : '—'}</td>
                                            <td className="p-3 text-purple-600 font-medium text-xs sm:text-sm">{formatearHorasExtrasIndividual(r.HorasExtras)}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(r.Estado, r.EsTardanza)}`}>{r.EsTardanza ? 'Tardanza' : r.Estado || '—'}</span></td>
                                            <td className="p-3 text-xs sm:text-sm hidden md:table-cell">{formatearTardanza(r.MinutosTardanza, r.EsTardanza)}</td>
                                            <td className="p-3 text-center"><button onClick={() => abrirModalEdicion(r)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-4">{registrosPagina.map((r, i) => <TarjetaRegistro key={i} registro={r} />)}</div>
                    )}
                    {totalPaginas > 1 && (
                        <div className="flex justify-center items-center gap-2 p-4 border-t">
                            <button onClick={() => setPaginaActual(p => Math.max(1, p-1))} disabled={paginaActual === 1} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="px-3 py-1 text-sm">Pág {paginaActual} de {totalPaginas}</span>
                            <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p+1))} disabled={paginaActual === totalPaginas} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>

                {/* Modal Registrar */}
                {mostrarFormulario && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
                                <h2 className="text-lg font-bold">Registrar Asistencia</h2>
                                <button onClick={() => setMostrarFormulario(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-5 space-y-3">
                                <select value={nuevoRegistro.empId} onChange={e => setNuevoRegistro({...nuevoRegistro, empId: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm">
                                    <option value="">Seleccionar empleado</option>
                                    {empleados.map(e => <option key={e.EmpId} value={e.EmpId}>{e.Nombres} {e.Apellidos}</option>)}
                                </select>
                                <input type="date" value={nuevoRegistro.fecha} onChange={e => setNuevoRegistro({...nuevoRegistro, fecha: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
                                <input type="time" value={nuevoRegistro.horaEntrada} onChange={e => setNuevoRegistro({...nuevoRegistro, horaEntrada: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Hora Entrada" />
                                <input type="time" value={nuevoRegistro.horaSalidaAlmuerzo} onChange={e => setNuevoRegistro({...nuevoRegistro, horaSalidaAlmuerzo: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Salida Almuerzo" />
                                <input type="time" value={nuevoRegistro.horaRegresoAlmuerzo} onChange={e => setNuevoRegistro({...nuevoRegistro, horaRegresoAlmuerzo: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Regreso Almuerzo" />
                                <input type="time" value={nuevoRegistro.horaSalida} onChange={e => setNuevoRegistro({...nuevoRegistro, horaSalida: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Hora Salida" />
                                <textarea value={nuevoRegistro.observaciones} onChange={e => setNuevoRegistro({...nuevoRegistro, observaciones: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" rows="3" placeholder="Observaciones" />
                            </div>
                            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                                <button onClick={registrarAsistencia} disabled={registrando} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">Guardar</button>
                                <button onClick={() => setMostrarFormulario(false)} className="flex-1 bg-gray-200 py-2.5 rounded-lg text-sm font-medium">Cancelar</button>
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
                                <button onClick={() => setMostrarModalEdicion(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-sm">{editandoRegistro.Nombres} {editandoRegistro.Apellidos}</p>
                                    <p className="text-xs text-gray-500">{formatDisplayDate(editandoRegistro.Fecha)}</p>
                                </div>
                                <input type="time" value={editandoRegistro.HoraEntrada?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraEntrada: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
                                <input type="time" value={editandoRegistro.HoraSalidaAlmuerzo?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraSalidaAlmuerzo: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
                                <input type="time" value={editandoRegistro.HoraRegresoAlmuerzo?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraRegresoAlmuerzo: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
                                <input type="time" value={editandoRegistro.HoraSalida?.substring(0,5) || ''} onChange={e => setEditandoRegistro({...editandoRegistro, HoraSalida: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
                                <textarea value={editandoRegistro.Observaciones || ''} onChange={e => setEditandoRegistro({...editandoRegistro, Observaciones: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" rows="3" placeholder="Observaciones" />
                                {editandoRegistro.HorasExtras > 0 && <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-600">⏱️ Horas extras: {formatearHorasExtrasIndividual(editandoRegistro.HorasExtras)}</div>}
                                {editandoRegistro.EsTardanza === 1 && <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-600">⚠️ Tardanza: {formatearTardanza(editandoRegistro.MinutosTardanza, true)}</div>}
                            </div>
                            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                                <button onClick={guardarEdicion} disabled={registrando} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">Guardar</button>
                                <button onClick={() => setMostrarModalEdicion(false)} className="flex-1 bg-gray-200 py-2.5 rounded-lg text-sm font-medium">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanelAsistencia;