import React, { useState, useEffect } from 'react';
import {
    Clock,
    Coffee,
    LogIn,
    LogOut,
    Sun,
    MapPin,
    Wifi,
    AlertCircle,
    CheckCircle,
    User,
    Fingerprint,
    Smartphone,
    Home
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
    const [wifiActual, setWifiActual] = useState('');
    const [paso, setPaso] = useState('codigo'); // codigo, marcacion, confirmacion
    const [metodoDeteccion, setMetodoDeteccion] = useState('');

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

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
        return date.toLocaleDateString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const detectarWifi = () => {
        // En una PWA con capacidades especiales
        if ('connection' in navigator) {
            const connection = navigator.connection ||
                navigator.mozConnection ||
                navigator.webkitConnection;

            // Algunos navegadores permiten obtener tipo de conexión
            if (connection) {
                console.log('Tipo de conexión:', connection.type);
                console.log('Velocidad:', connection.downlink, 'Mbps');

                // Si es WiFi, asumimos que es la red de la empresa
                if (connection.type === 'wifi') {
                    // No podemos obtener el SSID real por seguridad del navegador
                    return 'wifi_detectado';
                }
            }
        }

        // Detectar por IP local (red 192.168.x.x)
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
                        precision: position.coords.accuracy,
                        altitud: position.coords.altitude
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
        setMensaje({ texto: 'Verificando ubicación...', tipo: 'info' });

        try {
            const wifiDetectado = detectarWifi();
            let datosUbicacion = {};

            // Intentar primero con WiFi
            if (wifiDetectado) {
                datosUbicacion.wifiSSID = wifiDetectado;
                setMetodoDeteccion('wifi');
            }

            // Si no hay WiFi o es necesario, intentar con GPS
            if (!wifiDetectado || true) { // Siempre intentar GPS también por seguridad
                try {
                    const ubicacion = await obtenerUbicacion();
                    datosUbicacion = {
                        ...datosUbicacion,
                        latitud: ubicacion.latitud,
                        longitud: ubicacion.longitud,
                        precision: ubicacion.precision
                    };
                    setMetodoDeteccion(prev => prev || 'gps');
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
                setMensaje({
                    texto: `✅ Ubicación válida detectada vía ${data.metodo === 'wifi' ? 'WiFi' : data.metodo === 'gps' ? 'GPS' : 'Red Local'}`,
                    tipo: 'exito'
                });
            } else {
                setUbicacionValida({ valida: false });
                setMensaje({
                    texto: data.message || 'No estás en la ubicación autorizada',
                    tipo: 'error'
                });
            }
        } catch (error) {
            console.error('Error verificando ubicación:', error);
            setUbicacionValida({ valida: false });
            setMensaje({
                texto: error.message || 'Error verificando ubicación',
                tipo: 'error'
            });
        } finally {
            setVerificandoUbicacion(false);
        }
    };



    const buscarEmpleado = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/empleados/documento/${codigo}`);
            const data = await response.json();

            if (response.ok) {
                setEmpleado(data);
                // Luego buscar el registro del día
                const registroResponse = await fetch(`${BACKEND_URL}/api/marcaciones/hoy/${codigo}`);
                const registroData = await registroResponse.json();
                setRegistroHoy(registroData);
                setPaso('marcacion');
            } else {
                setMensaje({ texto: data.error || 'Empleado no encontrado', tipo: 'error' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error de conexión', tipo: 'error' });
        }
    };


    const marcar = async (tipo) => {
        if (!ubicacionValida?.valida) {
            setMensaje({
                texto: 'No puedes marcar desde esta ubicación',
                tipo: 'error'
            });
            return;
        }

        setCargando(true);
        setMensaje({ texto: 'Registrando marcación...', tipo: 'info' });

        try {
            let datosMarcacion = {
                codigo_empleado: codigo,
                dispositivo: navigator.userAgent
            };

            // Obtener datos de ubicación actualizados
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
                setMensaje({
                    texto: data.message,
                    tipo: 'exito'
                });

                // Recargar registro después de 2 segundos
                setTimeout(async () => {
                    await buscarEmpleado();
                }, 2000);
            } else {
                setMensaje({
                    texto: data.error || data.message || 'Error al marcar',
                    tipo: 'error'
                });
            }
        } catch (error) {
            setMensaje({
                texto: 'Error de conexión',
                tipo: 'error'
            });
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
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
            <div className="max-w-md mx-auto">
                {/* Header con hora y estado */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-4 border border-white/20">
                    <div className="flex items-center justify-between text-white mb-4">
                        <Clock className="w-8 h-8" />
                        <span className="text-5xl font-bold font-mono">
                            {formatearHora(horaActual)}
                        </span>
                    </div>
                    <p className="text-white/80 text-center capitalize">
                        {formatearFecha(horaActual)}
                    </p>
                </div>

                {/* Estado de ubicación */}
                {configuracion && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-white/20">
                        <div className="flex items-center gap-3 text-white">
                            {ubicacionValida?.valida ? (
                                <>
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="flex-1">Ubicación verificada</span>
                                    <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full">
                                        {ubicacionValida.metodo}
                                    </span>
                                </>
                            ) : ubicacionValida === null ? (
                                <>
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                                    <span className="flex-1">Verificando ubicación...</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <span className="flex-1">Fuera del área permitida</span>
                                </>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-white/60 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{configuracion.direccion}</span>
                        </div>
                    </div>
                )}

                {/* Paso 1: Ingreso de código */}
                {paso === 'codigo' && (
                    <div className="bg-white rounded-3xl shadow-2xl p-6">
                        <div className="text-center mb-6">
                            <Fingerprint className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                Marca tu Asistencia
                            </h2>
                            <p className="text-gray-600 text-sm">
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
                                    className="w-full px-4 py-4 text-center text-2xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Ingresa tu documento"
                                    disabled={cargando}
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={buscarEmpleado}
                                disabled={cargando || !codigo.trim()}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <User className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm opacity-90">{getMensajeBienvenida()}</p>
                                    <h2 className="text-2xl font-bold">
                                        {empleado.Nombres} {empleado.Apellidos}
                                    </h2>
                                    <p className="text-sm opacity-90">DNI: {empleado.DocID}</p>
                                </div>
                            </div>
                        </div>

                        {/* Estado del día */}
                        <div className="bg-white rounded-3xl shadow-2xl p-6">
                            <h3 className="font-semibold text-gray-800 mb-4">Registro de hoy</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600">Entrada</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraEntrada || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600">Salida Almuerzo</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraSalidaAlmuerzo || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600">Regreso Almuerzo</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraRegresoAlmuerzo || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600">Salida</span>
                                    <span className="font-bold text-gray-800">
                                        {registroHoy?.HoraSalida || '—'}
                                    </span>
                                </div>
                                {registroHoy?.HorasTrabajadas && (
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                        <span className="text-green-600">Horas trabajadas</span>
                                        <span className="font-bold text-green-700">
                                            {registroHoy.HorasTrabajadas} hrs
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botones de marcación */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => marcar('entrada')}
                                disabled={!estados.puedeEntrada || cargando || !ubicacionValida?.valida}
                                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${estados.puedeEntrada && ubicacionValida?.valida
                                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <LogIn className="w-8 h-8" />
                                <span className="font-semibold">Entrada</span>
                            </button>

                            <button
                                onClick={() => marcar('salida-almuerzo')}
                                disabled={!estados.puedeSalidaAlmuerzo || cargando || !ubicacionValida?.valida}
                                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${estados.puedeSalidaAlmuerzo && ubicacionValida?.valida
                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Coffee className="w-8 h-8" />
                                <span className="font-semibold">Salida Almuerzo</span>
                            </button>

                            <button
                                onClick={() => marcar('regreso-almuerzo')}
                                disabled={!estados.puedeRegresoAlmuerzo || cargando || !ubicacionValida?.valida}
                                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${estados.puedeRegresoAlmuerzo && ubicacionValida?.valida
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Sun className="w-8 h-8" />
                                <span className="font-semibold">Regreso Almuerzo</span>
                            </button>

                            <button
                                onClick={() => marcar('salida')}
                                disabled={!estados.puedeSalida || cargando || !ubicacionValida?.valida}
                                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${estados.puedeSalida && ubicacionValida?.valida
                                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <LogOut className="w-8 h-8" />
                                <span className="font-semibold">Salida</span>
                            </button>
                        </div>

                        {/* Botón para cambiar empleado */}
                        <button
                            onClick={resetear}
                            className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            <span>Cambiar empleado</span>
                        </button>
                    </div>
                )}

                {/* Paso 3: Confirmación */}
                {paso === 'confirmacion' && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            ¡Marcación exitosa!
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {mensaje.texto}
                        </p>
                        <div className="animate-pulse text-gray-400">
                            Redirigiendo...
                        </div>
                    </div>
                )}

                {/* Mensajes flotantes */}
                {mensaje.texto && paso !== 'confirmacion' && (
                    <div className={`mt-4 p-4 rounded-2xl text-center ${mensaje.tipo === 'error'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : mensaje.tipo === 'exito'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                        {mensaje.tipo === 'error' && <AlertCircle className="w-5 h-5 inline mr-2" />}
                        {mensaje.tipo === 'exito' && <CheckCircle className="w-5 h-5 inline mr-2" />}
                        {mensaje.texto}
                    </div>
                )}

                {/* Footer con info de ubicación */}
                {configuracion && (
                    <div className="mt-4 text-center text-white/60 text-xs">
                        <p>📍 Radio permitido: {configuracion.radioPermitido} metros</p>
                        <p>📡 Redes WiFi: {configuracion.wifiPermitidos.join(' • ')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarcacionEmpleados;