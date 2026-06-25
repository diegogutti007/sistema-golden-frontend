import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  RefreshCw,
  Printer,
  Download,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Wallet,
  Target,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";

import { BACKEND_URL } from "../config";

const DashboardVentas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState("mensual");
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());
  const [mesSelected, setMesSelected] = useState(new Date().getMonth() + 1);
  const [semanaSelected, setSemanaSelected] = useState(1);
  const [datosVentas, setDatosVentas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    promedioVentas: 0,
    ventaMaxima: 0,
    ventaMinima: 0,
    crecimiento: 0,
    tendencia: "estable"
  });
  const [topProductos, setTopProductos] = useState([]);
  const [resumenMensual, setResumenMensual] = useState([]);

  // Generar datos de ejemplo para prueba
  const generarDatosEjemplo = () => {
    const datos = [];
    const labels = periodo === 'anual' ? 
      ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] :
      periodo === 'mensual' ?
        Array.from({ length: 30 }, (_, i) => String(i + 1)) :
        ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    for (let i = 0; i < labels.length; i++) {
      datos.push({
        label: labels[i],
        total: Math.floor(Math.random() * 5000) + 1000,
        cantidad: Math.floor(Math.random() * 20) + 1
      });
    }
    return datos;
  };

  useEffect(() => {
    fetchVentas();
  }, [periodo, yearSelected, mesSelected, semanaSelected]);

  const fetchVentas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        periodo: periodo,
        year: yearSelected,
        mes: mesSelected,
        semana: semanaSelected
      };
      
      const response = await axios.get(`${BACKEND_URL}/api/dashboard-ventas`, { params });
      if (response.data.success) {
        setDatosVentas(response.data.data.ventas || []);
        setEstadisticas(response.data.data.estadisticas || {});
        setTopProductos(response.data.data.top_productos || []);
        setResumenMensual(response.data.data.resumen_mensual || []);
      } else {
        setError(response.data.error);
        // Si hay error, usar datos de ejemplo
        setDatosVentas(generarDatosEjemplo());
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar datos de ventas, mostrando datos de ejemplo");
      // Usar datos de ejemplo si falla la API
      setDatosVentas(generarDatosEjemplo());
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-PE");
  };

  const getTendenciaColor = (crecimiento) => {
    if (crecimiento > 0) return "text-green-600";
    if (crecimiento < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getTendenciaIcono = (crecimiento) => {
    if (crecimiento > 0) return <TrendingUp className="w-5 h-5" />;
    if (crecimiento < 0) return <TrendingDown className="w-5 h-5" />;
    return null;
  };

  // Graficar datos
  const renderGrafico = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-yellow-600">
          <p>{error}</p>
          <button onClick={fetchVentas} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      );
    }

    if (!datosVentas || datosVentas.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>No hay datos de ventas disponibles</p>
          <button onClick={fetchVentas} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Cargar datos
          </button>
        </div>
      );
    }

    const datos = datosVentas;
    const totales = datos.map(d => d.total);
    const maxValor = Math.max(...totales, 1);
    const minValor = Math.min(...totales, 0);
    const rango = maxValor - minValor || 1;

    // Verificar que hay datos suficientes
    if (datos.length < 2) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>Se necesitan al menos 2 puntos para mostrar el gráfico</p>
        </div>
      );
    }

    return (
      <div className="relative h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
          {/* Grid horizontal */}
          {[0, 25, 50, 75, 100].map((val, idx) => (
            <line
              key={idx}
              x1="40"
              y1={idx * 60 + 10}
              x2="990"
              y2={idx * 60 + 10}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Líneas verticales */}
          {datos.map((d, i) => {
            const x = 40 + (i / (datos.length - 1)) * 950;
            return (
              <line
                key={i}
                x1={x}
                y1="10"
                x2={x}
                y2="250"
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}
          
          {/* Área bajo la línea */}
          <polygon
            points={datos.map((d, i) => {
              const x = 40 + (i / (datos.length - 1)) * 950;
              const y = 250 - ((d.total - minValor) / rango) * 220 - 10;
              return `${x},${y}`;
            }).join(' ') + `, ${40 + (datos.length - 1) * 950 / (datos.length - 1)},250, 40,250`
            }
            fill="rgba(59, 130, 246, 0.1)"
            stroke="none"
          />
          
          {/* Línea principal */}
          <polyline
            points={datos.map((d, i) => {
              const x = 40 + (i / (datos.length - 1)) * 950;
              const y = 250 - ((d.total - minValor) / rango) * 220 - 10;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Línea de tendencia */}
          {datos.length > 1 && (
            <line
              x1="40"
              y1={250 - ((datos[0].total - minValor) / rango) * 220 - 10}
              x2="990"
              y2={250 - ((datos[datos.length - 1].total - minValor) / rango) * 220 - 10}
              stroke="#22c55e"
              strokeWidth="2"
              strokeDasharray="8,4"
            />
          )}
          
          {/* Puntos */}
          {datos.map((d, i) => {
            const x = 40 + (i / (datos.length - 1)) * 950;
            const y = 250 - ((d.total - minValor) / rango) * 220 - 10;
            const esMax = d.total === maxValor;
            const esMin = d.total === minValor && minValor > 0;
            
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={esMax || esMin ? 6 : 4}
                  fill={esMax ? '#22c55e' : esMin ? '#ef4444' : '#3b82f6'}
                  stroke="white"
                  strokeWidth="2"
                />
                {i % Math.max(1, Math.floor(datos.length / 10)) === 0 && (
                  <text
                    x={x}
                    y="270"
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {d.label}
                  </text>
                )}
                {(esMax || esMin) && (
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill={esMax ? '#22c55e' : '#ef4444'}
                    fontWeight="bold"
                  >
                    {formatMoney(d.total)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Obtener nombre del mes
  const getNombreMes = (mes) => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[mes - 1] || mes;
  };

  // Obtener semanas del mes
  const getSemanasMes = () => {
    const fecha = new Date(yearSelected, mesSelected - 1, 1);
    const ultimoDia = new Date(yearSelected, mesSelected, 0);
    const semanas = [];
    let semanaActual = 1;
    let diaInicio = 1;
    
    while (diaInicio <= ultimoDia.getDate()) {
      const diaFin = Math.min(diaInicio + 6, ultimoDia.getDate());
      semanas.push({
        numero: semanaActual,
        inicio: diaInicio,
        fin: diaFin,
        label: `Semana ${semanaActual} (${diaInicio}-${diaFin})`
      });
      semanaActual++;
      diaInicio += 7;
    }
    return semanas;
  };

  const semanasDisponibles = getSemanasMes();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <LineChart className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Dashboard de Ventas
                </h1>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Análisis de ventas por año, mes y semana con tendencias
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fetchVentas()}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Periodo</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="anual">Anual</option>
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            
            {periodo === "anual" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Año</label>
                <select
                  value={yearSelected}
                  onChange={(e) => setYearSelected(parseInt(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
            
            {(periodo === "mensual" || periodo === "semanal") && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Año</label>
                  <select
                    value={yearSelected}
                    onChange={(e) => setYearSelected(parseInt(e.target.value))}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    {[2023, 2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mes</label>
                  <select
                    value={mesSelected}
                    onChange={(e) => setMesSelected(parseInt(e.target.value))}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                      <option key={mes} value={mes}>{getNombreMes(mes)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            {periodo === "semanal" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Semana</label>
                <select
                  value={semanaSelected}
                  onChange={(e) => setSemanaSelected(parseInt(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  {semanasDisponibles.map(sem => (
                    <option key={sem.numero} value={sem.numero}>{sem.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-xs">Total Ventas</p>
            <p className="text-xl font-bold">{formatMoney(estadisticas.totalVentas)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-xs">Promedio</p>
            <p className="text-xl font-bold">{formatMoney(estadisticas.promedioVentas)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-purple-100 text-xs">Venta Máxima</p>
            <p className="text-xl font-bold">{formatMoney(estadisticas.ventaMaxima)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <p className="text-orange-100 text-xs">Venta Mínima</p>
            <p className="text-xl font-bold">{formatMoney(estadisticas.ventaMinima)}</p>
          </div>
          <div className={`bg-gradient-to-br rounded-xl p-4 text-white ${
            estadisticas.crecimiento > 0 ? 'from-emerald-500 to-emerald-600' : 
            estadisticas.crecimiento < 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-white/80 text-xs">Crecimiento</p>
              {getTendenciaIcono(estadisticas.crecimiento)}
            </div>
            <p className="text-xl font-bold">{estadisticas.crecimiento?.toFixed(1) || 0}%</p>
          </div>
        </div>

        {/* Gráfico de Líneas */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Tendencia de Ventas</h2>
              <p className="text-sm text-gray-500">
                {periodo === "anual" && `Evolución mensual - ${yearSelected}`}
                {periodo === "mensual" && `Evolución diaria - ${getNombreMes(mesSelected)} ${yearSelected}`}
                {periodo === "semanal" && `Evolución diaria - Semana ${semanaSelected} de ${getNombreMes(mesSelected)} ${yearSelected}`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                Ventas
              </span>
              <span className="flex items-center gap-1 ml-3">
                <div className="w-3 h-0.5 bg-green-500 border-t-2 border-dashed"></div>
                Tendencia
              </span>
            </div>
          </div>

          {renderGrafico()}
        </div>

        {/* Top Productos y Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Productos */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Productos
            </h3>
            {topProductos.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay productos</p>
            ) : (
              <div className="space-y-3">
                {topProductos.map((producto, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{producto.nombre}</p>
                      <p className="text-xs text-gray-500">{producto.cantidad} unidades</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{formatMoney(producto.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen Mensual */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Resumen Mensual
            </h3>
            {resumenMensual.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay datos</p>
            ) : (
              <div className="space-y-3">
                {resumenMensual.map((mes, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-16 text-sm font-medium text-gray-600">{mes.mes}</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${(mes.total / Math.max(...resumenMensual.map(m => m.total))) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-sm font-bold text-gray-800">{formatMoney(mes.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Dashboard de Ventas - Datos actualizados al {new Date().toLocaleDateString('es-PE')}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardVentas;