import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { BACKEND_URL } from '../config';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  
  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  
  // Estado para el formulario
  const [form, setForm] = useState({
    ClienteID: null,
    Nombre: '',
    Apellido: '',
    Telefono: '',
    Email: ''
  });

  // Estado para búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  // Función para obtener headers con autenticación
  const obtenerHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Cargar clientes
  const cargarClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/clientes`, {
        headers: obtenerHeaders()
      });
      
      if (!response.ok) throw new Error('Error al cargar clientes');
      
      const data = await response.json();
      setClientes(data);
      setClientesFiltrados(data);
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Filtrar clientes por búsqueda
  useEffect(() => {
    if (terminoBusqueda.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente => 
        cliente.Nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        cliente.Apellido.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        `${cliente.Nombre} ${cliente.Apellido}`.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        (cliente.Telefono && cliente.Telefono.includes(terminoBusqueda)) ||
        (cliente.Email && cliente.Email.toLowerCase().includes(terminoBusqueda.toLowerCase()))
      );
      setClientesFiltrados(filtrados);
    }
  }, [terminoBusqueda, clientes]);

  // Abrir modal para nuevo cliente
  const abrirNuevoCliente = () => {
    setForm({
      ClienteID: null,
      Nombre: '',
      Apellido: '',
      Telefono: '',
      Email: ''
    });
    setClienteSeleccionado(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirEditarCliente = (cliente) => {
    setForm({
      ClienteID: cliente.ClienteID,
      Nombre: cliente.Nombre || '',
      Apellido: cliente.Apellido || '',
      Telefono: cliente.Telefono || '',
      Email: cliente.Email || ''
    });
    setClienteSeleccionado(cliente);
    setModalAbierto(true);
  };

  // Abrir modal de confirmación para eliminar
  const abrirEliminarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalEliminar(true);
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!form.Nombre.trim()) {
      alert('El nombre es requerido');
      return false;
    }
    if (!form.Apellido.trim()) {
      alert('El apellido es requerido');
      return false;
    }
    if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email)) {
      alert('El email no tiene un formato válido');
      return false;
    }
    return true;
  };

  // Guardar cliente (crear o actualizar)
  const guardarCliente = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setLoadingAccion(true);
    setError(null);
    
    try {
      const url = form.ClienteID 
        ? `${BACKEND_URL}/api/clientes/${form.ClienteID}`
        : `${BACKEND_URL}/api/clientes`;
      
      const method = form.ClienteID ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: obtenerHeaders(),
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar cliente');
      }
      
      await cargarClientes();
      
      setMensajeExito(form.ClienteID ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
      setTimeout(() => setMensajeExito(''), 3000);
      
      setModalAbierto(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoadingAccion(false);
    }
  };

  // Eliminar cliente
  const eliminarCliente = async () => {
    if (!clienteSeleccionado) return;
    
    setLoadingAccion(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/clientes/${clienteSeleccionado.ClienteID}`, {
        method: 'DELETE',
        headers: obtenerHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar cliente');
      }
      
      await cargarClientes();
      
      setMensajeExito('Cliente eliminado correctamente');
      setTimeout(() => setMensajeExito(''), 3000);
      
      setModalEliminar(false);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoadingAccion(false);
    }
  };

  // Formatear nombre completo
  const nombreCompleto = (cliente) => {
    return `${cliente.Nombre || ''} ${cliente.Apellido || ''}`.trim() || 'Sin nombre';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Estilo similar a CierreCaja */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-600" />
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 mt-1">Administra tus clientes de manera fácil y rápida</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={cargarClientes}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all border border-blue-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
              
              <button
                onClick={abrirNuevoCliente}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Cliente</span>
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, teléfono o email..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Mensajes */}
        {mensajeExito && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{mensajeExito}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabla de clientes */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre Completo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map((cliente) => (
                      <tr key={cliente.ClienteID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">{cliente.ClienteID}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {nombreCompleto(cliente)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cliente.Telefono || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cliente.Email || '-'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => abrirEditarCliente(cliente)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => abrirEliminarCliente(cliente)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        {terminoBusqueda ? (
                          <div>
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No se encontraron clientes para "{terminoBusqueda}"</p>
                          </div>
                        ) : (
                          <div>
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No hay clientes registrados</p>
                            <button
                              onClick={abrirNuevoCliente}
                              className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              + Agregar primer cliente
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CLIENTE (Crear/Editar) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {form.ClienteID ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h3>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={guardarCliente} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={form.Nombre}
                    onChange={(e) => setForm({...form, Nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Juan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={form.Apellido}
                    onChange={(e) => setForm({...form, Apellido: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Pérez"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={form.Telefono}
                    onChange={(e) => setForm({...form, Telefono: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 987654321"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={form.Email}
                    onChange={(e) => setForm({...form, Email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: juan@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loadingAccion}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingAccion ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {form.ClienteID ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      {modalEliminar && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar cliente?</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de eliminar a <strong>{nombreCompleto(clienteSeleccionado)}</strong>?
              </p>
              <p className="text-sm text-red-600 mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={eliminarCliente}
                  disabled={loadingAccion}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingAccion ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setModalEliminar(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;