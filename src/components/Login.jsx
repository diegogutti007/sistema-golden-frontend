import { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ MEJORAR LA LIMPIEZA DE DATOS
  useEffect(() => {
    // Verificar si ya hay una sesión activa
    const token = localStorage.getItem("token");
    const usuarioData = localStorage.getItem("usuario");
    
    if (token && usuarioData) {
      try {
        const user = JSON.parse(usuarioData);
        console.log("✅ Sesión existente encontrada:", user.usuario);
        // Si hay sesión activa, redirigir al dashboard
        onLogin(user);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
        // Limpiar datos corruptos
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    } else {
      // Limpiar cualquier dato residual
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
  }, [onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuario.trim(),
          contrasena: contrasena
        }),
      });

      // ✅ MEJOR MANEJO DE ERRORES DE CONEXIÓN
      if (!response) {
        throw new Error('No se pudo conectar con el servidor');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      if (data.success) {
        // Guardar token y datos del usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.user));
        
        console.log("✅ Login exitoso, usuario:", data.user.usuario);
        
        // ✅ FORZAR ACTUALIZACIÓN COMPLETA
        setTimeout(() => {
          onLogin(data.user);
        }, 100);
        
      } else {
        throw new Error(data.error || 'Error en el login');
      }

    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message || "Error al iniciar sesión");
    } finally {
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
          
          <h2 className="text-xl font-bold text-white mb-1">
            GOLDEN NAILS
          </h2>
          <p className="text-gray-300 text-xs">
            Sistema de Gestión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Usuario */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-200 text-sm"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingrese su usuario"
                required
                disabled={cargando}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-200 text-sm"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                disabled={cargando}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            </div>
          )}

          {/* Botón de Login */}
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

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sistema seguro • Golden Nails
          </p>
        </div>
      </div>
    </div>
  );
}