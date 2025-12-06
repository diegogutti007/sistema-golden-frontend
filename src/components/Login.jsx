import { useState, useEffect } from "react";
import { BACKEND_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 Login montado");
    
    // Solo verificar si ya está autenticado
    const token = localStorage.getItem("token");
    const usuarioData = localStorage.getItem("usuario");
    
    if (token && usuarioData) {
      console.log("✅ Ya autenticado, redirigiendo...");
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuario.trim() || !contrasena.trim()) {
      setError("Usuario y contraseña son requeridos");
      return;
    }

    setCargando(true);
    setError("");

    try {
      console.log("🔐 Enviando login a:", `${BACKEND_URL}/api/auth/login`);
      
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuario.trim(),
          contrasena: contrasena.trim()
        }),
      });

      console.log("📡 Status respuesta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error del servidor:", errorText);
        throw new Error("Credenciales incorrectas o servidor no disponible");
      }

      const data = await response.json();
      console.log("✅ Respuesta recibida:", data);

      if (data.success && data.token) {
        // Guardar en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.user));
        
        console.log("✅ Login exitoso, llamando onLogin");
        
        // Llamar a la función del padre
        onLogin(data.user);
        
        // Redirigir
        navigate('/', { replace: true });
      } else {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

    } catch (error) {
      console.error('❌ Error completo en login:', error);
      setError(error.message || "Error al iniciar sesión");
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4 py-8 w-full">
      <div className="bg-gray-800/95 shadow-2xl rounded-2xl p-6 w-full max-w-xs mx-auto border border-yellow-500/20">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="relative mx-auto mb-3">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-yellow-400 rounded-full" />
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">GOLDEN NAILS</h2>
          <p className="text-gray-300 text-xs">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Usuario</label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-200 text-sm"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              disabled={cargando}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-200 text-sm"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              disabled={cargando}
            />
          </div>

          {error && (
            <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/20">
              <div className="text-xs font-medium text-center text-red-400">
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {cargando ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Ingresando...</span>
              </div>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Sistema seguro • Pilona 2.0</p>
        </div>
      </div>
    </div>
  );
}