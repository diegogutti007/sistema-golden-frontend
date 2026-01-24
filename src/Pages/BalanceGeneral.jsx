import React, { useState, useEffect } from "react";
import {
  Building,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
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
  Scale,
  Landmark,
  Wallet,
  CreditCard,
  Package,
  Users,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const BalanceGeneral = () => {
  // Estados para periodos
  const [periodoActual, setPeriodoActual] = useState("2024");
  const [periodoComparativo, setPeriodoComparativo] = useState("2023");
  
  // Estados para los datos del balance general
  const [balanceGeneral, setBalanceGeneral] = useState({
    periodoActual: {
      // ACTIVO
      activo: {
        corriente: {
          disponible: {
            cajaBancos: 150000,
            valoresNegociables: 50000,
            totalDisponible: 200000
          },
          exigible: {
            cuentasPorCobrar: 180000,
            deudoresVarios: 25000,
            provisionCobranzaDudosa: -5000,
            totalExigible: 200000
          },
          realizables: {
            existencias: 300000,
            mercaderias: 150000,
            productosTerminados: 100000,
            totalRealizables: 550000
          },
          otrosActivosCorrientes: 50000,
          totalActivoCorriente: 1000000
        },
        noCorriente: {
          inmovilizado: {
            terrenos: 400000,
            edificios: 600000,
            maquinariaEquipo: 300000,
            vehiculos: 100000,
            depreciacionAcumulada: -200000,
            totalInmovilizado: 1200000
          },
          intangibles: {
            patentes: 80000,
            marcaRegistrada: 50000,
            fondoComercio: 70000,
            totalIntangibles: 200000
          },
          otrosActivosNoCorrientes: 100000,
          totalActivoNoCorriente: 1500000
        },
        totalActivo: 2500000
      },
      
      // PASIVO
      pasivo: {
        corriente: {
          proveedores: 180000,
          prestamosCortoPlazo: 120000,
          cuentasPorPagarComerciales: 80000,
          impuestosPorPagar: 40000,
          provisiones: 30000,
          totalPasivoCorriente: 450000
        },
        noCorriente: {
          prestamosLargoPlazo: 550000,
          bonosPorPagar: 200000,
          otrosPasivosLargoPlazo: 100000,
          totalPasivoNoCorriente: 850000
        },
        totalPasivo: 1300000
      },
      
      // PATRIMONIO
      patrimonio: {
        capital: {
          capitalSocial: 800000,
          aportesCapital: 200000,
          totalCapital: 1000000
        },
        reservas: {
          reservaLegal: 80000,
          reservasEstatutarias: 50000,
          otrasReservas: 20000,
          totalReservas: 150000
        },
        resultadosAcumulados: {
          resultadosEjerciciosAnteriores: 40000,
          resultadoEjercicio: 176400,
          totalResultadosAcumulados: 216400
        },
        totalPatrimonio: 1366400
      }
    },
    periodoComparativo: {
      activo: {
        corriente: {
          disponible: {
            cajaBancos: 120000,
            valoresNegociables: 40000,
            totalDisponible: 160000
          },
          exigible: {
            cuentasPorCobrar: 150000,
            deudoresVarios: 20000,
            provisionCobranzaDudosa: -4000,
            totalExigible: 166000
          },
          realizables: {
            existencias: 250000,
            mercaderias: 120000,
            productosTerminados: 80000,
            totalRealizables: 450000
          },
          otrosActivosCorrientes: 40000,
          totalActivoCorriente: 816000
        },
        noCorriente: {
          inmovilizado: {
            terrenos: 350000,
            edificios: 550000,
            maquinariaEquipo: 250000,
            vehiculos: 90000,
            depreciacionAcumulada: -180000,
            totalInmovilizado: 1060000
          },
          intangibles: {
            patentes: 70000,
            marcaRegistrada: 40000,
            fondoComercio: 60000,
            totalIntangibles: 170000
          },
          otrosActivosNoCorrientes: 80000,
          totalActivoNoCorriente: 1310000
        },
        totalActivo: 2126000
      },
      pasivo: {
        corriente: {
          proveedores: 150000,
          prestamosCortoPlazo: 100000,
          cuentasPorPagarComerciales: 60000,
          impuestosPorPagar: 30000,
          provisiones: 20000,
          totalPasivoCorriente: 360000
        },
        noCorriente: {
          prestamosLargoPlazo: 500000,
          bonosPorPagar: 180000,
          otrosPasivosLargoPlazo: 80000,
          totalPasivoNoCorriente: 760000
        },
        totalPasivo: 1120000
      },
      patrimonio: {
        capital: {
          capitalSocial: 700000,
          aportesCapital: 150000,
          totalCapital: 850000
        },
        reservas: {
          reservaLegal: 65000,
          reservasEstatutarias: 40000,
          otrasReservas: 15000,
          totalReservas: 120000
        },
        resultadosAcumulados: {
          resultadosEjerciciosAnteriores: 35000,
          resultadoEjercicio: 153720,
          totalResultadosAcumulados: 188720
        },
        totalPatrimonio: 1158720
      }
    }
  });

  // Estados para métricas calculadas
  const [metricas, setMetricas] = useState({
    liquidezCorriente: 0,
    liquidezAcida: 0,
    endeudamientoTotal: 0,
    endeudamientoLargoPlazo: 0,
    rentabilidadPatrimonio: 0,
    rentabilidadActivo: 0,
    rotacionInventarios: 0,
    diasCobranza: 0
  });

  // Estados para controles UI
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({
    activoCorriente: true,
    activoNoCorriente: true,
    pasivoCorriente: true,
    pasivoNoCorriente: true,
    patrimonio: true
  });

  // Calcular métricas
  useEffect(() => {
    const actual = balanceGeneral.periodoActual;
    const comparativo = balanceGeneral.periodoComparativo;

    // Liquidez Corriente = Activo Corriente / Pasivo Corriente
    const liquidezCorriente = actual.activo.corriente.totalActivoCorriente / actual.pasivo.corriente.totalPasivoCorriente;
    
    // Liquidez Acida = (Activo Corriente - Inventarios) / Pasivo Corriente
    const liquidezAcida = (actual.activo.corriente.totalActivoCorriente - actual.activo.corriente.realizables.totalRealizables) / actual.pasivo.corriente.totalPasivoCorriente;
    
    // Endeudamiento Total = Pasivo Total / Activo Total
    const endeudamientoTotal = (actual.pasivo.totalPasivo / actual.activo.totalActivo) * 100;
    
    // Endeudamiento Largo Plazo = Pasivo No Corriente / Patrimonio
    const endeudamientoLargoPlazo = (actual.pasivo.noCorriente.totalPasivoNoCorriente / actual.patrimonio.totalPatrimonio) * 100;
    
    // ROE (Return on Equity) = Utilidad Neta / Patrimonio Promedio
    const utilidadNeta = 176400; // Del estado de resultados
    const patrimonioPromedio = (actual.patrimonio.totalPatrimonio + comparativo.patrimonio.totalPatrimonio) / 2;
    const rentabilidadPatrimonio = (utilidadNeta / patrimonioPromedio) * 100;
    
    // ROA (Return on Assets) = Utilidad Neta / Activo Promedio
    const activoPromedio = (actual.activo.totalActivo + comparativo.activo.totalActivo) / 2;
    const rentabilidadActivo = (utilidadNeta / activoPromedio) * 100;
    
    // Rotación de Inventarios (aproximado) = Costo Ventas / Inventario Promedio
    const costoVentas = 750000; // Del estado de resultados
    const inventarioPromedio = (actual.activo.corriente.realizables.totalRealizables + comparativo.activo.corriente.realizables.totalRealizables) / 2;
    const rotacionInventarios = costoVentas / inventarioPromedio;
    
    // Días de Cobranza = (Cuentas por Cobrar / Ventas) * 365
    const ventasNetas = 1250000; // Del estado de resultados
    const diasCobranza = (actual.activo.corriente.exigible.cuentasPorCobrar / ventasNetas) * 365;

    setMetricas({
      liquidezCorriente: parseFloat(liquidezCorriente.toFixed(2)),
      liquidezAcida: parseFloat(liquidezAcida.toFixed(2)),
      endeudamientoTotal: parseFloat(endeudamientoTotal.toFixed(2)),
      endeudamientoLargoPlazo: parseFloat(endeudamientoLargoPlazo.toFixed(2)),
      rentabilidadPatrimonio: parseFloat(rentabilidadPatrimonio.toFixed(2)),
      rentabilidadActivo: parseFloat(rentabilidadActivo.toFixed(2)),
      rotacionInventarios: parseFloat(rotacionInventarios.toFixed(2)),
      diasCobranza: parseFloat(diasCobranza.toFixed(0))
    });
  }, [balanceGeneral]);

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
    const actual = balanceGeneral.periodoActual;
    
    const reporte = `
BALANCE GENERAL - MODELO CONTABLE PERUANO (NIC/NIIF)
Fecha de corte: Diciembre ${periodoActual} - Comparativo: Diciembre ${periodoComparativo}
Fecha de generación: ${new Date().toLocaleDateString('es-PE')}

================================================================================
ACTIVO
================================================================================
ACTIVO CORRIENTE
Disponible:
  Caja y Bancos: ${formatearMoneda(actual.activo.corriente.disponible.cajaBancos)}
  Valores Negociables: ${formatearMoneda(actual.activo.corriente.disponible.valoresNegociables)}
  Total Disponible: ${formatearMoneda(actual.activo.corriente.disponible.totalDisponible)}

Exigible:
  Cuentas por Cobrar: ${formatearMoneda(actual.activo.corriente.exigible.cuentasPorCobrar)}
  Deudores Varios: ${formatearMoneda(actual.activo.corriente.exigible.deudoresVarios)}
  Provisión Cobranza Dudosa: ${formatearMoneda(actual.activo.corriente.exigible.provisionCobranzaDudosa)}
  Total Exigible: ${formatearMoneda(actual.activo.corriente.exigible.totalExigible)}

Realizables:
  Existencias: ${formatearMoneda(actual.activo.corriente.realizables.existencias)}
  Mercaderías: ${formatearMoneda(actual.activo.corriente.realizables.mercaderias)}
  Productos Terminados: ${formatearMoneda(actual.activo.corriente.realizables.productosTerminados)}
  Total Realizables: ${formatearMoneda(actual.activo.corriente.realizables.totalRealizables)}

Otros Activos Corrientes: ${formatearMoneda(actual.activo.corriente.otrosActivosCorrientes)}
TOTAL ACTIVO CORRIENTE: ${formatearMoneda(actual.activo.corriente.totalActivoCorriente)}

ACTIVO NO CORRIENTE
Inmovilizado:
  Terrenos: ${formatearMoneda(actual.activo.noCorriente.inmovilizado.terrenos)}
  Edificios: ${formatearMoneda(actual.activo.noCorriente.inmovilizado.edificios)}
  Maquinaria y Equipo: ${formatearMoneda(actual.activo.noCorriente.inmovilizado.maquinariaEquipo)}
  Vehículos: ${formatearMoneda(actual.activo.noCorriente.inmovilizado.vehiculos)}
  Depreciación Acumulada: ${formatearMoneda(actual.activo.noCorriente.inmovilizado.depreciacionAcumulada)}
  Total Inmovilizado: ${formatearMoneda(actual.activo.noCorriente.inmovilizado.totalInmovilizado)}

Intangibles:
  Patentes: ${formatearMoneda(actual.activo.noCorriente.intangibles.patentes)}
  Marca Registrada: ${formatearMoneda(actual.activo.noCorriente.intangibles.marcaRegistrada)}
  Fondo Comercio: ${formatearMoneda(actual.activo.noCorriente.intangibles.fondoComercio)}
  Total Intangibles: ${formatearMoneda(actual.activo.noCorriente.intangibles.totalIntangibles)}

Otros Activos No Corrientes: ${formatearMoneda(actual.activo.noCorriente.otrosActivosNoCorrientes)}
TOTAL ACTIVO NO CORRIENTE: ${formatearMoneda(actual.activo.noCorriente.totalActivoNoCorriente)}

TOTAL ACTIVO: ${formatearMoneda(actual.activo.totalActivo)}

================================================================================
PASIVO Y PATRIMONIO
================================================================================
PASIVO CORRIENTE
  Proveedores: ${formatearMoneda(actual.pasivo.corriente.proveedores)}
  Préstamos Corto Plazo: ${formatearMoneda(actual.pasivo.corriente.prestamosCortoPlazo)}
  Cuentas por Pagar Comerciales: ${formatearMoneda(actual.pasivo.corriente.cuentasPorPagarComerciales)}
  Impuestos por Pagar: ${formatearMoneda(actual.pasivo.corriente.impuestosPorPagar)}
  Provisiones: ${formatearMoneda(actual.pasivo.corriente.provisiones)}
TOTAL PASIVO CORRIENTE: ${formatearMoneda(actual.pasivo.corriente.totalPasivoCorriente)}

PASIVO NO CORRIENTE
  Préstamos Largo Plazo: ${formatearMoneda(actual.pasivo.noCorriente.prestamosLargoPlazo)}
  Bonos por Pagar: ${formatearMoneda(actual.pasivo.noCorriente.bonosPorPagar)}
  Otros Pasivos Largo Plazo: ${formatearMoneda(actual.pasivo.noCorriente.otrosPasivosLargoPlazo)}
TOTAL PASIVO NO CORRIENTE: ${formatearMoneda(actual.pasivo.noCorriente.totalPasivoNoCorriente)}

TOTAL PASIVO: ${formatearMoneda(actual.pasivo.totalPasivo)}

PATRIMONIO
Capital:
  Capital Social: ${formatearMoneda(actual.patrimonio.capital.capitalSocial)}
  Aportes de Capital: ${formatearMoneda(actual.patrimonio.capital.aportesCapital)}
  Total Capital: ${formatearMoneda(actual.patrimonio.capital.totalCapital)}

Reservas:
  Reserva Legal: ${formatearMoneda(actual.patrimonio.reservas.reservaLegal)}
  Reservas Estatutarias: ${formatearMoneda(actual.patrimonio.reservas.reservasEstatutarias)}
  Otras Reservas: ${formatearMoneda(actual.patrimonio.reservas.otrasReservas)}
  Total Reservas: ${formatearMoneda(actual.patrimonio.reservas.totalReservas)}

Resultados Acumulados:
  Resultados Ejercicios Anteriores: ${formatearMoneda(actual.patrimonio.resultadosAcumulados.resultadosEjerciciosAnteriores)}
  Resultado del Ejercicio: ${formatearMoneda(actual.patrimonio.resultadosAcumulados.resultadoEjercicio)}
  Total Resultados Acumulados: ${formatearMoneda(actual.patrimonio.resultadosAcumulados.totalResultadosAcumulados)}

TOTAL PATRIMONIO: ${formatearMoneda(actual.patrimonio.totalPatrimonio)}

TOTAL PASIVO Y PATRIMONIO: ${formatearMoneda(actual.pasivo.totalPasivo + actual.patrimonio.totalPatrimonio)}

================================================================================
ANÁLISIS DE INDICADORES FINANCIEROS
================================================================================
Liquidez Corriente: ${metricas.liquidezCorriente}
Liquidez Ácida: ${metricas.liquidezAcida}
Endeudamiento Total: ${metricas.endeudamientoTotal}%
Endeudamiento Largo Plazo: ${metricas.endeudamientoLargoPlazo}%
Rentabilidad sobre Patrimonio (ROE): ${metricas.rentabilidadPatrimonio}%
Rentabilidad sobre Activos (ROA): ${metricas.rentabilidadActivo}%
Rotación de Inventarios: ${metricas.rotacionInventarios} veces
Días de Cobranza: ${metricas.diasCobranza} días

================================================================================
EQUILIBRIO FINANCIERO
================================================================================
El Balance General presenta una estructura financiera ${metricas.endeudamientoTotal > 60 ? 'altamente apalancada' : metricas.endeudamientoTotal > 40 ? 'moderadamente apalancada' : 'conservadora'}.
La liquidez corriente de ${metricas.liquidezCorriente} ${metricas.liquidezCorriente > 2 ? 'es adecuada para cubrir obligaciones de corto plazo' : metricas.liquidezCorriente > 1 ? 'es mínimamente aceptable' : 'podría presentar problemas de liquidez'}.
    `;

    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-general-${periodoActual}.txt`;
    a.click();
  };

  // Función para alternar sección
  const toggleSeccion = (seccion) => {
    setSeccionesExpandidas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // Componente para mostrar línea del balance
  const LineaBalance = ({ 
    label, 
    valorActual, 
    valorComparativo = null, 
    esTotal = false,
    esSubtitulo = false,
    nivel = 0,
    tipo = "activo" // activo, pasivo, patrimonio
  }) => {
    const diferencia = valorComparativo !== null ? calcularDiferencia(valorActual, valorComparativo) : null;
    
    const colores = {
      activo: {
        total: 'text-blue-700',
        fondo: 'bg-blue-50',
        borde: 'border-blue-200'
      },
      pasivo: {
        total: 'text-red-700',
        fondo: 'bg-red-50',
        borde: 'border-red-200'
      },
      patrimonio: {
        total: 'text-green-700',
        fondo: 'bg-green-50',
        borde: 'border-green-200'
      }
    };

    const color = colores[tipo] || colores.activo;
    
    return (
      <div className={`
        flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3
        ${esTotal ? `${color.fondo} border-t-2 ${color.borde} font-bold` : ''}
        ${esSubtitulo ? 'bg-gray-50 font-semibold' : ''}
        ${nivel === 1 ? 'pl-4' : nivel === 2 ? 'pl-8' : nivel === 3 ? 'pl-12' : ''}
        border-b border-gray-100
      `}>
        <div className="flex items-center gap-2">
          {esSubtitulo && <FileText className="w-4 h-4 text-gray-500" />}
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
              ${esTotal ? color.total : 'text-gray-800'}
            `}>
              {formatearMoneda(valorActual)}
            </div>
            
            {diferencia !== null && !esTotal && (
              <div className="mt-1">
                <IndicadorCrecimiento 
                  valor={diferencia} 
                  invertido={tipo === "pasivo" || label.includes('Deuda') || label.includes('Préstamo')}
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
                Balance General - Perú
              </h1>
              <p className="text-gray-600 mt-2">
                Modelo contable peruano conforme a NIC/NIIF - Situación financiera al cierre del periodo
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
                label: "Activo Total", 
                valor: balanceGeneral.periodoActual.activo.totalActivo, 
                icon: Building, 
                color: "blue",
                subtext: `Crecimiento: ${calcularDiferencia(balanceGeneral.periodoActual.activo.totalActivo, balanceGeneral.periodoComparativo.activo.totalActivo).toFixed(1)}%`
              },
              { 
                label: "Patrimonio", 
                valor: balanceGeneral.periodoActual.patrimonio.totalPatrimonio, 
                icon: Landmark, 
                color: "green",
                subtext: `ROE: ${metricas.rentabilidadPatrimonio}%`
              },
              { 
                label: "Endeudamiento", 
                valor: `${metricas.endeudamientoTotal}%`, 
                icon: CreditCard, 
                color: "red",
                subtext: "Pasivo/Activo"
              },
              { 
                label: "Liquidez", 
                valor: `${metricas.liquidezCorriente}x`, 
                icon: Wallet, 
                color: "purple",
                subtext: "Corriente"
              },
              { 
                label: "Rotación Inventarios", 
                valor: `${metricas.rotacionInventarios}x`, 
                icon: Package, 
                color: "yellow",
                subtext: "Eficiencia"
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
          {/* Balance General Detallado */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Balance General Consolidado</h2>
                      <p className="text-blue-100 text-sm">Modelo NIC/NIIF - Perú</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">Diciembre {periodoActual}</div>
                    <div className="text-blue-200 text-sm">vs Diciembre {periodoComparativo}</div>
                  </div>
                </div>
              </div>

              {/* ACTIVO */}
              <div className="border-b border-gray-200">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    ACTIVO
                  </h3>
                </div>

                {/* Sección: Activo Corriente */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => toggleSeccion('activoCorriente')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-700">ACTIVO CORRIENTE</h4>
                    </div>
                    {seccionesExpandidas.activoCorriente ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                  
                  {seccionesExpandidas.activoCorriente && (
                    <div className="p-2">
                      <div className="ml-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Disponible</h5>
                        <LineaBalance 
                          label="Caja y Bancos" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.disponible.cajaBancos}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.disponible.cajaBancos}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Valores Negociables" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.disponible.valoresNegociables}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.disponible.valoresNegociables}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Total Disponible" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.disponible.totalDisponible}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.disponible.totalDisponible}
                          esSubtitulo={true}
                          tipo="activo"
                        />
                      </div>

                      <div className="ml-4 mt-2">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Exigible</h5>
                        <LineaBalance 
                          label="Cuentas por Cobrar" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.exigible.cuentasPorCobrar}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.exigible.cuentasPorCobrar}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Deudores Varios" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.exigible.deudoresVarios}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.exigible.deudoresVarios}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="(-) Provisión Cobranza Dudosa" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.exigible.provisionCobranzaDudosa}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.exigible.provisionCobranzaDudosa}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Total Exigible" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.exigible.totalExigible}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.exigible.totalExigible}
                          esSubtitulo={true}
                          tipo="activo"
                        />
                      </div>

                      <div className="ml-4 mt-2">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Realizables</h5>
                        <LineaBalance 
                          label="Existencias" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.realizables.existencias}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.realizables.existencias}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Mercaderías" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.realizables.mercaderias}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.realizables.mercaderias}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Productos Terminados" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.realizables.productosTerminados}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.realizables.productosTerminados}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Total Realizables" 
                          valorActual={balanceGeneral.periodoActual.activo.corriente.realizables.totalRealizables}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.realizables.totalRealizables}
                          esSubtitulo={true}
                          tipo="activo"
                        />
                      </div>

                      <LineaBalance 
                        label="Otros Activos Corrientes" 
                        valorActual={balanceGeneral.periodoActual.activo.corriente.otrosActivosCorrientes}
                        valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.otrosActivosCorrientes}
                        nivel={1}
                        tipo="activo"
                      />
                      
                      <LineaBalance 
                        label="TOTAL ACTIVO CORRIENTE" 
                        valorActual={balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente}
                        valorComparativo={balanceGeneral.periodoComparativo.activo.corriente.totalActivoCorriente}
                        esTotal={true}
                        tipo="activo"
                      />
                    </div>
                  )}
                </div>

                {/* Sección: Activo No Corriente */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => toggleSeccion('activoNoCorriente')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-700">ACTIVO NO CORRIENTE</h4>
                    </div>
                    {seccionesExpandidas.activoNoCorriente ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                  
                  {seccionesExpandidas.activoNoCorriente && (
                    <div className="p-2">
                      <div className="ml-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Inmovilizado</h5>
                        <LineaBalance 
                          label="Terrenos" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.inmovilizado.terrenos}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.inmovilizado.terrenos}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Edificios" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.inmovilizado.edificios}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.inmovilizado.edificios}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Maquinaria y Equipo" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.inmovilizado.maquinariaEquipo}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.inmovilizado.maquinariaEquipo}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Vehículos" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.inmovilizado.vehiculos}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.inmovilizado.vehiculos}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="(-) Depreciación Acumulada" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.inmovilizado.depreciacionAcumulada}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.inmovilizado.depreciacionAcumulada}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Total Inmovilizado" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.inmovilizado.totalInmovilizado}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.inmovilizado.totalInmovilizado}
                          esSubtitulo={true}
                          tipo="activo"
                        />
                      </div>

                      <div className="ml-4 mt-2">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Intangibles</h5>
                        <LineaBalance 
                          label="Patentes" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.intangibles.patentes}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.intangibles.patentes}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Marca Registrada" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.intangibles.marcaRegistrada}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.intangibles.marcaRegistrada}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Fondo Comercio" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.intangibles.fondoComercio}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.intangibles.fondoComercio}
                          nivel={2}
                          tipo="activo"
                        />
                        <LineaBalance 
                          label="Total Intangibles" 
                          valorActual={balanceGeneral.periodoActual.activo.noCorriente.intangibles.totalIntangibles}
                          valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.intangibles.totalIntangibles}
                          esSubtitulo={true}
                          tipo="activo"
                        />
                      </div>

                      <LineaBalance 
                        label="Otros Activos No Corrientes" 
                        valorActual={balanceGeneral.periodoActual.activo.noCorriente.otrosActivosNoCorrientes}
                        valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.otrosActivosNoCorrientes}
                        nivel={1}
                        tipo="activo"
                      />
                      
                      <LineaBalance 
                        label="TOTAL ACTIVO NO CORRIENTE" 
                        valorActual={balanceGeneral.periodoActual.activo.noCorriente.totalActivoNoCorriente}
                        valorComparativo={balanceGeneral.periodoComparativo.activo.noCorriente.totalActivoNoCorriente}
                        esTotal={true}
                        tipo="activo"
                      />
                    </div>
                  )}
                </div>

                <LineaBalance 
                  label="TOTAL ACTIVO" 
                  valorActual={balanceGeneral.periodoActual.activo.totalActivo}
                  valorComparativo={balanceGeneral.periodoComparativo.activo.totalActivo}
                  esTotal={true}
                  tipo="activo"
                />
              </div>

              {/* PASIVO Y PATRIMONIO */}
              <div>
                <div className="bg-red-50 p-4 border-b border-red-100">
                  <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    PASIVO Y PATRIMONIO
                  </h3>
                </div>

                {/* Pasivo Corriente */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => toggleSeccion('pasivoCorriente')}
                    className="w-full flex items-center justify-between p-4 bg-red-50/50 hover:bg-red-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-700">PASIVO CORRIENTE</h4>
                    </div>
                    {seccionesExpandidas.pasivoCorriente ? (
                      <ChevronUp className="w-5 h-5 text-red-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-red-600" />
                    )}
                  </button>
                  
                  {seccionesExpandidas.pasivoCorriente && (
                    <div className="p-2">
                      <LineaBalance 
                        label="Proveedores" 
                        valorActual={balanceGeneral.periodoActual.pasivo.corriente.proveedores}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.corriente.proveedores}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="Préstamos Corto Plazo" 
                        valorActual={balanceGeneral.periodoActual.pasivo.corriente.prestamosCortoPlazo}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.corriente.prestamosCortoPlazo}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="Cuentas por Pagar Comerciales" 
                        valorActual={balanceGeneral.periodoActual.pasivo.corriente.cuentasPorPagarComerciales}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.corriente.cuentasPorPagarComerciales}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="Impuestos por Pagar" 
                        valorActual={balanceGeneral.periodoActual.pasivo.corriente.impuestosPorPagar}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.corriente.impuestosPorPagar}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="Provisiones" 
                        valorActual={balanceGeneral.periodoActual.pasivo.corriente.provisiones}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.corriente.provisiones}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="TOTAL PASIVO CORRIENTE" 
                        valorActual={balanceGeneral.periodoActual.pasivo.corriente.totalPasivoCorriente}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.corriente.totalPasivoCorriente}
                        esTotal={true}
                        tipo="pasivo"
                      />
                    </div>
                  )}
                </div>

                {/* Pasivo No Corriente */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => toggleSeccion('pasivoNoCorriente')}
                    className="w-full flex items-center justify-between p-4 bg-red-50/50 hover:bg-red-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-700">PASIVO NO CORRIENTE</h4>
                    </div>
                    {seccionesExpandidas.pasivoNoCorriente ? (
                      <ChevronUp className="w-5 h-5 text-red-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-red-600" />
                    )}
                  </button>
                  
                  {seccionesExpandidas.pasivoNoCorriente && (
                    <div className="p-2">
                      <LineaBalance 
                        label="Préstamos Largo Plazo" 
                        valorActual={balanceGeneral.periodoActual.pasivo.noCorriente.prestamosLargoPlazo}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.noCorriente.prestamosLargoPlazo}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="Bonos por Pagar" 
                        valorActual={balanceGeneral.periodoActual.pasivo.noCorriente.bonosPorPagar}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.noCorriente.bonosPorPagar}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="Otros Pasivos Largo Plazo" 
                        valorActual={balanceGeneral.periodoActual.pasivo.noCorriente.otrosPasivosLargoPlazo}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.noCorriente.otrosPasivosLargoPlazo}
                        nivel={1}
                        tipo="pasivo"
                      />
                      <LineaBalance 
                        label="TOTAL PASIVO NO CORRIENTE" 
                        valorActual={balanceGeneral.periodoActual.pasivo.noCorriente.totalPasivoNoCorriente}
                        valorComparativo={balanceGeneral.periodoComparativo.pasivo.noCorriente.totalPasivoNoCorriente}
                        esTotal={true}
                        tipo="pasivo"
                      />
                    </div>
                  )}
                </div>

                <LineaBalance 
                  label="TOTAL PASIVO" 
                  valorActual={balanceGeneral.periodoActual.pasivo.totalPasivo}
                  valorComparativo={balanceGeneral.periodoComparativo.pasivo.totalPasivo}
                  esTotal={true}
                  tipo="pasivo"
                />

                {/* Patrimonio */}
                <div>
                  <button
                    onClick={() => toggleSeccion('patrimonio')}
                    className="w-full flex items-center justify-between p-4 bg-green-50/50 hover:bg-green-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Landmark className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-700">PATRIMONIO</h4>
                    </div>
                    {seccionesExpandidas.patrimonio ? (
                      <ChevronUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                  
                  {seccionesExpandidas.patrimonio && (
                    <div className="p-2">
                      <div className="ml-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Capital</h5>
                        <LineaBalance 
                          label="Capital Social" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.capital.capitalSocial}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.capital.capitalSocial}
                          nivel={2}
                          tipo="patrimonio"
                        />
                        <LineaBalance 
                          label="Aportes de Capital" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.capital.aportesCapital}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.capital.aportesCapital}
                          nivel={2}
                          tipo="patrimonio"
                        />
                        <LineaBalance 
                          label="Total Capital" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.capital.totalCapital}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.capital.totalCapital}
                          esSubtitulo={true}
                          tipo="patrimonio"
                        />
                      </div>

                      <div className="ml-4 mt-2">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Reservas</h5>
                        <LineaBalance 
                          label="Reserva Legal" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.reservas.reservaLegal}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.reservas.reservaLegal}
                          nivel={2}
                          tipo="patrimonio"
                        />
                        <LineaBalance 
                          label="Reservas Estatutarias" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.reservas.reservasEstatutarias}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.reservas.reservasEstatutarias}
                          nivel={2}
                          tipo="patrimonio"
                        />
                        <LineaBalance 
                          label="Otras Reservas" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.reservas.otrasReservas}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.reservas.otrasReservas}
                          nivel={2}
                          tipo="patrimonio"
                        />
                        <LineaBalance 
                          label="Total Reservas" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.reservas.totalReservas}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.reservas.totalReservas}
                          esSubtitulo={true}
                          tipo="patrimonio"
                        />
                      </div>

                      <div className="ml-4 mt-2">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Resultados Acumulados</h5>
                        <LineaBalance 
                          label="Resultados Ejercicios Anteriores" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.resultadosAcumulados.resultadosEjerciciosAnteriores}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.resultadosAcumulados.resultadosEjerciciosAnteriores}
                          nivel={2}
                          tipo="patrimonio"
                        />
                        <LineaBalance 
                          label="Resultado del Ejercicio" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.resultadosAcumulados.resultadoEjercicio}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.resultadosAcumulados.resultadoEjercicio}
                          nivel={2}
                          tipo="patrimonio"
                        />
                        <LineaBalance 
                          label="Total Resultados Acumulados" 
                          valorActual={balanceGeneral.periodoActual.patrimonio.resultadosAcumulados.totalResultadosAcumulados}
                          valorComparativo={balanceGeneral.periodoComparativo.patrimonio.resultadosAcumulados.totalResultadosAcumulados}
                          esSubtitulo={true}
                          tipo="patrimonio"
                        />
                      </div>
                    </div>
                  )}
                  
                  <LineaBalance 
                    label="TOTAL PATRIMONIO" 
                    valorActual={balanceGeneral.periodoActual.patrimonio.totalPatrimonio}
                    valorComparativo={balanceGeneral.periodoComparativo.patrimonio.totalPatrimonio}
                    esTotal={true}
                    tipo="patrimonio"
                  />
                </div>

                {/* Equilibrio Fundamental */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        TOTAL PASIVO Y PATRIMONIO
                      </div>
                      <div className="text-sm text-gray-600">Debe ser igual al Total Activo</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-700">
                        {formatearMoneda(balanceGeneral.periodoActual.pasivo.totalPasivo + balanceGeneral.periodoActual.patrimonio.totalPatrimonio)}
                      </div>
                      <div className={`text-sm ${Math.abs(balanceGeneral.periodoActual.activo.totalActivo - (balanceGeneral.periodoActual.pasivo.totalPasivo + balanceGeneral.periodoActual.patrimonio.totalPatrimonio)) < 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(balanceGeneral.periodoActual.activo.totalActivo - (balanceGeneral.periodoActual.pasivo.totalPasivo + balanceGeneral.periodoActual.patrimonio.totalPatrimonio)) < 1 ? '✓ Equilibrio correcto' : '✗ Desequilibrio detectado'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral - Análisis y Ratios */}
          <div className="space-y-6">
            {/* Análisis de Liquidez */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Análisis de Liquidez
              </h3>
              
              <div className="space-y-4">
                {[
                  { 
                    label: "Liquidez Corriente", 
                    valor: metricas.liquidezCorriente, 
                    unidad: "x", 
                    interpretacion: "Activo Corr. / Pasivo Corr.",
                    buenValor: 1.5,
                    color: metricas.liquidezCorriente >= 2 ? "green" : metricas.liquidezCorriente >= 1 ? "yellow" : "red"
                  },
                  { 
                    label: "Liquidez Ácida", 
                    valor: metricas.liquidezAcida, 
                    unidad: "x", 
                    interpretacion: "(Activo Corr. - Invent.) / Pasivo Corr.",
                    buenValor: 1,
                    color: metricas.liquidezAcida >= 1.2 ? "green" : metricas.liquidezAcida >= 0.8 ? "yellow" : "red"
                  },
                  { 
                    label: "Capital de Trabajo", 
                    valor: balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente - balanceGeneral.periodoActual.pasivo.corriente.totalPasivoCorriente, 
                    unidad: "", 
                    interpretacion: "Activo Corr. - Pasivo Corr.",
                    buenValor: 0,
                    color: (balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente - balanceGeneral.periodoActual.pasivo.corriente.totalPasivoCorriente) > 0 ? "green" : "red"
                  }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      <div className={`text-lg font-bold text-${item.color}-600`}>
                        {typeof item.valor === 'number' && item.unidad === '' ? formatearMoneda(item.valor) : `${item.valor}${item.unidad}`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{item.interpretacion}</div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs">
                        <span>Bajo</span>
                        <span>Óptimo</span>
                        <span>Alto</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full bg-${item.color}-500`}
                          style={{ width: `${Math.min((item.valor / (item.buenValor * 2)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Análisis de Endeudamiento */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Endeudamiento y Solvencia
              </h3>
              
              <div className="space-y-4">
                {[
                  { 
                    label: "Endeudamiento Total", 
                    valor: metricas.endeudamientoTotal, 
                    unidad: "%", 
                    interpretacion: "Pasivo Total / Activo Total",
                    buenValor: 50,
                    color: metricas.endeudamientoTotal <= 40 ? "green" : metricas.endeudamientoTotal <= 60 ? "yellow" : "red"
                  },
                  { 
                    label: "Endeudamiento L/P", 
                    valor: metricas.endeudamientoLargoPlazo, 
                    unidad: "%", 
                    interpretacion: "Pasivo No Corr. / Patrimonio",
                    buenValor: 60,
                    color: metricas.endeudamientoLargoPlazo <= 50 ? "green" : metricas.endeudamientoLargoPlazo <= 80 ? "yellow" : "red"
                  },
                  { 
                    label: "Razón de Deuda", 
                    valor: (balanceGeneral.periodoActual.pasivo.totalPasivo / balanceGeneral.periodoActual.patrimonio.totalPatrimonio).toFixed(2), 
                    unidad: "", 
                    interpretacion: "Pasivo Total / Patrimonio",
                    buenValor: 1,
                    color: (balanceGeneral.periodoActual.pasivo.totalPasivo / balanceGeneral.periodoActual.patrimonio.totalPatrimonio) <= 1 ? "green" : "yellow"
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
                        <span>Conservador</span>
                        <span>Moderado</span>
                        <span>Agresivo</span>
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

            {/* Rentabilidad */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Rentabilidad
              </h3>
              
              <div className="space-y-3">
                {[
                  { label: "ROE (Return on Equity)", valor: `${metricas.rentabilidadPatrimonio}%`, desc: "Utilidad Neta / Patrimonio", tendencia: "up" },
                  { label: "ROA (Return on Assets)", valor: `${metricas.rentabilidadActivo}%`, desc: "Utilidad Neta / Activo Total", tendencia: "up" },
                  { label: "Margen Neto", valor: "14.1%", desc: "Del Estado de Resultados", tendencia: "stable" },
                  { label: "ROI (Return on Investment)", valor: "18.5%", desc: "Retorno sobre inversión", tendencia: "up" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">{item.valor}</div>
                      <div className={`text-xs ${item.tendencia === 'up' ? 'text-green-600' : item.tendencia === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                        {item.tendencia === 'up' ? '↑ Creciente' : item.tendencia === 'down' ? '↓ Decreciente' : '→ Estable'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Composición del Activo */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Composición del Activo
              </h3>
              
              <div className="space-y-3">
                {[
                  { 
                    label: "Activo Corriente", 
                    valor: balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente,
                    porcentaje: (balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente / balanceGeneral.periodoActual.activo.totalActivo) * 100,
                    color: "blue"
                  },
                  { 
                    label: "Activo No Corriente", 
                    valor: balanceGeneral.periodoActual.activo.noCorriente.totalActivoNoCorriente,
                    porcentaje: (balanceGeneral.periodoActual.activo.noCorriente.totalActivoNoCorriente / balanceGeneral.periodoActual.activo.totalActivo) * 100,
                    color: "green"
                  }
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.label}</span>
                      <span className="font-medium text-gray-800">
                        {formatearMoneda(item.valor)} ({item.porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${item.color}-500 rounded-full`}
                        style={{ width: `${item.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Distribución del Activo Corriente:</div>
                  {[
                    { label: "Disponible", valor: balanceGeneral.periodoActual.activo.corriente.disponible.totalDisponible, porcentaje: (balanceGeneral.periodoActual.activo.corriente.disponible.totalDisponible / balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente) * 100, color: "green" },
                    { label: "Exigible", valor: balanceGeneral.periodoActual.activo.corriente.exigible.totalExigible, porcentaje: (balanceGeneral.periodoActual.activo.corriente.exigible.totalExigible / balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente) * 100, color: "blue" },
                    { label: "Realizables", valor: balanceGeneral.periodoActual.activo.corriente.realizables.totalRealizables, porcentaje: (balanceGeneral.periodoActual.activo.corriente.realizables.totalRealizables / balanceGeneral.periodoActual.activo.corriente.totalActivoCorriente) * 100, color: "yellow" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between text-xs py-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-700">{item.porcentaje.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Sistema de Análisis Financiero - Balance General conforme a NIC/NIIF Perú</p>
          <p className="mt-1">Activo = Pasivo + Patrimonio | Fecha de corte: Diciembre {periodoActual}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceGeneral;