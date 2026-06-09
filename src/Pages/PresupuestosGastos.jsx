import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Printer,
  RefreshCw,
  Wallet,
  Target,
  PieChart,
  Bell,
  BellOff,
  CheckSquare,
  Eye,
  FileText,
  Clock,
  User
} from "lucide-react";

import { BACKEND_URL } from "../config";

const GestionPresupuestos = () => {
  const [categorias, setCategorias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelected, setPeriodoSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [resumen, setResumen] = useState(null);
  
  // Estados para el modal de detalle
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [detalleGastos, setDetalleGastos] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  
  const [editForm, setEditForm] = useState({
    presupuesto_mensual: 0,
    presupuesto_anual: 0,
    alerta_porcentaje: 80
  });

  useEffect(() => {
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (periodoSelected) {
      fetchPresupuestos();
    }
  }, [periodoSelected]);

  const fetchPeriodos = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/periodos-lista`);
      if (response.data.success) {
        setPeriodos(response.data.data);
        if (response.data.data.length > 0) {
          setPeriodoSelected(response.data.data[0].periodo_id);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar periodos: " + (err.response?.data?.error || err.message));
    }
  };

  const fetchPresupuestos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/presupuestos-alertas`, {
        params: { periodo_id: periodoSelected }
      });
      if (response.data.success) {
        setCategorias(response.data.data.categorias || []);
        setResumen(response.data.data.resumen);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar presupuestos: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener detalle de gastos por categoría
  const fetchDetalleGastos = async (categoria) => {
    setLoadingDetalle(true);
    setSelectedCategoria(categoria);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/gastos-por-categoria`, {
        params: { 
          categoria_id: categoria.categoria_id,
          periodo_id: periodoSelected,
          limite: 50
        }
      });
      if (response.data.success) {
        setDetalleGastos(response.data.data || []);
      } else {
        setDetalleGastos([]);
      }
    } catch (err) {
      console.error(err);
      setDetalleGastos([]);
    } finally {
      setLoadingDetalle(false);
      setShowDetailModal(true);
    }
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      await axios.put(`${BACKEND_URL}/api/categorias-gasto/${id}/presupuesto`, editForm);
      await fetchPresupuestos();
      setEditandoId(null);
      setEditForm({ presupuesto_mensual: 0, presupuesto_anual: 0, alerta_porcentaje: 80 });
    } catch (err) {
      console.error(err);
      setError("Error al actualizar presupuesto");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditandoId(categoria.categoria_id);
    setEditForm({
      presupuesto_mensual: categoria.presupuesto_mensual || 0,
      presupuesto_anual: categoria.presupuesto_anual || 0,
      alerta_porcentaje: categoria.alerta_porcentaje || 80
    });
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
    setEditForm({ presupuesto_mensual: 0, presupuesto_anual: 0, alerta_porcentaje: 80 });
  };

  const formatMoney = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Función para determinar el estado según el porcentaje
  const determinarEstado = (porcentaje) => {
    if (porcentaje > 100) return 'SOBREPASADO';
    if (porcentaje === 100) return 'COMPLETADO';
    if (porcentaje >= 80) return 'CERCANO';
    return 'NORMAL';
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'SOBREPASADO':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'COMPLETADO':
        return <CheckSquare className="w-4 h-4 text-blue-500" />;
      case 'CERCANO':
        return <Bell className="w-4 h-4 text-yellow-500" />;
      case 'NORMAL':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <BellOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'SOBREPASADO':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">⚠️ Sobrepasado</span>;
      case 'COMPLETADO':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">✓ Completado</span>;
      case 'CERCANO':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">🔔 Cercano</span>;
      case 'NORMAL':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✅ Normal</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">⚪ Sin presupuesto</span>;
    }
  };

  const getProgressColor = (estado) => {
    switch(estado) {
      case 'SOBREPASADO': return 'bg-red-500';
      case 'COMPLETADO': return 'bg-blue-500';
      case 'CERCANO': return 'bg-yellow-500';
      case 'NORMAL': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                Gestión de Presupuestos
              </h1>
              <p className="text-gray-600 mt-2">
                Define presupuestos por categoría y recibe alertas cuando te acerques al límite
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchPresupuestos}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Selector de periodo */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Periodo:</span>
            </div>
            <select
              value={periodoSelected}
              onChange={(e) => setPeriodoSelected(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periodos.map(p => (
                <option key={p.periodo_id} value={p.periodo_id}>
                  {p.nombre || p.periodo} ({p.periodo})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        {resumen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Presupuesto Total</span>
              </div>
              <div className="text-xl font-bold">{formatMoney(resumen.total_presupuesto)}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Gasto Real</span>
              </div>
              <div className="text-xl font-bold">{formatMoney(resumen.total_gastos)}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-medium">Diferencia</span>
              </div>
              <div className={`text-xl font-bold ${resumen.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMoney(Math.abs(resumen.diferencia))}
                <span className="text-sm ml-1">
                  {resumen.diferencia >= 0 ? '(sobra)' : '(falta)'}
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <PieChart className="w-4 h-4" />
                <span className="text-xs font-medium">Ejecución</span>
              </div>
              <div className="text-xl font-bold">{resumen.porcentaje_ejecucion?.toFixed(1) || 0}%</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Sobrepasados</span>
              </div>
              <div className="text-xl font-bold">{resumen.categorias_alerta || 0}</div>
            </div>
          </div>
        )}

        {/* Tabla de categorías */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Presupuesto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gasto Real</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diferencia</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ejecución</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alerta %</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categorias.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No hay categorías registradas
                      </td>
                    </tr>
                  ) : (
                    categorias.map((categoria) => {
                      const porcentaje = categoria.porcentaje_ejecucion || 0;
                      const diferencia = categoria.diferencia || 0;
                      const estado = categoria.estado || determinarEstado(porcentaje);
                      
                      return (
                        <tr key={categoria.categoria_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{categoria.nombre}</div>
                            {categoria.descripcion && (
                              <div className="text-xs text-gray-500">{categoria.descripcion}</div>
                            )}
                          </td>
                          
                          <td className="px-4 py-3">
                            {editandoId === categoria.categoria_id ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.presupuesto_mensual}
                                onChange={(e) => setEditForm({ ...editForm, presupuesto_mensual: parseFloat(e.target.value) || 0 })}
                                className="w-32 text-right border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-right font-medium">
                                {formatMoney(categoria.presupuesto_mensual)}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-4 py-3 text-right">
                            <div>
                              <span className="font-medium text-red-600">
                                {formatMoney(categoria.gasto_real_mensual)}
                              </span>
                              {categoria.cantidad_gastos > 0 && (
                                <div className="text-xs text-gray-400">{categoria.cantidad_gastos} gastos</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3 text-right">
                            <span className={`font-medium ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatMoney(Math.abs(diferencia))}
                              <span className="text-xs ml-1">
                                {diferencia >= 0 ? '(sobra)' : '(falta)'}
                              </span>
                            </span>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${getProgressColor(estado)}`}
                                  style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium min-w-[45px]">
                                {porcentaje.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-4 py-3 text-center">
                            {editandoId === categoria.categoria_id ? (
                              <input
                                type="number"
                                value={editForm.alerta_porcentaje}
                                onChange={(e) => setEditForm({ ...editForm, alerta_porcentaje: parseInt(e.target.value) || 80 })}
                                className="w-16 text-center border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-center">{categoria.alerta_porcentaje}%</span>
                            )}
                          </td>
                          
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getEstadoIcon(estado)}
                              {getEstadoBadge(estado)}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => fetchDetalleGastos(categoria)}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                title="Ver detalle de gastos"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {editandoId === categoria.categoria_id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdate(categoria.categoria_id)}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Guardar"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleEdit(categoria)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Editar presupuesto"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Detalle de Gastos */}
        {showDetailModal && selectedCategoria && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-xl">
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-bold">{selectedCategoria.nombre}</h2>
                      <p className="text-purple-200 text-sm">Detalle de gastos del periodo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Resumen de la categoría */}
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Presupuesto</p>
                    <p className="text-lg font-bold text-blue-600">{formatMoney(selectedCategoria.presupuesto_mensual)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Gasto Real</p>
                    <p className={`text-lg font-bold ${(selectedCategoria.porcentaje_ejecucion || 0) > 100 ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatMoney(selectedCategoria.gasto_real_mensual)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Ejecución</p>
                    <p className={`text-lg font-bold ${
                      (selectedCategoria.porcentaje_ejecucion || 0) > 100 ? 'text-red-600' :
                      (selectedCategoria.porcentaje_ejecucion || 0) >= 80 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {(selectedCategoria.porcentaje_ejecucion || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Lista de gastos */}
              <div className="p-5 overflow-y-auto max-h-[50vh]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Lista de Gastos
                  </h3>
                  <span className="text-xs text-gray-500">
                    {detalleGastos.length} gastos encontrados
                  </span>
                </div>
                
                {loadingDetalle ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : detalleGastos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay gastos registrados en esta categoría</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detalleGastos.map((gasto, index) => (
                      <div key={gasto.gasto_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{gasto.descripcion}</span>
                            {gasto.categoria && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                                {gasto.categoria}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {gasto.fecha_gasto && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(gasto.fecha_gasto)}
                              </span>
                            )}
                            {gasto.periodo_nombre && (
                              <span className="text-xs text-gray-400">
                                Periodo: {gasto.periodo_nombre}
                              </span>
                            )}
                            {gasto.usuario && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {gasto.usuario}
                              </span>
                            )}
                          </div>
                          {gasto.observaciones && (
                            <p className="text-xs text-gray-400 mt-1">{gasto.observaciones}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{formatMoney(gasto.monto)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer del Modal */}
              <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer con información */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">¿Cómo funcionan las alertas?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li><strong>Normal (✅)</strong>: Gasto menor al 80% del presupuesto</li>
                <li><strong>Cercano (🔔)</strong>: Gasto entre 80% y 99.9% del presupuesto</li>
                <li><strong>Completado (✓)</strong>: Gasto igual al 100% del presupuesto</li>
                <li><strong>Sobrepasado (⚠️)</strong>: Gasto supera el 100% del presupuesto</li>
                <li>Haz clic en el ícono <Eye className="w-3 h-3 inline" /> para ver el detalle de gastos de cada categoría</li>
                <li>Puedes editar el presupuesto para cada categoría haciendo clic en el ícono de editar</li>
                <li>Los gastos reales se calculan automáticamente desde la tabla de gastos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionPresupuestos;