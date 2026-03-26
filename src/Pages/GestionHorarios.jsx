import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';
import {
    Clock,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Calendar,
    Users,
    AlertCircle,
    CheckCircle,
    Sun,
    Moon,
    Coffee,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Copy,
    Info
} from 'lucide-react';

const GestionHorarios = () => {
    const [horarios, setHorarios] = useState([]);
    const [horariosFiltrados, setHorariosFiltrados] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [buscando, setBuscando] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('todos'); // todos, activos, inactivos
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina] = useState(10);
    const [verDetalle, setVerDetalle] = useState(null);
    const [viewport, setViewport] = useState('mobile');

    // Formulario de horario
    const [formData, setFormData] = useState({
        Codigo: '',
        Nombre: '',
        Descripcion: '',
        HoraEntrada: '08:00',
        HoraSalida: '17:00',
        HoraAlmuerzoInicio: '12:00',
        HoraAlmuerzoFin: '13:00',
        ToleranciaEntrada: 15,
        ToleranciaSalida: 15,
        HorasLaborales: 8,
        DiasLaborales: '1,2,3,4,5',
        Activo: true,
        EsTurnoNoche: false,
        TieneAlmuerzo: true
    });

    // Detectar tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1024) setViewport('desktop');
            else if (width >= 768) setViewport('tablet');
            else setViewport('mobile');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cargar horarios
    useEffect(() => {
        cargarHorarios();
    }, []);

    // Filtrar horarios
    useEffect(() => {
        let filtrados = [...horarios];
        
        // Filtro por búsqueda
        if (buscando) {
            filtrados = filtrados.filter(h => 
                h.Nombre.toLowerCase().includes(buscando.toLowerCase()) ||
                h.Codigo.toLowerCase().includes(buscando.toLowerCase()) ||
                (h.Descripcion && h.Descripcion.toLowerCase().includes(buscando.toLowerCase()))
            );
        }
        
        // Filtro por estado
        if (filtroActivo === 'activos') {
            filtrados = filtrados.filter(h => h.Activo === 1);
        } else if (filtroActivo === 'inactivos') {
            filtrados = filtrados.filter(h => h.Activo === 0);
        }
        
        setHorariosFiltrados(filtrados);
        setPaginaActual(1);
    }, [buscando, filtroActivo, horarios]);

    const cargarHorarios = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/api/horarios`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Error al cargar horarios');
            
            const data = await response.json();
            setHorarios(data);
            setHorariosFiltrados(data);
        } catch (error) {
            console.error('Error cargando horarios:', error);
            setMensaje({ texto: 'Error al cargar horarios', tipo: 'error' });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const generarCodigo = () => {
        const nombre = formData.Nombre.trim();
        if (nombre) {
            let codigo = nombre.toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
                .replace(/[^A-Z0-9_]/g, '')
                .substring(0, 20);
            setFormData({ ...formData, Codigo: codigo });
        }
    };

    const calcularHorasLaborales = () => {
        if (!formData.HoraEntrada || !formData.HoraSalida) return;
        
        const entrada = new Date(`2000-01-01 ${formData.HoraEntrada}`);
        const salida = new Date(`2000-01-01 ${formData.HoraSalida}`);
        let horas = (salida - entrada) / (1000 * 60 * 60);
        
        if (formData.TieneAlmuerzo && formData.HoraAlmuerzoInicio && formData.HoraAlmuerzoFin) {
            const almuerzoInicio = new Date(`2000-01-01 ${formData.HoraAlmuerzoInicio}`);
            const almuerzoFin = new Date(`2000-01-01 ${formData.HoraAlmuerzoFin}`);
            const horasAlmuerzo = (almuerzoFin - almuerzoInicio) / (1000 * 60 * 60);
            horas -= horasAlmuerzo;
        }
        
        if (formData.EsTurnoNoche && horas < 0) {
            horas += 24;
        }
        
        setFormData({ ...formData, HorasLaborales: parseFloat(horas.toFixed(2)) });
    };

    useEffect(() => {
        calcularHorasLaborales();
    }, [formData.HoraEntrada, formData.HoraSalida, formData.HoraAlmuerzoInicio, formData.HoraAlmuerzoFin, formData.TieneAlmuerzo, formData.EsTurnoNoche]);

    const validarFormulario = () => {
        if (!formData.Codigo.trim()) {
            setMensaje({ texto: 'El código es requerido', tipo: 'error' });
            return false;
        }
        if (!formData.Nombre.trim()) {
            setMensaje({ texto: 'El nombre es requerido', tipo: 'error' });
            return false;
        }
        if (!formData.HoraEntrada || !formData.HoraSalida) {
            setMensaje({ texto: 'Las horas de entrada y salida son requeridas', tipo: 'error' });
            return false;
        }
        if (formData.TieneAlmuerzo && (!formData.HoraAlmuerzoInicio || !formData.HoraAlmuerzoFin)) {
            setMensaje({ texto: 'Las horas de almuerzo son requeridas', tipo: 'error' });
            return false;
        }
        if (formData.TieneAlmuerzo && formData.HoraAlmuerzoInicio >= formData.HoraAlmuerzoFin) {
            setMensaje({ texto: 'La hora de inicio de almuerzo debe ser menor que la hora de fin', tipo: 'error' });
            return false;
        }
        return true;
    };

    const guardarHorario = async () => {
        if (!validarFormulario()) {
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
            return;
        }

        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const url = editando 
                ? `${BACKEND_URL}/api/horarios/${editando}`
                : `${BACKEND_URL}/api/horarios`;
            
            const method = editando ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMensaje({ 
                    texto: editando ? 'Horario actualizado exitosamente' : 'Horario creado exitosamente', 
                    tipo: 'exito' 
                });
                setMostrarFormulario(false);
                setEditando(null);
                resetFormulario();
                cargarHorarios();
            } else {
                setMensaje({ texto: data.error || 'Error al guardar', tipo: 'error' });
            }
        } catch (error) {
            console.error('Error guardando horario:', error);
            setMensaje({ texto: 'Error de conexión', tipo: 'error' });
        } finally {
            setCargando(false);
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        }
    };

    const eliminarHorario = async (id, nombre) => {
        if (!confirm(`¿Estás seguro de eliminar el horario "${nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
        
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/api/horarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMensaje({ texto: 'Horario eliminado exitosamente', tipo: 'exito' });
                cargarHorarios();
            } else {
                setMensaje({ texto: data.error || 'Error al eliminar', tipo: 'error' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error al eliminar', tipo: 'error' });
        } finally {
            setCargando(false);
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        }
    };

    const editarHorario = (horario) => {
        setFormData({
            Codigo: horario.Codigo,
            Nombre: horario.Nombre,
            Descripcion: horario.Descripcion || '',
            HoraEntrada: horario.HoraEntrada.substring(0, 5),
            HoraSalida: horario.HoraSalida.substring(0, 5),
            HoraAlmuerzoInicio: horario.HoraAlmuerzoInicio ? horario.HoraAlmuerzoInicio.substring(0, 5) : '12:00',
            HoraAlmuerzoFin: horario.HoraAlmuerzoFin ? horario.HoraAlmuerzoFin.substring(0, 5) : '13:00',
            ToleranciaEntrada: horario.ToleranciaEntrada,
            ToleranciaSalida: horario.ToleranciaSalida,
            HorasLaborales: horario.HorasLaborales,
            DiasLaborales: horario.DiasLaborales,
            Activo: horario.Activo === 1,
            EsTurnoNoche: horario.EsTurnoNoche === 1,
            TieneAlmuerzo: horario.TieneAlmuerzo === 1
        });
        setEditando(horario.HorarioId);
        setMostrarFormulario(true);
        setVerDetalle(null);
    };

    const resetFormulario = () => {
        setFormData({
            Codigo: '',
            Nombre: '',
            Descripcion: '',
            HoraEntrada: '08:00',
            HoraSalida: '17:00',
            HoraAlmuerzoInicio: '12:00',
            HoraAlmuerzoFin: '13:00',
            ToleranciaEntrada: 15,
            ToleranciaSalida: 15,
            HorasLaborales: 8,
            DiasLaborales: '1,2,3,4,5',
            Activo: true,
            EsTurnoNoche: false,
            TieneAlmuerzo: true
        });
    };

    const duplicarHorario = (horario) => {
        setFormData({
            ...formData,
            Codigo: `${horario.Codigo}_COPIA`,
            Nombre: `${horario.Nombre} (Copia)`,
            Descripcion: horario.Descripcion || '',
            HoraEntrada: horario.HoraEntrada.substring(0, 5),
            HoraSalida: horario.HoraSalida.substring(0, 5),
            HoraAlmuerzoInicio: horario.HoraAlmuerzoInicio ? horario.HoraAlmuerzoInicio.substring(0, 5) : '12:00',
            HoraAlmuerzoFin: horario.HoraAlmuerzoFin ? horario.HoraAlmuerzoFin.substring(0, 5) : '13:00',
            ToleranciaEntrada: horario.ToleranciaEntrada,
            ToleranciaSalida: horario.ToleranciaSalida,
            HorasLaborales: horario.HorasLaborales,
            DiasLaborales: horario.DiasLaborales,
            Activo: true,
            EsTurnoNoche: horario.EsTurnoNoche === 1,
            TieneAlmuerzo: horario.TieneAlmuerzo === 1
        });
        setEditando(null);
        setMostrarFormulario(true);
        setVerDetalle(null);
    };

    const formatearHora = (hora) => {
        if (!hora) return '—';
        return hora.substring(0, 5);
    };

    const getDiasLaboralesTexto = (dias) => {
        const diasMap = {
            1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom'
        };
        if (!dias) return '—';
        const diasArray = dias.split(',').map(d => diasMap[d] || d);
        if (diasArray.length === 5 && dias === '1,2,3,4,5') return 'Lun a Vie';
        if (diasArray.length === 6 && dias === '1,2,3,4,5,6') return 'Lun a Sáb';
        return diasArray.join(' ');
    };

    // Paginación
    const indiceUltimo = paginaActual * itemsPorPagina;
    const indicePrimero = indiceUltimo - itemsPorPagina;
    const horariosPagina = horariosFiltrados.slice(indicePrimero, indiceUltimo);
    const totalPaginas = Math.ceil(horariosFiltrados.length / itemsPorPagina);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="w-7 h-7 text-blue-600" />
                            Gestión de Horarios
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Administra los horarios de trabajo del personal
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetFormulario();
                            setEditando(null);
                            setMostrarFormulario(true);
                            setVerDetalle(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Horario
                    </button>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o código..."
                                    value={buscando}
                                    onChange={(e) => setBuscando(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFiltroActivo('todos')}
                                className={`px-3 py-2 rounded-lg transition-colors ${filtroActivo === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFiltroActivo('activos')}
                                className={`px-3 py-2 rounded-lg transition-colors ${filtroActivo === 'activos' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Activos
                            </button>
                            <button
                                onClick={() => setFiltroActivo('inactivos')}
                                className={`px-3 py-2 rounded-lg transition-colors ${filtroActivo === 'inactivos' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Inactivos
                            </button>
                            <button
                                onClick={cargarHorarios}
                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Actualizar"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Formulario de horario */}
                {mostrarFormulario && (
                    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">
                                    {editando ? 'Editar Horario' : 'Nuevo Horario'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setMostrarFormulario(false);
                                        setEditando(null);
                                        resetFormulario();
                                    }}
                                    className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código *
                                    </label>
                                    <input
                                        type="text"
                                        name="Codigo"
                                        value={formData.Codigo}
                                        onChange={handleChange}
                                        onBlur={generarCodigo}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Ej: TURNO_MANANA"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="Nombre"
                                        value={formData.Nombre}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Turno Mañana"
                                    />
                                </div>
                                
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <input
                                        type="text"
                                        name="Descripcion"
                                        value={formData.Descripcion}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Descripción del horario"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora Entrada *
                                    </label>
                                    <input
                                        type="time"
                                        name="HoraEntrada"
                                        value={formData.HoraEntrada}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora Salida *
                                    </label>
                                    <input
                                        type="time"
                                        name="HoraSalida"
                                        value={formData.HoraSalida}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Horas Laborales
                                    </label>
                                    <input
                                        type="number"
                                        name="HorasLaborales"
                                        value={formData.HorasLaborales}
                                        onChange={handleChange}
                                        step="0.5"
                                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-mono"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tolerancia Entrada (min)
                                    </label>
                                    <input
                                        type="number"
                                        name="ToleranciaEntrada"
                                        value={formData.ToleranciaEntrada}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="60"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tolerancia Salida (min)
                                    </label>
                                    <input
                                        type="number"
                                        name="ToleranciaSalida"
                                        value={formData.ToleranciaSalida}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="60"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Días Laborales
                                    </label>
                                    <select
                                        name="DiasLaborales"
                                        value={formData.DiasLaborales}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="1,2,3,4,5">Lunes a Viernes</option>
                                        <option value="1,2,3,4,5,6">Lunes a Sábado</option>
                                        <option value="1,2,3,4,5,6,7">Lunes a Domingo</option>
                                        <option value="2,3,4,5,6">Martes a Sábado</option>
                                        <option value="6,7">Sábado y Domingo</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="TieneAlmuerzo"
                                        checked={formData.TieneAlmuerzo}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Tiene hora de almuerzo</span>
                                </label>
                                
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="EsTurnoNoche"
                                        checked={formData.EsTurnoNoche}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Es turno noche</span>
                                </label>
                                
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="Activo"
                                        checked={formData.Activo}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Activo</span>
                                </label>
                            </div>
                            
                            {formData.TieneAlmuerzo && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Coffee className="w-3 h-3 inline mr-1" />
                                            Inicio Almuerzo
                                        </label>
                                        <input
                                            type="time"
                                            name="HoraAlmuerzoInicio"
                                            value={formData.HoraAlmuerzoInicio}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Coffee className="w-3 h-3 inline mr-1" />
                                            Fin Almuerzo
                                        </label>
                                        <input
                                            type="time"
                                            name="HoraAlmuerzoFin"
                                            value={formData.HoraAlmuerzoFin}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setMostrarFormulario(false);
                                        setEditando(null);
                                        resetFormulario();
                                    }}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarHorario}
                                    disabled={cargando}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {cargando ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {cargando ? 'Guardando...' : 'Guardar Horario'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de horarios */}
                {cargando && !mostrarFormulario ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : horariosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No hay horarios registrados</h3>
                        <p className="text-gray-500">
                            {buscando ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer horario haciendo clic en "Nuevo Horario"'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {horariosPagina.map(horario => (
                                <div key={horario.HorarioId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className={`p-4 ${horario.Activo ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {horario.EsTurnoNoche ? (
                                                        <Moon className="w-5 h-5 text-indigo-500" />
                                                    ) : (
                                                        <Sun className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                    <h3 className="font-bold text-gray-800 text-lg">{horario.Nombre}</h3>
                                                    {!horario.Activo && (
                                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 font-mono">{horario.Codigo}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setVerDetalle(verDetalle === horario.HorarioId ? null : horario.HorarioId)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    {verDetalle === horario.HorarioId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => duplicarHorario(horario)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                                    title="Duplicar"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => editarHorario(horario)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => eliminarHorario(horario.HorarioId, horario.Nombre)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Clock className="w-3 h-3" />
                                                <span className="font-mono">{formatearHora(horario.HoraEntrada)} - {formatearHora(horario.HoraSalida)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Calendar className="w-3 h-3" />
                                                <span>{getDiasLaboralesTexto(horario.DiasLaborales)}</span>
                                            </div>
                                            {horario.TieneAlmuerzo && (
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Coffee className="w-3 h-3" />
                                                    <span className="text-xs">{formatearHora(horario.HoraAlmuerzoInicio)} - {formatearHora(horario.HoraAlmuerzoFin)}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>Tol: {horario.ToleranciaEntrada} min</span>
                                            </div>
                                        </div>
                                        
                                        {horario.Descripcion && (
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{horario.Descripcion}</p>
                                        )}
                                        
                                        {/* Detalle expandido */}
                                        {verDetalle === horario.HorarioId && (
                                            <div className="mt-3 pt-3 border-t bg-gray-50 rounded-lg p-3">
                                                <h4 className="text-xs font-semibold text-gray-700 mb-2">Detalles del Horario</h4>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div><span className="text-gray-500">Horas laborales:</span> <span className="font-semibold">{horario.HorasLaborales} hrs</span></div>
                                                    <div><span className="text-gray-500">Tolerancia salida:</span> <span>{horario.ToleranciaSalida} min</span></div>
                                                    <div><span className="text-gray-500">Turno noche:</span> <span>{horario.EsTurnoNoche ? 'Sí' : 'No'}</span></div>
                                                    <div><span className="text-gray-500">Fecha creación:</span> <span>{new Date(horario.FechaCreacion).toLocaleDateString()}</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Paginación */}
                        {totalPaginas > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPaginaActual(paginaActual - 1)}
                                        disabled={paginaActual === 1}
                                        className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {[...Array(Math.min(5, totalPaginas))].map((_, i) => {
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
                                                className={`w-8 h-8 rounded-lg transition-colors ${
                                                    paginaActual === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white border hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPaginaActual(paginaActual + 1)}
                                        disabled={paginaActual === totalPaginas}
                                        className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Mostrando {horariosPagina.length} de {horariosFiltrados.length} horarios
                        </div>
                    </>
                )}
                
                {/* Mensaje flotante */}
                {mensaje.texto && (
                    <div className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg flex items-center gap-2 ${
                        mensaje.tipo === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'
                    }`}>
                        {mensaje.tipo === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {mensaje.texto}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionHorarios;