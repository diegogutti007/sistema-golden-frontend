import React, { useState, useEffect } from "react";
import { BACKEND_URL } from '../config';
import ArticuloModal from "../Modales/ArticuloModal";

export default function GestionArticulos() {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [articuloEdit, setArticuloEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

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

  // Renderizar vista de tarjetas para móvil/tablet
  const renderCards = () => (
    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-3`}>
      {articulosFiltrados.map((articulo) => (
        <div 
          key={articulo.ArticuloID} 
          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Header de la tarjeta */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {articulo.Nombre}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {articulo.Codigo || 'Sin código'}
                </p>
              </div>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                articulo.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {articulo.Estado}
              </span>
            </div>
          </div>

          {/* Cuerpo de la tarjeta */}
          <div className="p-3 space-y-2">
            {/* Descripción */}
            {articulo.Descripcion && (
              <p className="text-xs text-gray-600 line-clamp-2">
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

            {/* Stock y Categoría */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                articulo.Stock <= 5 ? 'bg-red-100 text-red-800' : 
                articulo.Stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                Stock: {articulo.Stock} {articulo.UnidadMedida}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-[120px]">
                {getCategoriaNombre(articulo.CategoriaID)}
              </span>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="p-3 border-t border-gray-100 flex justify-end space-x-2">
            <button
              onClick={() => handleEditar(articulo)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <span className="text-base">✏️</span>
            </button>
            <button
              onClick={() => handleEliminar(articulo.ArticuloID)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <span className="text-base">🗑️</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizar tabla compacta para desktop
  const renderTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-[10%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="w-[15%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="w-[20%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th className="w-[8%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P. Compra</th>
            <th className="w-[8%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P. Venta</th>
            <th className="w-[8%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="w-[12%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="w-[8%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="w-[11%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articulosFiltrados.map((articulo) => (
            <tr key={articulo.ArticuloID} className="hover:bg-gray-50">
              <td className="px-2 py-3 text-xs text-gray-900 truncate" title={articulo.Codigo}>
                {articulo.Codigo || '-'}
              </td>
              <td className="px-2 py-3 text-xs text-gray-500 truncate" title={articulo.Nombre}>
                {articulo.Nombre}
              </td>
              <td className="px-2 py-3 text-xs text-gray-500 truncate" title={articulo.Descripcion}>
                {articulo.Descripcion || '-'}
              </td>
              <td className="px-2 py-3 text-xs text-gray-500">
                S/ {parseFloat(articulo.PrecioCompra || 0).toFixed(2)}
              </td>
              <td className="px-2 py-3 text-xs text-gray-500">
                S/ {parseFloat(articulo.PrecioVenta).toFixed(2)}
              </td>
              <td className="px-2 py-3">
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  articulo.Stock <= 5 ? 'bg-red-100 text-red-800' : 
                  articulo.Stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {articulo.Stock} {articulo.UnidadMedida}
                </span>
              </td>
              <td className="px-2 py-3 text-xs text-gray-500 truncate" title={getCategoriaNombre(articulo.CategoriaID)}>
                {getCategoriaNombre(articulo.CategoriaID)}
              </td>
              <td className="px-2 py-3">
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  articulo.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {articulo.Estado}
                </span>
              </td>
              <td className="px-2 py-3 text-xs font-medium">
                <button
                  onClick={() => handleEditar(articulo)}
                  className="text-blue-600 hover:text-blue-900 mr-2 p-1"
                  title="Editar"
                >
                  <span className="text-sm">✏️</span>
                </button>
                <button
                  onClick={() => handleEliminar(articulo.ArticuloID)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Eliminar"
                >
                  <span className="text-sm">🗑️</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header fijo */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">
            Gestión de Artículos
          </h1>
          
          <button
            onClick={() => {
              setArticuloEdit(null);
              setModalIsOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
          >
            <span className="text-lg">➕</span>
            <span>Nuevo Artículo</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">Cargando artículos...</span>
          </div>
        ) : articulosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No se encontraron artículos</p>
          </div>
        ) : (
          <>
            {/* Vista automática según dispositivo */}
            {isDesktop ? renderTable() : renderCards()}
          </>
        )}
      </div>

      {/* Modal */}
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
  );
}