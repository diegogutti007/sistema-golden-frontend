import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calculator,
  FileText,
  Download,
  Printer,
  Filter,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { BACKEND_URL } from "../config";

const EstadoResultados = () => {

  // =========================
  // STATES
  // =========================

  const [periodoActual, setPeriodoActual] = useState("");
  const [periodoComparativo, setPeriodoComparativo] = useState("");
  const [periodosDisponibles, setPeriodosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadoResultados, setEstadoResultados] = useState({
    periodoActual: null,
    periodoComparativo: null
  });
  const [metricas, setMetricas] = useState({
    margenBruto: 0,
    margenOperativo: 0,
    margenNeto: 0,
    crecimientoVentas: 0,
    crecimientoUtilidad: 0
  });
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({
    ingresos: true,
    costos: true,
    gastos: true,
    resultados: true
  });

  // =========================
  // OBTENER PERIODOS
  // =========================

  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/periodos-disponibles`
        );

        if (response.data.success) {
          const data = response.data.data || [];
          setPeriodosDisponibles(data);

          if (data.length >= 2) {
            setPeriodoActual(String(data[0].periodo));
            setPeriodoComparativo(String(data[1].periodo));
          } else if (data.length === 1) {
            setPeriodoActual(String(data[0].periodo));
            setPeriodoComparativo(String(data[0].periodo));
          }
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los periodos");
      }
    };

    fetchPeriodos();
  }, []);

  // =========================
  // OBTENER ESTADO RESULTADOS
  // =========================

  useEffect(() => {
    const fetchEstadoResultados = async () => {
      if (!periodoActual || !periodoComparativo) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/estado-resultados/${periodoActual}/${periodoComparativo}`
        );

        if (response.data.success) {
          setEstadoResultados(
            response.data.data || {
              periodoActual: null,
              periodoComparativo: null
            }
          );
        } else {
          setError(response.data.error);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error ||
          "Error al obtener estado de resultados"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEstadoResultados();
  }, [periodoActual, periodoComparativo]);

  // =========================
  // CALCULAR METRICAS
  // =========================

  useEffect(() => {
    const actual = estadoResultados?.periodoActual;
    const comparativo = estadoResultados?.periodoComparativo;

    if (!actual || !comparativo) return;

    const ingresosActual =
      Number(actual.ingresosOperacionales?.totalIngresosOperacionales || 0);
    const ingresosComparativo =
      Number(comparativo.ingresosOperacionales?.totalIngresosOperacionales || 0);
    const utilidadNetaActual = Number(actual.utilidadNeta || 0);
    const utilidadNetaComparativo = Number(comparativo.utilidadNeta || 0);

    const margenBruto = ingresosActual !== 0
      ? (Number(actual.utilidadBruta || 0) / ingresosActual) * 100
      : 0;

    const margenOperativo = ingresosActual !== 0
      ? (Number(actual.utilidadOperativa || 0) / ingresosActual) * 100
      : 0;

    const margenNeto = ingresosActual !== 0
      ? (utilidadNetaActual / ingresosActual) * 100
      : 0;

    const crecimientoVentas = ingresosComparativo !== 0
      ? ((ingresosActual - ingresosComparativo) / ingresosComparativo) * 100
      : 0;

    const crecimientoUtilidad = utilidadNetaComparativo !== 0
      ? ((utilidadNetaActual - utilidadNetaComparativo) / utilidadNetaComparativo) * 100
      : 0;

    setMetricas({
      margenBruto: Number(margenBruto.toFixed(2)),
      margenOperativo: Number(margenOperativo.toFixed(2)),
      margenNeto: Number(margenNeto.toFixed(2)),
      crecimientoVentas: Number(crecimientoVentas.toFixed(2)),
      crecimientoUtilidad: Number(crecimientoUtilidad.toFixed(2))
    });
  }, [estadoResultados]);

  // =========================
  // FORMATEAR MONEDA
  // =========================

  const formatearMoneda = (valor) => {
    const numero = Number(valor || 0);
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero);
  };

  // =========================
  // DIFERENCIA %
  // =========================

  const calcularDiferencia = (actual, comparativo) => {
    const a = Number(actual || 0);
    const b = Number(comparativo || 0);
    if (b === 0) return 0;
    return ((a - b) / Math.abs(b)) * 100;
  };

  // =========================
  // TOGGLE
  // =========================

  const toggleSeccion = (seccion) => {
    setSeccionesExpandidas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // =========================
  // GENERAR REPORTE
  // =========================

  const generarReporte = () => {
    const actual = estadoResultados?.periodoActual;
    if (!actual) return;

    const reporte = `ESTADO DE RESULTADOS INTEGRAL
Periodo: ${periodoActual} - Comparativo: ${periodoComparativo}
Fecha: ${new Date().toLocaleDateString('es-PE')}
===============================================================================
I. INGRESOS OPERACIONALES
===============================================================================
Ventas Netas: ${formatearMoneda(actual.ingresosOperacionales?.ventasNetas || 0)}
Otros Ingresos Operacionales: ${formatearMoneda(actual.ingresosOperacionales?.otrosIngresosOperacionales || 0)}
TOTAL INGRESOS OPERACIONALES: ${formatearMoneda(actual.ingresosOperacionales?.totalIngresosOperacionales || 0)}

II. COSTOS DE VENTAS
===============================================================================
Costo de Ventas: ${formatearMoneda(actual.costoVentas || 0)}
UTILIDAD BRUTA: ${formatearMoneda(actual.utilidadBruta || 0)}
Margen Bruto: ${metricas.margenBruto}%

III. GASTOS OPERATIVOS
===============================================================================
Gastos Administrativos: ${formatearMoneda(actual.gastosOperativos?.gastosAdministrativos || 0)}
Gastos Financieros: ${formatearMoneda(actual.gastosOperativos?.gastosFinancieros || 0)}
TOTAL GASTOS OPERATIVOS: ${formatearMoneda(actual.gastosOperativos?.totalGastosOperativos || 0)}

IV. OTROS INGRESOS Y GASTOS
===============================================================================
Otros Ingresos: ${formatearMoneda(actual.otrosIngresos || 0)}
Otros Gastos: ${formatearMoneda(actual.otrosGastos || 0)}

V. RESULTADOS
===============================================================================
UTILIDAD OPERATIVA: ${formatearMoneda(actual.utilidadOperativa || 0)}
Margen Operativo: ${metricas.margenOperativo}%
Participación de Trabajadores (10%): ${formatearMoneda(actual.participacionTrabajadores || 0)}
UTILIDAD ANTES DE IMPUESTOS: ${formatearMoneda(actual.utilidadAntesImpuestos || 0)}
Impuesto a la Renta (30%): ${formatearMoneda(actual.impuestoRenta || 0)}
UTILIDAD NETA: ${formatearMoneda(actual.utilidadNeta || 0)}
Margen Neto: ${metricas.margenNeto}%`;

    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estado-resultados-${periodoActual}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // =========================
  // COMPONENTE CRECIMIENTO
  // =========================

  const IndicadorCrecimiento = ({ valor, invertido = false }) => {
    const esPositivo = valor >= 0;
    const color = esPositivo
      ? (invertido ? "text-red-600" : "text-green-600")
      : (invertido ? "text-green-600" : "text-red-600");
    const Icono = esPositivo ? ArrowUpRight : ArrowDownRight;

    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${color}`}>
        <Icono className="w-3 h-3" />
        {Math.abs(valor).toFixed(2)}%
      </span>
    );
  };

  // =========================
  // COMPONENTE LINEA
  // =========================

  const LineaResultado = ({
    label,
    valorActual,
    valorComparativo = null,
    esTotal = false,
    esSubtitulo = false,
    nivel = 0,
    invertido = false
  }) => {
    const diferencia = valorComparativo !== null
      ? calcularDiferencia(valorActual, valorComparativo)
      : null;

    return (
      <div
        className={`
          flex flex-col sm:flex-row sm:items-center justify-between
          py-3 px-4 border-b border-gray-100
          ${esTotal ? "bg-blue-50 font-bold border-t-2 border-blue-200" : ""}
          ${esSubtitulo ? "bg-gray-50 font-semibold" : ""}
          ${nivel === 1 ? "pl-8" : ""}
          ${nivel === 2 ? "pl-12" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          {esSubtitulo && <FileText className="w-4 h-4 text-gray-500" />}
          <span className={`
            ${esTotal ? "text-blue-700 text-lg" : "text-gray-700"}
          `}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-6 mt-2 sm:mt-0">
          {valorComparativo !== null && (
            <div className="text-right">
              <div className="text-xs text-gray-500">{periodoComparativo}</div>
              <div className="text-sm text-gray-600">
                {formatearMoneda(valorComparativo)}
              </div>
            </div>
          )}

          <div className="text-right">
            <div className="text-xs text-gray-500">{periodoActual}</div>
            <div className={`
              ${esTotal ? "text-xl text-blue-700" : "text-lg text-gray-800"}
              font-semibold
            `}>
              {formatearMoneda(valorActual)}
            </div>
            {diferencia !== null && !esTotal && (
              <IndicadorCrecimiento valor={diferencia} invertido={invertido} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información financiera...</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <h3 className="text-red-700 font-bold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const actual = estadoResultados?.periodoActual || {};
  const comparativo = estadoResultados?.periodoComparativo || {};

  if (!actual.ingresosOperacionales || !comparativo.ingresosOperacionales) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-gray-500 text-lg text-center">
          <p>No hay información disponible</p>
          <p className="text-sm mt-2">Seleccione periodos válidos</p>
        </div>
      </div>
    );
  }

  // =========================
  // RENDER PRINCIPAL
  // =========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                Estado de Resultados - Perú
              </h1>
              <p className="text-gray-600 mt-2">
                Modelo contable peruano conforme a NIC/NIIF - Análisis comparativo
              </p>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <select
                    value={periodoActual}
                    onChange={(e) => setPeriodoActual(e.target.value)}
                    className="bg-transparent text-gray-800 font-medium focus:outline-none"
                  >
                    {(periodosDisponibles || []).map((p) => (
                      <option key={p.periodo} value={p.periodo}>
                        {p.periodo} - Periodo Actual
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select
                    value={periodoComparativo}
                    onChange={(e) => setPeriodoComparativo(e.target.value)}
                    className="bg-transparent text-gray-800 font-medium focus:outline-none"
                  >
                    {(periodosDisponibles || []).map((p) => (
                      <option key={p.periodo} value={p.periodo}>
                        {p.periodo} - Periodo Comparativo
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generarReporte}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* MÉTRICAS - 5 TARJETAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Utilidad Neta</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700 mb-1">
                {formatearMoneda(actual.utilidadNeta)}
              </div>
              <div className="text-xs text-gray-500">
                Crecimiento: {metricas.crecimientoUtilidad}%
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Margen Neto</span>
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {metricas.margenNeto}%
              </div>
              <div className="text-xs text-gray-500">Rentabilidad sobre ventas</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Ventas Totales</span>
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {formatearMoneda(actual.ingresosOperacionales?.totalIngresosOperacionales)}
              </div>
              <div className="text-xs text-gray-500">
                Crecimiento: {metricas.crecimientoVentas}%
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Margen Bruto</span>
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {metricas.margenBruto}%
              </div>
              <div className="text-xs text-gray-500">Eficiencia operativa</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Margen Operativo</span>
                <PieChart className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700 mb-1">
                {metricas.margenOperativo}%
              </div>
              <div className="text-xs text-gray-500">Rentabilidad operacional</div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ESTADO DE RESULTADOS DETALLADO */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Estado de Resultados Integral</h2>
                      <p className="text-blue-100 text-sm">Modelo NIC/NIIF - Perú</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{periodoActual}</div>
                    <div className="text-blue-200 text-sm">vs {periodoComparativo}</div>
                  </div>
                </div>
              </div>

              {/* INGRESOS OPERACIONALES */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSeccion('ingresos')}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-800">I. INGRESOS OPERACIONALES</h3>
                  </div>
                  {seccionesExpandidas.ingresos ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  )}
                </button>
                {seccionesExpandidas.ingresos && (
                  <div>
                    <LineaResultado
                      label="Ventas Netas"
                      valorActual={actual.ingresosOperacionales?.ventasNetas || 0}
                      valorComparativo={comparativo.ingresosOperacionales?.ventasNetas || 0}
                      nivel={1}
                    />
                    <LineaResultado
                      label="Otros Ingresos Operacionales"
                      valorActual={actual.ingresosOperacionales?.otrosIngresosOperacionales || 0}
                      valorComparativo={comparativo.ingresosOperacionales?.otrosIngresosOperacionales || 0}
                      nivel={1}
                    />
                    <LineaResultado
                      label="TOTAL INGRESOS OPERACIONALES"
                      valorActual={actual.ingresosOperacionales?.totalIngresosOperacionales || 0}
                      valorComparativo={comparativo.ingresosOperacionales?.totalIngresosOperacionales || 0}
                      esTotal={true}
                    />
                  </div>
                )}
              </div>

              {/* COSTOS Y UTILIDAD BRUTA */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSeccion('costos')}
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">II. COSTOS Y UTILIDAD BRUTA</h3>
                  </div>
                  {seccionesExpandidas.costos ? (
                    <ChevronUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-green-600" />
                  )}
                </button>
                {seccionesExpandidas.costos && (
                  <div>
                    <LineaResultado
                      label="Costo de Ventas"
                      valorActual={actual.costoVentas || 0}
                      valorComparativo={comparativo.costoVentas || 0}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado
                      label="UTILIDAD BRUTA"
                      valorActual={actual.utilidadBruta || 0}
                      valorComparativo={comparativo.utilidadBruta || 0}
                      esTotal={true}
                    />
                    <div className="p-3 bg-green-50 mx-3 mb-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-700">Margen Bruto</span>
                        <span className="text-lg font-bold text-green-800">{metricas.margenBruto}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GASTOS OPERATIVOS */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSeccion('gastos')}
                  className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-yellow-800">III. GASTOS OPERATIVOS</h3>
                  </div>
                  {seccionesExpandidas.gastos ? (
                    <ChevronUp className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-yellow-600" />
                  )}
                </button>
                {seccionesExpandidas.gastos && (
                  <div>
                    <LineaResultado
                      label="Gastos Administrativos"
                      valorActual={actual.gastosOperativos?.gastosAdministrativos || 0}
                      valorComparativo={comparativo.gastosOperativos?.gastosAdministrativos || 0}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado
                      label="Gastos Financieros"
                      valorActual={actual.gastosOperativos?.gastosFinancieros || 0}
                      valorComparativo={comparativo.gastosOperativos?.gastosFinancieros || 0}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado
                      label="TOTAL GASTOS OPERATIVOS"
                      valorActual={actual.gastosOperativos?.totalGastosOperativos || 0}
                      valorComparativo={comparativo.gastosOperativos?.totalGastosOperativos || 0}
                      esSubtitulo={true}
                      invertido={true}
                    />
                  </div>
                )}
              </div>

              {/* RESULTADOS FINALES */}
              <div>
                <button
                  onClick={() => toggleSeccion('resultados')}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-800">IV. RESULTADOS FINALES</h3>
                  </div>
                  {seccionesExpandidas.resultados ? (
                    <ChevronUp className="w-5 h-5 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-600" />
                  )}
                </button>
                {seccionesExpandidas.resultados && (
                  <div>
                    <LineaResultado
                      label="Otros Ingresos"
                      valorActual={actual.otrosIngresos || 0}
                      valorComparativo={comparativo.otrosIngresos || 0}
                      nivel={1}
                    />
                    <LineaResultado
                      label="Otros Gastos"
                      valorActual={actual.otrosGastos || 0}
                      valorComparativo={comparativo.otrosGastos || 0}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado
                      label="UTILIDAD OPERATIVA"
                      valorActual={actual.utilidadOperativa || 0}
                      valorComparativo={comparativo.utilidadOperativa || 0}
                      esSubtitulo={true}
                    />
                    <LineaResultado
                      label="Participación de Trabajadores (10%)"
                      valorActual={actual.participacionTrabajadores || 0}
                      valorComparativo={comparativo.participacionTrabajadores || 0}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado
                      label="UTILIDAD ANTES DE IMPUESTOS"
                      valorActual={actual.utilidadAntesImpuestos || 0}
                      valorComparativo={comparativo.utilidadAntesImpuestos || 0}
                      esSubtitulo={true}
                    />
                    <LineaResultado
                      label="Impuesto a la Renta (30%)"
                      valorActual={actual.impuestoRenta || 0}
                      valorComparativo={comparativo.impuestoRenta || 0}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado
                      label="UTILIDAD NETA DEL EJERCICIO"
                      valorActual={actual.utilidadNeta || 0}
                      valorComparativo={comparativo.utilidadNeta || 0}
                      esTotal={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PANEL LATERAL */}
          <div className="space-y-6">
            {/* Resumen Ejecutivo */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Resumen Ejecutivo
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Rendimiento del Periodo</h4>
                  <p className="text-gray-700 text-sm">
                    La empresa muestra un crecimiento del{" "}
                    <span className="font-semibold text-green-600">{metricas.crecimientoVentas}%</span> en ventas
                    y un incremento del{" "}
                    <span className="font-semibold text-green-600">{metricas.crecimientoUtilidad}%</span> en utilidad neta.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Análisis de Rentabilidad</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex justify-between">
                      <span>Margen Bruto:</span>
                      <span className="font-semibold text-blue-600">{metricas.margenBruto}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Margen Operativo:</span>
                      <span className="font-semibold text-green-600">{metricas.margenOperativo}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Margen Neto:</span>
                      <span className="font-semibold text-purple-600">{metricas.margenNeto}%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Comparativa de Periodos */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Comparativa de Periodos
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Ventas Totales", actual: actual.ingresosOperacionales?.totalIngresosOperacionales || 0, comparativo: comparativo.ingresosOperacionales?.totalIngresosOperacionales || 0 },
                  { label: "Utilidad Bruta", actual: actual.utilidadBruta || 0, comparativo: comparativo.utilidadBruta || 0 },
                  { label: "Utilidad Operativa", actual: actual.utilidadOperativa || 0, comparativo: comparativo.utilidadOperativa || 0 },
                  { label: "Utilidad Neta", actual: actual.utilidadNeta || 0, comparativo: comparativo.utilidadNeta || 0 }
                ].map((item, index) => {
                  const crecimiento = calcularDiferencia(item.actual, item.comparativo);
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">{item.label}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-gray-600">{formatearMoneda(item.comparativo)}</div>
                        <div className="flex flex-col items-end">
                          <div className="text-lg font-bold text-gray-800">{formatearMoneda(item.actual)}</div>
                          <IndicadorCrecimiento valor={crecimiento} />
                        </div>
                      </div>
                      <div className="mt-2 flex h-2 rounded-full overflow-hidden">
                        <div className="bg-gray-300" style={{ width: `${Math.min((item.comparativo / item.actual) * 100, 100)}%` }} />
                        <div className="bg-blue-500" style={{ width: `${Math.min((item.actual / (item.actual + item.comparativo)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Sistema de Análisis Financiero - Estado de Resultados conforme a NIC/NIIF Perú</p>
        </div>
      </div>
    </div>
  );
};

export default EstadoResultados;