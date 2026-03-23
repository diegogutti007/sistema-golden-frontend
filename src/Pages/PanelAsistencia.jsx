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
    XCircle
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
    const [cargando, setCargando] = useState(false);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        horasPromedio: 0
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina] = useState(15);

    useEffect(() => {
        cargarEmpleados();
    }, []);

    useEffect(() => {
        cargarReporte();
    }, [fechaInicio, fechaFin, empleadoFiltro]);

    /*     const cargarEmpleados = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/empleados`);
                const data = await response.json();
                setEmpleados(data);
            } catch (error) {
                console.error('Error cargando empleados:', error);
            }
        }; */
    const cargarEmpleados = async () => {
        try {
            // Obtener el token almacenado (después del login)
            const token = localStorage.getItem('token');

            // Si no hay token, podrías redirigir al login o mostrar error
            if (!token) {
                console.warn('No hay token de autenticación');
                // Opcional: redirigir al login
                // window.location.href = '/login';
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/empleados`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expirado o inválido
                    console.error('Token inválido o expirado');
                    localStorage.removeItem('token'); // Limpiar token inválido
                    // Redirigir al login
                    // window.location.href = '/login';
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Verificar que data es un array
            if (Array.isArray(data)) {
                setEmpleados(data);
            } else {
                console.error('La respuesta no es un array:', data);
                setEmpleados([]);
            }

        } catch (error) {
            console.error('Error cargando empleados:', error);
            setEmpleados([]); // Establecer array vacío en caso de error
        }
    };


    const cargarReporte = async () => {
        setCargando(true);
        try {
            let url = `${BACKEND_URL}/api/reportes/asistencia?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            if (empleadoFiltro) {
                url += `&empId=${empleadoFiltro}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            setRegistros(data);
            calcularEstadisticas(data);
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
        const tardanzas = data.filter(r => {
            if (!r.HoraEntrada) return false;
            const horaEntrada = r.HoraEntrada.split(':');
            const hora = parseInt(horaEntrada[0]);
            const minutos = parseInt(horaEntrada[1]);
            return hora > 9 || (hora === 9 && minutos > 0);
        }).length;

        const horasTotales = data.reduce((sum, r) => sum + (parseFloat(r.HorasTrabajadas) || 0), 0);
        const horasPromedio = presentes > 0 ? (horasTotales / presentes).toFixed(2) : 0;

        setEstadisticas({
            total,
            presentes,
            ausentes,
            tardanzas,
            horasPromedio
        });
    };

    const exportarExcel = () => {
        // Crear CSV
        const headers = [
            'Fecha',
            'Empleado',
            'Documento',
            'Entrada',
            'Salida Almuerzo',
            'Regreso Almuerzo',
            'Salida',
            'Horas',
            'Estado',
            'Método'
        ];

        const rows = registros.map(r => [
            new Date(r.Fecha).toLocaleDateString('es-PE'),
            `${r.Nombres} ${r.Apellidos}`,
            r.Codigo,
            r.HoraEntrada || '',
            r.HoraSalidaAlmuerzo || '',
            r.HoraRegresoAlmuerzo || '',
            r.HoraSalida || '',
            r.HorasTrabajadas || '',
            r.Estado,
            r.MetodoValidacion || ''
        ]);

        const csv = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${fechaInicio}_${fechaFin}.csv`;
        a.click();
    };

    const getMetodoIcono = (metodo) => {
        switch (metodo) {
            case 'wifi': return <Wifi className="w-4 h-4 text-blue-600" />;
            case 'gps': return <MapPin className="w-4 h-4 text-green-600" />;
            case 'ip_local': return <Smartphone className="w-4 h-4 text-purple-600" />;
            default: return null;
        }
    };

    const getEstadoColor = (estado) => {
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

    const getEstadoIcono = (estado) => {
        switch (estado) {
            case 'Completo':
                return <CheckCircle className="w-4 h-4" />;
            case 'Incompleto':
                return <AlertCircle className="w-4 h-4" />;
            case 'Ausente':
                return <XCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    // Paginación
    const indiceUltimo = paginaActual * itemsPorPagina;
    const indicePrimero = indiceUltimo - itemsPorPagina;
    const registrosPagina = registros.slice(indicePrimero, indiceUltimo);
    const totalPaginas = Math.ceil(registros.length / itemsPorPagina);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Panel de Asistencia</h1>
                        <p className="text-gray-600">Monitoreo de marcaciones y control horario</p>
                    </div>
                    <button
                        onClick={exportarExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar Excel
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empleado
                            </label>
                            <select
                                value={empleadoFiltro}
                                onChange={(e) => setEmpleadoFiltro(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todos los empleados</option>
                                {empleados.map(emp => (
                                    <option key={emp.EmpId} value={emp.EmpId}>
                                        {emp.Nombres} {emp.Apellidos} - {emp.DocID}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={cargarReporte}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Registros</p>
                                <p className="text-2xl font-bold">{estadisticas.total}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Presentes</p>
                                <p className="text-2xl font-bold">{estadisticas.presentes}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Tardanzas</p>
                                <p className="text-2xl font-bold">{estadisticas.tardanzas}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">Ausentes</p>
                                <p className="text-2xl font-bold">{estadisticas.ausentes}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Horas Promedio</p>
                                <p className="text-2xl font-bold">{estadisticas.horasPromedio}</p>
                            </div>
                            <BarChart className="w-8 h-8 text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Tabla de registros */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {cargando ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Salida Almuerzo</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Regreso Almuerzo</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {registrosPagina.map((reg, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {new Date(reg.Fecha).toLocaleDateString('es-PE')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {reg.Nombres} {reg.Apellidos}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {reg.Codigo}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                    {reg.HoraEntrada || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                    {reg.HoraSalidaAlmuerzo || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                    {reg.HoraRegresoAlmuerzo || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                    {reg.HoraSalida || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">
                                                    {reg.HorasTrabajadas || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reg.Estado)}`}>
                                                        {getEstadoIcono(reg.Estado)}
                                                        {reg.Estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {reg.MetodoValidacion && (
                                                        <div className="flex items-center gap-1">
                                                            {getMetodoIcono(reg.MetodoValidacion)}
                                                            <span className="text-xs capitalize">{reg.MetodoValidacion}</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {registros.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, registros.length)} de {registros.length} registros
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPaginaActual(paginaActual - 1)}
                                            disabled={paginaActual === 1}
                                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {[...Array(totalPaginas)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPaginaActual(i + 1)}
                                                className={`w-8 h-8 rounded-xl font-medium transition-colors ${paginaActual === i + 1
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPaginaActual(paginaActual + 1)}
                                            disabled={paginaActual === totalPaginas}
                                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
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
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No hay registros</h3>
                        <p className="text-gray-500">
                            No se encontraron marcaciones para el período seleccionado
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanelAsistencia;