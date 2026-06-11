// GenerarQREmpleado.jsx - Versión simplificada para prueba
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function GenerarQREmpleado({ empleado, onClose }) {
  const [qrCode, setQrCode] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  console.log('🎯 GenerarQREmpleado recibió:', empleado);

  useEffect(() => {
    if (empleado && empleado.EmpId) {
      generarQR();
    }
  }, [empleado]);

  const generarQR = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/qr/generar/${empleado.EmpId}`);
      const data = await res.json();
      if (data.success) {
        setQrCode(data.qrCode);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  if (!empleado) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-2xl p-6 max-w-md">
          <h3 className="text-lg font-bold mb-2">Error</h3>
          <p>No se encontró información del empleado</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-white font-bold">Código QR</h2>
          <button onClick={onClose} className="text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold">{empleado.Nombres} {empleado.Apellidos}</h3>
            <p className="text-sm text-gray-500">DNI: {empleado.DocID}</p>
          </div>

          {cargando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Generando QR...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
              <button onClick={generarQR} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg">Reintentar</button>
            </div>
          ) : qrCode ? (
            <div className="text-center">
              <img src={qrCode} alt="QR" className="w-64 h-64 mx-auto border rounded-xl" />
              <p className="mt-4 text-sm text-gray-500">Escanea para marcar asistencia</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No se pudo generar el QR</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}