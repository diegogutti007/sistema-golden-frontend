import React, { useState, useEffect } from "react";
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
  Building,
  Users,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const EstadoResultados = () => {
  // Estados para periodos
  const [periodoActual, setPeriodoActual] = useState("2024");
  const [periodoComparativo, setPeriodoComparativo] = useState("2023");
  
  // Estados para los datos del estado de resultados
  const [estadoResultados, setEstadoResultados] = useState({
    periodoActual: {
      // INGRESOS
      ingresosOperacionales: {
        ventasNetas: 1250000,
        otrosIngresosOperacionales: 25000,
        totalIngresosOperacionales: 1275000
      },
      // COSTOS
      costoVentas: 750000,
      utilidadBruta: 525000,
      // GASTOS OPERATIVOS
      gastosOperativos: {
        gastosVentas: 120000,
        gastosAdministrativos: 85000,
        gastosFinancieros: 45000,
        totalGastosOperativos: 250000
      },
      // OTROS INGRESOS Y GASTOS
      otrosIngresos: 15000,
      otrosGastos: 10000,
      // RESULTADOS
      utilidadOperativa: 280000,
      participacionTrabajadores: 28000,
      utilidadAntesImpuestos: 252000,
      impuestoRenta: 75600,
      utilidadNeta: 176400
    },
    periodoComparativo: {
      ingresosOperacionales: {
        ventasNetas: 1100000,
        otrosIngresosOperacionales: 20000,
        totalIngresosOperacionales: 1120000
      },
      costoVentas: 660000,
      utilidadBruta: 460000,
      gastosOperativos: {
        gastosVentas: 105000,
        gastosAdministrativos: 75000,
        gastosFinancieros: 40000,
        totalGastosOperativos: 220000
      },
      otrosIngresos: 12000,
      otrosGastos: 8000,
      utilidadOperativa: 244000,
      participacionTrabajadores: 24400,
      utilidadAntesImpuestos: 219600,
      impuestoRenta: 65880,
      utilidadNeta: 153720
    }
  });

  // Estados para métricas calculadas
  const [metricas, setMetricas] = useState({
    margenBruto: 0,
    margenOperativo: 0,
    margenNeto: 0,
    crecimientoVentas: 0,
    crecimientoUtilidad: 0
  });

  // Estados para controles UI
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({
    ingresos: true,
    costos: true,
    gastos: true,
    resultados: true
  });

  // Calcular métricas
  useEffect(() => {
    const actual = estadoResultados.periodoActual;
    const comparativo = estadoResultados.periodoComparativo;

    // Margen Bruto
    const margenBruto = (actual.utilidadBruta / actual.ingresosOperacionales.totalIngresosOperacionales) * 100;
    
    // Margen Operativo
    const margenOperativo = (actual.utilidadOperativa / actual.ingresosOperacionales.totalIngresosOperacionales) * 100;
    
    // Margen Neto
    const margenNeto = (actual.utilidadNeta / actual.ingresosOperacionales.totalIngresosOperacionales) * 100;
    
    // Crecimiento Ventas
    const crecimientoVentas = ((actual.ingresosOperacionales.totalIngresosOperacionales - comparativo.ingresosOperacionales.totalIngresosOperacionales) / comparativo.ingresosOperacionales.totalIngresosOperacionales) * 100;
    
    // Crecimiento Utilidad
    const crecimientoUtilidad = ((actual.utilidadNeta - comparativo.utilidadNeta) / comparativo.utilidadNeta) * 100;

    setMetricas({
      margenBruto: parseFloat(margenBruto.toFixed(2)),
      margenOperativo: parseFloat(margenOperativo.toFixed(2)),
      margenNeto: parseFloat(margenNeto.toFixed(2)),
      crecimientoVentas: parseFloat(crecimientoVentas.toFixed(2)),
      crecimientoUtilidad: parseFloat(crecimientoUtilidad.toFixed(2))
    });
  }, [estadoResultados]);

  // Función para formatear moneda peruana
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  };

  // Función para calcular diferencia porcentual
  const calcularDiferencia = (actual, comparativo) => {
    if (comparativo === 0) return 0;
    return ((actual - comparativo) / Math.abs(comparativo)) * 100;
  };

  // Función para renderizar indicador de crecimiento
  const IndicadorCrecimiento = ({ valor, invertido = false }) => {
    const esPositivo = valor >= 0;
    const color = esPositivo ? (invertido ? 'text-red-600' : 'text-green-600') : (invertido ? 'text-green-600' : 'text-red-600');
    const Icono = esPositivo ? ArrowUpRight : ArrowDownRight;
    
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${color}`}>
        <Icono className="w-3 h-3" />
        {Math.abs(valor).toFixed(2)}%
      </span>
    );
  };

  // Función para generar reporte
  const generarReporte = () => {
    const actual = estadoResultados.periodoActual;
    
    const reporte = `
ESTADO DE RESULTADOS INTEGRAL - MODELO CONTABLE PERUANO (NIC/NIIF)
Periodo: ${periodoActual} - Comparativo: ${periodoComparativo}
Fecha de generación: ${new Date().toLocaleDateString('es-PE')}

================================================================================
I. INGRESOS OPERACIONALES
================================================================================
Ventas Netas: ${formatearMoneda(actual.ingresosOperacionales.ventasNetas)}
Otros Ingresos Operacionales: ${formatearMoneda(actual.ingresosOperacionales.otrosIngresosOperacionales)}
TOTAL INGRESOS OPERACIONALES: ${formatearMoneda(actual.ingresosOperacionales.totalIngresosOperacionales)}

================================================================================
II. COSTOS DE VENTAS
================================================================================
Costo de Ventas: ${formatearMoneda(actual.costoVentas)}
UTILIDAD BRUTA: ${formatearMoneda(actual.utilidadBruta)}
Margen Bruto: ${metricas.margenBruto}%

================================================================================
III. GASTOS OPERATIVOS
================================================================================
Gastos de Ventas: ${formatearMoneda(actual.gastosOperativos.gastosVentas)}
Gastos Administrativos: ${formatearMoneda(actual.gastosOperativos.gastosAdministrativos)}
Gastos Financieros: ${formatearMoneda(actual.gastosOperativos.gastosFinancieros)}
TOTAL GASTOS OPERATIVOS: ${formatearMoneda(actual.gastosOperativos.totalGastosOperativos)}

================================================================================
IV. OTROS INGRESOS Y GASTOS
================================================================================
Otros Ingresos: ${formatearMoneda(actual.otrosIngresos)}
Otros Gastos: ${formatearMoneda(actual.otrosGastos)}

================================================================================
V. RESULTADOS
================================================================================
UTILIDAD OPERATIVA: ${formatearMoneda(actual.utilidadOperativa)}
Margen Operativo: ${metricas.margenOperativo}%
Participación de Trabajadores: ${formatearMoneda(actual.participacionTrabajadores)}
UTILIDAD ANTES DE IMPUESTOS: ${formatearMoneda(actual.utilidadAntesImpuestos)}
Impuesto a la Renta (30%): ${formatearMoneda(actual.impuestoRenta)}
UTILIDAD NETA DEL EJERCICIO: ${formatearMoneda(actual.utilidadNeta)}
Margen Neto: ${metricas.margenNeto}%

================================================================================
INDICADORES FINANCIEROS
================================================================================
Crecimiento de Ventas: ${metricas.crecimientoVentas}%
Crecimiento de Utilidad Neta: ${metricas.crecimientoUtilidad}%
Rentabilidad sobre Ventas: ${metricas.margenNeto}%

================================================================================
ANÁLISIS COMPARATIVO
================================================================================
El Estado de Resultados muestra una ${metricas.crecimientoUtilidad >= 0 ? 'mejora' : 'disminución'} en la rentabilidad 
del ${Math.abs(metricas.crecimientoUtilidad)}% en comparación con el periodo anterior.
    `;

    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estado-resultados-${periodoActual}.txt`;
    a.click();
  };

  // Función para alternar sección
  const toggleSeccion = (seccion) => {
    setSeccionesExpandidas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // Componente para mostrar línea del estado de resultados
  const LineaResultado = ({ 
    label, 
    valorActual, 
    valorComparativo = null, 
    esTotal = false,
    esSubtitulo = false,
    nivel = 0 
  }) => {
    const diferencia = valorComparativo !== null ? calcularDiferencia(valorActual, valorComparativo) : null;
    
    return (
      <div className={`
        flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3
        ${esTotal ? 'bg-blue-50 border-t-2 border-blue-200 font-bold' : ''}
        ${esSubtitulo ? 'bg-gray-50 font-semibold' : ''}
        ${nivel === 1 ? 'pl-4' : nivel === 2 ? 'pl-8' : ''}
        border-b border-gray-100
      `}>
        <div className="flex items-center gap-2">
          {esSubtitulo && <FileText className="w-4 h-4 text-gray-500" />}
          <span className={`
            ${esTotal ? 'text-blue-800 text-lg' : esSubtitulo ? 'text-gray-700' : 'text-gray-600'}
            ${nivel > 0 ? 'text-sm' : ''}
          `}>
            {label}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          {valorComparativo !== null && (
            <div className="text-right">
              <div className="text-xs text-gray-500">{periodoComparativo}</div>
              <div className="text-sm font-medium text-gray-600">
                {formatearMoneda(valorComparativo)}
              </div>
            </div>
          )}
          
          <div className="text-right">
            <div className="text-xs text-gray-500">{periodoActual}</div>
            <div className={`
              ${esTotal ? 'text-xl' : 'text-lg'} 
              font-semibold
              ${esTotal ? 'text-blue-700' : 'text-gray-800'}
            `}>
              {formatearMoneda(valorActual)}
            </div>
            
            {diferencia !== null && !esTotal && (
              <div className="mt-1">
                <IndicadorCrecimiento valor={diferencia} invertido={label.includes('Gastos') || label.includes('Costo')} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                Estado de Resultados - Perú
              </h1>
              <p className="text-gray-600 mt-2">
                Modelo contable peruano conforme a NIC/NIIF - Análisis comparativo de periodos
              </p>
              
              {/* Selectores de periodo */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <select 
                    value={periodoActual}
                    onChange={(e) => setPeriodoActual(e.target.value)}
                    className="bg-transparent text-gray-800 font-medium focus:outline-none"
                  >
                    <option value="2024">2024 - Periodo Actual</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select 
                    value={periodoComparativo}
                    onChange={(e) => setPeriodoComparativo(e.target.value)}
                    className="bg-transparent text-gray-800 font-medium focus:outline-none"
                  >
                    <option value="2023">2023 - Periodo Comparativo</option>
                    <option value="2024">2024</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generarReporte}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 border border-green-200"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 border border-purple-200"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </div>
          </div>
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { 
                label: "Utilidad Neta", 
                valor: estadoResultados.periodoActual.utilidadNeta, 
                icon: TrendingUp, 
                color: "green",
                subtext: `Crecimiento: ${metricas.crecimientoUtilidad}%`
              },
              { 
                label: "Margen Neto", 
                valor: `${metricas.margenNeto}%`, 
                icon: Percent, 
                color: "blue",
                subtext: "Rentabilidad sobre ventas"
              },
              { 
                label: "Ventas Totales", 
                valor: estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales, 
                icon: DollarSign, 
                color: "purple",
                subtext: `Crecimiento: ${metricas.crecimientoVentas}%`
              },
              { 
                label: "Margen Bruto", 
                valor: `${metricas.margenBruto}%`, 
                icon: BarChart3, 
                color: "yellow",
                subtext: "Eficiencia operativa"
              },
              { 
                label: "Margen Operativo", 
                valor: `${metricas.margenOperativo}%`, 
                icon: PieChart, 
                color: "red",
                subtext: "Rentabilidad operacional"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <div className={`text-2xl font-bold text-${item.color}-700 mb-1`}>
                  {typeof item.valor === 'number' ? formatearMoneda(item.valor) : item.valor}
                </div>
                <div className="text-xs text-gray-500">{item.subtext}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de Resultados Detallado */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
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

              {/* Sección: Ingresos Operacionales */}
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
                  <div className="p-2">
                    <LineaResultado 
                      label="Ventas Netas" 
                      valorActual={estadoResultados.periodoActual.ingresosOperacionales.ventasNetas}
                      valorComparativo={estadoResultados.periodoComparativo.ingresosOperacionales.ventasNetas}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="Otros Ingresos Operacionales" 
                      valorActual={estadoResultados.periodoActual.ingresosOperacionales.otrosIngresosOperacionales}
                      valorComparativo={estadoResultados.periodoComparativo.ingresosOperacionales.otrosIngresosOperacionales}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="TOTAL INGRESOS OPERACIONALES" 
                      valorActual={estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales}
                      valorComparativo={estadoResultados.periodoComparativo.ingresosOperacionales.totalIngresosOperacionales}
                      esTotal={true}
                    />
                  </div>
                )}
              </div>

              {/* Sección: Costos y Utilidad Bruta */}
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
                  <div className="p-2">
                    <LineaResultado 
                      label="Costo de Ventas" 
                      valorActual={estadoResultados.periodoActual.costoVentas}
                      valorComparativo={estadoResultados.periodoComparativo.costoVentas}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="UTILIDAD BRUTA" 
                      valorActual={estadoResultados.periodoActual.utilidadBruta}
                      valorComparativo={estadoResultados.periodoComparativo.utilidadBruta}
                      esTotal={true}
                    />
                    
                    {/* Indicador de Margen Bruto */}
                    <div className="mt-2 p-3 bg-green-50 rounded-lg mx-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700">Margen Bruto</span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-800">{metricas.margenBruto}%</div>
                          <IndicadorCrecimiento 
                            valor={calcularDiferencia(
                              metricas.margenBruto, 
                              (estadoResultados.periodoComparativo.utilidadBruta / estadoResultados.periodoComparativo.ingresosOperacionales.totalIngresosOperacionales) * 100
                            )} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección: Gastos Operativos */}
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
                  <div className="p-2">
                    <LineaResultado 
                      label="Gastos de Ventas" 
                      valorActual={estadoResultados.periodoActual.gastosOperativos.gastosVentas}
                      valorComparativo={estadoResultados.periodoComparativo.gastosOperativos.gastosVentas}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="Gastos Administrativos" 
                      valorActual={estadoResultados.periodoActual.gastosOperativos.gastosAdministrativos}
                      valorComparativo={estadoResultados.periodoComparativo.gastosOperativos.gastosAdministrativos}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="Gastos Financieros" 
                      valorActual={estadoResultados.periodoActual.gastosOperativos.gastosFinancieros}
                      valorComparativo={estadoResultados.periodoComparativo.gastosOperativos.gastosFinancieros}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="TOTAL GASTOS OPERATIVOS" 
                      valorActual={estadoResultados.periodoActual.gastosOperativos.totalGastosOperativos}
                      valorComparativo={estadoResultados.periodoComparativo.gastosOperativos.totalGastosOperativos}
                      esSubtitulo={true}
                      invertido={true}
                    />
                  </div>
                )}
              </div>

              {/* Sección: Resultados Finales */}
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
                  <div className="p-2">
                    <LineaResultado 
                      label="Otros Ingresos" 
                      valorActual={estadoResultados.periodoActual.otrosIngresos}
                      valorComparativo={estadoResultados.periodoComparativo.otrosIngresos}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="Otros Gastos" 
                      valorActual={estadoResultados.periodoActual.otrosGastos}
                      valorComparativo={estadoResultados.periodoComparativo.otrosGastos}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="UTILIDAD OPERATIVA" 
                      valorActual={estadoResultados.periodoActual.utilidadOperativa}
                      valorComparativo={estadoResultados.periodoComparativo.utilidadOperativa}
                      esSubtitulo={true}
                    />
                    <LineaResultado 
                      label="Participación de Trabajadores (10%)" 
                      valorActual={estadoResultados.periodoActual.participacionTrabajadores}
                      valorComparativo={estadoResultados.periodoComparativo.participacionTrabajadores}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="UTILIDAD ANTES DE IMPUESTOS" 
                      valorActual={estadoResultados.periodoActual.utilidadAntesImpuestos}
                      valorComparativo={estadoResultados.periodoComparativo.utilidadAntesImpuestos}
                      esSubtitulo={true}
                    />
                    <LineaResultado 
                      label="Impuesto a la Renta (30%)" 
                      valorActual={estadoResultados.periodoActual.impuestoRenta}
                      valorComparativo={estadoResultados.periodoComparativo.impuestoRenta}
                      invertido={true}
                      nivel={1}
                    />
                    <LineaResultado 
                      label="UTILIDAD NETA DEL EJERCICIO" 
                      valorActual={estadoResultados.periodoActual.utilidadNeta}
                      valorComparativo={estadoResultados.periodoComparativo.utilidadNeta}
                      esTotal={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral - Análisis y Ratios */}
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
                    La empresa muestra un crecimiento del <span className="font-semibold text-green-600">{metricas.crecimientoVentas}%</span> en ventas 
                    y un incremento del <span className="font-semibold text-green-600">{metricas.crecimientoUtilidad}%</span> en utilidad neta 
                    comparado con el periodo anterior.
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

            {/* Ratios Financieros */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                Ratios Financieros
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: "ROA (Return on Assets)", valor: "8.5%", tendencia: "up", desc: "Rentabilidad sobre activos" },
                  { label: "ROE (Return on Equity)", valor: "15.2%", tendencia: "up", desc: "Rentabilidad sobre patrimonio" },
                  { label: "Rotación de Inventario", valor: "6.8x", tendencia: "up", desc: "Eficiencia inventarios" },
                  { label: "Días de Cobranza", valor: "45 días", tendencia: "down", desc: "Eficiencia cobranza" },
                  { label: "Apalancamiento", valor: "1.8x", tendencia: "stable", desc: "Nivel de endeudamiento" }
                ].map((ratio, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{ratio.label}</div>
                      <div className="text-xs text-gray-500">{ratio.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">{ratio.valor}</div>
                      <div className={`text-xs ${ratio.tendencia === 'up' ? 'text-green-600' : ratio.tendencia === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                        {ratio.tendencia === 'up' ? '↑ Mejorando' : ratio.tendencia === 'down' ? '↓ Deteriorando' : '→ Estable'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribución de Gastos */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Distribución de Gastos
              </h3>
              
              <div className="space-y-3">
                {[
                  { label: "Costo de Ventas", valor: estadoResultados.periodoActual.costoVentas, porcentaje: (estadoResultados.periodoActual.costoVentas / estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales) * 100, color: "red" },
                  { label: "Gastos de Ventas", valor: estadoResultados.periodoActual.gastosOperativos.gastosVentas, porcentaje: (estadoResultados.periodoActual.gastosOperativos.gastosVentas / estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales) * 100, color: "orange" },
                  { label: "Gastos Administrativos", valor: estadoResultados.periodoActual.gastosOperativos.gastosAdministrativos, porcentaje: (estadoResultados.periodoActual.gastosOperativos.gastosAdministrativos / estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales) * 100, color: "yellow" },
                  { label: "Gastos Financieros", valor: estadoResultados.periodoActual.gastosOperativos.gastosFinancieros, porcentaje: (estadoResultados.periodoActual.gastosOperativos.gastosFinancieros / estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales) * 100, color: "blue" },
                  { label: "Impuesto a la Renta", valor: estadoResultados.periodoActual.impuestoRenta, porcentaje: (estadoResultados.periodoActual.impuestoRenta / estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales) * 100, color: "purple" }
                ].map((gasto, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{gasto.label}</span>
                      <span className="font-medium text-gray-800">
                        {formatearMoneda(gasto.valor)} ({gasto.porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${gasto.color}-500 rounded-full`}
                        style={{ width: `${Math.min(gasto.porcentaje, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <span className="font-semibold">Análisis: </span>
                  Los gastos operativos representan el 
                  <span className="font-bold"> {((estadoResultados.periodoActual.gastosOperativos.totalGastosOperativos / estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales) * 100).toFixed(1)}% </span>
                  de los ingresos totales.
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
                  { 
                    label: "Ventas Totales", 
                    actual: estadoResultados.periodoActual.ingresosOperacionales.totalIngresosOperacionales,
                    comparativo: estadoResultados.periodoComparativo.ingresosOperacionales.totalIngresosOperacionales
                  },
                  { 
                    label: "Utilidad Bruta", 
                    actual: estadoResultados.periodoActual.utilidadBruta,
                    comparativo: estadoResultados.periodoComparativo.utilidadBruta
                  },
                  { 
                    label: "Utilidad Operativa", 
                    actual: estadoResultados.periodoActual.utilidadOperativa,
                    comparativo: estadoResultados.periodoComparativo.utilidadOperativa
                  },
                  { 
                    label: "Utilidad Neta", 
                    actual: estadoResultados.periodoActual.utilidadNeta,
                    comparativo: estadoResultados.periodoComparativo.utilidadNeta
                  }
                ].map((item, index) => {
                  const crecimiento = calcularDiferencia(item.actual, item.comparativo);
                  
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">{item.label}</div>
                      
                      <div className="flex justify-between items-end mb-1">
                        <div className="text-xs text-gray-500">{periodoComparativo}</div>
                        <div className="text-xs text-gray-500">{periodoActual}</div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-gray-600">
                          {formatearMoneda(item.comparativo)}
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-lg font-bold text-gray-800">
                            {formatearMoneda(item.actual)}
                          </div>
                          <IndicadorCrecimiento valor={crecimiento} />
                        </div>
                      </div>
                      
                      {/* Barra comparativa */}
                      <div className="mt-2 flex h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gray-300"
                          style={{ width: `${Math.min((item.comparativo / item.actual) * 100, 100)}%` }}
                        />
                        <div 
                          className="bg-blue-500"
                          style={{ width: `${Math.min((item.actual / (item.actual + item.comparativo)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Sistema de Análisis Financiero - Estado de Resultados conforme a NIC/NIIF Perú</p>
          <p className="mt-1">Los datos presentados son confidenciales y para uso exclusivo de la administración de la empresa</p>
        </div>
      </div>
    </div>
  );
};

export default EstadoResultados;