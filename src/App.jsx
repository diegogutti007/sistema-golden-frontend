import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import LayoutPrincipal from "./components/LayoutPrincipal";
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
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (token && usuarioGuardado) {
      try {
        const user = JSON.parse(usuarioGuardado);
        setUsuario(user);
        
        // Si estamos en login, redirigir al dashboard
        if (location.pathname === '/login') {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
      }
    } else {
      setUsuario(null);
      
      // Si no estamos en login y no hay usuario, redirigir a login
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
    
    setCargando(false);
  }, []);

  // Manejar login exitoso
  const handleLogin = (userData) => {
    setUsuario(userData);
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate('/login');
  };

  // Mostrar spinner mientras carga
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400 text-sm">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Si estamos en login, mostrar solo Login
  if (location.pathname === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  // Si no hay usuario, mostrar spinner
  if (!usuario) {
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
  return (
    <LayoutPrincipal usuario={usuario} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/NuevoEmpleados" element={<ProtectedRoute><FormEmpleado /></ProtectedRoute>} />
        <Route path="/GestionEmpleados" element={<ProtectedRoute><ListaEmpleado /></ProtectedRoute>} />
        <Route path="/ComisionDetalles" element={<ProtectedRoute><ListaComisiones /></ProtectedRoute>} />
        <Route path="/Asistencias" element={<ProtectedRoute><div className="p-6">Página de Asistencias - En desarrollo</div></ProtectedRoute>} />
        <Route path="/citas" element={<ProtectedRoute><AgendaCitas /></ProtectedRoute>} />
        <Route path="/citas/Historial" element={<ProtectedRoute><HistorialCitas /></ProtectedRoute>} />
        <Route path="/gastos" element={<ProtectedRoute><FormularioGasto /></ProtectedRoute>} />
        <Route path="/gastos/GestionGastos" element={<ProtectedRoute><ListaGastos /></ProtectedRoute>} />
        <Route path="/Ventas" element={<ProtectedRoute><VentaFormulario /></ProtectedRoute>} />
        <Route path="/Ventas/GestionVentas" element={<ProtectedRoute><VentaLista /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute><div className="p-6">Configuración - En desarrollo</div></ProtectedRoute>} />
        
        {/* Rutas del menú secundario */}
        <Route path="/dashboard/ventas" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Ventas</h1><p>Estadísticas de ventas</p></div></ProtectedRoute>} />
        <Route path="/dashboard/comisiones" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Comisiones</h1><p>Estadísticas de comisiones</p></div></ProtectedRoute>} />
        <Route path="/dashboard/citas" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Citas</h1><p>Estadísticas de citas</p></div></ProtectedRoute>} />
        <Route path="/ventas/productos" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold text-gray-800 mb-4">Ventas Productos</h1><p>Gestión de productos</p></div></ProtectedRoute>} />
        <Route path="/ventas/servicios" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold text-gray-800 mb-4">Ventas Servicios</h1><p>Gestión de servicios</p></div></ProtectedRoute>} />
        <Route path="/inventario/stock" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold text-gray-800 mb-4">Inventario Stock</h1><p>Gestión de stock</p></div></ProtectedRoute>} />
        <Route path="/inventario/proveedores" element={<ProtectedRoute><div className="p-6"><h1 className="text-2xl font-bold text-gray-800 mb-4">Inventario Proveedores</h1><p>Gestión de proveedores</p></div></ProtectedRoute>} />
        
        <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </LayoutPrincipal>
  );
}

export default App;