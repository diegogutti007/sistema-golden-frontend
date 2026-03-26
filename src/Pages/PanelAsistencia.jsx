import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';
import {
    Calendar,
    Users,
    Clock,
    Download,
    Search,
    Filter,
    BarChart,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Wifi,
    Smartphone,
    AlertCircle,
    CheckCircle,
    XCircle,
    Menu,
    X,
    TrendingUp,
    Sun,
    Moon
} from 'lucide-react';

const PanelAsistencia = () => {
    const [fechaInicio, setFechaInicio] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [fechaFin, setFechaFin] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [registros, setRegistros] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [empleadoFiltro, setEmpleadoFiltro] = useState('');
    const [tipoHorarioFiltro, setTipoHorarioFiltro] = useState('');
    const [tiposHorario, setTiposHorario] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        horasPromedio: 0,
        minutosTardanzaPromedio: 0,
        porcentajeTardanzas: 0
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(10);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [viewport, setViewport] = useState('mobile');

    // Detectar tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                setViewport('desktop');
                setItemsPorPagina(15);
            } else if (width >= 768) {
                setViewport('tablet');
                setItemsPorPagina(10);
            } else {
                setViewport('mobile');
                setItemsPorPagina(5);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        cargarEmpleados();
        cargarTiposHorario();
    }, []);

    useEffect(() => {
        cargarReporte();
    }, [fechaInicio, fechaFin, empleadoFiltro, tipoHorarioFiltro]);

    const cargarEmpleados = async () => {
        try {
            // Eliminamos el token - endpoint público
            const response = await fetch(`${BACKEND_URL}/api/empleados`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setEmpleados(data);
            } else {
                console.error('La respuesta no es un array:', data);
                setEmpleados([]);
            }
        } catch (error) {
            console.error('Error cargando empleados:', error);
            setEmpleados([]);
        }
    };

    const cargarTiposHorario = async () => {
        try {
            // Endpoint público sin token
            const response = await fetch(`${BACKEND_URL}/api/tipos-empleado`);
            if (response.ok) {
                const data = await response.json();
                setTiposHorario(data);
            }
        } catch (error) {
            console.error('Error cargando tipos de horario:', error);
        }
    };

    const cargarReporte = async () => {
        setCargando(true);
        try {
            let url = `${BACKEND_URL}/api/reportes/asistencia?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            if (empleadoFiltro) {
                url += `&empId=${empleadoFiltro}`;
            }
            if (tipoHorarioFiltro) {
                url += `&tipo_empleado=${tipoHorarioFiltro}`;
            }

            // Endpoint público sin token
            const response = await fetch(url);
            const data = await response.json();
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
        const presentes = data.filter(r => r.Estado === 'Completo' || r.Estado === 'Tardanza').length;
        const ausentes = data.filter(r => r.Estado === 'Ausente').length;
        
        // Calcular tardanzas (ahora usando el campo EsTardanza)
        const tardanzas = data.filter(r => r.EsTardanza === 1 || r.EsTardanza === true).length;
        
        // Calcular minutos totales de tardanza
        const minutosTardanzaTotal = data.reduce((sum, r) => sum + (parseInt(r.MinutosTardanza) || 0), 0);
        const minutosTardanzaPromedio = tardanzas > 0 ? (minutosTardanzaTotal / tardanzas).toFixed(0) : 0;
        
        // Calcular horas totales
        const horasTotales = data.reduce((sum, r) => sum + (parseFloat(r.HorasTrabajadas) || 0), 0);
        const horasPromedio = presentes > 0 ? (horasTotales / presentes).toFixed(2) : 0;
        
        // Porcentaje de tardanzas
        const porcentajeTardanzas = total > 0 ? ((tardanzas / total) * 100).toFixed(1) : 0;

        setEstadisticas({
            total,
            presentes,
            ausentes,
            tardanzas,
            horasPromedio,
            minutosTardanzaPromedio,
            porcentajeTardanzas
        });
    };

    const exportarExcel = () => {
        const headers = [
            'Fecha',
            'Empleado',
            'Documento',
            'Horario',
            'Entrada',
            'Salida Almuerzo',
            'Regreso Almuerzo',
            'Salida',
            'Horas',
            'Estado',
            'Tardanza',
            'Minutos Tardanza',
            'Método'
        ];

        const rows = registros.map(r => [
            new Date(r.Fecha).toLocaleDateString('es-PE'),
            `${r.Nombres} ${r.Apellidos}`,
            r.Codigo,
            r.HorarioNombre || '',
            r.HoraEntrada || '',
            r.HoraSalidaAlmuerzo || '',
            r.HoraRegresoAlmuerzo || '',
            r.HoraSalida || '',
            r.HorasTrabajadas || '',
            r.Estado,
            r.EsTardanza ? 'Sí' : 'No',
            r.MinutosTardanza || '',
            r.MetodoValidacion || ''
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${fechaInicio}_${fechaFin}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getMetodoIcono = (metodo) => {
        switch (metodo) {
            case 'wifi': return <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />;
            case 'gps': return <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
            case 'ip_local': return <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />;
            default: return null;
        }
    };

    const getEstadoColor = (estado, esTardanza) => {
        if (esTardanza) return 'bg-orange-100 text-orange-800 border-orange-200';
        switch (estado) {
            case 'Completo':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Incompleto':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Ausente':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEstadoIcono = (estado, esTardanza) => {
        if (esTardanza) return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
        switch (estado) {
            case 'Completo':
                return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            case 'Incompleto':
                return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            case 'Ausente':
                return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            default:
                return null;
        }
    };

    const formatearHoraPeru = (horaStr) => {
        if (!horaStr) return '—';
        if (typeof horaStr === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(horaStr)) {
            return horaStr.substring(0, 5);
        }
        return horaStr;
    };

    const indiceUltimo = paginaActual * itemsPorPagina;
    const indicePrimero = indiceUltimo - itemsPorPagina;
    const registrosPagina = registros.slice(indicePrimero, indiceUltimo);
    const totalPaginas = Math.ceil(registros.length / itemsPorPagina);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Panel de Asistencia</h1>
                        <p className="text-sm sm:text-base text-gray-600">Monitoreo de marcaciones y control de tardanzas</p>
                    </div>
                    <button
                        onClick={exportarExcel}
                        disabled={registros.length === 0}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar Excel</span>
                        <span className="sm:hidden">Exportar</span>
                    </button>
                </div>

                {/* Filtros - Responsive con toggle en móvil */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6">
                    {viewport === 'mobile' && (
                        <button
                            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                            className="w-full flex items-center justify-between p-4 text-gray-700 font-medium"
                        >
                            <span className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filtros de búsqueda
                            </span>
                            {filtrosAbiertos ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    )}
                    
                    <div className={`${viewport === 'mobile' && !filtrosAbiertos ? 'hidden' : 'block'} p-4 sm:p-6`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Empleado
                                </label>
                                <select
                                    value={empleadoFiltro}
                                    onChange={(e) => setEmpleadoFiltro(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los empleados</option>
                                    {empleados.map(emp => (
                                        <option key={emp.EmpId} value={emp.EmpId}>
                                            {emp.Nombres} {emp.Apellidos}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Horario
                                </label>
                                <select
                                    value={tipoHorarioFiltro}
                                    onChange={(e) => setTipoHorarioFiltro(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los horarios</option>
                                    {tiposHorario.map(tipo => (
                                        <option key={tipo.Tipo_EmpId} value={tipo.Tipo_EmpId}>
                                            {tipo.Nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={cargarReporte}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <Search className="w-4 h-4" />
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de estadísticas - Grid responsive con nuevas métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs sm:text-sm">Total</p>
                                <p className="text-xl sm:text-2xl font-bold">{estadisticas.total}</p>
                            </div>
                            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-xs sm:text-sm">Presentes</p>
                                <p className="text-xl sm:text-2xl font-bold">{estadisticas.presentes}</p>
                            </div>
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-xs sm:text-sm">Tardanzas</p>
                                <p className="text-xl sm:text-2xl font-bold">{estadisticas.tardanzas}</p>
                                <p className="text-xs text-orange-200">{estadisticas.porcentajeTardanzas}%</p>
                            </div>
                            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-xs sm:text-sm">Min. Tardanza</p>
                                <p className="text-xl sm:text-2xl font-bold">{estadisticas.minutosTardanzaPromedio}</p>
                                <p className="text-xs text-yellow-200">min promedio</p>
                            </div>
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-xs sm:text-sm">Ausentes</p>
                                <p className="text-xl sm:text-2xl font-bold">{estadisticas.ausentes}</p>
                            </div>
                            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white col-span-2 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-xs sm:text-sm">Horas Promedio</p>
                                <p className="text-xl sm:text-2xl font-bold">{estadisticas.horasPromedio}</p>
                            </div>
                            <BarChart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Tabla de registros - Responsive con scroll horizontal */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    {cargando ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                                            {viewport !== 'mobile' && (
                                                <>
                                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Salida Alm.</th>
                                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Regreso Alm.</th>
                                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                                                </>
                                            )}
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Tardanza</th>
                                            {viewport !== 'mobile' && (
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {registrosPagina.map((reg, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                                    {new Date(reg.Fecha).toLocaleDateString('es-PE')}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                                        {viewport === 'mobile' 
                                                            ? `${reg.Nombres?.split(' ')[0] || ''} ${reg.Apellidos?.split(' ')[0] || ''}`
                                                            : `${reg.Nombres || ''} ${reg.Apellidos || ''}`
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {reg.Codigo}
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                                    <div className="flex items-center gap-1">
                                                        {reg.HorarioNombre ? (
                                                            <>
                                                                {reg.EsTurnoNoche ? 
                                                                    <Moon className="w-3 h-3 text-indigo-500" /> : 
                                                                    <Sun className="w-3 h-3 text-yellow-500" />
                                                                }
                                                                <span className="text-xs">{reg.HorarioNombre}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                {viewport !== 'mobile' && (
                                                    <>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm">
                                                            {formatearHoraPeru(reg.HoraEntrada) || '—'}
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm">
                                                            {formatearHoraPeru(reg.HoraSalidaAlmuerzo) || '—'}
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm">
                                                            {formatearHoraPeru(reg.HoraRegresoAlmuerzo) || '—'}
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm">
                                                            {formatearHoraPeru(reg.HoraSalida) || '—'}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono font-medium text-xs sm:text-sm">
                                                    {reg.HorasTrabajadas || '—'}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reg.Estado, reg.EsTardanza)}`}>
                                                        {getEstadoIcono(reg.Estado, reg.EsTardanza)}
                                                        <span className="hidden sm:inline">
                                                            {reg.EsTardanza ? 'Tardanza' : reg.Estado}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                                    {reg.EsTardanza ? (
                                                        <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {reg.MinutosTardanza} min
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600">Puntual</span>
                                                    )}
                                                </td>
                                                {viewport !== 'mobile' && (
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                        {reg.MetodoValidacion && (
                                                            <div className="flex items-center gap-1">
                                                                {getMetodoIcono(reg.MetodoValidacion)}
                                                                <span className="text-xs capitalize hidden sm:inline">{reg.MetodoValidacion}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación - Responsive */}
                            {registros.length > 0 && (
                                <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                        Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, registros.length)} de {registros.length} registros
                                    </p>
                                    <div className="flex justify-center sm:justify-end gap-1 sm:gap-2">
                                        <button
                                            onClick={() => setPaginaActual(paginaActual - 1)}
                                            disabled={paginaActual === 1}
                                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                            let pageNum;
                                            if (totalPaginas <= 5) {
                                                pageNum = i + 1;
                                            } else if (paginaActual <= 3) {
                                                pageNum = i + 1;
                                            } else if (paginaActual >= totalPaginas - 2) {
                                                pageNum = totalPaginas - 4 + i;
                                            } else {
                                                pageNum = paginaActual - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPaginaActual(pageNum)}
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                                                        paginaActual === pageNum
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setPaginaActual(paginaActual + 1)}
                                            disabled={paginaActual === totalPaginas}
                                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Mensaje si no hay datos */}
                {!cargando && registros.length === 0 && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                        <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">No hay registros</h3>
                        <p className="text-sm sm:text-base text-gray-500">
                            No se encontraron marcaciones para el período seleccionado
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanelAsistencia;