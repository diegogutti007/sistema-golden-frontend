// GenerarQRLocal.jsx - Solo el administrador usa esto una vez
import React, { useState, useEffect } from 'react';
import { Download, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { BACKEND_URL } from '../config';

export default function GenerarQRLocal() {
  const [qrCode, setQrCode] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    generarQR();
  }, []);

  const generarQR = async () => {
    try {
      // Obtener token único del local desde el backend
      const res = await fetch(`${BACKEND_URL}/api/qr/local/generar`);
      const data = await res.json();
      
      // Generar QR con la URL de marcación
      const url = `${window.location.origin}/marcacion/local/${data.token}`;
      const qr = await QRCode.toDataURL(url, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      setQrCode(qr);
    } catch (error) {
      console.error('Error generando QR:', error);
    } finally {
      setCargando(false);
    }
  };

  const descargarQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.download = 'qr_local_golden_nails.png';
    link.href = qrCode;
    link.click();
  };

  const imprimirQR = () => {
    if (!qrCode) return;
    const ventana = window.open();
    ventana.document.write(`
      <html>
        <head>
          <title>QR Golden Nails</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 2px solid #d4af37;
              border-radius: 20px;
            }
            img { width: 400px; height: 400px; }
            h1 { color: #d4af37; margin-top: 20px; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrCode}" />
            <h1>GOLDEN NAILS SPA</h1>
            <p>Escanea para marcar tu asistencia</p>
            <p style="font-size: 12px;">Todos los empleados usan el mismo código</p>
          </div>
        </body>
      </html>
    `);
    ventana.print();
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
          <h2 className="text-white text-xl font-bold">Código QR del Local</h2>
          <p className="text-yellow-100">Imprime y pega este código en la recepción</p>
        </div>

        <div className="p-8 text-center">
          {qrCode && (
            <>
              <img src={qrCode} alt="QR Local" className="w-96 h-96 mx-auto border-4 border-yellow-500 rounded-2xl shadow-lg" />
              
              <div className="mt-6">
                <p className="text-gray-700 mb-2">
                  <strong>Golden Nails Spa</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Todos los empleados escanean este mismo código<br />
                  para registrar su asistencia
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={descargarQR}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Download className="w-5 h-5" />
                    Descargar QR
                  </button>
                  <button
                    onClick={imprimirQR}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimir QR
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-sm text-gray-500 text-center">
            📍 Coloca este código QR en un lugar visible de la recepción.<br />
            Los empleados lo escanearán desde su celular para marcar asistencia.
          </p>
        </div>
      </div>
    </div>
  );
}