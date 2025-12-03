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

  // Establecer fechas por defecto (mes actual)

  useEffect(() => {
    // Para Create React App usa REACT_APP_API_URL
    const url = "https://sistemagolden-backend-production.up.railway.app";//process.env.REACT_APP_API_URL || 


    setBackendUrl(url);
    console.log("🔗 URL del backend detectada:", url);
  }, []);

  // En tu App.jsx - modifica el useEffect para verificar el token
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const token = localStorage.getItem("token");
        const usuarioGuardado = localStorage.getItem("usuario");

        if (token && usuarioGuardado) {
          // Verificar si el token es válido
          const response = await fetch(`https://sistemagolden-backend-production.up.railway.app/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUsuario(data.user);
          } else {
            // Token inválido, limpiar localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      } finally {
        setCargando(false);
      }
    };

    verificarAutenticacion();
  }, []);

  const handleLogin = (userData) => {
    try {
      localStorage.setItem("usuario", JSON.stringify(userData));
      setUsuario(userData);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  // Modifica handleLogout para llamar al backend
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch(`https://sistemagolden-backend-production.up.railway.app/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar Login
  if (!usuario) {
    console.log("No hay usuario, mostrando Login"); // Para debug
    return <Login onLogin={handleLogin} />;
  }

  // Si hay usuario, mostrar la aplicación con rutas
  console.log("Usuario autenticado, mostrando aplicación"); // Para debug
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/NuevoEmpleados" element={<FormEmpleado />} />
              <Route path="/GestionEmpleados" element={<ListaEmpleado />} />
              <Route path="/ComisionDetalles" element={<ListaComisiones />} />
              <Route path="/Asistencias" element={<div className="p-6">Página de Asistencias - En desarrollo</div>} />
              <Route path="/citas" element={<AgendaCitas />} />
              <Route path="/citas/Historial" element={<HistorialCitas />} />
              <Route path="/gastos" element={<FormularioGasto />} />
              <Route path="/gastos/GestionGastos" element={<ListaGastos />} />
              <Route path="/Ventas" element={<VentaFormulario />} />
              <Route path="/Ventas/GestionVentas" element={<VentaLista />} />
              <Route path="/perfil" element={<PerfilUsuario />} />

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