// app/marcacion/local/[token]/page.jsx (Next.js) o ruta en React Router
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
//import MarcacionEmpleado from '../components/MarcacionEmpleado';
import MarcacionEmpleado from './MarcacionEmpleado';
import { BACKEND_URL } from '../config';


export default function PaginaMarcacionLocal() {
  const { token } = useParams();
  const [valido, setValido] = useState(true);

  useEffect(() => {
    // Verificar si el token es válido
    const verificarToken = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/qr/local/verificar/${token}`);
        const data = await res.json();
        if (!data.valido) {
          setValido(false);
        }
      } catch (error) {
        setValido(false);
      }
    };
    verificarToken();
  }, [token]);

  if (!valido) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">QR Inválido</h2>
          <p className="text-gray-600">Este código QR no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  return <MarcacionEmpleado tokenLocal={token} onClose={() => window.close()} />;
}