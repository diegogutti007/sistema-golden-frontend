import { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioData = localStorage.getItem("usuario");
    
    if (token && usuarioData) {
      try {
        const user = JSON.parse(usuarioData);
        onLogin(user);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    }
  }, [onLogin]);

  // ✅ FUNCIÓN MEJORADA PARA PROBAR CONEXIÓN
  const probarConexionBackend = async () => {
    try {
      setCargando(true);
      setError("");
      
      console.log("🔍 Probando conexión a:", backendUrl);
      
      // Solo probar el endpoint /health
      try {
        const response = await fetch(`https://sistemagolden-backend-production.up.railway.app/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`📡 Respuesta de /health:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ /health responde:`, data);
          setError(`✅ Backend conectado correctamente`);
          return true;
        } else {
          setError(`❌ Backend responde con error: ${response.status}`);
          return false;
        }
      } catch (err) {
        console.log(`❌ /health falló:`, err.message);
        setError("❌ No se pudo conectar al backend. Verifica la URL.");
        return false;
      }
      
    } catch (error) {
      console.error("❌ Error en prueba de conexión:", error);
      setError(`❌ Error: ${error.message}`);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuario.trim() || !contrasena.trim()) {
      setError("Usuario y contraseña son requeridos");
      return;
    }

    setCargando(true);
    setError("");

    try {
      console.log("🔐 Intentando login en:", `https://sistemagolden-backend-production.up.railway.app/api/auth/login`);
      
      const response = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/auth/login`, {
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
        // Si es error 405, probablemente la ruta no existe
        if (response.status === 405) {
          throw new Error(`Error 405: Método no permitido. Verifica que la ruta /api/auth/login exista en el backend.`);
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Respuesta login:", data);

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  // ✅ ACTUALIZAR URL MANUALMENTE
  const actualizarURL = () => {
    const nuevaUrl = prompt("Ingresa la URL de tu backend en Railway:", backendUrl);
    if (nuevaUrl) {
      // Asegurarse de que la URL no tenga slash al final
      const urlLimpia = nuevaUrl.replace(/\/$/, '');
      setBackendUrl(urlLimpia);
      console.log("🔄 URL actualizada:", urlLimpia);
      setError(""); // Limpiar error al cambiar URL
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
          
          {/* Botones de conexión */}
{/*           <div className="mt-3 space-y-2">
            <button 
              type="button"
              onClick={probarConexionBackend}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg transition-all"
              disabled={cargando}
            >
              Probar Conexión
            </button>
            <button 
              type="button"
              onClick={actualizarURL}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs py-2 rounded-lg transition-all"
            >
              Cambiar URL
            </button>
          </div> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos del formulario */}
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
{/*         <div className="mt-4 p-2 bg-gray-900/50 rounded text-xs">
          <div className="text-gray-400">URL Backend Actual:</div>
          <div className="text-yellow-400 truncate">{backendUrl}</div>
          <div className="text-gray-500 text-xs mt-1">
            Si no funciona, haz click en "Cambiar URL" y pega: 
            <br />
            <code className="bg-black p-1 rounded">https://sistemagolden-backend-production.up.railway.app</code>
          </div>
        </div> */}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Sistema seguro • Golden Nails</p>
        </div>
      </div>
    </div>
  );
}