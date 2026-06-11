// EscanearQRMarcacion.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Clock, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function EscanearQRMarcacion({ onClose, onSuccess }) {
  const [escaneando, setEscaneando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMarcacion, setTipoMarcacion] = useState(null);
  const [tokenEscaneado, setTokenEscaneado] = useState(null);
  const [errorCamara, setErrorCamara] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeScannerRef = useRef(null);

  const tiposMarcacion = [
    { id: 'entrada', label: 'Entrada', icon: '🚪', horario: 'Registro de entrada', color: 'bg-green-500' },
    { id: 'salida_almuerzo', label: 'Salida Almuerzo', icon: '🍽️', horario: 'Salida a almorzar', color: 'bg-yellow-500' },
    { id: 'regreso_almuerzo', label: 'Regreso Almuerzo', icon: '🔄', horario: 'Regreso de almuerzo', color: 'bg-orange-500' },
    { id: 'salida', label: 'Salida', icon: '🏠', horario: 'Salida del trabajo', color: 'bg-red-500' }
  ];

  const procesarMarcacion = async (token, tipo) => {
    setProcesando(true);
    setMensaje(null);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/qr/marcacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, tipo })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMensaje({
          tipo: 'success',
          texto: `✅ ${data.message}`,
          hora: data.hora
        });
        
        if (onSuccess) onSuccess(data);
        
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setMensaje({
          tipo: 'error',
          texto: `❌ ${data.error || 'Error al procesar marcación'}`
        });
        // Volver a escanear
        setTimeout(() => {
          setTipoMarcacion(null);
          setTokenEscaneado(null);
          setMensaje(null);
          iniciarScanner();
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({
        tipo: 'error',
        texto: '❌ Error de conexión con el servidor'
      });
      setTimeout(() => {
        setTipoMarcacion(null);
        setTokenEscaneado(null);
        setMensaje(null);
        iniciarScanner();
      }, 2000);
    } finally {
      setProcesando(false);
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    if (procesando) return;
    
    setEscaneando(false);
    detenerScanner();
    
    // Extraer token de la URL
    const token = decodedText.split('/qr/').pop();
    setTokenEscaneado(token);
    setTipoMarcacion(token);
  };

  const onScanFailure = (error) => {
    // No hacer nada, solo seguir escaneando
    console.warn('Error escaneando:', error);
  };

  const iniciarScanner = () => {
    if (html5QrCodeScannerRef.current) {
      html5QrCodeScannerRef.current.clear();
      html5QrCodeScannerRef.current = null;
    }
    
    if (scannerRef.current && !html5QrCodeScannerRef.current) {
      try {
        html5QrCodeScannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            rememberLastUsedCamera: true,
            supportedScanTypes: 1
          },
          false
        );
        
        html5QrCodeScannerRef.current.render(onScanSuccess, onScanFailure);
        setErrorCamara(false);
      } catch (error) {
        console.error('Error al iniciar scanner:', error);
        setErrorCamara(true);
      }
    }
  };

  const detenerScanner = () => {
    if (html5QrCodeScannerRef.current) {
      html5QrCodeScannerRef.current.clear();
      html5QrCodeScannerRef.current = null;
    }
  };

  const seleccionarTipo = (tipo) => {
    if (tokenEscaneado) {
      procesarMarcacion(tokenEscaneado, tipo);
    }
  };

  const procesarCodigoManual = async () => {
    if (!codigoManual.trim()) {
      alert('Ingrese un código QR válido');
      return;
    }
    
    setProcesando(true);
    const token = codigoManual.split('/qr/').pop();
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/qr/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setTokenEscaneado(token);
        setTipoMarcacion(token);
        setModoManual(false);
      } else {
        setMensaje({
          tipo: 'error',
          texto: '❌ Código QR inválido o expirado'
        });
      }
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: '❌ Error al validar código'
      });
    } finally {
      setProcesando(false);
    }
  };

  useEffect(() => {
    iniciarScanner();
    
    return () => {
      detenerScanner();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-xl">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-white font-bold">Escanear QR</h2>
                <p className="text-blue-100 text-sm">Para marcar asistencia</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {mensaje ? (
            <div className={`p-4 rounded-xl mb-4 ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <div className="flex items-center space-x-2">
                {mensaje.tipo === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{mensaje.texto}</span>
              </div>
              {mensaje.hora && (
                <p className="text-sm mt-2">Hora registrada: {mensaje.hora}</p>
              )}
            </div>
          ) : tipoMarcacion ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">QR Escaneado</h3>
                <p className="text-sm text-gray-500">Seleccione el tipo de marcación</p>
              </div>
              
              <div className="space-y-3">
                {tiposMarcacion.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => seleccionarTipo(tipo.id)}
                    disabled={procesando}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                      procesando ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-102'
                    } ${tipo.color} text-white`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tipo.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold">{tipo.label}</p>
                        <p className="text-xs text-white/80">{tipo.horario}</p>
                      </div>
                    </div>
                    {procesando && <Loader className="w-5 h-5 animate-spin" />}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setTipoMarcacion(null);
                  setTokenEscaneado(null);
                  iniciarScanner();
                }}
                className="mt-4 text-gray-500 text-sm underline hover:text-gray-700"
              >
                Volver a escanear
              </button>
            </div>
          ) : errorCamara ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error con la cámara</h3>
              <p className="text-gray-500 text-sm mb-4">
                No se pudo acceder a la cámara. Asegúrate de permitir el acceso.
              </p>
              <button
                onClick={() => setModoManual(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Ingresar código manualmente
              </button>
            </div>
          ) : modoManual ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresar código QR manualmente</h3>
              <input
                type="text"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value)}
                placeholder="Pega el código QR aquí..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={procesarCodigoManual}
                  disabled={procesando}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {procesando ? 'Procesando...' : 'Procesar'}
                </button>
                <button
                  onClick={() => {
                    setModoManual(false);
                    iniciarScanner();
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Volver a cámara
                </button>
              </div>
            </div>
          ) : (
            <>
              <div id="qr-reader" ref={scannerRef} className="w-full"></div>
              {escaneando && (
                <div className="text-center mt-4">
                  <div className="animate-pulse">
                    <p className="text-gray-500 text-sm">
                      📷 Coloca el código QR frente a la cámara
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Asegúrate de tener buena iluminación
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setModoManual(true)}
                className="mt-4 text-blue-500 text-sm underline hover:text-blue-700 w-full text-center"
              >
                ¿No puedes escanear? Ingresa el código manualmente
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            ⚡ Escanea tu código QR personal para registrar tu asistencia
          </p>
        </div>
      </div>
    </div>
  );
}