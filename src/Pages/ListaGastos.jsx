import React, { useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Tag
} from "lucide-react";
import FormularioGasto from "./FormularioGasto";

export default function ListaGastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Para Create React App usa REACT_APP_API_URL
    const url = "https://sistemagolden-backend-production.up.railway.app";//process.env.REACT_APP_API_URL || "http://localhost:5000"//"https://sistemagolden-backend-production.up.railway.app";//
    //"https://sistemagolden-backend-production.up.railway.app"
    setBackendUrl(url);
    console.log("🔗 URL del backend detectada:", url);
  }, []);

  // ✅ Cargar lista de gastos
  const cargarGastos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/gastos`);
      const data = await res.json();
      setGastos(data);
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  // ✅ Eliminar gasto
  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este gasto?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/gastos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Gasto eliminado correctamente");
        cargarGastos();
      } else {
        alert("❌ Error al eliminar gasto");
      }
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
    }
  };

  // ✅ Ver detalle
  const openDetalle = (gasto) => {
    setSelectedGasto(gasto);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedGasto(null);
    setModalVisible(false);
  };

  // ✅ Crear o editar
  const openFormulario = (gasto = null) => {
    setSelectedGasto(gasto);
    setShowForm(true);
  };

  const closeFormulario = () => {
    setSelectedGasto(null);
    setShowForm(false);
    cargarGastos();
  };

  // Estadísticas
  const stats = {
    total: gastos.length,
    montoTotal: gastos.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0),
    promedio: gastos.length > 0 ? gastos.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0) / gastos.length : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 p-4 sm:p-6">
      {/* Header con Estadísticas */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Administra y controla todos los gastos del negocio</p>
            </div>
          </div>

          <button
            onClick={() => openFormulario()}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Nuevo Gasto</span>
          </button>
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Gastos</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm">Monto Total</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">${stats.montoTotal.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Promedio</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">${stats.promedio.toFixed(2)}</p>
              </div>
              <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla - Versión Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gastos.length > 0 ? (
                    gastos.map((gasto) => (
                      <tr
                        key={gasto.gasto_id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm mr-3">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {gasto.descripcion}
                              </div>
                              <div className="text-sm text-gray-500">#{gasto.gasto_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {gasto.Nombre || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center text-gray-900 font-semibold">
                            <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                            ${Number(gasto.monto).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-gray-700">
                          {gasto.usuario || "Sistema"}
                        </td>
                        <td className="py-4 px-6 text-center text-sm text-gray-700">
                          <div className="flex items-center justify-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(gasto.fecha_gasto).toLocaleDateString("es-PE")}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => openDetalle(gasto)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openFormulario(gasto)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => eliminarGasto(gasto.gasto_id)}
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
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <DollarSign className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No se encontraron gastos</p>
                          <p className="text-sm">Comienza registrando tu primer gasto</p>
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

      {/* Lista - Versión Móvil */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : gastos.length > 0 ? (
          gastos.map((gasto) => (
            <div key={gasto.gasto_id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {gasto.descripcion}
                    </h3>
                    <p className="text-xs text-gray-500">ID: #{gasto.gasto_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => openDetalle(gasto)}
                  className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Categoría:</span>
                  <span className="font-medium text-blue-600">{gasto.Nombre || "-"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-bold text-green-600">${Number(gasto.monto).toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Usuario:</span>
                  <span className="font-medium text-gray-900">{gasto.usuario || "Sistema"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(gasto.fecha_gasto).toLocaleDateString("es-PE")}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-2 pt-3 mt-3 border-t border-gray-200">
                <button
                  onClick={() => openFormulario(gasto)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminarGasto(gasto.gasto_id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <DollarSign className="w-16 h-16 mb-4 text-gray-300 mx-auto" />
            <p className="text-lg font-medium text-gray-500 mb-2">No se encontraron gastos</p>
            <p className="text-sm text-gray-400">Comienza registrando tu primer gasto</p>
          </div>
        )}
      </div>

      {/* Modal de Detalle Mejorado - Totalmente Responsive */}
      {modalVisible && selectedGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mx-auto relative max-h-[95vh] overflow-y-auto">
            {/* Header móvil */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">Detalle del Gasto</h2>
                    <p className="text-gray-300 text-xs sm:text-sm truncate">Información completa del gasto</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-300 hover:text-white transition-colors p-1 sm:p-2 hover:bg-white hover:bg-opacity-10 rounded-lg flex-shrink-0 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Información Principal - Una columna en móvil */}
              <div className="space-y-4 sm:space-y-5 mb-4 sm:mb-6">
                {/* Descripción */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Descripción</h3>
                      <p className="text-gray-800 font-medium text-sm sm:text-base break-words">
                        {selectedGasto.descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categoría y Monto - Stack en móvil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-semibold text-gray-700">Categoría</h3>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedGasto.Nombre || "-"}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <h3 className="text-xs font-semibold text-gray-700">Monto</h3>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-green-600">${Number(selectedGasto.monto).toFixed(2)}</p>
                  </div>
                </div>

                {/* Fecha */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Fecha del Gasto</h3>
                      <p className="text-gray-800 font-medium text-sm">
                        {new Date(selectedGasto.fecha_gasto).toLocaleDateString("es-PE", {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(selectedGasto.fecha_gasto).toLocaleTimeString("es-PE", {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información Adicional - Grid responsive */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                      <h3 className="text-xs font-semibold text-gray-700">Usuario</h3>
                    </div>
                    <p className="text-gray-800 font-medium text-xs sm:text-sm truncate" title={selectedGasto.usuario || "Sistema"}>
                      {selectedGasto.usuario || "Sistema"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      <h3 className="text-xs font-semibold text-gray-700">ID</h3>
                    </div>
                    <p className="text-gray-600 font-mono text-xs sm:text-sm">#{selectedGasto.gasto_id}</p>
                  </div>
                </div>
              </div>

              {/* Tipo de Pago - Si existe */}
              {selectedGasto.TipoPago && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Método de Pago</h3>
                      <p className="text-gray-800 font-medium text-sm sm:text-base">
                        {selectedGasto.TipoPago}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 mb-4 sm:mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Observaciones</h3>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 max-h-32 overflow-y-auto">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedGasto.observaciones || (
                          <span className="text-gray-400 italic text-sm">No hay observaciones registradas</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de Estado - Stack en móvil */}
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Resumen del Estado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Monto Total</p>
                    <p className="text-base sm:text-lg font-bold text-gray-800">${Number(selectedGasto.monto).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Estado</p>
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                      Registrado
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer con Acciones - Stack en móvil */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                <div className="text-xs text-gray-500 text-center sm:text-left">
                  Consultado el {new Date().toLocaleDateString("es-PE")}
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      closeModal();
                      openFormulario(selectedGasto);
                    }}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-sm w-full sm:w-auto order-2 sm:order-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex items-center justify-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold text-sm w-full sm:w-auto order-1 sm:order-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cerrar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {selectedGasto ? "Editar Gasto" : "Nuevo Gasto"}
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {selectedGasto ? "Actualiza la información del gasto" : "Registra un nuevo gasto en el sistema"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeFormulario}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <FormularioGasto
                gastoSeleccionado={selectedGasto}
                onClose={closeFormulario}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}