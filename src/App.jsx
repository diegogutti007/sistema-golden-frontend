import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import MenuPrincipal from "./components/MenuPrincipal";
import MenuSecundario from "./components/MenuSecundario";
import VentaFormulario from "./Pages/VentaFormulario";
import VentaLista from "./Pages/VentaLista";
import ListaGastos from "./Pages/ListaGastos";
import FormularioGasto from "./Pages/FormularioGasto";
import ListaComisiones from "./Pages/ListaComisiones";
import AgendaCitas from "./Pages/AgendaCitas";
import FormEmpleado from "./Pages/FormEmpleado";
import ListaEmpleado from "./Pages/ListaEmpleado";
import Dashboard from "./Pages/Dashboard";
import PerfilUsuario from "./Pages/PerfilUsuario";
import HistorialCitas from "./Pages/HistorialCitas";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [backendUrl, setBackendUrl] = useState("");

  // ✅ DETECTAR URL DEL BACKEND AUTOMÁTICAMENTE
  useEffect(() => {
    const url = "https://sistemagolden-backend-production.up.railway.app";
    setBackendUrl(url);
    console.log("🔗 Backend URL detectada:", url);
  }, []);

  // ✅ VERIFICAR AUTENTICACIÓN MEJORADA
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const token = localStorage.getItem("token");
        const usuarioGuardado = localStorage.getItem("usuario");
        
        if (token && usuarioGuardado) {
          try {
            // Verificar si el token es válido
            const response = await fetch(`${backendUrl}/api/auth/verify`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              setUsuario(data.user);
            } else {
              // Token inválido, limpiar localStorage
              console.log("❌ Token inválido, limpiando sesión");
              localStorage.removeItem("token");
              localStorage.removeItem("usuario");
            }
          } catch (error) {
            console.log("⚠️ No se pudo verificar token, usando datos locales");
            // Si falla la verificación, usar datos locales
            const userData = JSON.parse(usuarioGuardado);
            setUsuario(userData);
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
      } finally {
        setCargando(false);
      }
    };

    if (backendUrl) {
      verificarAutenticacion();
    } else {
      setCargando(false);
    }
  }, [backendUrl]);

  const handleLogin = (userData) => {
    try {
      localStorage.setItem("usuario", JSON.stringify(userData));
      setUsuario(userData);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  // ✅ LOGOUT MEJORADO
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token && backendUrl) {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => {
          console.log("⚠️ No se pudo contactar backend para logout:", err);
        });
      }
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setUsuario(null);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400 text-sm">Iniciando sistema...</p>
          {backendUrl && (
            <p className="text-gray-500 text-xs">Conectando a: {backendUrl}</p>
          )}
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar Login
  if (!usuario) {
    console.log("No hay usuario, mostrando Login");
    return <Login onLogin={handleLogin} />;
  }

  // Si hay usuario, mostrar la aplicación con rutas
  console.log("Usuario autenticado, mostrando aplicación");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans relative overflow-hidden flex flex-col">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.05)_1px,_transparent_0)] bg-[length:10px_10px] pointer-events-none"></div>

      <MenuPrincipal onLogout={handleLogout} usuario={usuario} />

      <div className="md:ml-64 pt-14 flex-1 flex flex-col">
        <MenuSecundario />

        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:px-8 xl:px-12 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard backendUrl={backendUrl} />} />
              <Route path="/NuevoEmpleados" element={<FormEmpleado backendUrl={backendUrl} />} />
              <Route path="/GestionEmpleados" element={<ListaEmpleado backendUrl={backendUrl} />} />
              <Route path="/ComisionDetalles" element={<ListaComisiones backendUrl={backendUrl} />} />
              <Route path="/Asistencias" element={<div className="p-6">Página de Asistencias - En desarrollo</div>} />
              <Route path="/citas" element={<AgendaCitas backendUrl={backendUrl} />} />
              <Route path="/citas/Historial" element={<HistorialCitas backendUrl={backendUrl} />}  />
              <Route path="/gastos" element={<FormularioGasto backendUrl={backendUrl} />} />
              <Route path="/gastos/GestionGastos" element={<ListaGastos backendUrl={backendUrl} />} />
              <Route path="/Ventas" element={<VentaFormulario backendUrl={backendUrl} />} />
              <Route path="/Ventas/GestionVentas" element={<VentaLista backendUrl={backendUrl} />} />
              <Route path="/perfil" element={<PerfilUsuario backendUrl={backendUrl} />}  />

              <Route path="/configuracion" element={<div className="p-6">Configuración - En desarrollo</div>} />
              <Route path="*" element={<div className="p-6 text-center">Página no encontrada</div>} />
            </Routes>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-2 text-center text-gray-500 text-xs">
          © 2025 Pilona System v2.0
        </footer>
      </div>
    </div>
  );
}

export default App;