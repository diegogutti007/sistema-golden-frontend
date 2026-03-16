import React, { useState, useEffect } from "react";
import { BACKEND_URL } from '../config';
import ArticuloModal from "../Modales/ArticuloModal";
import {
  Search,
  Package,
  DollarSign,
  ShoppingCart,
  Edit,
  Trash2,
  Eye,
  X,
  Grid,
  Table as TableIcon
} from "lucide-react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function GestionArticulos() {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [articuloEdit, setArticuloEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [articuloDetalle, setArticuloDetalle] = useState(null);
  const [viewMode, setViewMode] = useState('auto');

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1280;
  const isDesktop = windowWidth >= 1280;

  // Determinar vista según modo y dispositivo
  const getEffectiveViewMode = () => {
    if (viewMode === 'table' && isDesktop) return 'table';
    if (viewMode === 'grid') return 'grid';
    if (isDesktop) return 'table';
    return 'grid';
  };

  const effectiveViewMode = getEffectiveViewMode();

  // Función para obtener token
  const getToken = () => localStorage.getItem('token');

  // Función para manejar respuestas
  const handleResponse = async (response) => {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
  };

  // Cargar artículos
  const fetchArticulos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/articulos`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await handleResponse(response);
      setArticulos(data);
    } catch (error) {
      console.error("❌ Error al cargar artículos:", error);
      alert("Error al cargar los artículos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías para el selector
  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categorias`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await handleResponse(response);
      setCategorias(data);
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    fetchArticulos();
    fetchCategorias();
  }, []);

  // Guardar artículo (crear o actualizar)
  const handleGuardar = async (articuloData) => {
    try {
      const url = articuloEdit 
        ? `${BACKEND_URL}/api/articulos/${articuloEdit.ArticuloID}`
        : `${BACKEND_URL}/api/articulos`;
      
      const response = await fetch(url, {
        method: articuloEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(articuloData),
      });

      await handleResponse(response);
      
      alert(articuloEdit ? "✅ Artículo actualizado correctamente" : "✅ Artículo creado correctamente");
      fetchArticulos();
      setModalIsOpen(false);
      setArticuloEdit(null);
    } catch (error) {
      console.error("❌ Error al guardar artículo:", error);
      alert("Error al guardar el artículo: " + error.message);
    }
  };

  // Eliminar artículo
  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este artículo?")) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/articulos/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      await handleResponse(response);
      
      alert("✅ Artículo eliminado correctamente");
      fetchArticulos();
    } catch (error) {
      console.error("❌ Error al eliminar artículo:", error);
      alert("Error al eliminar el artículo: " + error.message);
    }
  };

  // Abrir modal para editar
  const handleEditar = (articulo) => {
    setArticuloEdit(articulo);
    setModalIsOpen(true);
  };

  // Ver detalle del artículo
  const verDetalle = (articulo) => {
    setArticuloDetalle(articulo);
    setDetalleModalOpen(true);
  };

  // Filtrar artículos por búsqueda
  const articulosFiltrados = articulos.filter(articulo =>
    articulo.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.Codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener nombre de categoría
  const getCategoriaNombre = (categoriaId) => {
    if (!categoriaId) return 'Sin categoría';
    const categoria = categorias.find(c => c.CategoriaID === categoriaId);
    return categoria?.Nombre || 'Sin categoría';
  };

  // Estadísticas
  const stats = {
    total: articulos.length,
    activos: articulos.filter(a => a.Estado === 'Activo').length,
    stockBajo: articulos.filter(a => a.Stock <= 5).length,
    valorInventario: articulos.reduce((sum, a) => sum + (parseFloat(a.PrecioCompra || 0) * (a.Stock || 0)), 0)
  };

  // Prevenir scroll del body cuando el modal de detalle está abierto
  useEffect(() => {
    if (detalleModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [detalleModalOpen]);

  return (
    <div className="p-4 sm:p-6">
      {/* Header con Estadísticas */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Artículos</h1>
            <p className="text-gray-600 text-sm">Administra el inventario de productos y servicios</p>
          </div>
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Artículos</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Artículos Activos</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.activos}</p>
              </div>
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs sm:text-sm">Stock Bajo</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.stockBajo}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Valor Inventario</p>
                <p className="text-xl sm:text-2xl font-bold">S/ {stats.valorInventario.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Acciones */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Selector de vista (solo en desktop) */}
            {isDesktop && (
              <div className="flex items-center bg-gray-100 rounded-xl p-1 mr-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${effectiveViewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${effectiveViewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista tabla"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setArticuloEdit(null);
                setModalIsOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span className="text-lg">➕</span>
              <span>Nuevo Artículo</span>
            </button>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right mt-3">
          {articulosFiltrados.length} de {articulos.length} artículos
        </div>
      </div>

      {/* Vista de Tabla */}
      {effectiveViewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        P. Compra
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        P. Venta
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articulosFiltrados.length > 0 ? (
                      articulosFiltrados.map((articulo) => (
                        <tr
                          key={articulo.ArticuloID}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {articulo.Codigo || '—'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {articulo.Nombre}
                              </div>
                              {articulo.Descripcion && (
                                <div className="text-xs text-gray-500 truncate max-w-xs" title={articulo.Descripcion}>
                                  {articulo.Descripcion}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {getCategoriaNombre(articulo.CategoriaID)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center text-gray-700">
                              <DollarSign className="text-gray-400 mr-1 w-4 h-4" />
                              <span className="font-medium">
                                S/ {parseFloat(articulo.PrecioCompra || 0).toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center text-green-600 font-semibold">
                              <DollarSign className="text-green-400 mr-1 w-4 h-4" />
                              <span>S/ {parseFloat(articulo.PrecioVenta).toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              articulo.Stock <= 5 ? 'bg-red-100 text-red-800' : 
                              articulo.Stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {articulo.Stock} {articulo.UnidadMedida}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              articulo.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {articulo.Estado}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => verDetalle(articulo)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditar(articulo)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEliminar(articulo.ArticuloID)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-12 text-center">
                          <div className="flex flex-col items-center text-gray-500">
                            <Package className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No se encontraron artículos</p>
                            <p className="text-sm">Intenta con otros términos de búsqueda</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Vista de Cuadrícula */}
      {effectiveViewMode === 'grid' && (
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-4`}>
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : articulosFiltrados.length > 0 ? (
            articulosFiltrados.map((articulo) => (
              <div key={articulo.ArticuloID} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header de la tarjeta */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate" title={articulo.Nombre}>
                          {articulo.Nombre}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {articulo.Codigo || 'Sin código'}
                        </p>
                      </div>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      articulo.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {articulo.Estado}
                    </span>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-4 space-y-3">
                  {/* Categoría */}
                  <div className="flex items-center text-xs text-gray-600">
                    <Package className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{getCategoriaNombre(articulo.CategoriaID)}</span>
                  </div>

                  {/* Descripción (si existe) */}
                  {articulo.Descripcion && (
                    <p className="text-xs text-gray-500 line-clamp-2" title={articulo.Descripcion}>
                      {articulo.Descripcion}
                    </p>
                  )}

                  {/* Precios */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Compra</p>
                      <p className="font-semibold text-sm text-gray-800">
                        S/ {parseFloat(articulo.PrecioCompra || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Venta</p>
                      <p className="font-semibold text-sm text-green-600">
                        S/ {parseFloat(articulo.PrecioVenta).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Stock:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      articulo.Stock <= 5 ? 'bg-red-100 text-red-800' : 
                      articulo.Stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {articulo.Stock} {articulo.UnidadMedida}
                    </span>
                  </div>
                </div>

                {/* Footer con acciones */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end space-x-2">
                  <button
                    onClick={() => verDetalle(articulo)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditar(articulo)}
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors duration-200"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(articulo.ArticuloID)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
              <Package className="w-16 h-16 mb-4 text-gray-300 mx-auto" />
              <p className="text-lg font-medium text-gray-500 mb-2">No se encontraron artículos</p>
              <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Creación/Edición - CORREGIDO */}
      {modalIsOpen && (
        <div className="fixed inset-0 z-[200]">
          <ArticuloModal
            isOpen={modalIsOpen}
            onRequestClose={() => {
              setModalIsOpen(false);
              setArticuloEdit(null);
            }}
            onGuardar={handleGuardar}
            articuloEdit={articuloEdit}
            categorias={categorias}
          />
        </div>
      )}

      {/* Modal de Detalle */}
      <Modal
        isOpen={detalleModalOpen}
        onRequestClose={() => setDetalleModalOpen(false)}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-2 sm:mx-4 relative max-h-[95vh] overflow-hidden outline-none"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-2 sm:p-4"
        style={{
          overlay: {
            zIndex: 150
          },
          content: {
            zIndex: 151
          }
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header del Modal */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="max-w-[200px] sm:max-w-none">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  {articuloDetalle?.Nombre}
                </h2>
                <p className="text-blue-100 text-xs truncate">
                  {articuloDetalle?.Codigo || "Sin código"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDetalleModalOpen(false)}
              className="text-white hover:bg-white/20 p-1 sm:p-2 rounded-xl transition-colors duration-200 flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Contenido del Modal */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}>
            {articuloDetalle && (
              <div className="space-y-4">
                {/* Información Principal Compacta */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                      {articuloDetalle.Nombre?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full shadow-sm text-xs">
                          <Package className="w-3 h-3 text-gray-500" />
                          <span className="font-medium text-gray-700 truncate">
                            {articuloDetalle.Codigo || 'Sin código'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full shadow-sm text-xs">
                          <span className="font-medium text-gray-700">
                            {getCategoriaNombre(articuloDetalle.CategoriaID)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de Información */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Información de Precios */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>Precios</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Precio Compra</span>
                        <span className="font-bold text-gray-800 text-base">
                          S/ {parseFloat(articuloDetalle.PrecioCompra || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Precio Venta</span>
                        <span className="font-bold text-green-600 text-base">
                          S/ {parseFloat(articuloDetalle.PrecioVenta).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Margen</span>
                        <span className="font-semibold text-blue-600">
                          {articuloDetalle.PrecioCompra ? 
                            (((articuloDetalle.PrecioVenta - articuloDetalle.PrecioCompra) / articuloDetalle.PrecioVenta) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de Stock */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4 text-purple-500" />
                      <span>Inventario</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Stock Actual</span>
                        <span className={`font-bold ${
                          articuloDetalle.Stock <= 5 ? 'text-red-600' : 
                          articuloDetalle.Stock <= 10 ? 'text-yellow-600' : 
                          'text-green-600'
                        } text-base`}>
                          {articuloDetalle.Stock} {articuloDetalle.UnidadMedida}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">Unidad Medida</span>
                        <span className="font-medium text-gray-800">
                          {articuloDetalle.UnidadMedida}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estado del Artículo */}
                  <div className="sm:col-span-2">
                    <div className={`rounded-2xl p-4 border shadow-sm ${
                      articuloDetalle.Estado === 'Activo' ?
                        "bg-gradient-to-r from-green-50 to-green-100 border-green-200" :
                        "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          articuloDetalle.Estado === 'Activo' ? "bg-green-500" : "bg-red-500"
                        }`}>
                          {articuloDetalle.Estado === 'Activo' ? (
                            <ShoppingCart className="w-5 h-5 text-white" />
                          ) : (
                            <Package className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            Artículo {articuloDetalle.Estado === 'Activo' ? 'Activo' : 'Inactivo'}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {articuloDetalle.Estado === 'Activo' ?
                              "Disponible para venta" :
                              "No disponible para venta"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {articuloDetalle.Descripcion && (
                    <div className="sm:col-span-2 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-base font-semibold text-gray-800 mb-2">Descripción</h4>
                      <p className="text-sm text-gray-600">{articuloDetalle.Descripcion}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer del Modal */}
          <div className="border-t border-gray-200 px-4 py-3 flex-shrink-0 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={() => setDetalleModalOpen(false)}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base w-full sm:w-auto text-center"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}