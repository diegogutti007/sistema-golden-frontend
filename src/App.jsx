import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("🔄 App renderizado:", {
    pathname: location.pathname,
    usuario: !!usuario,
    cargando
  });

  // Solo verificar autenticación una vez al cargar
  useEffect(() => {
    console.log("🔍 Verificando autenticación inicial...");
    
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    console.log("📊 Datos en localStorage:", { 
      token: !!token, 
      usuario: !!usuarioGuardado 
    });

    if (token && usuarioGuardado) {
      try {
        const user = JSON.parse(usuarioGuardado);
        console.log("✅ Usuario encontrado:", user);
        setUsuario(user);
        
        // Si estamos en login, redirigir
        if (location.pathname === '/login') {
          console.log("🔄 Redirigiendo de login a dashboard");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("❌ Error al parsear usuario:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
      }
    } else {
      console.log("❌ No hay usuario autenticado");
      setUsuario(null);
      
      // Si no estamos en login y no hay usuario, redirigir a login
      if (location.pathname !== '/login') {
        console.log("🔄 Redirigiendo a login");
        navigate('/login', { replace: true });
      }
    }
    
    // No necesitamos cargando en este caso
    // setCargando(false);
  }, []); // SOLO al montar, no en cada cambio de ruta

  // Manejar login exitoso
  const handleLogin = (userData) => {
    console.log("✅ Login exitoso, actualizando estado:", userData);
    setUsuario(userData);
  };

  // Manejar logout
  const handleLogout = () => {
    console.log("🚪 Cerrando sesión");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate('/login');
  };

  // Si estamos en la ruta /login, mostrar solo Login
  if (location.pathname === '/login') {
    console.log("📱 Mostrando página de login");
    return <Login onLogin={handleLogin} />;
  }

  // Si no hay usuario (y no estamos en login), mostrar spinner
  if (!usuario) {
    console.log("⏳ No hay usuario, mostrando spinner");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400 text-sm">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario, mostrar la aplicación
  console.log("🏠 Mostrando aplicación para usuario:", usuario);
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
              {/* Todas las rutas están protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/NuevoEmpleados" element={
                <ProtectedRoute>
                  <FormEmpleado />
                </ProtectedRoute>
              } />
              
              <Route path="/GestionEmpleados" element={
                <ProtectedRoute>
                  <ListaEmpleado />
                </ProtectedRoute>
              } />
              
              <Route path="/ComisionDetalles" element={
                <ProtectedRoute>
                  <ListaComisiones />
                </ProtectedRoute>
              } />
              
              <Route path="/Asistencias" element={
                <ProtectedRoute>
                  <div className="p-6">Página de Asistencias - En desarrollo</div>
                </ProtectedRoute>
              } />
              
              <Route path="/citas" element={
                <ProtectedRoute>
                  <AgendaCitas />
                </ProtectedRoute>
              } />
              
              <Route path="/citas/Historial" element={
                <ProtectedRoute>
                  <HistorialCitas />
                </ProtectedRoute>
              } />
              
              <Route path="/gastos" element={
                <ProtectedRoute>
                  <FormularioGasto />
                </ProtectedRoute>
              } />
              
              <Route path="/gastos/GestionGastos" element={
                <ProtectedRoute>
                  <ListaGastos />
                </ProtectedRoute>
              } />
              
              <Route path="/Ventas" element={
                <ProtectedRoute>
                  <VentaFormulario />
                </ProtectedRoute>
              } />
              
              <Route path="/Ventas/GestionVentas" element={
                <ProtectedRoute>
                  <VentaLista />
                </ProtectedRoute>
              } />
              
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <PerfilUsuario />
                </ProtectedRoute>
              } />
              
              <Route path="/configuracion" element={
                <ProtectedRoute>
                  <div className="p-6">Configuración - En desarrollo</div>
                </ProtectedRoute>
              } />
              
              {/* Ruta por defecto */}
              <Route path="*" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
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