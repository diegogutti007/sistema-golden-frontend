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
  RefreshCw,
  UserCircle,
  ChevronLeft,
  ChevronRight
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
  
  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesPorPagina] = useState(8);
  
  // Estado para ordenamiento
  const [ordenarPor, setOrdenarPor] = useState('Nombre');
  const [ordenAscendente, setOrdenAscendente] = useState(true);

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

  // Filtrar y ordenar clientes
  useEffect(() => {
    let resultado = [...clientes];
    
    // Filtrar por búsqueda
    if (terminoBusqueda.trim() !== '') {
      resultado = resultado.filter(cliente => 
        cliente.Nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        cliente.Apellido.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        `${cliente.Nombre} ${cliente.Apellido}`.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        (cliente.Telefono && cliente.Telefono.includes(terminoBusqueda)) ||
        (cliente.Email && cliente.Email.toLowerCase().includes(terminoBusqueda.toLowerCase()))
      );
    }
    
    // Ordenar
    resultado.sort((a, b) => {
      let valorA, valorB;
      
      if (ordenarPor === 'Nombre') {
        valorA = `${a.Nombre} ${a.Apellido}`.toLowerCase();
        valorB = `${b.Nombre} ${b.Apellido}`.toLowerCase();
      } else if (ordenarPor === 'ID') {
        valorA = a.ClienteID;
        valorB = b.ClienteID;
      } else if (ordenarPor === 'Telefono') {
        valorA = a.Telefono || '';
        valorB = b.Telefono || '';
      } else {
        valorA = a.Email || '';
        valorB = b.Email || '';
      }
      
      if (ordenAscendente) {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });
    
    setClientesFiltrados(resultado);
    setPaginaActual(1);
  }, [terminoBusqueda, clientes, ordenarPor, ordenAscendente]);

  // Obtener clientes de la página actual
  const indiceUltimoCliente = paginaActual * clientesPorPagina;
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina;
  const clientesPaginaActual = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

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
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Si el error es por citas asociadas
      if (response.status === 400 && responseData.citasCount) {
        throw new Error(`No se puede eliminar el cliente porque tiene ${responseData.citasCount} cita(s) asociada(s). Debes eliminar o reasignar las citas primero.`);
      }
      throw new Error(responseData.error || 'Error al eliminar cliente');
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

  // Obtener iniciales para avatar
  const obtenerIniciales = (cliente) => {
    const nombre = cliente.Nombre || '';
    const apellido = cliente.Apellido || '';
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase() || '?';
  };

  // Cambiar página
  const irPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con estilo corporativo */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                  Gestión de Clientes
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  {clientes.length} clientes registrados
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={cargarClientes}
                disabled={loading}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Actualizar</span>
              </button>
              
              <button
                onClick={abrirNuevoCliente}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nuevo Cliente</span>
              </button>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, teléfono o email..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-base text-gray-700"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium text-gray-700"
              >
                <option value="Nombre">Ordenar por Nombre</option>
                <option value="ID">Ordenar por ID</option>
                <option value="Email">Ordenar por Email</option>
                <option value="Telefono">Ordenar por Teléfono</option>
              </select>
              
              <button
                onClick={() => setOrdenAscendente(!ordenAscendente)}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700"
                title={ordenAscendente ? "Orden descendente" : "Orden ascendente"}
              >
                {ordenAscendente ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {mensajeExito && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center gap-3 animate-slideDown shadow-md">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">{mensajeExito}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3 animate-slideDown shadow-md">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Grid de clientes */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-200">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
              </div>
              <Loader2 className="w-20 h-20 text-yellow-500 mx-auto mb-4 opacity-0" />
            </div>
            <p className="text-gray-600 text-lg font-medium mt-8">Cargando clientes...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clientesPaginaActual.length > 0 ? (
                clientesPaginaActual.map((cliente) => (
                  <div
                    key={cliente.ClienteID}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-yellow-500 transform hover:-translate-y-1"
                  >
                    {/* Cabecera con gradiente dorado */}
                    <div className="h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 relative">
                      <div className="absolute -bottom-10 left-5">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-yellow-500">
                          <span className="text-2xl font-bold text-yellow-600">
                            {obtenerIniciales(cliente)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenido */}
                    <div className="pt-12 p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-yellow-600 transition-colors">
                        {nombreCompleto(cliente)}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">ID: #{cliente.ClienteID}</p>
                      
                      <div className="space-y-3">
                        {cliente.Telefono && (
                          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <Phone className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm">{cliente.Telefono}</span>
                          </div>
                        )}
                        
                        {cliente.Email && (
                          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <Mail className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm truncate">{cliente.Email}</span>
                          </div>
                        )}
                        
                        {!cliente.Telefono && !cliente.Email && (
                          <div className="text-center py-3 text-gray-400 italic text-sm">
                            Sin información de contacto
                          </div>
                        )}
                      </div>
                      
                      {/* Acciones */}
                      <div className="mt-5 flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => abrirEditarCliente(cliente)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="font-medium">Editar</span>
                        </button>
                        <button
                          onClick={() => abrirEliminarCliente(cliente)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="font-medium">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-700 text-xl font-medium mb-2">
                    {terminoBusqueda ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                  </p>
                  <p className="text-gray-500 mb-6">
                    {terminoBusqueda 
                      ? `No hay resultados para "${terminoBusqueda}"` 
                      : 'Comienza agregando tu primer cliente'}
                  </p>
                  {!terminoBusqueda && (
                    <button
                      onClick={abrirNuevoCliente}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Agregar Cliente</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Paginación */}
            {clientesFiltrados.length > 0 && (
              <div className="mt-8 flex items-center justify-between bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <p className="text-gray-600 font-medium">
                  Mostrando <span className="text-yellow-600 font-bold">{indicePrimerCliente + 1}</span> -{' '}
                  <span className="text-yellow-600 font-bold">{Math.min(indiceUltimoCliente, clientesFiltrados.length)}</span> de{' '}
                  <span className="text-yellow-600 font-bold">{clientesFiltrados.length}</span> clientes
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={irPaginaAnterior}
                    disabled={paginaActual === 1}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        paginaActual === i + 1
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={irPaginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE CLIENTE (Crear/Editar) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <UserCircle className="w-6 h-6" />
                  {form.ClienteID ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h3>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={guardarCliente} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={form.Nombre}
                    onChange={(e) => setForm({...form, Nombre: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-gray-700"
                    placeholder="Ej: Juan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
                  <input
                    type="text"
                    value={form.Apellido}
                    onChange={(e) => setForm({...form, Apellido: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-gray-700"
                    placeholder="Ej: Pérez"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={form.Telefono}
                    onChange={(e) => setForm({...form, Telefono: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-gray-700"
                    placeholder="Ej: 987654321"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={form.Email}
                    onChange={(e) => setForm({...form, Email: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-gray-700"
                    placeholder="Ej: juan@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loadingAccion}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3.5 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loadingAccion ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {form.ClienteID ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all border-2 border-gray-200"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-slideUp">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4 border-2 border-red-200">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Eliminar cliente?</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de eliminar a <span className="font-bold text-yellow-600">{nombreCompleto(clienteSeleccionado)}</span>?
              </p>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-6 border border-red-200">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={eliminarCliente}
                  disabled={loadingAccion}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loadingAccion ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setModalEliminar(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all border-2 border-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Clientes;