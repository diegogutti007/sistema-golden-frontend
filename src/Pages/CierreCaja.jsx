import React, { useState, useEffect } from "react";
import { BACKEND_URL } from '../config';
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
  RefreshCw,
  Loader2,
  Save,
  Lock,
  Info
} from "lucide-react";

const CierreCaja = () => {
  const [fechaCierre, setFechaCierre] = useState(new Date().toISOString().split('T')[0]);
  const [horaCierre, setHoraCierre] = useState(() => {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  });
  
  // Función para obtener nombre del usuario desde localStorage
  const obtenerNombreUsuario = () => {
    try {
      const usuarioData = localStorage.getItem('usuario');
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        if (usuario.nombre && usuario.apellido) {
          return `${usuario.nombre} ${usuario.apellido}`;
        } else if (usuario.nombre_completo) {
          return usuario.nombre_completo;
        } else if (usuario.username) {
          return usuario.username;
        } else if (usuario.email) {
          return usuario.email.split('@')[0];
        }
      }
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
    }
    return "Usuario";
  };

  // Estado para responsable
  const responsable = obtenerNombreUsuario();

  // Estados para ventas
  const [ventasEfectivo, setVentasEfectivo] = useState(0);
  const [ventasYape, setVentasYape] = useState(0);
  const [ventasPlin, setVentasPlin] = useState(0);
  const [ventasTarjeta, setVentasTarjeta] = useState(0);

  // Estados para gastos
  const [gastos, setGastos] = useState([]);

  // Estados para dinero
  const [dineroInicial, setDineroInicial] = useState(500);
  const [efectivoEsperado, setEfectivoEsperado] = useState(0);
  const [dineroFinalCaja, setDineroFinalCaja] = useState(0);
  const [diferencia, setDiferencia] = useState(0);

  // Estados para resumen
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [dineroRetirar, setDineroRetirar] = useState(0);

  // Estados para cargando y errores
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [cargandoGastos, setCargandoGastos] = useState(false);
  const [cargandoVerificacion, setCargandoVerificacion] = useState(false);
  const [errorVentas, setErrorVentas] = useState(null);
  const [errorGastos, setErrorGastos] = useState(null);

  // Estado para confirmación
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // NUEVO: Estado para verificar si ya existe cierre en la fecha
  const [cierreExistente, setCierreExistente] = useState(null);
  const [yaRegistradoHoy, setYaRegistradoHoy] = useState(false);

  // Función para convertir hora a formato 24h
  const convertirHora24Horas = (hora12h) => {
    if (!hora12h) return "00:00";
    if (/^\d{2}:\d{2}$/.test(hora12h)) return hora12h;
    
    try {
      const match = hora12h.match(/(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i);
      if (!match) return "00:00";
      
      let horas = parseInt(match[1]);
      const minutos = match[2];
      const periodo = match[3] || '';
      
      if (periodo.toLowerCase().includes('p') && horas < 12) {
        horas += 12;
      } else if (periodo.toLowerCase().includes('a') && horas === 12) {
        horas = 0;
      }
      
      return `${horas.toString().padStart(2, '0')}:${minutos}`;
    } catch (error) {
      console.error("Error convirtiendo hora:", error);
      return "00:00";
    }
  };

  // Función helper para formatear montos
  const formatearMoneda = (valor) => {
    const num = parseFloat(valor) || 0;
    return `S/ ${num.toFixed(2)}`;
  };

  // Función para verificar si ya existe cierre en la fecha
  const verificarCierreExistente = async () => {
    try {
      setCargandoVerificacion(true);
      const fechaFormateada = fechaCierre.split('T')[0] || fechaCierre;
      const response = await fetch(`${BACKEND_URL}/api/cierre-caja/verificar?fecha=${fechaFormateada}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.existe) {
          setCierreExistente(data.cierre);
          setYaRegistradoHoy(true);
          // Si ya existe cierre, cargar los datos existentes
          if (data.cierre) {
            setDineroInicial(data.cierre.dinero_inicial || 500);
            setDineroFinalCaja(data.cierre.dinero_final_caja || 0);
            setIsConfirmed(true);
          }
        } else {
          setCierreExistente(null);
          setYaRegistradoHoy(false);
          setIsConfirmed(false);
        }
      }
    } catch (error) {
      console.error("Error verificando cierre existente:", error);
    } finally {
      setCargandoVerificacion(false);
    }
  };

  // Calcular totales
  useEffect(() => {
    const ventasTotal = ventasEfectivo + ventasYape + ventasPlin + ventasTarjeta;
    setTotalVentas(ventasTotal);

    const gastosTotal = gastos.reduce((total, gasto) => {
      const monto = parseFloat(gasto.monto) || 0;
      return total + monto;
    }, 0);
    setTotalGastos(gastosTotal);

    const efectivoEsperadoCalc = ventasTotal - gastosTotal;
    setEfectivoEsperado(efectivoEsperadoCalc);

    const retirarCalc = dineroInicial + efectivoEsperadoCalc;
    setDineroRetirar(retirarCalc);

    const diferenciaCalc = dineroFinalCaja - retirarCalc;
    setDiferencia(diferenciaCalc);
  }, [ventasEfectivo, ventasYape, ventasPlin, ventasTarjeta, gastos, dineroInicial, dineroFinalCaja]);

  // Función para obtener ventas del día
  const obtenerVentasDelDia = async () => {
    try {
      setCargandoVentas(true);
      setErrorVentas(null);
      const fechaFormateada = fechaCierre.split('T')[0] || fechaCierre;
      const response = await fetch(`${BACKEND_URL}/api/ventas/resumen-dia?fecha=${fechaFormateada}`);

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();

      setVentasEfectivo(data.efectivo || 0);
      setVentasYape(data.yape || 0);
      setVentasPlin(data.plin || 0);
      setVentasTarjeta(data.tarjeta || 0);

    } catch (error) {
      console.error("Error obteniendo ventas:", error);
      setErrorVentas(error.message);
    } finally {
      setCargandoVentas(false);
    }
  };

  // Función para obtener gastos del día
  const obtenerGastosDelDia = async () => {
    try {
      setCargandoGastos(true);
      setErrorGastos(null);
      const fechaFormateada = fechaCierre.split('T')[0] || fechaCierre;
      const response = await fetch(`${BACKEND_URL}/api/gastos/resumen-dia?fecha=${fechaFormateada}`);

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setGastos(data || []);

    } catch (error) {
      console.error("Error obteniendo gastos:", error);
      setErrorGastos(error.message);
    } finally {
      setCargandoGastos(false);
    }
  };

  // Función para obtener dinero inicial
  const obtenerDineroInicial = async () => {
    try {
      const fechaFormateada = fechaCierre.split('T')[0] || fechaCierre;
      const response = await fetch(`${BACKEND_URL}/api/caja/dinero-inicial?fecha=${fechaFormateada}`);

      if (response.ok) {
        const data = await response.json();
        setDineroInicial(data.monto || 500);
      }
    } catch (error) {
      console.error("Error obteniendo dinero inicial:", error);
    }
  };

  // Cargar datos cuando cambia la fecha
  useEffect(() => {
    // Primero verificar si ya existe cierre
    verificarCierreExistente();
    
    // Si no existe cierre o estamos viendo otra fecha, cargar datos
    if (!yaRegistradoHoy || cierreExistente === null) {
      obtenerVentasDelDia();
      obtenerGastosDelDia();
      obtenerDineroInicial();
    }
  }, [fechaCierre]);

  // Confirmar cierre
  const confirmarCierre = async () => {
    // Bloquear si ya existe cierre
    if (yaRegistradoHoy) {
      alert("Ya existe un cierre de caja registrado para esta fecha. No se puede registrar otro.");
      return;
    }

    if (!isConfirmed) {
      try {
        const ventasTotal = totalVentas;
        const efectivoEsperadoCalc = ventasTotal - totalGastos;
        const horaFormateada = convertirHora24Horas(horaCierre);
        
        const datosCierre = {
          fecha: fechaCierre,
          hora: horaFormateada,
          responsable: responsable,
          dinero_inicial: dineroInicial,
          dinero_final_caja: dineroFinalCaja,
          ventas_efectivo: ventasEfectivo,
          ventas_yape: ventasYape,
          ventas_plin: ventasPlin,
          ventas_tarjeta: ventasTarjeta,
          ventas_total: ventasTotal,
          total_gastos: totalGastos,
          efectivo_esperado: efectivoEsperadoCalc,
          diferencia: diferencia,
          dinero_retirar: dineroRetirar,
          estado: Math.abs(diferencia) < 0.01 ? "CORRECTO" : "CON_DIFERENCIA"
        };

        const response = await fetch(`${BACKEND_URL}/api/cierre-caja`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosCierre)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al guardar el cierre');
        }

        const result = await response.json();
        setIsConfirmed(true);
        setYaRegistradoHoy(true); // Marcar como ya registrado
        
        // Actualizar el cierre existente
        verificarCierreExistente();
        
        alert(result.message || "Cierre de caja confirmado y guardado en el sistema");

      } catch (error) {
        console.error("Error confirmando cierre:", error);
        alert("Error al guardar el cierre: " + error.message);
      }
    }
  };

  // Generar reporte
  const generarReporte = () => {
    const reporte = `
REPORTE DE CIERRE DE CAJA
Fecha: ${fechaCierre}
Hora: ${horaCierre}
Responsable: ${responsable}
Estado: ${cierreExistente?.estado || 'PENDIENTE'}

VENTAS:
Efectivo: ${formatearMoneda(ventasEfectivo)}
Yape: ${formatearMoneda(ventasYape)}
Plin: ${formatearMoneda(ventasPlin)}
Tarjeta: ${formatearMoneda(ventasTarjeta)}
TOTAL VENTAS: ${formatearMoneda(totalVentas)}

GASTOS:
${gastos.map(g => `- ${g.descripcion}: ${formatearMoneda(g.monto)} (${g.categoria || 'Sin categoría'})`).join('\n')}
TOTAL GASTOS: ${formatearMoneda(totalGastos)}

EFECTIVO:
Dinero Inicial: ${formatearMoneda(dineroInicial)}
Efectivo Esperado: ${formatearMoneda(efectivoEsperado)}
Dinero Final en Caja: ${formatearMoneda(dineroFinalCaja)}
Diferencia: ${formatearMoneda(diferencia)}
Dinero a Retirar: ${formatearMoneda(dineroRetirar)}

${Math.abs(diferencia || 0) < 0.01 ? "✅ CIERRE CORRECTO" : "⚠️ HAY DIFERENCIA EN CAJA"}

${yaRegistradoHoy ? "✳️ CIERRE YA REGISTRADO PREVIAMENTE" : ""}
    `;

    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cierre-caja-${fechaCierre}.txt`;
    a.click();
  };

  // Recargar todos los datos
  const recargarDatos = () => {
    if (!yaRegistradoHoy) {
      obtenerVentasDelDia();
      obtenerGastosDelDia();
      obtenerDineroInicial();
    }
    verificarCierreExistente();
  };

  // Verificar si la fecha actual es hoy
  const esHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return fechaCierre === hoy;
  };

  // Función para cambiar fecha (con validación)
  const cambiarFecha = (nuevaFecha) => {
    setFechaCierre(nuevaFecha);
  };

  // Determinar si la interfaz debe estar bloqueada
  const interfazBloqueada = yaRegistradoHoy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 md:mb-6">
            <div className="w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Cierre de Caja
                </h1>
                {yaRegistradoHoy && (
                  <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium border border-yellow-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>YA REGISTRADO</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Registro y control de ingresos y egresos diarios</p>
              
              {/* Info usuario - solo móvil */}
              <div className="mt-3 lg:hidden flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-800">{responsable}</div>
                  <div className="text-xs text-gray-500">Usuario responsable</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
              <button
                onClick={recargarDatos}
                disabled={cargandoVentas || cargandoGastos || cargandoVerificacion}
                className="flex-1 lg:flex-none flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {(cargandoVentas || cargandoGastos || cargandoVerificacion) ? (
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                )}
                <span className="hidden sm:inline">
                  {(cargandoVentas || cargandoGastos || cargandoVerificacion) ? 'Cargando...' : 'Actualizar'}
                </span>
              </button>

              <button
                onClick={generarReporte}
                disabled={interfazBloqueada}
                className="flex-1 lg:flex-none flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Reporte</span>
              </button>
            </div>
          </div>

          {/* AVISO DE CIERRE YA REGISTRADO */}
          {yaRegistradoHoy && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Info className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-base md:text-lg font-bold text-yellow-800">
                      ⚠️ Cierre de Caja Ya Registrado
                    </h3>
                    {cierreExistente?.estado && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${cierreExistente.estado === 'CORRECTO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {cierreExistente.estado}
                      </div>
                    )}
                  </div>
                  <p className="text-yellow-700 text-sm md:text-base mt-1">
                    Ya existe un cierre de caja registrado para el <strong>{fechaCierre}</strong>.
                  </p>
                  {cierreExistente && (
                    <div className="mt-2 text-sm text-yellow-600 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <div>Registrado por: <strong>{cierreExistente.responsable}</strong></div>
                      <div>Hora: <strong>{cierreExistente.hora || 'No registrada'}</strong></div>
                      <div>Diferencia: <strong>{formatearMoneda(cierreExistente.diferencia || 0)}</strong></div>
                      <div>Efectivo final: <strong>{formatearMoneda(cierreExistente.dinero_final_caja || 0)}</strong></div>
                    </div>
                  )}
                  <p className="text-xs text-yellow-600 mt-2">
                    Si necesitas modificar este cierre, contacta con un administrador del sistema.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información del cierre - Grid responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white rounded-xl p-3 md:p-4 border border-blue-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Fecha</span>
              </div>
              <input
                type="date"
                value={fechaCierre}
                onChange={(e) => cambiarFecha(e.target.value)}
                disabled={cargandoVerificacion}
                className={`w-full bg-transparent text-gray-900 text-base md:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${yaRegistradoHoy ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {cargandoVerificacion && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-3 md:p-4 border border-blue-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Hora Cierre</span>
              </div>
              <input
                type="time"
                value={horaCierre}
                onChange={(e) => setHoraCierre(e.target.value)}
                disabled={yaRegistradoHoy}
                className={`w-full bg-transparent text-gray-900 text-base md:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${yaRegistradoHoy ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="bg-white rounded-xl p-3 md:p-4 border border-blue-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Responsable</span>
              </div>
              <div className={`w-full bg-gray-50 text-gray-800 text-base md:text-lg font-semibold py-1 md:py-2 px-2 md:px-3 rounded border border-gray-200 ${yaRegistradoHoy ? 'opacity-50' : ''}`}>
                {responsable}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Usuario del sistema
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 md:p-4 border border-blue-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Wallet className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Dinero Inicial</span>
              </div>
              <div className="relative">
                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                <input
                  type="number"
                  step="0.01"
                  value={dineroInicial}
                  onChange={(e) => setDineroInicial(parseFloat(e.target.value) || 0)}
                  disabled={yaRegistradoHoy}
                  className={`w-full bg-transparent text-gray-900 text-base md:text-lg font-semibold pl-6 md:pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${yaRegistradoHoy ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de error */}
        {errorVentas && (
          <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Error cargando ventas: {errorVentas}</span>
            </div>
          </div>
        )}

        {errorGastos && (
          <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Error cargando gastos: {errorGastos}</span>
            </div>
          </div>
        )}

        {/* Grid principal responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Columna Izquierda - Ventas y Gastos */}
          <div className="space-y-4 md:space-y-6">
            {/* Sección de Ventas */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-green-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  Ventas del Día
                </h2>
                <div className="flex items-center gap-2">
                  {cargandoVentas && <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />}
                  <span className="text-xl md:text-2xl font-bold text-green-700">{formatearMoneda(totalVentas)}</span>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                {[
                  { icon: DollarSign, color: "yellow", label: "Efectivo", value: ventasEfectivo },
                  { icon: Smartphone, color: "blue", label: "Yape", value: ventasYape },
                  { icon: Smartphone, color: "green", label: "Plin", value: ventasPlin },
                  { icon: CreditCard, color: "purple", label: "Tarjeta", value: ventasTarjeta }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 md:w-10 md:h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                        <item.icon className={`w-4 h-4 md:w-5 md:h-5 text-${item.color}-600`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm md:text-base">{item.label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg md:text-xl font-bold text-${item.color}-600`}>{formatearMoneda(item.value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección de Gastos */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-red-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                  Gastos del Día
                </h2>
                <div className="flex items-center gap-2">
                  {cargandoGastos && <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-red-600" />}
                  <span className="text-xl md:text-2xl font-bold text-red-700">{formatearMoneda(totalGastos)}</span>
                </div>
              </div>

              <div className="space-y-3 max-h-48 md:max-h-60 overflow-y-auto pr-1">
                {gastos.map(gasto => (
                  <div key={gasto.id || gasto._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-800 text-sm md:text-base truncate">{gasto.descripcion}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                          {gasto.categoria || 'Sin categoría'}
                        </span>
                        {gasto.fecha && (
                          <span className="text-xs">{new Date(gasto.fecha).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="font-bold text-red-600 whitespace-nowrap">{formatearMoneda(gasto.monto)}</span>
                    </div>
                  </div>
                ))}

                {gastos.length === 0 && !cargandoGastos && !yaRegistradoHoy && (
                  <div className="text-center py-6 md:py-8 text-gray-500">
                    <TrendingDown className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm md:text-base">No hay gastos registrados</p>
                  </div>
                )}

                {yaRegistradoHoy && cierreExistente?.total_gastos && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-600 mb-1">Gastos registrados en el cierre:</div>
                    <div className="text-xl font-bold text-red-600">{formatearMoneda(cierreExistente.total_gastos)}</div>
                  </div>
                )}

                {cargandoGastos && (
                  <div className="text-center py-6 md:py-8">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-red-600 mx-auto" />
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Cargando gastos...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resumen y Cierre */}
          <div className="space-y-4 md:space-y-6">
            {/* Resumen de Cierre */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-yellow-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Cierre ya registrado</p>
                  </div>
                </div>
              )}
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4 md:mb-6">
                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                Resumen del Cierre
              </h2>

              <div className="space-y-3 md:space-y-4">
                {[
                  { label: "Dinero Inicial", value: dineroInicial, color: "yellow" },
                  { label: "Total Ventas", value: totalVentas, color: "green" },
                  { label: "Total Gastos", value: totalGastos, color: "red" },
                  { label: "Efectivo Esperado", value: efectivoEsperado, color: "blue" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-gray-700 text-sm md:text-base">{item.label}</div>
                    <div className={`text-lg md:text-xl font-bold text-${item.color}-600`}>{formatearMoneda(item.value)}</div>
                  </div>
                ))}

                <div className="flex items-center justify-between p-3 md:p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <div className="text-gray-800 font-medium text-sm md:text-base">Dinero Total a Retirar</div>
                  <div className="text-xl md:text-2xl font-bold text-yellow-700">{formatearMoneda(dineroRetirar)}</div>
                </div>

                {/* Dinero Final en Caja */}
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                    <div className="text-gray-800 font-medium text-sm md:text-base">Dinero Final en Caja (Real)</div>
                    <div className="text-xs text-gray-500">Ingrese el conteo real</div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg md:text-xl">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      value={dineroFinalCaja}
                      onChange={(e) => setDineroFinalCaja(parseFloat(e.target.value) || 0)}
                      disabled={yaRegistradoHoy}
                      className={`w-full bg-white text-gray-900 text-xl md:text-2xl font-bold px-8 md:px-10 py-2 md:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 text-right ${yaRegistradoHoy ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Diferencia */}
                <div className={`p-3 md:p-4 rounded-lg border-2 ${Math.abs(diferencia || 0) < 0.01 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {Math.abs(diferencia || 0) < 0.01 ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                      )}
                      <div className="text-gray-800 font-medium text-sm md:text-base">Diferencia</div>
                    </div>
                    <div className={`text-xl md:text-2xl font-bold ${Math.abs(diferencia || 0) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                      {(diferencia || 0) >= 0 ? '+' : ''}{formatearMoneda(Math.abs(diferencia || 0))}
                    </div>
                  </div>
                  <div className={`text-xs md:text-sm mt-2 ${Math.abs(diferencia || 0) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                    {Math.abs(diferencia || 0) < 0.01
                      ? '✅ El cierre es correcto, no hay diferencias'
                      : (diferencia || 0) > 0
                        ? `⚠️ Hay un excedente de ${formatearMoneda(diferencia)} en caja`
                        : `⚠️ Hay un faltante de ${formatearMoneda(Math.abs(diferencia || 0))} en caja`
                    }
                  </div>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <div className="mt-6 md:mt-8">
                <button
                  onClick={confirmarCierre}
                  disabled={isConfirmed || cargandoVentas || cargandoGastos || yaRegistradoHoy}
                  className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-200 ${isConfirmed || yaRegistradoHoy
                    ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                    : cargandoVentas || cargandoGastos
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500 shadow-md hover:shadow-lg'
                    }`}
                >
                  {yaRegistradoHoy ? (
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5 md:w-6 md:h-6" />
                      <span>Ya Registrado</span>
                    </div>
                  ) : isConfirmed ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                      <span>Cierre Confirmado</span>
                    </div>
                  ) : cargandoVentas || cargandoGastos ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                      <span>Cargando datos...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5 md:w-6 md:h-6" />
                      <span>Confirmar Cierre de Caja</span>
                    </div>
                  )}
                </button>

                {(isConfirmed || yaRegistradoHoy) && (
                  <div className="mt-3 md:mt-4 text-center text-sm md:text-sm text-green-600">
                    ✅ {yaRegistradoHoy ? 'Cierre ya registrado anteriormente' : 'El cierre ha sido registrado en el sistema'}
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-blue-200 shadow-sm relative">
              {yaRegistradoHoy && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl z-10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Estadísticas del Día</h2>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[
                  { label: "Ventas Totales", value: totalVentas, color: "green" },
                  { label: "Gastos Totales", value: totalGastos, color: "red" },
                  { label: "Transferencias", value: (ventasYape || 0) + (ventasPlin || 0), color: "blue" },
                  { label: "Tarjetas", value: ventasTarjeta, color: "purple" },
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 md:p-4 text-center border border-gray-100">
                    <div className={`text-xl md:text-2xl font-bold text-${item.color}-600 mb-1`}>{formatearMoneda(item.value)}</div>
                    <div className="text-xs md:text-sm text-gray-600">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Efectivo en Ventas</span>
                  <span className="text-gray-800 font-medium">
                    {totalVentas ? (((ventasEfectivo || 0) / totalVentas) * 100 || 0).toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalVentas ? (((ventasEfectivo || 0) / totalVentas) * 100 || 0) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notas - Responsive */}
        <div className="mt-6 md:mt-8 bg-blue-50 rounded-xl p-3 md:p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-sm font-medium">Notas Importantes</span>
          </div>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1 pl-5 md:pl-6">
            <li className="list-disc">Los datos de ventas y gastos se obtienen automáticamente del sistema.</li>
            <li className="list-disc">Cambia la fecha para ver los datos de diferentes días.</li>
            <li className="list-disc">El "Dinero Final en Caja" debe ser el conteo físico real del efectivo.</li>
            <li className="list-disc">Confirme el cierre solo después de verificar todos los montos.</li>
            <li className="list-disc">
              <span className="font-bold text-yellow-700">Solo se permite un cierre de caja por día.</span>
              Si ya existe un cierre registrado, no podrás registrar otro.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CierreCaja;