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
  Calendar,
  Clock,
  Users,
  Download,
  AlertCircle,
  RefreshCw,
  Loader2,
  Save,
  Lock,
  Info,
  Edit2,
  Shield,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
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

  // Función para obtener token del localStorage
  const obtenerToken = () => {
    try {
      let token = localStorage.getItem('token');
      if (token) return token;

      const usuarioData = localStorage.getItem('usuario');
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        token = usuario.token || null;
        if (token) return token;
      }

      return null;
    } catch (error) {
      console.error("Error obteniendo token:", error);
      return null;
    }
  };

  // Función para crear headers CON autenticación
  const crearHeadersConAuth = () => {
    const token = obtenerToken();
    console.log("🔑 Token encontrado:", token ? "Sí" : "No");

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  // Función para obtener nombre del usuario
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

  // Función para verificar si el usuario es administrador
  const verificarSiEsAdmin = () => {
    try {
      const usuarioData = localStorage.getItem('usuario');
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        return usuario.rol === 'admin' || usuario.rol === 'administrador';
      }
    } catch (error) {
      console.error("Error verificando rol:", error);
    }
    return false;
  };

  // Estado para responsable
  const [responsable] = useState(obtenerNombreUsuario);
  const [isAdmin] = useState(verificarSiEsAdmin);

  // Estados para ventas
  const [ventasEfectivo, setVentasEfectivo] = useState(0);
  const [ventasYape, setVentasYape] = useState(0);
  const [ventasPlin, setVentasPlin] = useState(0);
  const [ventasTarjeta, setVentasTarjeta] = useState(0);

  // Estados para gastos
  const [gastos, setGastos] = useState([]);

  // Estados para dinero
  const [dineroInicial, setDineroInicial] = useState(0);
  const [efectivoEsperado, setEfectivoEsperado] = useState(0);
  const [dineroFinalCaja, setDineroFinalCaja] = useState(0);
  const [diferencia, setDiferencia] = useState(0);

  // Estados para resumen
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [dineroRetirar, setDineroRetirar] = useState(0);

  // Estados para cargando y errores
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [cargandoGastos, setCargandoGastos] = useState(false);
  const [cargandoActualizacion, setCargandoActualizacion] = useState(false);
  const [errorVentas, setErrorVentas] = useState(null);
  const [errorGastos, setErrorGastos] = useState(null);
  const [errorGuardado, setErrorGuardado] = useState(null);
  const [errorEndpoint, setErrorEndpoint] = useState(null);

  // Estado para control de bloqueo por fecha
  const [cierreExistente, setCierreExistente] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarPasswordModal, setMostrarPasswordModal] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  // Estado para el mensaje de éxito
  const [mensajeExito, setMensajeExito] = useState('');

  // Función para diagnosticar endpoints
  const diagnosticarEndpoints = async () => {
    console.log("🔍 Diagnosticando endpoints disponibles...");
    setErrorEndpoint(null);

    const endpoints = [
      { metodo: 'GET', url: '/api/cierre-caja/verificar', desc: 'Verificar cierre' },
      { metodo: 'POST', url: '/api/cierre-caja', desc: 'Crear cierre' },
      { metodo: 'GET', url: '/api/ventas/resumen-dia', desc: 'Ventas' },
      { metodo: 'GET', url: '/api/gastos/resumen-dia', desc: 'Gastos' },
      { metodo: 'GET', url: '/api/caja/dinero-inicial', desc: 'Dinero inicial' }
    ];

    for (const ep of endpoints) {
      try {
        const url = `${BACKEND_URL}${ep.url}?fecha=${fechaCierre}`;
        console.log(`Probando ${ep.metodo} ${url}`);

        const response = await fetch(url, {
          method: ep.metodo,
          headers: crearHeadersConAuth()
        });

        console.log(`✅ ${ep.desc}: ${response.status} ${response.statusText}`);

        if (response.status === 404) {
          setErrorEndpoint(`El endpoint ${ep.url} no existe en el backend`);
        }
      } catch (error) {
        console.log(`❌ ${ep.desc}: Error - ${error.message}`);
      }
    }
  };

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

  // Función para formatear fecha en español
  const formatearFechaEspañol = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T12:00:00');
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para navegar entre fechas
  const cambiarFecha = (dias) => {
    const fecha = new Date(fechaCierre + 'T12:00:00');
    fecha.setDate(fecha.getDate() + dias);
    setFechaCierre(fecha.toISOString().split('T')[0]);
  };

  // Función para ir a hoy
  const irAHoy = () => {
    setFechaCierre(new Date().toISOString().split('T')[0]);
  };

  // Función para verificar si ya existe cierre
  const verificarCierrePorFecha = async (fecha) => {
    try {
      const fechaFormateada = fecha.split('T')[0] || fecha;
      console.log(`🔍 Verificando cierre para fecha: ${fechaFormateada}`);

      const url = `${BACKEND_URL}/api/cierre-caja/verificar?fecha=${fechaFormateada}`;
      console.log(`📡 GET ${url}`);

      const response = await fetch(url, {
        headers: crearHeadersConAuth()
      });

      if (response.status === 404) {
        console.error("❌ Endpoint /api/cierre-caja/verificar no encontrado");
        return { fecha, existe: false, cierre: null };
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📊 Resultado verificación:`, data);

      return {
        fecha: fechaFormateada,
        existe: data.existe || false,
        cierre: data.cierre || null
      };
    } catch (error) {
      console.error(`Error verificando cierre para fecha ${fecha}:`, error);
      return { fecha, existe: false, cierre: null };
    }
  };

  // Función para obtener ventas del día
  const obtenerVentasDelDia = async (fecha) => {
    try {
      setCargandoVentas(true);
      setErrorVentas(null);
      const fechaFormateada = fecha.split('T')[0] || fecha;
      console.log(`💰 Buscando ventas para: ${fechaFormateada}`);

      const url = `${BACKEND_URL}/api/ventas/resumen-dia?fecha=${fechaFormateada}`;
      const response = await fetch(url, {
        headers: crearHeadersConAuth()
      });

      if (response.status === 404) {
        console.warn("⚠️ Endpoint de ventas no encontrado, usando valores por defecto");
        setVentasEfectivo(0);
        setVentasYape(0);
        setVentasPlin(0);
        setVentasTarjeta(0);
        return;
      }

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();

      console.log(`✅ Ventas encontradas:`, data);

      setVentasEfectivo(parseFloat(data.efectivo) || 0);
      setVentasYape(parseFloat(data.yape) || 0);
      setVentasPlin(parseFloat(data.plin) || 0);
      setVentasTarjeta(parseFloat(data.tarjeta) || 0);

    } catch (error) {
      console.error("Error obteniendo ventas:", error);
      setErrorVentas(error.message);
    } finally {
      setCargandoVentas(false);
    }
  };

  /* // Función para obtener gastos del día
  const obtenerGastosDelDia = async (fecha) => {
    try {
      setCargandoGastos(true);
      setErrorGastos(null);
      const fechaFormateada = fecha.split('T')[0] || fecha;
      console.log(`💰 Buscando gastos para: ${fechaFormateada}`);
      
      const url = `${BACKEND_URL}/api/gastos/resumen-dia?fecha=${fechaFormateada}`;
      const response = await fetch(url, {
        headers: crearHeadersConAuth()
      });

      if (response.status === 404) {
        console.warn("⚠️ Endpoint de gastos no encontrado, usando lista vacía");
        setGastos([]);
        return;
      }

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      
      console.log(`✅ ${data.length} gastos encontrados para ${fechaFormateada}`);
      setGastos(data || []);

    } catch (error) {
      console.error("Error obteniendo gastos:", error);
      setErrorGastos(error.message);
    } finally {
      setCargandoGastos(false);
    }
  }; */

  // Función para obtener gastos del día
  const obtenerGastosDelDia = async (fecha) => {
    try {
      setCargandoGastos(true);
      setErrorGastos(null);
      const fechaFormateada = fecha.split('T')[0] || fecha;
      console.log(`💰 Buscando gastos para: ${fechaFormateada}`);

      const url = `${BACKEND_URL}/api/gastos/resumen-dia?fecha=${fechaFormateada}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 404) {
        console.warn("⚠️ Endpoint de gastos no encontrado, usando lista vacía");
        setGastos([]);
        return;
      }

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();

      console.log(`✅ ${data.length} gastos encontrados para ${fechaFormateada}`);
      setGastos(data || []);

    } catch (error) {
      console.error("Error obteniendo gastos:", error);
      setErrorGastos(error.message);
    } finally {
      setCargandoGastos(false);
    }
  };

  // Función para obtener dinero inicial
  const obtenerDineroInicial = async (fecha) => {
    try {
      const fechaFormateada = fecha.split('T')[0] || fecha;
      console.log(`💵 Buscando dinero inicial para: ${fechaFormateada}`);

      const url = `${BACKEND_URL}/api/caja/dinero-inicial?fecha=${fechaFormateada}`;
      const response = await fetch(url, {
        headers: crearHeadersConAuth()
      });

      if (response.status === 404) {
        console.warn("⚠️ Endpoint de dinero inicial no encontrado, usando valor por defecto 500");
        setDineroInicial(0);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Dinero inicial encontrado: ${data.monto}`);
        setDineroInicial(parseFloat(data.monto) || 500);
      } else {
        setDineroInicial(500);
      }
    } catch (error) {
      console.error("Error obteniendo dinero inicial:", error);
      setDineroInicial(500);
    }
  };

  // Cargar datos para la fecha seleccionada
  const cargarDatosPorFecha = async (fecha) => {
    setCargandoInicial(true);
    setErrorVentas(null);
    setErrorGastos(null);
    setMensajeExito('');

    try {
      const fechaFormateada = fecha.split('T')[0] || fecha;

      // Verificar cierre para esta fecha
      const resultado = await verificarCierrePorFecha(fechaFormateada);

      if (resultado.existe && resultado.cierre) {
        console.log(`✅ Cargando cierre existente para ${fechaFormateada}:`, resultado.cierre);
        setCierreExistente(resultado.cierre);
        setDineroInicial(parseFloat(resultado.cierre.dinero_inicial) || 500);
        setDineroFinalCaja(parseFloat(resultado.cierre.dinero_final_caja) || 0);
        setVentasEfectivo(parseFloat(resultado.cierre.ventas_efectivo) || 0);
        setVentasYape(parseFloat(resultado.cierre.ventas_yape) || 0);
        setVentasPlin(parseFloat(resultado.cierre.ventas_plin) || 0);
        setVentasTarjeta(parseFloat(resultado.cierre.ventas_tarjeta) || 0);
        setTotalVentas(parseFloat(resultado.cierre.ventas_total) || 0);
        setTotalGastos(parseFloat(resultado.cierre.total_gastos) || 0);

        setGastos([]);
        setModoEdicion(false);
      } else {
        console.log(`📭 No hay cierre para ${fechaFormateada}, cargando datos del día`);
        setCierreExistente(null);
        setModoEdicion(false);

        await Promise.all([
          obtenerVentasDelDia(fechaFormateada),
          obtenerGastosDelDia(fechaFormateada),
          obtenerDineroInicial(fechaFormateada)
        ]);

        setDineroFinalCaja(0);
      }
    } catch (error) {
      console.error("Error cargando datos por fecha:", error);
    } finally {
      setCargandoInicial(false);
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

  // Efecto para cargar datos y diagnosticar
  useEffect(() => {
    diagnosticarEndpoints();
    cargarDatosPorFecha(fechaCierre);
  }, [fechaCierre]);

  // Función para desbloquear con contraseña
  const desbloquearConPassword = async () => {
    if (passwordAdmin === 'admin123' && isAdmin) {
      setModoEdicion(true);
      setMostrarPasswordModal(false);
      setPasswordAdmin('');
      setErrorPassword('');

      const fechaFormateada = fechaCierre.split('T')[0] || fechaCierre;
      await Promise.all([
        obtenerVentasDelDia(fechaFormateada),
        obtenerGastosDelDia(fechaFormateada),
        obtenerDineroInicial(fechaFormateada)
      ]);
    } else {
      setErrorPassword('Contraseña incorrecta o no tienes permisos de administrador');
    }
  };

  // Función para actualizar cierre existente
  const actualizarCierre = async () => {
    if (!cierreExistente || !cierreExistente.id) {
      alert("No se encontró el cierre a modificar.");
      return;
    }

    try {
      setCargandoActualizacion(true);
      setErrorGuardado(null);

      const ventasTotal = totalVentas;
      const efectivoEsperadoCalc = ventasTotal - totalGastos;
      const horaFormateada = convertirHora24Horas(horaCierre);

      const datosCierre = {
        fecha: fechaCierre,
        hora: horaFormateada,
        responsable: responsable,
        dinero_inicial: parseFloat(dineroInicial) || 0,
        dinero_final_caja: parseFloat(dineroFinalCaja) || 0,
        ventas_efectivo: parseFloat(ventasEfectivo) || 0,
        ventas_yape: parseFloat(ventasYape) || 0,
        ventas_plin: parseFloat(ventasPlin) || 0,
        ventas_tarjeta: parseFloat(ventasTarjeta) || 0,
        ventas_total: parseFloat(ventasTotal) || 0,
        total_gastos: parseFloat(totalGastos) || 0,
        efectivo_esperado: parseFloat(efectivoEsperadoCalc) || 0,
        diferencia: parseFloat(diferencia) || 0,
        dinero_retirar: parseFloat(dineroRetirar) || 0,
        estado: Math.abs(diferencia) < 0.01 ? "CORRECTO" : "CON_DIFERENCIA"
      };

      console.log(`🔄 Actualizando cierre ID: ${cierreExistente.id}`, datosCierre);

      const url = `${BACKEND_URL}/api/cierre-caja/${cierreExistente.id}`;
      console.log(`📡 PUT ${url}`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: crearHeadersConAuth(),
        body: JSON.stringify(datosCierre)
      });

      if (response.status === 404) {
        throw new Error('El endpoint de actualización no existe en el servidor');
      }

      if (response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Cierre actualizado:`, result);

      await cargarDatosPorFecha(fechaCierre);

      setMensajeExito("Cierre de caja actualizado correctamente");
      setTimeout(() => setMensajeExito(''), 3000);

    } catch (error) {
      console.error("Error actualizando cierre:", error);
      setErrorGuardado(error.message);
    } finally {
      setCargandoActualizacion(false);
    }
  };

  // Crear nuevo cierre
  const crearNuevoCierre = async () => {
    try {
      setCargandoActualizacion(true);
      setErrorGuardado(null);

      const ventasTotal = totalVentas;
      const efectivoEsperadoCalc = ventasTotal - totalGastos;
      const horaFormateada = convertirHora24Horas(horaCierre);

      const datosCierre = {
        fecha: fechaCierre,
        hora: horaFormateada,
        responsable: responsable,
        dinero_inicial: parseFloat(dineroInicial) || 0,
        dinero_final_caja: parseFloat(dineroFinalCaja) || 0,
        ventas_efectivo: parseFloat(ventasEfectivo) || 0,
        ventas_yape: parseFloat(ventasYape) || 0,
        ventas_plin: parseFloat(ventasPlin) || 0,
        ventas_tarjeta: parseFloat(ventasTarjeta) || 0,
        ventas_total: parseFloat(ventasTotal) || 0,
        total_gastos: parseFloat(totalGastos) || 0,
        efectivo_esperado: parseFloat(efectivoEsperadoCalc) || 0,
        diferencia: parseFloat(diferencia) || 0,
        dinero_retirar: parseFloat(dineroRetirar) || 0,
        estado: Math.abs(diferencia) < 0.01 ? "CORRECTO" : "CON_DIFERENCIA"
      };

      console.log(`💾 Guardando nuevo cierre:`, datosCierre);

      const url = `${BACKEND_URL}/api/cierre-caja`;
      console.log(`📡 POST ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: crearHeadersConAuth(),
        body: JSON.stringify(datosCierre)
      });

      if (response.status === 404) {
        throw new Error('El endpoint de creación de cierre no existe en el servidor. Verifica que la ruta /api/cierre-caja esté implementada en el backend.');
      }

      if (response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Cierre guardado:`, result);

      await cargarDatosPorFecha(fechaCierre);

      setMensajeExito("Cierre de caja guardado correctamente");
      setTimeout(() => setMensajeExito(''), 3000);

    } catch (error) {
      console.error("Error guardando cierre:", error);
      setErrorGuardado(error.message);
    } finally {
      setCargandoActualizacion(false);
    }
  };

  // Manejar envío del formulario
  const manejarEnvio = async () => {
    if (modoEdicion && cierreExistente) {
      await actualizarCierre();
    } else if (!cierreExistente) {
      await crearNuevoCierre();
    }
  };

  // Generar reporte
  const generarReporte = () => {
    const reporte = `
===========================================
      REPORTE DE CIERRE DE CAJA
===========================================
Fecha: ${new Date(fechaCierre + 'T12:00:00').toLocaleDateString('es-PE')}
Hora: ${horaCierre}
Responsable: ${responsable}
Estado: ${cierreExistente?.estado || (modoEdicion ? 'EN EDICIÓN' : 'NUEVO')}

===========================================
VENTAS:
-------------------------------------------
Efectivo: ${formatearMoneda(ventasEfectivo)}
Yape: ${formatearMoneda(ventasYape)}
Plin: ${formatearMoneda(ventasPlin)}
Tarjeta: ${formatearMoneda(ventasTarjeta)}
TOTAL VENTAS: ${formatearMoneda(totalVentas)}

===========================================
GASTOS:
-------------------------------------------
${gastos.map(g => `- ${g.descripcion}: ${formatearMoneda(g.monto)} (${g.categoria || 'Sin categoría'})`).join('\n')}
TOTAL GASTOS: ${formatearMoneda(totalGastos)}

===========================================
EFECTIVO:
-------------------------------------------
Dinero Inicial: ${formatearMoneda(dineroInicial)}
Efectivo Esperado: ${formatearMoneda(efectivoEsperado)}
Dinero Final en Caja: ${formatearMoneda(dineroFinalCaja)}
Diferencia: ${formatearMoneda(diferencia)}
Dinero a Retirar: ${formatearMoneda(dineroRetirar)}

===========================================
${Math.abs(diferencia || 0) < 0.01 ? "✅ CIERRE CORRECTO" : "⚠️ HAY DIFERENCIA EN CAJA"}

${cierreExistente && !modoEdicion ? "🔒 CIERRE YA REGISTRADO" : ""}
${modoEdicion ? "✳️ MODO EDICIÓN ACTIVO" : ""}
===========================================
    `;

    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cierre-caja-${fechaCierre}.txt`;
    a.click();
  };

  // Recargar datos
  const recargarDatos = () => {
    cargarDatosPorFecha(fechaCierre);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setMostrarPasswordModal(false);
    setPasswordAdmin('');
    setErrorPassword('');
  };

  // Renderizar modal
  const renderPasswordModal = () => {
    if (!mostrarPasswordModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Desbloquear Cierre</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Ya existe un cierre registrado para esta fecha. Como administrador, puedes desbloquearlo para realizar modificaciones.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña de Administrador
            </label>
            <input
              type="password"
              value={passwordAdmin}
              onChange={(e) => setPasswordAdmin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ingrese su contraseña"
              autoFocus
            />
            {errorPassword && (
              <p className="text-red-600 text-sm mt-1">{errorPassword}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={desbloquearConPassword}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Desbloquear
            </button>
            <button
              onClick={cerrarModal}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (cargandoInicial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando datos del cierre...</p>
        </div>
      </div>
    );
  }

  const fechaActualBloqueada = cierreExistente && !modoEdicion;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 md:p-4 lg:p-6">
      {renderPasswordModal()}

      <div className="max-w-7xl mx-auto">
        {/* Header con título y acciones */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Cierre de Caja
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Registro y control de ingresos y egresos diarios</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={recargarDatos}
                disabled={cargandoVentas || cargandoGastos}
                className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all border border-blue-200 disabled:opacity-50"
              >
                {(cargandoVentas || cargandoGastos) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Actualizar</span>
              </button>

              <button
                onClick={generarReporte}
                className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all border border-green-200"
              >
                <Download className="w-4 h-4" />
                <span>Reporte</span>
              </button>
            </div>
          </div>

          {/* SELECTOR DE FECHA DESTACADO - Totalmente independiente */}
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">FECHA DE CIERRE</p>
                  <p className="text-white text-xl md:text-2xl font-bold capitalize">
                    {formatearFechaEspañol(fechaCierre)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
                <button
                  onClick={() => cambiarFecha(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Día anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <button
                  onClick={irAHoy}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Hoy
                </button>

                <input
                  type="date"
                  value={fechaCierre}
                  onChange={(e) => setFechaCierre(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                <button
                  onClick={() => cambiarFecha(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Día siguiente"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Indicador de estado de la fecha seleccionada */}
            <div className="mt-3 flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${cierreExistente
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-green-200 text-green-800'
                }`}>
                {cierreExistente
                  ? '🔒 Cierre ya registrado'
                  : '✅ Sin cierre registrado'}
              </div>

              {cierreExistente && cierreExistente.estado && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${cierreExistente.estado === 'CORRECTO'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                  }`}>
                  {cierreExistente.estado}
                </div>
              )}
            </div>
          </div>

          {/* AVISOS CONTEXTUALES */}
          {cierreExistente && !modoEdicion && (
            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-800">Cierre existente para esta fecha</h3>
                    <p className="text-yellow-700 text-sm">
                      Ya hay un cierre registrado el {new Date(fechaCierre + 'T12:00:00').toLocaleDateString('es-PE')} a las {cierreExistente.hora}.
                    </p>
                    {isAdmin && (
                      <p className="text-yellow-600 text-xs mt-1">
                        Como administrador, puedes desbloquearlo para modificarlo.
                      </p>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setMostrarPasswordModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md whitespace-nowrap"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Desbloquear para Editar</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {modoEdicion && (
            <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <Edit2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-800">Modo Edición Activo</h3>
                  <p className="text-purple-700 text-sm">
                    Estás modificando un cierre existente. Los cambios se guardarán actualizando el registro original.
                  </p>
                  <p className="text-purple-600 text-xs mt-1">
                    ⚠️ Ten cuidado al modificar los valores, esto afectará los registros históricos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mensajeExito && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {mensajeExito}
              </p>
            </div>
          )}

          {errorGuardado && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error: {errorGuardado}
              </p>
            </div>
          )}
        </div>

        {/* Grid de información rápida */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Responsable</div>
            <div className="font-semibold text-gray-800 truncate">{responsable}</div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Hora Cierre</div>
            <input
              type="time"
              value={horaCierre}
              onChange={(e) => setHoraCierre(e.target.value)}
              disabled={fechaActualBloqueada && !modoEdicion}
              className={`w-full bg-transparent font-semibold text-gray-800 focus:outline-none ${(fechaActualBloqueada && !modoEdicion) ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Dinero Inicial</div>
            <div className="relative">
              <span className="absolute left-0 text-gray-500">S/</span>
              <input
                type="number"
                step="0.01"
                value={dineroInicial}
                onChange={(e) => setDineroInicial(parseFloat(e.target.value) || 0)}
                disabled={fechaActualBloqueada && !modoEdicion}
                className={`w-full pl-6 bg-transparent font-semibold text-gray-800 focus:outline-none ${(fechaActualBloqueada && !modoEdicion) ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Total Ventas</div>
            <div className="font-bold text-green-600">{formatearMoneda(totalVentas)}</div>
          </div>
        </div>

        {/* Mensajes de error de carga */}
        {errorVentas && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Error cargando ventas: {errorVentas}
            </p>
          </div>
        )}

        {errorGastos && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Error cargando gastos: {errorGastos}
            </p>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda - Ventas y Gastos */}
          <div className="space-y-6">
            {/* Sección de Ventas */}
            <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Ventas del Día
                </h2>
                <div className="flex items-center gap-2">
                  {cargandoVentas && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                  <span className="text-xl font-bold text-green-700">{formatearMoneda(totalVentas)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { icon: DollarSign, color: "yellow", label: "Efectivo", value: ventasEfectivo, bg: "bg-yellow-50" },
                  { icon: Smartphone, color: "blue", label: "Yape", value: ventasYape, bg: "bg-blue-50" },
                  { icon: Smartphone, color: "green", label: "Plin", value: ventasPlin, bg: "bg-green-50" },
                  { icon: CreditCard, color: "purple", label: "Tarjeta", value: ventasTarjeta, bg: "bg-purple-50" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                      </div>
                      <span className="font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className={`text-lg font-bold text-${item.color}-600`}>{formatearMoneda(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección de Gastos */}
            <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Gastos del Día
                </h2>
                <div className="flex items-center gap-2">
                  {cargandoGastos && <Loader2 className="w-4 h-4 animate-spin text-red-600" />}
                  <span className="text-xl font-bold text-red-700">{formatearMoneda(totalGastos)}</span>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {gastos.length > 0 ? (
                  gastos.map((gasto) => (
                    <div key={gasto.id || gasto._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{gasto.descripcion}</div>
                        <div className="text-xs text-gray-500">{gasto.categoria || 'Sin categoría'}</div>
                      </div>
                      <span className="font-bold text-red-600">{formatearMoneda(gasto.monto)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No hay gastos registrados</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resumen y Cierre */}
          <div className="space-y-6">
            {/* Resumen de Cierre */}
            <div className="bg-white rounded-xl p-5 border border-yellow-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-yellow-600" />
                Resumen del Cierre
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Efectivo Esperado</span>
                  <span className="font-bold text-blue-600">{formatearMoneda(efectivoEsperado)}</span>
                </div>

                <div className="flex justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <span className="font-medium">Dinero a Retirar</span>
                  <span className="text-xl font-bold text-yellow-700">{formatearMoneda(dineroRetirar)}</span>
                </div>

                {/* Dinero Final en Caja */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Dinero Final en Caja</span>
                    <span className="text-xs text-gray-500">Conteo real</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      value={dineroFinalCaja}
                      onChange={(e) => setDineroFinalCaja(parseFloat(e.target.value) || 0)}
                      disabled={fechaActualBloqueada && !modoEdicion}
                      className={`w-full pl-10 pr-4 py-3 text-xl font-bold text-right bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${(fechaActualBloqueada && !modoEdicion) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Diferencia */}
                <div className={`p-4 rounded-lg border-2 ${Math.abs(diferencia) < 0.01 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {Math.abs(diferencia) < 0.01 ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">Diferencia</span>
                    </div>
                    <span className={`text-xl font-bold ${Math.abs(diferencia) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                      {diferencia >= 0 ? '+' : ''}{formatearMoneda(Math.abs(diferencia))}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${Math.abs(diferencia) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                    {Math.abs(diferencia) < 0.01
                      ? 'El cierre es correcto, no hay diferencias'
                      : diferencia > 0
                        ? `Hay un excedente de ${formatearMoneda(diferencia)} en caja`
                        : `Hay un faltante de ${formatearMoneda(Math.abs(diferencia))} en caja`
                    }
                  </p>
                </div>
              </div>

              {/* Botón de Acción Principal */}
              <div className="mt-6">
                <button
                  onClick={manejarEnvio}
                  disabled={cargandoVentas || cargandoGastos || cargandoActualizacion || (fechaActualBloqueada && !modoEdicion)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${modoEdicion
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                      : fechaActualBloqueada
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : cargandoVentas || cargandoGastos
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white shadow-md'
                    }`}
                >
                  {cargandoActualizacion ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>{modoEdicion ? 'Actualizando...' : 'Guardando...'}</span>
                    </div>
                  ) : modoEdicion ? (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-6 h-6" />
                      <span>Actualizar Cierre</span>
                    </div>
                  ) : fechaActualBloqueada ? (
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-6 h-6" />
                      <span>Cierre ya registrado</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-6 h-6" />
                      <span>Confirmar Cierre de Caja</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Info className="w-4 h-4" />
            <span className="font-medium">Información importante</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Los datos de ventas y gastos se cargan automáticamente del sistema</li>
            <li>El "Dinero Final en Caja" debe ser el conteo físico real</li>
            <li>Solo se permite un cierre por día - si ya existe, los campos se bloquean</li>
            {isAdmin && <li className="text-purple-700">Como administrador puedes desbloquear y modificar cierres existentes</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CierreCaja;