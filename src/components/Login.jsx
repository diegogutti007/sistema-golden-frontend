import { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioData = localStorage.getItem("usuario");
    
    if (token && usuarioData) {
      try {
        const user = JSON.parse(usuarioData);
        console.log("✅ Sesión existente encontrada:", user.usuario);
        onLogin(user);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
  }, [onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    // ✅ VALIDACIÓN MEJORADA
    if (!usuario.trim() || !contrasena.trim()) {
      setError("Usuario y contraseña son requeridos");
      setCargando(false);
      return;
    }

    try {
      console.log("🔗 Intentando conectar a:", `${API_URL}/api/auth/login`);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuario.trim(),
          contrasena: contrasena.trim()
        }),
      });

      console.log("📡 Respuesta del servidor - Status:", response.status);

      // ✅ MEJOR MANEJO DE ERRORES DE RED
      if (!response.ok) {
        // Intentar obtener el mensaje de error
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.text();
          if (errorData) {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.error || parsedError.message || errorData;
          }
        } catch (parseError) {
          console.log("No se pudo parsear el error como JSON");
        }
        
        throw new Error(errorMessage);
      }

      // ✅ PARSEAR LA RESPUESTA EXITOSA
      const data = await response.json();
      console.log("✅ Respuesta del login:", data);

      if (data.success && data.token) {
        // Guardar token y datos del usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.user));
        
        console.log("✅ Login exitoso, usuario:", data.user?.usuario);
        
        // Redirigir al dashboard
        setTimeout(() => {
          onLogin(data.user);
        }, 100);
        
      } else {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

    } catch (error) {
      console.error('❌ Error completo en login:', error);
      
      // ✅ MENSAJES DE ERROR MÁS ESPECÍFICOS
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError("No se puede conectar al servidor. Verifica tu conexión o contacta al administrador.");
      } else if (error.message.includes('401')) {
        setError("Usuario o contraseña incorrectos");
      } else if (error.message.includes('500')) {
        setError("Error interno del servidor. Intenta más tarde.");
      } else if (error.message.includes('Token de acceso requerido')) {
        setError("Error de configuración del servidor. Contacta al administrador.");
      } else {
        setError(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      }
    } finally {
      setCargando(false);
    }
  };

  // ✅ FUNCIÓN PARA PROBAR LA CONEXIÓN AL BACKEND
  const probarConexionBackend = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend conectado:", data);
        setError("✅ Backend funcionando correctamente");
      } else {
        setError("❌ Backend no responde correctamente");
      }
    } catch (error) {
      console.error("❌ Error conectando al backend:", error);
      setError("❌ No se puede conectar al backend. Verifica la URL.");
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
          
          {/* ✅ BOTÓN DE PRUEBA DE CONEXIÓN */}
          <button 
            type="button"
            onClick={probarConexionBackend}
            className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 underline"
          >
            Probar conexión al servidor
          </button>
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
            <div className={`rounded-lg p-3 ${
              error.includes('✅') 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className={`text-xs font-medium text-center ${
                error.includes('✅') ? 'text-green-400' : 'text-red-400'
              }`}>
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

        {/* Información de Debug */}
        <div className="mt-4 p-2 bg-gray-900/50 rounded text-xs">
          <div className="text-gray-400">URL Backend:</div>
          <div className="text-yellow-400 truncate">{API_URL}</div>
        </div>

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