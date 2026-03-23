import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';
import {
    Clock,
    Coffee,
    LogIn,
    LogOut,
    Sun,
    MapPin,
    AlertCircle,
    CheckCircle,
    User,
    Fingerprint,
    Home,
    Smartphone,
    WifiOff
} from 'lucide-react';

const MarcacionEmpleados = () => {
    const [codigo, setCodigo] = useState('');
    const [empleado, setEmpleado] = useState(null);
    const [registroHoy, setRegistroHoy] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [cargando, setCargando] = useState(false);
    const [horaActual, setHoraActual] = useState(new Date());
    const [ubicacionValida, setUbicacionValida] = useState(null);
    const [verificandoUbicacion, setVerificandoUbicacion] = useState(false);
    const [configuracion, setConfiguracion] = useState(null);
    const [paso, setPaso] = useState('codigo');
    const [metodoDeteccion, setMetodoDeteccion] = useState('');
    const [viewport, setViewport] = useState('mobile');

    // Detectar tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1024) setViewport('desktop');
            else if (width >= 768) setViewport('tablet');
            else setViewport('mobile');
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cargar configuración al iniciar
    useEffect(() => {
        cargarConfiguracion();
        verificarSoporteNavegador();
    }, []);

    // Actualizar hora cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setHoraActual(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Verificar ubicación periódicamente si hay empleado
    useEffect(() => {
        if (empleado) {
            verificarUbicacion();
            const intervalo = setInterval(verificarUbicacion, 30000);
            return () => clearInterval(intervalo);
        }
    }, [empleado]);

    const verificarSoporteNavegador = () => {
        const soporte = {
            geolocation: 'geolocation' in navigator,
            wifi: 'connection' in navigator && 'ssid' in navigator.connection
        };

        if (!soporte.geolocation) {
            setMensaje({
                texto: 'Tu navegador no soporta geolocalización. Usa Chrome o Edge actualizado.',
                tipo: 'error'
            });
        }
    };

    const cargarConfiguracion = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/empresa/configuracion`);
            const data = await response.json();
            setConfiguracion(data);
        } catch (error) {
            console.error('Error cargando configuración:', error);
            setMensaje({
                texto: 'Error al cargar configuración de la empresa',
                tipo: 'error'
            });
        }
    };

    const formatearHora = (date) => {
        return date.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatearFecha = (date) => {
        const options = {
            weekday: viewport === 'mobile' ? 'short' : 'long',
            year: 'numeric',
            month: viewport === 'mobile' ? 'short' : 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('es-PE', options);
    };

    const detectarWifi = () => {
        if ('connection' in navigator) {
            const connection = navigator.connection ||
                navigator.mozConnection ||
                navigator.webkitConnection;

            if (connection && connection.type === 'wifi') {
                return 'wifi_detectado';
            }
        }
        return null;
    };

    const obtenerUbicacion = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no soportada'));
                return;
            }

            const opciones = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitud: position.coords.latitude,
                        longitud: position.coords.longitude,
                        precision: position.coords.accuracy
                    });
                },
                (error) => {
                    let mensajeError = 'Error obteniendo ubicación';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            mensajeError = 'Permiso de ubicación denegado. Actívalo en la configuración de tu navegador.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            mensajeError = 'Ubicación no disponible. Verifica tu GPS.';
                            break;
                        case error.TIMEOUT:
                            mensajeError = 'Tiempo de espera agotado. Intenta nuevamente.';
                            break;
                    }
                    reject(new Error(mensajeError));
                },
                opciones
            );
        });
    };

    const verificarUbicacion = async () => {
        setVerificandoUbicacion(true);
        
        try {
            const wifiDetectado = detectarWifi();
            let datosUbicacion = {};

            if (wifiDetectado) {
                datosUbicacion.wifiSSID = wifiDetectado;
                setMetodoDeteccion('wifi');
            }

            if (!wifiDetectado) {
                try {
                    const ubicacion = await obtenerUbicacion();
                    datosUbicacion = {
                        ...datosUbicacion,
                        latitud: ubicacion.latitud,
                        longitud: ubicacion.longitud
                    };
                    setMetodoDeteccion('gps');
                } catch (gpsError) {
                    console.warn('Error obteniendo GPS:', gpsError.message);
                    if (!wifiDetectado) {
                        throw new Error('No se pudo determinar tu ubicación');
                    }
                }
            }

            const response = await fetch(`${BACKEND_URL}/api/ubicacion/verificar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUbicacion)
            });

            const data = await response.json();

            if (response.ok) {
                setUbicacionValida({ valida: true, metodo: data.metodo });
            } else {
                setUbicacionValida({ valida: false });
                setMensaje({
                    texto: data.message || 'No estás en la ubicación autorizada',
                    tipo: 'error'
                });
                setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
            }
        } catch (error) {
            console.error('Error verificando ubicación:', error);
            setUbicacionValida({ valida: false });
            setMensaje({
                texto: error.message || 'Error verificando ubicación',
                tipo: 'error'
            });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        } finally {
            setVerificandoUbicacion(false);
        }
    };

    const buscarEmpleado = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/api/empleados/documento/${codigo}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok) {
                setEmpleado(data);
                const registroResponse = await fetch(`${BACKEND_URL}/api/marcaciones/hoy/${codigo}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                    }
                });
                const registroData = await registroResponse.json();
                setRegistroHoy(registroData);
                setPaso('marcacion');
            } else {
                setMensaje({ texto: data.error || 'Empleado no encontrado', tipo: 'error' });
                setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
            }
        } catch (error) {
            setMensaje({ texto: 'Error de conexión', tipo: 'error' });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        } finally {
            setCargando(false);
        }
    };

    const marcar = async (tipo) => {
        if (!ubicacionValida?.valida) {
            setMensaje({
                texto: 'No puedes marcar desde esta ubicación',
                tipo: 'error'
            });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
            return;
        }

        setCargando(true);
        setMensaje({ texto: 'Registrando marcación...', tipo: 'info' });

        try {
            let datosMarcacion = {
                codigo_empleado: codigo,
                dispositivo: navigator.userAgent
            };

            const wifiDetectado = detectarWifi();
            if (wifiDetectado) {
                datosMarcacion.wifiSSID = wifiDetectado;
            } else {
                try {
                    const ubicacion = await obtenerUbicacion();
                    datosMarcacion.latitud = ubicacion.latitud;
                    datosMarcacion.longitud = ubicacion.longitud;
                } catch (error) {
                    console.warn('Error obteniendo GPS:', error.message);
                }
            }

            const response = await fetch(`${BACKEND_URL}/api/marcaciones/${tipo}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosMarcacion)
            });

            const data = await response.json();

            if (response.ok) {
                setPaso('confirmacion');
                setMensaje({ texto: data.message, tipo: 'exito' });

                setTimeout(async () => {
                    await buscarEmpleado();
                }, 2000);
            } else {
                setMensaje({
                    texto: data.error || data.message || 'Error al marcar',
                    tipo: 'error'
                });
                setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
            }
        } catch (error) {
            setMensaje({ texto: 'Error de conexión', tipo: 'error' });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        } finally {
            setCargando(false);
        }
    };

    const getEstadoBotones = () => {
        if (!registroHoy) {
            return {
                puedeEntrada: true,
                puedeSalidaAlmuerzo: false,
                puedeRegresoAlmuerzo: false,
                puedeSalida: false
            };
        }

        return {
            puedeEntrada: !registroHoy.HoraEntrada,
            puedeSalidaAlmuerzo: registroHoy.HoraEntrada && !registroHoy.HoraSalidaAlmuerzo,
            puedeRegresoAlmuerzo: registroHoy.HoraSalidaAlmuerzo && !registroHoy.HoraRegresoAlmuerzo,
            puedeSalida: registroHoy.HoraRegresoAlmuerzo && !registroHoy.HoraSalida
        };
    };

    const estados = getEstadoBotones();
    const resetear = () => {
        setCodigo('');
        setEmpleado(null);
        setRegistroHoy(null);
        setPaso('codigo');
        setUbicacionValida(null);
        setMensaje({ texto: '', tipo: '' });
    };

    const getMensajeBienvenida = () => {
        if (!registroHoy) return '';
        const hora = new Date().getHours();
        if (hora < 12) return 'Buenos días';
        if (hora < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
            <div className={`mx-auto px-4 py-4 sm:px-6 lg:px-8 ${
                viewport === 'mobile' ? 'max-w-md' : 
                viewport === 'tablet' ? 'max-w-2xl' : 'max-w-4xl'
            }`}>
                {/* Header con hora y estado */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 mb-4 border border-white/20">
                    <div className="flex items-center justify-between text-white mb-2 sm:mb-4">
                        <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className={`font-bold font-mono ${
                            viewport === 'mobile' ? 'text-4xl' : 'text-5xl'
                        }`}>
                            {formatearHora(horaActual)}
                        </span>
                    </div>
                    <p className="text-white/80 text-center text-sm sm:text-base capitalize">
                        {formatearFecha(horaActual)}
                    </p>
                </div>

                {/* Estado de ubicación */}
                {configuracion && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 border border-white/20">
                        <div className="flex items-center gap-2 sm:gap-3 text-white text-sm sm:text-base">
                            {ubicacionValida?.valida ? (
                                <>
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                    <span className="flex-1">Ubicación verificada</span>
                                    <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full">
                                        {ubicacionValida.metodo}
                                    </span>
                                </>
                            ) : ubicacionValida === null ? (
                                <>
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                                    <span className="flex-1 text-xs sm:text-sm">Verificando ubicación...</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                                    <span className="flex-1 text-xs sm:text-sm">Fuera del área permitida</span>
                                </>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-white/60 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{configuracion.direccion}</span>
                        </div>
                    </div>
                )}

                {/* Paso 1: Ingreso de código */}
                {paso === 'codigo' && (
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6">
                        <div className="text-center mb-4 sm:mb-6">
                            <Fingerprint className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-2" />
                            <h2 className={`font-bold text-gray-800 ${
                                viewport === 'mobile' ? 'text-xl' : 'text-2xl'
                            }`}>
                                Marca tu Asistencia
                            </h2>
                            <p className="text-gray-600 text-xs sm:text-sm">
                                Ingresa tu número de documento
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Documento (DNI/Carnet)
                                </label>
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && buscarEmpleado()}
                                    className="w-full px-4 py-3 sm:py-4 text-center text-xl sm:text-2xl border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Ingresa tu documento"
                                    disabled={cargando}
                                    autoFocus
                                    inputMode="numeric"
                                />
                            </div>

                            <button
                                onClick={buscarEmpleado}
                                disabled={cargando || !codigo.trim()}
                                className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {cargando ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Verificando...</span>
                                    </div>
                                ) : (
                                    'Continuar'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Paso 2: Panel de marcación */}
                {paso === 'marcacion' && empleado && (
                    <div className="space-y-4">
                        {/* Tarjeta de empleado */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-white">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                    <User className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm opacity-90">{getMensajeBienvenida()}</p>
                                    <h2 className={`font-bold ${
                                        viewport === 'mobile' ? 'text-lg' : 'text-xl sm:text-2xl'
                                    }`}>
                                        {empleado.Nombres} {empleado.Apellidos}
                                    </h2>
                                    <p className="text-xs sm:text-sm opacity-90">DNI: {empleado.DocID}</p>
                                </div>
                            </div>
                        </div>

                        {/* Estado del día - Responsive grid */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
                                Registro de hoy
                            </h3>
                            <div className={`grid gap-2 sm:gap-3 ${
                                viewport === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'
                            }`}>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 text-sm">Entrada</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraEntrada || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 text-sm">Salida Almuerzo</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraSalidaAlmuerzo || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 text-sm">Regreso Almuerzo</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraRegresoAlmuerzo || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 text-sm">Salida</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraSalida || '—'}
                                    </span>
                                </div>
                                {registroHoy?.HorasTrabajadas && (
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                        <span className="text-green-600 text-sm">Horas trabajadas</span>
                                        <span className="font-bold text-green-700">
                                            {registroHoy.HorasTrabajadas} hrs
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botones de marcación - Grid responsive */}
                        <div className={`grid gap-3 ${
                            viewport === 'desktop' ? 'grid-cols-4' : 'grid-cols-2'
                        }`}>
                            <button
                                onClick={() => marcar('entrada')}
                                disabled={!estados.puedeEntrada || cargando || !ubicacionValida?.valida}
                                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all ${
                                    estados.puedeEntrada && ubicacionValida?.valida
                                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="font-semibold text-xs sm:text-sm">Entrada</span>
                            </button>

                            <button
                                onClick={() => marcar('salida-almuerzo')}
                                disabled={!estados.puedeSalidaAlmuerzo || cargando || !ubicacionValida?.valida}
                                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all ${
                                    estados.puedeSalidaAlmuerzo && ubicacionValida?.valida
                                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="font-semibold text-xs sm:text-sm">Salida Almuerzo</span>
                            </button>

                            <button
                                onClick={() => marcar('regreso-almuerzo')}
                                disabled={!estados.puedeRegresoAlmuerzo || cargando || !ubicacionValida?.valida}
                                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all ${
                                    estados.puedeRegresoAlmuerzo && ubicacionValida?.valida
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="font-semibold text-xs sm:text-sm">Regreso Almuerzo</span>
                            </button>

                            <button
                                onClick={() => marcar('salida')}
                                disabled={!estados.puedeSalida || cargando || !ubicacionValida?.valida}
                                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all ${
                                    estados.puedeSalida && ubicacionValida?.valida
                                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="font-semibold text-xs sm:text-sm">Salida</span>
                            </button>
                        </div>

                        {/* Botón para cambiar empleado */}
                        <button
                            onClick={resetear}
                            className="w-full py-2 sm:py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <Home className="w-4 h-4" />
                            <span>Cambiar empleado</span>
                        </button>
                    </div>
                )}

                {/* Paso 3: Confirmación */}
                {paso === 'confirmacion' && (
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                        </div>
                        <h3 className={`font-bold text-gray-800 mb-2 ${
                            viewport === 'mobile' ? 'text-xl' : 'text-2xl'
                        }`}>
                            ¡Marcación exitosa!
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base mb-6">
                            {mensaje.texto}
                        </p>
                        <div className="animate-pulse text-gray-400 text-sm">
                            Redirigiendo...
                        </div>
                    </div>
                )}

                {/* Mensajes flotantes */}
                {mensaje.texto && paso !== 'confirmacion' && (
                    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center text-sm sm:text-base shadow-lg ${
                        mensaje.tipo === 'error'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : mensaje.tipo === 'exito'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                        {mensaje.tipo === 'error' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />}
                        {mensaje.tipo === 'exito' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />}
                        {mensaje.texto}
                    </div>
                )}

                {/* Footer con info de ubicación */}
                {configuracion && (
                    <div className="mt-4 text-center text-white/60 text-xs">
                        <p>📍 Radio permitido: {configuracion.radioPermitido} metros</p>
                        <p className="hidden sm:block">📡 Redes WiFi: {configuracion.wifiPermitidos.join(' • ')}</p>
                        <p className="sm:hidden text-xs">📡 {configuracion.wifiPermitidos[0]}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarcacionEmpleados;