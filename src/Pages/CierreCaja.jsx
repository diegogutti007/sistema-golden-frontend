import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Smartphone,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Users,
  Download,
  Printer,
  AlertCircle,
  RefreshCw
} from "lucide-react";

const CierreCaja = () => {
  const [fechaCierre, setFechaCierre] = useState(new Date().toISOString().split('T')[0]);
  const [horaCierre, setHoraCierre] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [responsable, setResponsable] = useState("Claudia Alvarez");
  
  // Estados para ventas
  const [ventasEfectivo, setVentasEfectivo] = useState(0);
  const [ventasYape, setVentasYape] = useState(0);
  const [ventasPlin, setVentasPlin] = useState(0);
  const [ventasTarjeta, setVentasTarjeta] = useState(0);
  
  // Estados para gastos
  const [gastos, setGastos] = useState([
    { id: 1, descripcion: "Compra de materiales", monto: 150, categoria: "Materiales" },
    { id: 2, descripcion: "Pago de servicios", monto: 80, categoria: "Servicios" },
    { id: 3, descripcion: "Transporte", monto: 45, categoria: "Logística" }
  ]);
  
  // Estado para nuevo gasto
  const [nuevoGasto, setNuevoGasto] = useState({
    descripcion: "",
    monto: "",
    categoria: "Materiales"
  });
  
  // Estados para dinero inicial y final
  const [dineroInicial, setDineroInicial] = useState(500);
  const [efectivoEsperado, setEfectivoEsperado] = useState(0);
  const [dineroFinalCaja, setDineroFinalCaja] = useState(0);
  const [diferencia, setDiferencia] = useState(0);
  
  // Estados para resumen
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [dineroRetirar, setDineroRetirar] = useState(0);
  
  // Estado para confirmación
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Categorías de gastos
  const categoriasGastos = [
    "Materiales",
    "Servicios",
    "Logística",
    "Personal",
    "Impuestos",
    "Otros"
  ];

  // Calcular totales
  useEffect(() => {
    // Calcular total de ventas
    const ventasTotal = ventasEfectivo + ventasYape + ventasPlin + ventasTarjeta;
    setTotalVentas(ventasTotal);
    
    // Calcular total de gastos
    const gastosTotal = gastos.reduce((total, gasto) => total + gasto.monto, 0);
    setTotalGastos(gastosTotal);
    
    // Calcular efectivo esperado
    const efectivoEsperadoCalc = ventasTotal - gastosTotal;
    setEfectivoEsperado(efectivoEsperadoCalc);
    
    // Calcular dinero a retirar
    const retirarCalc = dineroInicial + efectivoEsperadoCalc;
    setDineroRetirar(retirarCalc);
    
    // Calcular diferencia
    const diferenciaCalc = dineroFinalCaja - retirarCalc;
    setDiferencia(diferenciaCalc);
  }, [ventasEfectivo, ventasYape, ventasPlin, ventasTarjeta, gastos, dineroInicial, dineroFinalCaja]);

  // Agregar nuevo gasto
  const agregarGasto = () => {
    if (nuevoGasto.descripcion && nuevoGasto.monto) {
      const nuevoGastoObj = {
        id: gastos.length + 1,
        descripcion: nuevoGasto.descripcion,
        monto: parseFloat(nuevoGasto.monto),
        categoria: nuevoGasto.categoria
      };
      
      setGastos([...gastos, nuevoGastoObj]);
      setNuevoGasto({ descripcion: "", monto: "", categoria: "Materiales" });
    }
  };

  // Eliminar gasto
  const eliminarGasto = (id) => {
    setGastos(gastos.filter(gasto => gasto.id !== id));
  };

  // Simular datos de ventas del día
  const cargarVentasDelDia = () => {
    // Estos serían los datos reales de tu base de datos
    setVentasEfectivo(1250);
    setVentasYape(850);
    setVentasPlin(620);
    setVentasTarjeta(480);
  };

  // Confirmar cierre
  const confirmarCierre = () => {
    if (!isConfirmed) {
      setIsConfirmed(true);
      // Aquí iría la lógica para guardar en la base de datos
      alert("Cierre de caja confirmado y guardado en el sistema");
    }
  };

  // Generar reporte
  const generarReporte = () => {
    const reporte = `
      REPORTE DE CIERRE DE CAJA
      Fecha: ${fechaCierre}
      Hora: ${horaCierre}
      Responsable: ${responsable}
      
      VENTAS:
      Efectivo: $${ventasEfectivo}
      Yape: $${ventasYape}
      Plin: $${ventasPlin}
      Tarjeta: $${ventasTarjeta}
      TOTAL VENTAS: $${totalVentas}
      
      GASTOS:
      ${gastos.map(g => `- ${g.descripcion}: $${g.monto} (${g.categoria})`).join('\n')}
      TOTAL GASTOS: $${totalGastos}
      
      EFECTIVO:
      Dinero Inicial: $${dineroInicial}
      Efectivo Esperado: $${efectivoEsperado}
      Dinero Final en Caja: $${dineroFinalCaja}
      Diferencia: $${diferencia}
      Dinero a Retirar: $${dineroRetirar}
      
      ${diferencia === 0 ? "✅ CIERRE CORRECTO" : "⚠️ HAY DIFERENCIA EN CAJA"}
    `;
    
    // Descargar como archivo de texto
    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cierre-caja-${fechaCierre}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Cierre de Caja
              </h1>
              <p className="text-gray-400 mt-2">Registro y control de ingresos y egresos diarios</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={cargarVentasDelDia}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200 border border-blue-500/30"
              >
                <RefreshCw className="w-4 h-4" />
                Cargar Ventas Día
              </button>
              
              <button
                onClick={generarReporte}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-200 border border-green-500/30"
              >
                <Download className="w-4 h-4" />
                Descargar Reporte
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-200 border border-purple-500/30"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
          
          {/* Información del cierre */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Fecha</span>
              </div>
              <input
                type="date"
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none"
              />
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Hora Cierre</span>
              </div>
              <input
                type="time"
                value={horaCierre}
                onChange={(e) => setHoraCierre(e.target.value)}
                className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none"
              />
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Responsable</span>
              </div>
              <input
                type="text"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none"
                placeholder="Nombre del responsable"
              />
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Dinero Inicial</span>
              </div>
              <div className="relative">
                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">S/</span>
                <input
                  type="number"
                  value={dineroInicial}
                  onChange={(e) => setDineroInicial(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-white text-lg font-semibold pl-6 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda - Ventas y Gastos */}
          <div className="space-y-6">
            {/* Sección de Ventas */}
            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Ventas del Día
                </h2>
                <span className="text-2xl font-bold text-green-400">S/ {totalVentas.toFixed(2)}</span>
              </div>
              
              <div className="space-y-4">
                {/* Efectivo */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Efectivo</div>
                      <div className="text-sm text-gray-400">Dinero en billetes</div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">S/</span>
                    <input
                      type="number"
                      value={ventasEfectivo}
                      onChange={(e) => setVentasEfectivo(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700/50 text-white text-right font-semibold px-6 py-2 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Yape */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Yape</div>
                      <div className="text-sm text-gray-400">Transferencias Yape</div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">S/</span>
                    <input
                      type="number"
                      value={ventasYape}
                      onChange={(e) => setVentasYape(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700/50 text-white text-right font-semibold px-6 py-2 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Plin */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Plin</div>
                      <div className="text-sm text-gray-400">Transferencias Plin</div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">S/</span>
                    <input
                      type="number"
                      value={ventasPlin}
                      onChange={(e) => setVentasPlin(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700/50 text-white text-right font-semibold px-6 py-2 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Tarjeta */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Tarjeta</div>
                      <div className="text-sm text-gray-400">Pagos con tarjeta</div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">S/</span>
                    <input
                      type="number"
                      value={ventasTarjeta}
                      onChange={(e) => setVentasTarjeta(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700/50 text-white text-right font-semibold px-6 py-2 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Gastos */}
            <div className="bg-gray-900/80 rounded-2xl p-6 border border-red-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Gastos del Día
                </h2>
                <span className="text-2xl font-bold text-red-400">S/ {totalGastos.toFixed(2)}</span>
              </div>
              
              {/* Formulario para nuevo gasto */}
              <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium text-white mb-3">Agregar Nuevo Gasto</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={nuevoGasto.descripcion}
                      onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                      className="bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      placeholder="Descripción del gasto"
                    />
                    
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">S/</span>
                      <input
                        type="number"
                        value={nuevoGasto.monto}
                        onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                        className="bg-gray-700/50 text-white px-10 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={nuevoGasto.categoria}
                      onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
                      className="bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      {categoriasGastos.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={agregarGasto}
                      className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-200 border border-red-500/30"
                    >
                      Agregar Gasto
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Lista de gastos */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {gastos.map(gasto => (
                  <div key={gasto.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{gasto.descripcion}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs">{gasto.categoria}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-300">S/ {gasto.monto.toFixed(2)}</span>
                      <button
                        onClick={() => eliminarGasto(gasto.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {gastos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay gastos registrados</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resumen y Cierre */}
          <div className="space-y-6">
            {/* Resumen de Cierre */}
            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-500/20">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Wallet className="w-5 h-5 text-yellow-400" />
                Resumen del Cierre
              </h2>
              
              <div className="space-y-4">
                {/* Dinero Inicial */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-300">Dinero Inicial en Caja</div>
                  <div className="text-xl font-bold text-yellow-400">S/ {dineroInicial.toFixed(2)}</div>
                </div>
                
                {/* Ventas Totales */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-300">Total Ventas</div>
                  <div className="text-xl font-bold text-green-400">S/ {totalVentas.toFixed(2)}</div>
                </div>
                
                {/* Gastos Totales */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-300">Total Gastos</div>
                  <div className="text-xl font-bold text-red-400">S/ {totalGastos.toFixed(2)}</div>
                </div>
                
                {/* Efectivo Esperado */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-300">Efectivo Esperado en Caja</div>
                  <div className="text-xl font-bold text-blue-400">S/ {efectivoEsperado.toFixed(2)}</div>
                </div>
                
                {/* Dinero a Retirar */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border-2 border-yellow-500/50">
                  <div className="text-white font-medium">Dinero Total a Retirar</div>
                  <div className="text-2xl font-bold text-yellow-400">S/ {dineroRetirar.toFixed(2)}</div>
                </div>
                
                {/* Dinero Final en Caja */}
                <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">Dinero Final en Caja (Real)</div>
                    <div className="text-sm text-gray-400">Ingrese el conteo real</div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">S/</span>
                    <input
                      type="number"
                      value={dineroFinalCaja}
                      onChange={(e) => setDineroFinalCaja(parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700/50 text-white text-2xl font-bold px-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-right"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Diferencia */}
                <div className={`p-4 rounded-lg border-2 ${diferencia === 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {diferencia === 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div className="text-white font-medium">Diferencia</div>
                    </div>
                    <div className={`text-2xl font-bold ${diferencia === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {diferencia >= 0 ? '+' : ''}S/ {Math.abs(diferencia).toFixed(2)}
                    </div>
                  </div>
                  <div className={`text-sm mt-2 ${diferencia === 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                    {diferencia === 0 
                      ? '✅ El cierre es correcto, no hay diferencias' 
                      : diferencia > 0 
                        ? `⚠️ Hay un excedente de S/ ${diferencia.toFixed(2)} en caja`
                        : `⚠️ Hay un faltante de S/ ${Math.abs(diferencia).toFixed(2)} en caja`
                    }
                  </div>
                </div>
              </div>
              
              {/* Botón de Confirmación */}
              <div className="mt-8">
                <button
                  onClick={confirmarCierre}
                  disabled={isConfirmed}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    isConfirmed 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500'
                  }`}
                >
                  {isConfirmed ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      Cierre Confirmado
                    </div>
                  ) : (
                    'Confirmar Cierre de Caja'
                  )}
                </button>
                
                {isConfirmed && (
                  <div className="mt-4 text-center text-sm text-green-400">
                    ✅ El cierre ha sido registrado en el sistema
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-gray-900/80 rounded-2xl p-6 border border-blue-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Estadísticas del Día</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">S/ {totalVentas.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Ventas Totales</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">S/ {totalGastos.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Gastos Totales</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">S/ {(ventasYape + ventasPlin).toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Transferencias Digitales</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">S/ {ventasTarjeta.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Tarjetas</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Efectivo en Ventas</span>
                  <span className="text-white font-medium">{((ventasEfectivo / totalVentas) * 100 || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${(ventasEfectivo / totalVentas) * 100 || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="mt-8 bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Notas Importantes</span>
          </div>
          <ul className="text-sm text-gray-400 space-y-1 pl-6">
            <li className="list-disc">Verifique que todos los montos ingresados sean correctos antes de confirmar el cierre.</li>
            <li className="list-disc">El "Dinero Final en Caja" debe ser el conteo físico real del efectivo.</li>
            <li className="list-disc">Las diferencias deben ser justificadas y registradas en el sistema.</li>
            <li className="list-disc">Guarde el reporte generado para futuras auditorías.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CierreCaja;