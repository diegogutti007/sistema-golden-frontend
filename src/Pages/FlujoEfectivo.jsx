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
  Cash,
  Banknote, 
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Activity,
  Repeat,
  TrendingUp as TrendingUpIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const FlujoEfectivo = () => {
  // Estados para periodos
  const [periodoActual, setPeriodoActual] = useState("2024");
  const [periodoComparativo, setPeriodoComparativo] = useState("2023");
  
  // Estados para los datos del flujo de efectivo
  const [flujoEfectivo, setFlujoEfectivo] = useState({
    periodoActual: {
      // FLUJOS DE EFECTIVO DE LAS ACTIVIDADES DE OPERACIÓN
      actividadesOperacion: {
        entradas: {
          cobranzaClientes: 1350000,
          otrosIngresosOperativos: 30000,
          devolucionesImpuestos: 15000,
          totalEntradasOperacion: 1395000
        },
        salidas: {
          pagoProveedores: 720000,
          pagoGastosOperativos: 240000,
          pagoImpuestos: 75600,
          participacionTrabajadores: 28000,
          otrosPagosOperativos: 20000,
          totalSalidasOperacion: 1083600
        },
        netoActividadesOperacion: 311400
      },
      
      // FLUJOS DE EFECTIVO DE LAS ACTIVIDADES DE INVERSIÓN
      actividadesInversion: {
        entradas: {
          ventaActivosFijos: 50000,
          dividendosRecibidos: 10000,
          totalEntradasInversion: 60000
        },
        salidas: {
          compraActivosFijos: 180000,
          compraInversiones: 40000,
          totalSalidasInversion: 220000
        },
        netoActividadesInversion: -160000
      },
      
      // FLUJOS DE EFECTIVO DE LAS ACTIVIDADES DE FINANCIAMIENTO
      actividadesFinanciamiento: {
        entradas: {
          prestamosRecibidos: 120000,
          aportesCapital: 50000,
          totalEntradasFinanciamiento: 170000
        },
        salidas: {
          pagoPrestamos: 80000,
          pagoDividendos: 40000,
          totalSalidasFinanciamiento: 120000
        },
        netoActividadesFinanciamiento: 50000
      },
      
      // EFECTIVO NETO Y SALDOS
      netoAumentoDisminucionEfectivo: 201400,
      efectivoInicioPeriodo: 160000,
      efectivoFinPeriodo: 361400,
      
      // RECONCILIACIÓN
      conciliacionUtilidadNetaFlujoOperacion: {
        utilidadNeta: 176400,
        ajustes: {
          depreciacionAmortizacion: 80000,
          provisionCobranzaDudosa: 10000,
          variacionCuentasPorCobrar: -30000,
          variacionInventarios: -100000,
          variacionCuentasPorPagar: 30000,
          otrosAjustes: 5000,
          totalAjustes: -15000
        },
        totalConciliacion: 161400
      }
    },
    periodoComparativo: {
      actividadesOperacion: {
        entradas: {
          cobranzaClientes: 1180000,
          otrosIngresosOperativos: 25000,
          devolucionesImpuestos: 12000,
          totalEntradasOperacion: 1217000
        },
        salidas: {
          pagoProveedores: 640000,
          pagoGastosOperativos: 210000,
          pagoImpuestos: 65880,
          participacionTrabajadores: 24400,
          otrosPagosOperativos: 15000,
          totalSalidasOperacion: 955280
        },
        netoActividadesOperacion: 261720
      },
      actividadesInversion: {
        entradas: {
          ventaActivosFijos: 40000,
          dividendosRecibidos: 8000,
          totalEntradasInversion: 48000
        },
        salidas: {
          compraActivosFijos: 150000,
          compraInversiones: 35000,
          totalSalidasInversion: 185000
        },
        netoActividadesInversion: -137000
      },
      actividadesFinanciamiento: {
        entradas: {
          prestamosRecibidos: 100000,
          aportesCapital: 30000,
          totalEntradasFinanciamiento: 130000
        },
        salidas: {
          pagoPrestamos: 70000,
          pagoDividendos: 35000,
          totalSalidasFinanciamiento: 105000
        },
        netoActividadesFinanciamiento: 25000
      },
      netoAumentoDisminucionEfectivo: 149720,
      efectivoInicioPeriodo: 10280,
      efectivoFinPeriodo: 160000,
      conciliacionUtilidadNetaFlujoOperacion: {
        utilidadNeta: 153720,
        ajustes: {
          depreciacionAmortizacion: 70000,
          provisionCobranzaDudosa: 8000,
          variacionCuentasPorCobrar: -20000,
          variacionInventarios: -80000,
          variacionCuentasPorPagar: 25000,
          otrosAjustes: 4000,
          totalAjustes: -13000
        },
        totalConciliacion: 140720
      }
    }
  });

  // Estados para métricas calculadas
  const [metricas, setMetricas] = useState({
    coberturaDeuda: 0,
    margenFlujoOperativo: 0,
    razonFlujoOperativo: 0,
    crecimientoFlujoOperativo: 0,
    capacidadGeneracionEfectivo: 0,
    indiceAutofinanciamiento: 0
  });

  // Estados para controles UI
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({
    operacion: true,
    inversion: true,
    financiamiento: true,
    conciliacion: true
  });

  // Calcular métricas
  useEffect(() => {
    const actual = flujoEfectivo.periodoActual;
    const comparativo = flujoEfectivo.periodoComparativo;

    // Margen Flujo Operativo = Flujo Operación / Ventas
    const ventasNetas = 1250000; // Del estado de resultados
    const margenFlujoOperativo = (actual.actividadesOperacion.netoActividadesOperacion / ventasNetas) * 100;
    
    // Razón Flujo Operativo = Flujo Operación / Utilidad Neta
    const razonFlujoOperativo = actual.actividadesOperacion.netoActividadesOperacion / actual.conciliacionUtilidadNetaFlujoOperacion.utilidadNeta;
    
    // Crecimiento Flujo Operativo
    const crecimientoFlujoOperativo = ((actual.actividadesOperacion.netoActividadesOperacion - comparativo.actividadesOperacion.netoActividadesOperacion) / Math.abs(comparativo.actividadesOperacion.netoActividadesOperacion)) * 100;
    
    // Capacidad Generación Efectivo = Flujo Operación / Activo Total
    const activoTotal = 2500000; // Del balance general
    const capacidadGeneracionEfectivo = (actual.actividadesOperacion.netoActividadesOperacion / activoTotal) * 100;
    
    // Índice Autofinanciamiento = Flujo Operación / Inversiones
    const inversiones = actual.actividadesInversion.salidas.totalSalidasInversion;
    const indiceAutofinanciamiento = (actual.actividadesOperacion.netoActividadesOperacion / inversiones) * 100;
    
    // Cobertura de Deuda = Flujo Operación / Servicio Deuda
    const servicioDeuda = 120000; // Pago préstamos estimado
    const coberturaDeuda = actual.actividadesOperacion.netoActividadesOperacion / servicioDeuda;

    setMetricas({
      coberturaDeuda: parseFloat(coberturaDeuda.toFixed(2)),
      margenFlujoOperativo: parseFloat(margenFlujoOperativo.toFixed(2)),
      razonFlujoOperativo: parseFloat(razonFlujoOperativo.toFixed(2)),
      crecimientoFlujoOperativo: parseFloat(crecimientoFlujoOperativo.toFixed(2)),
      capacidadGeneracionEfectivo: parseFloat(capacidadGeneracionEfectivo.toFixed(2)),
      indiceAutofinanciamiento: parseFloat(indiceAutofinanciamiento.toFixed(2))
    });
  }, [flujoEfectivo]);

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
    const actual = flujoEfectivo.periodoActual;
    
    const reporte = `
FLUJO DE EFECTIVO - MODELO CONTABLE PERUANO (NIC/NIIF)
Periodo: ${periodoActual} - Comparativo: ${periodoComparativo}
Fecha de generación: ${new Date().toLocaleDateString('es-PE')}

================================================================================
I. FLUJOS DE EFECTIVO DE LAS ACTIVIDADES DE OPERACIÓN
================================================================================
ENTRADAS DE EFECTIVO:
  Cobranza a clientes: ${formatearMoneda(actual.actividadesOperacion.entradas.cobranzaClientes)}
  Otros ingresos operativos: ${formatearMoneda(actual.actividadesOperacion.entradas.otrosIngresosOperativos)}
  Devoluciones de impuestos: ${formatearMoneda(actual.actividadesOperacion.entradas.devolucionesImpuestos)}
  Total entradas por actividades de operación: ${formatearMoneda(actual.actividadesOperacion.entradas.totalEntradasOperacion)}

SALIDAS DE EFECTIVO:
  Pago a proveedores: ${formatearMoneda(actual.actividadesOperacion.salidas.pagoProveedores)}
  Pago de gastos operativos: ${formatearMoneda(actual.actividadesOperacion.salidas.pagoGastosOperativos)}
  Pago de impuestos: ${formatearMoneda(actual.actividadesOperacion.salidas.pagoImpuestos)}
  Participación de trabajadores: ${formatearMoneda(actual.actividadesOperacion.salidas.participacionTrabajadores)}
  Otros pagos operativos: ${formatearMoneda(actual.actividadesOperacion.salidas.otrosPagosOperativos)}
  Total salidas por actividades de operación: ${formatearMoneda(actual.actividadesOperacion.salidas.totalSalidasOperacion)}

FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE OPERACIÓN: ${formatearMoneda(actual.actividadesOperacion.netoActividadesOperacion)}

================================================================================
II. FLUJOS DE EFECTIVO DE LAS ACTIVIDADES DE INVERSIÓN
================================================================================
ENTRADAS DE EFECTIVO:
  Venta de activos fijos: ${formatearMoneda(actual.actividadesInversion.entradas.ventaActivosFijos)}
  Dividendos recibidos: ${formatearMoneda(actual.actividadesInversion.entradas.dividendosRecibidos)}
  Total entradas por actividades de inversión: ${formatearMoneda(actual.actividadesInversion.entradas.totalEntradasInversion)}

SALIDAS DE EFECTIVO:
  Compra de activos fijos: ${formatearMoneda(actual.actividadesInversion.salidas.compraActivosFijos)}
  Compra de inversiones: ${formatearMoneda(actual.actividadesInversion.salidas.compraInversiones)}
  Total salidas por actividades de inversión: ${formatearMoneda(actual.actividadesInversion.salidas.totalSalidasInversion)}

FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE INVERSIÓN: ${formatearMoneda(actual.actividadesInversion.netoActividadesInversion)}

================================================================================
III. FLUJOS DE EFECTIVO DE LAS ACTIVIDADES DE FINANCIAMIENTO
================================================================================
ENTRADAS DE EFECTIVO:
  Préstamos recibidos: ${formatearMoneda(actual.actividadesFinanciamiento.entradas.prestamosRecibidos)}
  Aportes de capital: ${formatearMoneda(actual.actividadesFinanciamiento.entradas.aportesCapital)}
  Total entradas por actividades de financiamiento: ${formatearMoneda(actual.actividadesFinanciamiento.entradas.totalEntradasFinanciamiento)}

SALIDAS DE EFECTIVO:
  Pago de préstamos: ${formatearMoneda(actual.actividadesFinanciamiento.salidas.pagoPrestamos)}
  Pago de dividendos: ${formatearMoneda(actual.actividadesFinanciamiento.salidas.pagoDividendos)}
  Total salidas por actividades de financiamiento: ${formatearMoneda(actual.actividadesFinanciamiento.salidas.totalSalidasFinanciamiento)}

FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE FINANCIAMIENTO: ${formatearMoneda(actual.actividadesFinanciamiento.netoActividadesFinanciamiento)}

================================================================================
IV. AUMENTO (DISMINUCIÓN) NETO DE EFECTIVO
================================================================================
Aumento (disminución) neto de efectivo: ${formatearMoneda(actual.netoAumentoDisminucionEfectivo)}
Efectivo al inicio del periodo: ${formatearMoneda(actual.efectivoInicioPeriodo)}
Efectivo al final del periodo: ${formatearMoneda(actual.efectivoFinPeriodo)}

================================================================================
V. RECONCILIACIÓN DE LA UTILIDAD NETA CON EL FLUJO DE EFECTIVO
================================================================================
Utilidad neta del ejercicio: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.utilidadNeta)}

Ajustes por:
  Depreciación y amortización: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.ajustes.depreciacionAmortizacion)}
  Provisión para cobranza dudosa: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.ajustes.provisionCobranzaDudosa)}
  Variación en cuentas por cobrar: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionCuentasPorCobrar)}
  Variación en inventarios: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionInventarios)}
  Variación en cuentas por pagar: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionCuentasPorPagar)}
  Otros ajustes: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.ajustes.otrosAjustes)}
  Total ajustes: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.ajustes.totalAjustes)}

FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE OPERACIÓN: ${formatearMoneda(actual.conciliacionUtilidadNetaFlujoOperacion.totalConciliacion)}

================================================================================
ANÁLISIS DE INDICADORES DE LIQUIDEZ
================================================================================
Cobertura de deuda: ${metricas.coberturaDeuda} veces
Margen de flujo operativo: ${metricas.margenFlujoOperativo}%
Razón flujo operativo/utilidad neta: ${metricas.razonFlujoOperativo}
Crecimiento flujo operativo: ${metricas.crecimientoFlujoOperativo}%
Capacidad generación efectivo: ${metricas.capacidadGeneracionEfectivo}%
Índice autofinanciamiento: ${metricas.indiceAutofinanciamiento}%

================================================================================
CONCLUSIONES
================================================================================
El flujo de efectivo muestra una ${actual.netoAumentoDisminucionEfectivo >= 0 ? 'mejora' : 'disminución'} en la liquidez 
de la empresa de ${formatearMoneda(actual.netoAumentoDisminucionEfectivo)} durante el periodo.
La empresa ${actual.actividadesOperacion.netoActividadesOperacion >= 0 ? 'genera' : 'consume'} efectivo de sus operaciones,
lo que indica ${actual.actividadesOperacion.netoActividadesOperacion >= 0 ? 'una operación sostenible' : 'dependencia de financiamiento externo'}.
    `;

    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flujo-efectivo-${periodoActual}.txt`;
    a.click();
  };

  // Función para alternar sección
  const toggleSeccion = (seccion) => {
    setSeccionesExpandidas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // Componente para mostrar línea del flujo de efectivo
  const LineaFlujo = ({ 
    label, 
    valorActual, 
    valorComparativo = null, 
    esTotal = false,
    esSubtitulo = false,
    nivel = 0,
    tipo = "operacion" // operacion, inversion, financiamiento
  }) => {
    const diferencia = valorComparativo !== null ? calcularDiferencia(valorActual, valorComparativo) : null;
    
    const colores = {
      operacion: {
        total: 'text-blue-700',
        fondo: 'bg-blue-50',
        borde: 'border-blue-200',
        icono: Activity
      },
      inversion: {
        total: 'text-green-700',
        fondo: 'bg-green-50',
        borde: 'border-green-200',
        icono: Building
      },
      financiamiento: {
        total: 'text-purple-700',
        fondo: 'bg-purple-50',
        borde: 'border-purple-200',
        icono: CreditCard
      },
      conciliacion: {
        total: 'text-yellow-700',
        fondo: 'bg-yellow-50',
        borde: 'border-yellow-200',
        icono: Repeat
      }
    };

    const color = colores[tipo] || colores.operacion;
    const esPositivo = valorActual >= 0;
    const colorValor = esPositivo ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`
        flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3
        ${esTotal ? `${color.fondo} border-t-2 ${color.borde} font-bold` : ''}
        ${esSubtitulo ? 'bg-gray-50 font-semibold' : ''}
        ${nivel === 1 ? 'pl-4' : nivel === 2 ? 'pl-8' : nivel === 3 ? 'pl-12' : ''}
        border-b border-gray-100
      `}>
        <div className="flex items-center gap-2">
          {esSubtitulo && <color.icono className="w-4 h-4 text-gray-500" />}
          <span className={`
            ${esTotal ? `${color.total} text-lg` : esSubtitulo ? 'text-gray-700' : 'text-gray-600'}
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
              ${esTotal ? color.total : colorValor}
            `}>
              {formatearMoneda(valorActual)}
            </div>
            
            {diferencia !== null && !esTotal && (
              <div className="mt-1">
                <IndicadorCrecimiento 
                  valor={diferencia} 
                  invertido={label.includes('Pago') || label.includes('Salida') || label.includes('Compra')}
                />
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
                Estado de Flujo de Efectivo - Perú
              </h1>
              <p className="text-gray-600 mt-2">
                Modelo contable peruano conforme a NIC/NIIF - Método directo e indirecto
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
                label: "Flujo Operativo", 
                valor: flujoEfectivo.periodoActual.actividadesOperacion.netoActividadesOperacion, 
                icon: Activity, 
                color: "blue",
                subtext: `Crecimiento: ${metricas.crecimientoFlujoOperativo}%`
              },
              { 
                label: "Flujo Neto Total", 
                valor: flujoEfectivo.periodoActual.netoAumentoDisminucionEfectivo, 
                icon: Banknote, 
                color: flujoEfectivo.periodoActual.netoAumentoDisminucionEfectivo >= 0 ? "green" : "red",
                subtext: `Efectivo final: ${formatearMoneda(flujoEfectivo.periodoActual.efectivoFinPeriodo)}`
              },
              { 
                label: "Cobertura Deuda", 
                valor: `${metricas.coberturaDeuda}x`, 
                icon: CreditCard, 
                color: metricas.coberturaDeuda >= 2 ? "green" : metricas.coberturaDeuda >= 1 ? "yellow" : "red",
                subtext: "Capacidad pago"
              },
              { 
                label: "Margen Flujo", 
                valor: `${metricas.margenFlujoOperativo}%`, 
                icon: Percent, 
                color: metricas.margenFlujoOperativo >= 20 ? "green" : metricas.margenFlujoOperativo >= 10 ? "yellow" : "red",
                subtext: "Eficiencia generación"
              },
              { 
                label: "Autofinanciamiento", 
                valor: `${metricas.indiceAutofinanciamiento}%`, 
                icon: TrendingUpIcon, 
                color: metricas.indiceAutofinanciamiento >= 100 ? "green" : metricas.indiceAutofinanciamiento >= 50 ? "yellow" : "red",
                subtext: "Cobertura inversiones"
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
          {/* Flujo de Efectivo Detallado */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Estado de Flujo de Efectivo</h2>
                      <p className="text-blue-100 text-sm">Método Directo - NIC/NIIF Perú</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{periodoActual}</div>
                    <div className="text-blue-200 text-sm">vs {periodoComparativo}</div>
                  </div>
                </div>
              </div>

              {/* Sección: Actividades de Operación */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSeccion('operacion')}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-800">I. ACTIVIDADES DE OPERACIÓN</h3>
                  </div>
                  {seccionesExpandidas.operacion ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  )}
                </button>
                
                {seccionesExpandidas.operacion && (
                  <div className="p-2">
                    <div className="ml-4 mb-2">
                      <h4 className="text-sm font-medium text-green-600 mb-1">Entradas de efectivo:</h4>
                      <LineaFlujo 
                        label="Cobranza a clientes" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.entradas.cobranzaClientes}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.entradas.cobranzaClientes}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Otros ingresos operativos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.entradas.otrosIngresosOperativos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.entradas.otrosIngresosOperativos}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Devoluciones de impuestos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.entradas.devolucionesImpuestos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.entradas.devolucionesImpuestos}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Total entradas por actividades de operación" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.entradas.totalEntradasOperacion}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.entradas.totalEntradasOperacion}
                        esSubtitulo={true}
                        tipo="operacion"
                      />
                    </div>

                    <div className="ml-4 mt-4">
                      <h4 className="text-sm font-medium text-red-600 mb-1">Salidas de efectivo:</h4>
                      <LineaFlujo 
                        label="Pago a proveedores" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.salidas.pagoProveedores}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.salidas.pagoProveedores}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Pago de gastos operativos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.salidas.pagoGastosOperativos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.salidas.pagoGastosOperativos}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Pago de impuestos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.salidas.pagoImpuestos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.salidas.pagoImpuestos}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Participación de trabajadores" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.salidas.participacionTrabajadores}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.salidas.participacionTrabajadores}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Otros pagos operativos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.salidas.otrosPagosOperativos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.salidas.otrosPagosOperativos}
                        nivel={2}
                        tipo="operacion"
                      />
                      <LineaFlujo 
                        label="Total salidas por actividades de operación" 
                        valorActual={flujoEfectivo.periodoActual.actividadesOperacion.salidas.totalSalidasOperacion}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.salidas.totalSalidasOperacion}
                        esSubtitulo={true}
                        tipo="operacion"
                      />
                    </div>

                    <LineaFlujo 
                      label="FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE OPERACIÓN" 
                      valorActual={flujoEfectivo.periodoActual.actividadesOperacion.netoActividadesOperacion}
                      valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.netoActividadesOperacion}
                      esTotal={true}
                      tipo="operacion"
                    />
                  </div>
                )}
              </div>

              {/* Sección: Actividades de Inversión */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSeccion('inversion')}
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">II. ACTIVIDADES DE INVERSIÓN</h3>
                  </div>
                  {seccionesExpandidas.inversion ? (
                    <ChevronUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-green-600" />
                  )}
                </button>
                
                {seccionesExpandidas.inversion && (
                  <div className="p-2">
                    <div className="ml-4 mb-2">
                      <h4 className="text-sm font-medium text-green-600 mb-1">Entradas de efectivo:</h4>
                      <LineaFlujo 
                        label="Venta de activos fijos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesInversion.entradas.ventaActivosFijos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.entradas.ventaActivosFijos}
                        nivel={2}
                        tipo="inversion"
                      />
                      <LineaFlujo 
                        label="Dividendos recibidos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesInversion.entradas.dividendosRecibidos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.entradas.dividendosRecibidos}
                        nivel={2}
                        tipo="inversion"
                      />
                      <LineaFlujo 
                        label="Total entradas por actividades de inversión" 
                        valorActual={flujoEfectivo.periodoActual.actividadesInversion.entradas.totalEntradasInversion}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.entradas.totalEntradasInversion}
                        esSubtitulo={true}
                        tipo="inversion"
                      />
                    </div>

                    <div className="ml-4 mt-4">
                      <h4 className="text-sm font-medium text-red-600 mb-1">Salidas de efectivo:</h4>
                      <LineaFlujo 
                        label="Compra de activos fijos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesInversion.salidas.compraActivosFijos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.salidas.compraActivosFijos}
                        nivel={2}
                        tipo="inversion"
                      />
                      <LineaFlujo 
                        label="Compra de inversiones" 
                        valorActual={flujoEfectivo.periodoActual.actividadesInversion.salidas.compraInversiones}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.salidas.compraInversiones}
                        nivel={2}
                        tipo="inversion"
                      />
                      <LineaFlujo 
                        label="Total salidas por actividades de inversión" 
                        valorActual={flujoEfectivo.periodoActual.actividadesInversion.salidas.totalSalidasInversion}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.salidas.totalSalidasInversion}
                        esSubtitulo={true}
                        tipo="inversion"
                      />
                    </div>

                    <LineaFlujo 
                      label="FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE INVERSIÓN" 
                      valorActual={flujoEfectivo.periodoActual.actividadesInversion.netoActividadesInversion}
                      valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.netoActividadesInversion}
                      esTotal={true}
                      tipo="inversion"
                    />
                  </div>
                )}
              </div>

              {/* Sección: Actividades de Financiamiento */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSeccion('financiamiento')}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-800">III. ACTIVIDADES DE FINANCIAMIENTO</h3>
                  </div>
                  {seccionesExpandidas.financiamiento ? (
                    <ChevronUp className="w-5 h-5 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-600" />
                  )}
                </button>
                
                {seccionesExpandidas.financiamiento && (
                  <div className="p-2">
                    <div className="ml-4 mb-2">
                      <h4 className="text-sm font-medium text-green-600 mb-1">Entradas de efectivo:</h4>
                      <LineaFlujo 
                        label="Préstamos recibidos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.entradas.prestamosRecibidos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.entradas.prestamosRecibidos}
                        nivel={2}
                        tipo="financiamiento"
                      />
                      <LineaFlujo 
                        label="Aportes de capital" 
                        valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.entradas.aportesCapital}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.entradas.aportesCapital}
                        nivel={2}
                        tipo="financiamiento"
                      />
                      <LineaFlujo 
                        label="Total entradas por actividades de financiamiento" 
                        valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.entradas.totalEntradasFinanciamiento}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.entradas.totalEntradasFinanciamiento}
                        esSubtitulo={true}
                        tipo="financiamiento"
                      />
                    </div>

                    <div className="ml-4 mt-4">
                      <h4 className="text-sm font-medium text-red-600 mb-1">Salidas de efectivo:</h4>
                      <LineaFlujo 
                        label="Pago de préstamos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.salidas.pagoPrestamos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.salidas.pagoPrestamos}
                        nivel={2}
                        tipo="financiamiento"
                      />
                      <LineaFlujo 
                        label="Pago de dividendos" 
                        valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.salidas.pagoDividendos}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.salidas.pagoDividendos}
                        nivel={2}
                        tipo="financiamiento"
                      />
                      <LineaFlujo 
                        label="Total salidas por actividades de financiamiento" 
                        valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.salidas.totalSalidasFinanciamiento}
                        valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.salidas.totalSalidasFinanciamiento}
                        esSubtitulo={true}
                        tipo="financiamiento"
                      />
                    </div>

                    <LineaFlujo 
                      label="FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE FINANCIAMIENTO" 
                      valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.netoActividadesFinanciamiento}
                      valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.netoActividadesFinanciamiento}
                      esTotal={true}
                      tipo="financiamiento"
                    />
                  </div>
                )}
              </div>

              {/* Resumen de Flujos */}
              <div className="border-b border-gray-100">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3 mb-4">
                    <Banknote className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-800">IV. RESUMEN DE FLUJOS DE EFECTIVO</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <LineaFlujo 
                      label="Flujo neto actividades de operación" 
                      valorActual={flujoEfectivo.periodoActual.actividadesOperacion.netoActividadesOperacion}
                      valorComparativo={flujoEfectivo.periodoComparativo.actividadesOperacion.netoActividadesOperacion}
                      nivel={1}
                      tipo="operacion"
                    />
                    <LineaFlujo 
                      label="Flujo neto actividades de inversión" 
                      valorActual={flujoEfectivo.periodoActual.actividadesInversion.netoActividadesInversion}
                      valorComparativo={flujoEfectivo.periodoComparativo.actividadesInversion.netoActividadesInversion}
                      nivel={1}
                      tipo="inversion"
                    />
                    <LineaFlujo 
                      label="Flujo neto actividades de financiamiento" 
                      valorActual={flujoEfectivo.periodoActual.actividadesFinanciamiento.netoActividadesFinanciamiento}
                      valorComparativo={flujoEfectivo.periodoComparativo.actividadesFinanciamiento.netoActividadesFinanciamiento}
                      nivel={1}
                      tipo="financiamiento"
                    />
                    
                    <LineaFlujo 
                      label="AUMENTO (DISMINUCIÓN) NETO DE EFECTIVO" 
                      valorActual={flujoEfectivo.periodoActual.netoAumentoDisminucionEfectivo}
                      valorComparativo={flujoEfectivo.periodoComparativo.netoAumentoDisminucionEfectivo}
                      esTotal={true}
                      tipo="operacion"
                    />
                    
                    <LineaFlujo 
                      label="Efectivo al inicio del periodo" 
                      valorActual={flujoEfectivo.periodoActual.efectivoInicioPeriodo}
                      valorComparativo={flujoEfectivo.periodoComparativo.efectivoInicioPeriodo}
                      nivel={1}
                      tipo="operacion"
                    />
                    
                    <LineaFlujo 
                      label="EFECTIVO AL FINAL DEL PERIODO" 
                      valorActual={flujoEfectivo.periodoActual.efectivoFinPeriodo}
                      valorComparativo={flujoEfectivo.periodoComparativo.efectivoFinPeriodo}
                      esTotal={true}
                      tipo="operacion"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Conciliación (Método Indirecto) */}
              <div>
                <button
                  onClick={() => toggleSeccion('conciliacion')}
                  className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Repeat className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-yellow-800">V. RECONCILIACIÓN (MÉTODO INDIRECTO)</h3>
                  </div>
                  {seccionesExpandidas.conciliacion ? (
                    <ChevronUp className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-yellow-600" />
                  )}
                </button>
                
                {seccionesExpandidas.conciliacion && (
                  <div className="p-2">
                    <LineaFlujo 
                      label="Utilidad neta del ejercicio" 
                      valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.utilidadNeta}
                      valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.utilidadNeta}
                      nivel={1}
                      tipo="conciliacion"
                    />
                    
                    <div className="ml-4 mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ajustes por:</h4>
                      <LineaFlujo 
                        label="Depreciación y amortización" 
                        valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.ajustes.depreciacionAmortizacion}
                        valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.ajustes.depreciacionAmortizacion}
                        nivel={2}
                        tipo="conciliacion"
                      />
                      <LineaFlujo 
                        label="Provisión para cobranza dudosa" 
                        valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.ajustes.provisionCobranzaDudosa}
                        valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.ajustes.provisionCobranzaDudosa}
                        nivel={2}
                        tipo="conciliacion"
                      />
                      <LineaFlujo 
                        label="Variación en cuentas por cobrar" 
                        valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionCuentasPorCobrar}
                        valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionCuentasPorCobrar}
                        nivel={2}
                        tipo="conciliacion"
                      />
                      <LineaFlujo 
                        label="Variación en inventarios" 
                        valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionInventarios}
                        valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionInventarios}
                        nivel={2}
                        tipo="conciliacion"
                      />
                      <LineaFlujo 
                        label="Variación en cuentas por pagar" 
                        valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionCuentasPorPagar}
                        valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.ajustes.variacionCuentasPorPagar}
                        nivel={2}
                        tipo="conciliacion"
                      />
                      <LineaFlujo 
                        label="Otros ajustes" 
                        valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.ajustes.otrosAjustes}
                        valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.ajustes.otrosAjustes}
                        nivel={2}
                        tipo="conciliacion"
                      />
                      <LineaFlujo 
                        label="Total ajustes" 
                        valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.ajustes.totalAjustes}
                        valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.ajustes.totalAjustes}
                        esSubtitulo={true}
                        tipo="conciliacion"
                      />
                    </div>

                    <LineaFlujo 
                      label="FLUJO NETO DE EFECTIVO POR ACTIVIDADES DE OPERACIÓN (Método Indirecto)" 
                      valorActual={flujoEfectivo.periodoActual.conciliacionUtilidadNetaFlujoOperacion.totalConciliacion}
                      valorComparativo={flujoEfectivo.periodoComparativo.conciliacionUtilidadNetaFlujoOperacion.totalConciliacion}
                      esTotal={true}
                      tipo="conciliacion"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral - Análisis y Ratios */}
          <div className="space-y-6">
            {/* Análisis de Liquidez */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Banknote  className="w-5 h-5 text-green-600" />
                Análisis de Liquidez
              </h3>
              
              <div className="space-y-4">
                {[
                  { 
                    label: "Cobertura de Deuda", 
                    valor: metricas.coberturaDeuda, 
                    unidad: "x", 
                    interpretacion: "Flujo Operativo / Servicio Deuda",
                    buenValor: 2,
                    color: metricas.coberturaDeuda >= 3 ? "green" : metricas.coberturaDeuda >= 1.5 ? "yellow" : "red"
                  },
                  { 
                    label: "Razón Efectivo/Ventas", 
                    valor: ((flujoEfectivo.periodoActual.efectivoFinPeriodo / 1250000) * 100).toFixed(1), 
                    unidad: "%", 
                    interpretacion: "Efectivo Final / Ventas Netas",
                    buenValor: 10,
                    color: (flujoEfectivo.periodoActual.efectivoFinPeriodo / 1250000) * 100 >= 15 ? "green" : (flujoEfectivo.periodoActual.efectivoFinPeriodo / 1250000) * 100 >= 5 ? "yellow" : "red"
                  },
                  { 
                    label: "Días de Efectivo", 
                    valor: Math.round((flujoEfectivo.periodoActual.efectivoFinPeriodo / (1083600 / 365))), 
                    unidad: "días", 
                    interpretacion: "Efectivo / Gastos Operativos Diarios",
                    buenValor: 60,
                    color: Math.round((flujoEfectivo.periodoActual.efectivoFinPeriodo / (1083600 / 365))) >= 90 ? "green" : Math.round((flujoEfectivo.periodoActual.efectivoFinPeriodo / (1083600 / 365))) >= 30 ? "yellow" : "red"
                  }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      <div className={`text-lg font-bold text-${item.color}-600`}>
                        {item.valor}{item.unidad}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{item.interpretacion}</div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs">
                        <span>Crítico</span>
                        <span>Aceptable</span>
                        <span>Óptimo</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full bg-${item.color}-500`}
                          style={{ width: `${Math.min((parseFloat(item.valor) / (item.buenValor * 1.5)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Composición de Flujos */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Composición de Flujos
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Origen del Aumento de Efectivo</div>
                  {[
                    { 
                      label: "Actividades de Operación", 
                      valor: flujoEfectivo.periodoActual.actividadesOperacion.netoActividadesOperacion,
                      porcentaje: (flujoEfectivo.periodoActual.actividadesOperacion.netoActividadesOperacion / flujoEfectivo.periodoActual.netoAumentoDisminucionEfectivo) * 100,
                      color: "blue"
                    },
                    { 
                      label: "Actividades de Financiamiento", 
                      valor: flujoEfectivo.periodoActual.actividadesFinanciamiento.netoActividadesFinanciamiento,
                      porcentaje: (flujoEfectivo.periodoActual.actividadesFinanciamiento.netoActividadesFinanciamiento / flujoEfectivo.periodoActual.netoAumentoDisminucionEfectivo) * 100,
                      color: "purple"
                    }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-medium text-gray-800">
                          {formatearMoneda(item.valor)} ({item.porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${item.color}-500 rounded-full`}
                          style={{ width: `${Math.abs(item.porcentaje)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Uso de Efectivo en Inversiones</div>
                  {[
                    { label: "Compra Activos Fijos", porcentaje: (flujoEfectivo.periodoActual.actividadesInversion.salidas.compraActivosFijos / flujoEfectivo.periodoActual.actividadesInversion.salidas.totalSalidasInversion) * 100 },
                    { label: "Compra Inversiones", porcentaje: (flujoEfectivo.periodoActual.actividadesInversion.salidas.compraInversiones / flujoEfectivo.periodoActual.actividadesInversion.salidas.totalSalidasInversion) * 100 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between text-xs py-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-700">{item.porcentaje.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ratios de Gestión de Efectivo */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Ratios de Gestión
              </h3>
              
              <div className="space-y-3">
                {[
                  { label: "Margen Flujo Operativo", valor: `${metricas.margenFlujoOperativo}%`, desc: "Flujo Operativo / Ventas", tendencia: metricas.margenFlujoOperativo >= 25 ? "up" : metricas.margenFlujoOperativo >= 15 ? "stable" : "down" },
                  { label: "Razón Flujo/Utilidad", valor: metricas.razonFlujoOperativo.toFixed(2), desc: "Flujo Operativo / Utilidad Neta", tendencia: metricas.razonFlujoOperativo >= 1.5 ? "up" : metricas.razonFlujoOperativo >= 0.8 ? "stable" : "down" },
                  { label: "Capacidad Generación", valor: `${metricas.capacidadGeneracionEfectivo}%`, desc: "Flujo Operativo / Activo Total", tendencia: metricas.capacidadGeneracionEfectivo >= 15 ? "up" : metricas.capacidadGeneracionEfectivo >= 8 ? "stable" : "down" },
                  { label: "Índice Autofinanciamiento", valor: `${metricas.indiceAutofinanciamiento}%`, desc: "Flujo Operativo / Inversiones", tendencia: metricas.indiceAutofinanciamiento >= 150 ? "up" : metricas.indiceAutofinanciamiento >= 80 ? "stable" : "down" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">{item.valor}</div>
                      <div className={`text-xs ${item.tendencia === 'up' ? 'text-green-600' : item.tendencia === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {item.tendencia === 'up' ? '↑ Fuerte' : item.tendencia === 'down' ? '↓ Débil' : '→ Moderada'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolución del Efectivo */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Evolución del Efectivo
              </h3>
              
              <div className="space-y-4">
                {[
                  { 
                    label: "Efectivo Inicio", 
                    actual: flujoEfectivo.periodoActual.efectivoInicioPeriodo,
                    comparativo: flujoEfectivo.periodoComparativo.efectivoInicioPeriodo
                  },
                  { 
                    label: "Flujo Neto", 
                    actual: flujoEfectivo.periodoActual.netoAumentoDisminucionEfectivo,
                    comparativo: flujoEfectivo.periodoComparativo.netoAumentoDisminucionEfectivo
                  },
                  { 
                    label: "Efectivo Final", 
                    actual: flujoEfectivo.periodoActual.efectivoFinPeriodo,
                    comparativo: flujoEfectivo.periodoComparativo.efectivoFinPeriodo
                  }
                ].map((item, index) => {
                  const crecimiento = calcularDiferencia(item.actual, item.comparativo);
                  
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">{item.label}</div>
                      
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
                          style={{ width: `${Math.min((item.comparativo / (item.actual + Math.abs(item.comparativo))) * 100, 100)}%` }}
                        />
                        <div 
                          className="bg-green-500"
                          style={{ width: `${Math.min((item.actual / (item.actual + Math.abs(item.comparativo))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 mb-1">Crecimiento Acumulado</div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-800">
                      {calcularDiferencia(flujoEfectivo.periodoActual.efectivoFinPeriodo, flujoEfectivo.periodoComparativo.efectivoInicioPeriodo).toFixed(1)}%
                    </div>
                    <IndicadorCrecimiento 
                      valor={calcularDiferencia(flujoEfectivo.periodoActual.efectivoFinPeriodo, flujoEfectivo.periodoComparativo.efectivoInicioPeriodo)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Sistema de Análisis Financiero - Flujo de Efectivo conforme a NIC/NIIF Perú</p>
          <p className="mt-1">Método directo e indirecto - NIIF 7: Instrumentos Financieros</p>
        </div>
      </div>
    </div>
  );
};

export default FlujoEfectivo;