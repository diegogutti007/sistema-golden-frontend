import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    User,
    Phone,
    Calendar,
    DollarSign,
    Briefcase,
    MapPin,
    Save,
    X,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const GestionEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [tiposEmpleado, setTiposEmpleado] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [empleadoEdit, setEmpleadoEdit] = useState(null);
    const [form, setForm] = useState({
        Nombres: '',
        Apellidos: '',
        DocID: '',
        FechaNacimiento: '',
        Direccion: '',
        telefono: '',
        Sueldo: '',
        Cargo_EmpId: '',
        Tipo_EmpId: '',
        fecha_ingreso: '',
        Estado: 'Activo'
    });

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        cargarEmpleados();
        cargarCatalogos();
    }, []);

    const cargarEmpleados = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/empleados`);
            const data = await response.json();
            setEmpleados(data);
        } catch (error) {
            console.error('Error cargando empleados:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarCatalogos = async () => {
        try {
            const [cargosRes, tiposRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/cargos-empleado`),
                fetch(`${BACKEND_URL}/api/tipos-empleado`)
            ]);
            
            const cargosData = await cargosRes.json();
            const tiposData = await tiposRes.json();
            
            setCargos(cargosData);
            setTiposEmpleado(tiposData);
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const guardarEmpleado = async (e) => {
        e.preventDefault();
        try {
            const url = empleadoEdit 
                ? `${BACKEND_URL}/api/empleados/${empleadoEdit.EmpId}`
                : `${BACKEND_URL}/api/empleados`;
            
            const response = await fetch(url, {
                method: empleadoEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                await cargarEmpleados();
                setModalAbierto(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error guardando empleado:', error);
        }
    };

    const eliminarEmpleado = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
        
        try {
            await fetch(`${BACKEND_URL}/api/empleados/${id}`, {
                method: 'DELETE'
            });
            await cargarEmpleados();
        } catch (error) {
            console.error('Error eliminando empleado:', error);
        }
    };

    const resetForm = () => {
        setForm({
            Nombres: '',
            Apellidos: '',
            DocID: '',
            FechaNacimiento: '',
            Direccion: '',
            telefono: '',
            Sueldo: '',
            Cargo_EmpId: '',
            Tipo_EmpId: '',
            fecha_ingreso: ''
        });
        setEmpleadoEdit(null);
    };

    const abrirModalEditar = (empleado) => {
        setEmpleadoEdit(empleado);
        setForm({
            Nombres: empleado.Nombres || '',
            Apellidos: empleado.Apellidos || '',
            DocID: empleado.DocID || '',
            FechaNacimiento: empleado.FechaNacimiento?.split('T')[0] || '',
            Direccion: empleado.Direccion || '',
            telefono: empleado.telefono || '',
            Sueldo: empleado.Sueldo || '',
            Cargo_EmpId: empleado.Cargo_EmpId || '',
            Tipo_EmpId: empleado.Tipo_EmpId || '',
            fecha_ingreso: empleado.fecha_ingreso?.split('T')[0] || ''
        });
        setModalAbierto(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Empleados</h1>
                        <p className="text-gray-600">Administra el personal de la empresa</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setModalAbierto(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Empleado
                    </button>
                </div>

                {/* Tabla de empleados */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nombres</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Apellidos</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {empleados.map(emp => (
                                        <tr key={emp.EmpId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{emp.DocID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{emp.Nombres}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{emp.Apellidos}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{emp.telefono || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{emp.Cargo_EmpId || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => abrirModalEditar(emp)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarEmpleado(emp.EmpId)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal de empleado */}
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sticky top-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <User className="w-6 h-6" />
                                        {empleadoEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
                                    </h3>
                                    <button
                                        onClick={() => setModalAbierto(false)}
                                        className="text-white hover:bg-white/20 p-2 rounded-xl"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={guardarEmpleado} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                                        <input
                                            type="text"
                                            value={form.Nombres}
                                            onChange={(e) => setForm({...form, Nombres: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                                        <input
                                            type="text"
                                            value={form.Apellidos}
                                            onChange={(e) => setForm({...form, Apellidos: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Documento *</label>
                                        <input
                                            type="text"
                                            value={form.DocID}
                                            onChange={(e) => setForm({...form, DocID: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                        <input
                                            type="text"
                                            value={form.telefono}
                                            onChange={(e) => setForm({...form, telefono: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Nacimiento</label>
                                        <input
                                            type="date"
                                            value={form.FechaNacimiento}
                                            onChange={(e) => setForm({...form, FechaNacimiento: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Ingreso</label>
                                        <input
                                            type="date"
                                            value={form.fecha_ingreso}
                                            onChange={(e) => setForm({...form, fecha_ingreso: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                    <input
                                        type="text"
                                        value={form.Direccion}
                                        onChange={(e) => setForm({...form, Direccion: e.target.value})}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                                        <select
                                            value={form.Cargo_EmpId}
                                            onChange={(e) => setForm({...form, Cargo_EmpId: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar cargo</option>
                                            {cargos.map(c => (
                                                <option key={c.Cargo_EmpId} value={c.Cargo_EmpId}>{c.Nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Empleado</label>
                                        <select
                                            value={form.Tipo_EmpId}
                                            onChange={(e) => setForm({...form, Tipo_EmpId: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            {tiposEmpleado.map(t => (
                                                <option key={t.Tipo_EmpId} value={t.Tipo_EmpId}>{t.Nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sueldo</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.Sueldo}
                                        onChange={(e) => setForm({...form, Sueldo: e.target.value})}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                                    >
                                        <Save className="w-4 h-4 inline mr-2" />
                                        Guardar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModalAbierto(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionEmpleados;