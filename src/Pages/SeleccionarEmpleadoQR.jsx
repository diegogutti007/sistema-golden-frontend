// SeleccionarEmpleadoQR.jsx - Versión simplificada
import React, { useState, useEffect } from 'react';
import { Search, User, QrCode, X, Loader } from 'lucide-react';
import { BACKEND_URL } from '../config';
import GenerarQREmpleado from './GenerarQREmpleado';

export default function SeleccionarEmpleadoQR({ onClose }) {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/listaempleadoactivo`);
      const data = await res.json();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const empleadosFiltrados = empleados.filter(emp => 
    emp && (
      (emp.Nombres || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (emp.Apellidos || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (emp.DocID || '').includes(busqueda)
    )
  );

  // Si hay empleado seleccionado, mostrar el generador de QR
  if (empleadoSeleccionado) {
    return <GenerarQREmpleado empleado={empleadoSeleccionado} onClose={() => setEmpleadoSeleccionado(null)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 rounded-t-2xl sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-white" />
              <h2 className="text-white font-bold">Generar QR</h2>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          {cargando ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
            </div>
          ) : empleadosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay empleados</p>
            </div>
          ) : (
            empleadosFiltrados.map((emp) => (
              <button
                key={emp.EmpId}
                onClick={() => setEmpleadoSeleccionado(emp)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {emp.Nombres?.charAt(0)}{emp.Apellidos?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{emp.Nombres} {emp.Apellidos}</p>
                    <p className="text-xs text-gray-500">DNI: {emp.DocID}</p>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-yellow-500" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}