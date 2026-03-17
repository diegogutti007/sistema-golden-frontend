import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Tag,
  Grid,
  Eye,
  Box
} from "lucide-react";
import { BACKEND_URL } from '../config';

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  
  // Estados para los modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  // Estado para el formulario (SIN StockMinimo)
  const [form, setForm] = useState({
    ArticuloID: null,
    Nombre: '',
    Descripcion: '',
    CategoriaID: '',
    PrecioCompra: '',
    PrecioVenta: '',
    Stock: '',
    UnidadMedida: 'Unidad',
    Estado: 'Activo'
  });

  // Estado para búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  
  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(8);
  
  // Estado para ordenamiento
  const [ordenarPor, setOrdenarPor] = useState('Nombre');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  
  // Estado para vista (grid/table)
  const [vista, setVista] = useState('grid');

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

  // Cargar productos
  const cargarProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Cargando productos desde:", `${BACKEND_URL}/api/productos`);
      const response = await fetch(`${BACKEND_URL}/api/productos`, {
        headers: obtenerHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.error || 'Error al cargar productos');
      }
      
      const data = await response.json();
      console.log("Productos cargados:", data);
      setProductos(data);
      setProductosFiltrados(data);
    } catch (error) {
      console.error('Error detallado:', error);
      setError(error.message || 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      console.log("Cargando categorías desde:", `${BACKEND_URL}/api/categorias_servicio`);
      const response = await fetch(`${BACKEND_URL}/api/categorias_servicio`, {
        headers: obtenerHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response categorías:", errorData);
        throw new Error(errorData.error || 'Error al cargar categorías');
      }
      
      const data = await response.json();
      console.log("Categorías cargadas:", data);
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  // Filtrar y ordenar productos
  useEffect(() => {
    let resultado = [...productos];
    
    // Filtrar por búsqueda
    if (terminoBusqueda.trim() !== '') {
      resultado = resultado.filter(producto => 
        producto.Nombre?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.Codigo?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.Descripcion?.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
    }
    
    // Ordenar
    resultado.sort((a, b) => {
      let valorA, valorB;
      
      if (ordenarPor === 'Nombre') {
        valorA = a.Nombre?.toLowerCase() || '';
        valorB = b.Nombre?.toLowerCase() || '';
      } else if (ordenarPor === 'Precio') {
        valorA = parseFloat(a.PrecioVenta) || 0;
        valorB = parseFloat(b.PrecioVenta) || 0;
      } else if (ordenarPor === 'Stock') {
        valorA = parseInt(a.Stock) || 0;
        valorB = parseInt(b.Stock) || 0;
      } else {
        valorA = a.Codigo || '';
        valorB = b.Codigo || '';
      }
      
      if (ordenAscendente) {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });
    
    setProductosFiltrados(resultado);
    setPaginaActual(1);
  }, [terminoBusqueda, productos, ordenarPor, ordenAscendente]);

  // Obtener productos de la página actual
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const productosPaginaActual = productosFiltrados.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);

  // Abrir modal para nuevo producto
  const abrirNuevoProducto = () => {
    setForm({
      ArticuloID: null,
      Nombre: '',
      Descripcion: '',
      CategoriaID: '',
      PrecioCompra: '',
      PrecioVenta: '',
      Stock: '',
      UnidadMedida: 'Unidad',
      Estado: 'Activo'
    });
    setProductoSeleccionado(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirEditarProducto = (producto) => {
    setForm({
      ArticuloID: producto.ArticuloID,
      Nombre: producto.Nombre || '',
      Descripcion: producto.Descripcion || '',
      CategoriaID: producto.CategoriaID || '',
      PrecioCompra: producto.PrecioCompra || '',
      PrecioVenta: producto.PrecioVenta || '',
      Stock: producto.Stock || '',
      UnidadMedida: producto.UnidadMedida || 'Unidad',
      Estado: producto.Estado || 'Activo'
    });
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  // Abrir modal de detalle
  const abrirDetalleProducto = (producto) => {
    setProductoSeleccionado(producto);
    setModalDetalle(true);
  };

  // Abrir modal de confirmación para eliminar
  const abrirEliminarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setModalEliminar(true);
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!form.Nombre?.trim()) {
      alert('El nombre es requerido');
      return false;
    }
    if (!form.PrecioVenta || parseFloat(form.PrecioVenta) <= 0) {
      alert('El precio de venta debe ser mayor a 0');
      return false;
    }
    if (parseInt(form.Stock) < 0) {
      alert('El stock no puede ser negativo');
      return false;
    }
    return true;
  };

  // Obtener nombre de categoría
  const getNombreCategoria = (categoriaId) => {
    if (!categoriaId) return 'Sin categoría';
    const categoria = categorias.find(c => c.CategoriaID === categoriaId);
    return categoria?.Nombre || 'Sin categoría';
  };

  // Guardar producto
  const guardarProducto = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setLoadingAccion(true);
    setError(null);
    
    try {
      const url = form.ArticuloID 
        ? `${BACKEND_URL}/api/productos/${form.ArticuloID}`
        : `${BACKEND_URL}/api/productos`;
      
      const method = form.ArticuloID ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: obtenerHeaders(),
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar producto');
      }
      
      await cargarProductos();
      
      setMensajeExito(form.ArticuloID ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      setTimeout(() => setMensajeExito(''), 3000);
      
      setModalAbierto(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoadingAccion(false);
    }
  };

  // Eliminar producto
  const eliminarProducto = async () => {
    if (!productoSeleccionado) return;
    
    setLoadingAccion(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/productos/${productoSeleccionado.ArticuloID}`, {
        method: 'DELETE',
        headers: obtenerHeaders()
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error al eliminar producto');
      }
      
      await cargarProductos();
      
      setMensajeExito('Producto eliminado correctamente');
      setTimeout(() => setMensajeExito(''), 3000);
      
      setModalEliminar(false);
      setProductoSeleccionado(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoadingAccion(false);
    }
  };

  // Obtener color según stock
  const getColorStock = (stock) => {
    if (stock <= 5) return 'text-red-600 bg-red-50 border-red-200';
    if (stock <= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Cambiar página
  const irPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  // Calcular estadísticas
  const stats = {
    total: productos.length,
    stockBajo: productos.filter(p => parseInt(p.Stock) <= 5).length,
    valorInventario: productos.reduce((sum, p) => sum + (parseFloat(p.PrecioCompra || 0) * (parseInt(p.Stock) || 0)), 0),
    activos: productos.filter(p => p.Estado === 'Activo').length
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Box className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                  Gestión de Productos
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  {productos.length} productos en inventario
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={cargarProductos}
                disabled={loading}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Actualizar</span>
              </button>
              
              <button
                onClick={abrirNuevoProducto}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o descripción..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base text-gray-700"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="Nombre">Ordenar por Nombre</option>
                <option value="Precio">Ordenar por Precio</option>
                <option value="Stock">Ordenar por Stock</option>
                <option value="Codigo">Ordenar por Código</option>
              </select>
              
              <button
                onClick={() => setOrdenAscendente(!ordenAscendente)}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700"
                title={ordenAscendente ? "Orden descendente" : "Orden ascendente"}
              >
                {ordenAscendente ? '↑' : '↓'}
              </button>

              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setVista('grid')}
                  className={`p-2.5 rounded-lg transition-colors ${vista === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista cuadrícula"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setVista('table')}
                  className={`p-2.5 rounded-lg transition-colors ${vista === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista tabla"
                >
                  <Package className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Productos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Box className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Productos Activos</p>
                <p className="text-2xl font-bold">{stats.activos}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Stock Bajo</p>
                <p className="text-2xl font-bold">{stats.stockBajo}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Valor Inventario</p>
                <p className="text-2xl font-bold">S/ {stats.valorInventario.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-200" />
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

        {/* Grid de productos */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-200">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <Loader2 className="w-20 h-20 text-blue-500 mx-auto mb-4 opacity-0" />
            </div>
            <p className="text-gray-600 text-lg font-medium mt-8">Cargando productos...</p>
          </div>
        ) : (
          <>
            {vista === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productosPaginaActual.length > 0 ? (
                  productosPaginaActual.map((producto) => (
                    <div
                      key={producto.ArticuloID}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-500 transform hover:-translate-y-1"
                    >
                      {/* Cabecera con gradiente azul */}
                      <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                        <div className="absolute -bottom-10 left-5">
                          <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-blue-500">
                            <Box className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenido */}
                      <div className="pt-12 p-5">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {producto.Nombre}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Código: #{producto.Codigo || 'N/A'}
                        </p>
                        
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs border border-purple-200">
                            <Tag className="w-3 h-3" />
                            {producto.CategoriaNombre || getNombreCategoria(producto.CategoriaID)}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-600">Precio Venta:</span>
                            <span className="font-bold text-green-600">
                              S/ {parseFloat(producto.PrecioVenta || 0).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className={`flex items-center justify-between p-2 rounded-lg border ${getColorStock(producto.Stock)}`}>
                            <span className="text-sm">Stock:</span>
                            <span className="font-bold">
                              {producto.Stock} {producto.UnidadMedida}
                            </span>
                          </div>
                          
                          {producto.Descripcion && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-200" title={producto.Descripcion}>
                              <span className="truncate block">{producto.Descripcion}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Acciones */}
                        <div className="mt-5 flex gap-2 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => abrirDetalleProducto(producto)}
                            className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver</span>
                          </button>
                          <button
                            onClick={() => abrirEditarProducto(producto)}
                            className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => abrirEliminarProducto(producto)}
                            className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
                      <Box className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-700 text-xl font-medium mb-2">
                      {terminoBusqueda ? 'No se encontraron productos' : 'No hay productos registrados'}
                    </p>
                    <p className="text-gray-500 mb-6">
                      {terminoBusqueda 
                        ? `No hay resultados para "${terminoBusqueda}"` 
                        : 'Comienza agregando tu primer producto'}
                    </p>
                    {!terminoBusqueda && (
                      <button
                        onClick={abrirNuevoProducto}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Agregar Producto</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Vista de tabla */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P. Venta</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productosPaginaActual.map((producto) => (
                        <tr key={producto.ArticuloID} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {producto.Codigo || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{producto.Nombre}</div>
                            {producto.Descripcion && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">{producto.Descripcion}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {producto.CategoriaNombre || getNombreCategoria(producto.CategoriaID)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            S/ {parseFloat(producto.PrecioVenta || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              producto.Stock <= 5 ? 'bg-red-100 text-red-800' : 
                              producto.Stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {producto.Stock} {producto.UnidadMedida}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              producto.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {producto.Estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => abrirDetalleProducto(producto)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => abrirEditarProducto(producto)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => abrirEliminarProducto(producto)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
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
              </div>
            )}

            {/* Paginación */}
            {productosFiltrados.length > 0 && (
              <div className="mt-8 flex items-center justify-between bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <p className="text-gray-600 font-medium">
                  Mostrando <span className="text-blue-600 font-bold">{indicePrimerItem + 1}</span> -{' '}
                  <span className="text-blue-600 font-bold">{Math.min(indiceUltimoItem, productosFiltrados.length)}</span> de{' '}
                  <span className="text-blue-600 font-bold">{productosFiltrados.length}</span> productos
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
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
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

      {/* MODAL DE PRODUCTO (Crear/Editar) - SIN StockMinimo */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Box className="w-6 h-6" />
                  {form.ArticuloID ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={guardarProducto} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  value={form.Nombre}
                  onChange={(e) => setForm({...form, Nombre: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                  placeholder="Ej: Laptop HP"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={form.Descripcion}
                  onChange={(e) => setForm({...form, Descripcion: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                <select
                  value={form.CategoriaID}
                  onChange={(e) => setForm({...form, CategoriaID: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.CategoriaID} value={cat.CategoriaID}>{cat.Nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Compra (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.PrecioCompra}
                    onChange={(e) => setForm({...form, PrecioCompra: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Venta (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.PrecioVenta}
                    onChange={(e) => setForm({...form, PrecioVenta: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.Stock}
                    onChange={(e) => setForm({...form, Stock: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad Medida</label>
                  <select
                    value={form.UnidadMedida}
                    onChange={(e) => setForm({...form, UnidadMedida: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                  >
                    <option value="Unidad">Unidad</option>
                    <option value="Caja">Caja</option>
                    <option value="Pack">Pack</option>
                    <option value="Kg">Kg</option>
                    <option value="Lt">Lt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                <select
                  value={form.Estado}
                  onChange={(e) => setForm({...form, Estado: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loadingAccion}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loadingAccion ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {form.ArticuloID ? 'Actualizar' : 'Guardar'}
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

      {/* MODAL DE DETALLE - SIN StockMinimo */}
      {modalDetalle && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Box className="w-6 h-6" />
                  Detalle del Producto
                </h3>
                <button
                  onClick={() => setModalDetalle(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información principal */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {productoSeleccionado.Nombre?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">{productoSeleccionado.Nombre}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        #{productoSeleccionado.Codigo || 'Sin código'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        productoSeleccionado.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {productoSeleccionado.Estado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Categoría</p>
                  <p className="font-semibold text-gray-800">
                    {productoSeleccionado.CategoriaNombre || getNombreCategoria(productoSeleccionado.CategoriaID)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Unidad de Medida</p>
                  <p className="font-semibold text-gray-800">{productoSeleccionado.UnidadMedida || 'Unidad'}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Precio Compra</p>
                  <p className="font-semibold text-gray-800">
                    S/ {parseFloat(productoSeleccionado.PrecioCompra || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Precio Venta</p>
                  <p className="font-semibold text-green-600">
                    S/ {parseFloat(productoSeleccionado.PrecioVenta || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Stock Actual</p>
                  <p className={`font-semibold ${getColorStock(productoSeleccionado.Stock).split(' ')[0]}`}>
                    {productoSeleccionado.Stock} {productoSeleccionado.UnidadMedida}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {productoSeleccionado.Descripcion && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Descripción</p>
                  <p className="text-gray-700">{productoSeleccionado.Descripcion}</p>
                </div>
              )}

              {/* Botón cerrar */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setModalDetalle(false)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR (igual) */}
      {modalEliminar && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-slideUp">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4 border-2 border-red-200">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Eliminar producto?</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de eliminar <span className="font-bold text-blue-600">{productoSeleccionado.Nombre}</span>?
              </p>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-6 border border-red-200">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={eliminarProducto}
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

export default GestionProductos;