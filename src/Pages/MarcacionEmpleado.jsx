// MarcacionEmpleado.jsx - Lo ven los empleados cuando escanean el QR
import React, { useState } from 'react';
import { Clock, Loader, X, CheckCircle, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function MarcacionEmpleado({ tokenLocal, onClose, onSuccess }) {
  const [procesando, setProcesando] = useState(false);
  const [paso, setPaso] = useState('identificacion'); // identificacion, marcacion, exito
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [buscando, setBuscando] = useState('');
  const [cargandoEmpleados, setCargandoEmpleados] = useState(false);

  const tiposMarcacion = [
    { id: 'entrada', label: 'Entrada', icon: '🚪', horario: 'Registro de entrada', color: 'bg-green-500' },
    { id: 'salida_almuerzo', label: 'Salida Almuerzo', icon: '🍽️', horario: 'Salida a almorzar', color: 'bg-yellow-500' },
    { id: 'regreso_almuerzo', label: 'Regreso Almuerzo', icon: '🔄', horario: 'Regreso de almuerzo', color: 'bg-orange-500' },
    { id: 'salida', label: 'Salida', icon: '🏠', horario: 'Salida del trabajo', color: 'bg-red-500' }
  ];

  // Cargar empleados activos
  const cargarEmpleados = async () => {
    setCargandoEmpleados(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/listaempleadoactivo`);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar empleados' });
    } finally {
      setCargandoEmpleados(false);
    }
  };

  // Seleccionar empleado
  const seleccionarEmpleado = (emp) => {
    setEmpleadoSeleccionado(emp);
    setPaso('marcacion');
  };

  // Procesar marcación
  const procesarMarcacion = async (tipo) => {
    setProcesando(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/marcacion/empleado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: empleadoSeleccionado.EmpId,
          tipo: tipo,
          tokenLocal: tokenLocal
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMensaje({ tipo: 'success', texto: data.message });
        setPaso('exito');
        if (onSuccess) onSuccess(data);
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setProcesando(false);
    }
  };

  // Al iniciar, cargar empleados
  useState(() => {
    cargarEmpleados();
  }, []);

  // Filtrar empleados por búsqueda
  const empleadosFiltrados = empleados.filter(emp =>
    emp.Nombres.toLowerCase().includes(buscando.toLowerCase()) ||
    emp.Apellidos.toLowerCase().includes(buscando.toLowerCase()) ||
    emp.DocID.includes(buscando)
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 rounded-t-2xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white font-bold text-lg">
                {paso === 'identificacion' && 'Identifícate'}
                {paso === 'marcacion' && 'Registrar Marcación'}
                {paso === 'exito' && '¡Marcación Exitosa!'}
              </h2>
              <p className="text-yellow-100 text-sm">Golden Nails Spa</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {mensaje && (
            <div className={`p-4 rounded-xl mb-4 ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {mensaje.texto}
            </div>
          )}

          {/* Paso 1: Identificación del empleado */}
          {paso === 'identificacion' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-800">¡Bienvenido!</h3>
                <p className="text-sm text-gray-500">Selecciona tu nombre para continuar</p>
              </div>

              {/* Buscador */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={buscando}
                  onChange={(e) => setBuscando(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Lista de empleados */}
              {cargandoEmpleados ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
                </div>
              ) : empleadosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No se encontraron empleados</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {empleadosFiltrados.map((emp) => (
                    <button
                      key={emp.EmpId}
                      onClick={() => seleccionarEmpleado(emp)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                        {emp.Nombres?.charAt(0)}{emp.Apellidos?.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{emp.Nombres} {emp.Apellidos}</p>
                        <p className="text-xs text-gray-500">DNI: {emp.DocID}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Selección de tipo de marcación */}
          {paso === 'marcacion' && empleadoSeleccionado && (
            <div>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-800">{empleadoSeleccionado.Nombres} {empleadoSeleccionado.Apellidos}</p>
                <p className="text-sm text-gray-500">¿Qué deseas registrar?</p>
              </div>

              <div className="space-y-3">
                {tiposMarcacion.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => procesarMarcacion(tipo.id)}
                    disabled={procesando}
                    className={`w-full flex items-center justify-between p-4 rounded-xl text-white ${tipo.color} ${procesando ? 'opacity-50' : 'hover:opacity-90'}`}
                  >
                    <div className="flex items-center gap-3">
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
                onClick={() => setPaso('identificacion')}
                className="w-full mt-4 text-gray-500 text-sm underline"
              >
                Volver a seleccionar empleado
              </button>
            </div>
          )}

          {/* Paso 3: Éxito */}
          {paso === 'exito' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">¡Registrado!</h3>
              <p className="text-gray-600">Tu marcación ha sido registrada exitosamente</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            📍 Escanea este código solo cuando estés en el local
          </p>
        </div>
      </div>
    </div>
  );
}