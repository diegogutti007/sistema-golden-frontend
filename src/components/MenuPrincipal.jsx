import React, { useEffect, useRef, useState } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Home,
  Users,
  Calendar,
  DollarSign,
  TrendingDown,
  LogOut,
  Settings,
  BarChart3,
  History,
  Space
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// ✅ COMPONENTE PARA OCULTAR ELEMENTOS SEGÚN ROL
const HideIfUnauthorized = ({ children, allowedRoles = [], userRole }) => {
  if (!allowedRoles.includes(userRole)) {
    return null;
  }
  return children;
};

// ✅ AGREGAR onLogout COMO PROP
const MenuPrincipal = ({ onLogout, usuario }) => {
  const [empleadosOpen, setEmpleadosOpen] = useState(false);
  const [citasOpen, setCitasOpen] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(false);
  const [gastosOpen, setGastosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ DEFINIR ROLES
  const ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    SUPERVISOR: 'supervisor',
    EMPLEADO: 'empleado'
  };

  // Obtener el rol del usuario (por defecto 'empleado' si no existe)
  const userRole = usuario?.rol || ROLES.EMPLEADO;

  // ✅ VERIFICACIÓN DE AUTENTICACIÓN MEJORADA
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');

    console.log("🔍 Verificando autenticación...", {
      token: !!token,
      usuarioData: !!usuarioData,
      pathname: location.pathname
    });

    if (!token || !usuarioData) {
      console.log("❌ No hay sesión activa");
      setIsAuthenticated(false);

      // Solo redirigir si no estamos ya en login
      if (location.pathname !== '/login') {
        console.log("🔄 Redirigiendo a login...");
        navigate('/login', { replace: true });
      }
    } else {
      console.log("✅ Sesión activa encontrada");
      setIsAuthenticated(true);

      // Si estamos en login pero hay sesión, redirigir a inicio
      if (location.pathname === '/login') {
        console.log("🔄 Redirigiendo a página principal desde login...");
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  // Cerrar submenus al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setEmpleadosOpen(false);
        setCitasOpen(false);
        setVentasOpen(false);
        setGastosOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar mobile menu al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ FUNCIÓN DE LOGOUT MEJORADA
  const handleLogout = () => {
    console.log("🔄 Iniciando logout desde MenuPrincipal...");

    // Cerrar todos los menús
    setUserMenuOpen(false);
    setMobileMenuOpen(false);

    // Limpiar localStorage
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setIsAuthenticated(false);

    // Llamar a la función de logout del padre si existe
    if (onLogout) {
      console.log("✅ onLogout encontrado, ejecutando...");
      onLogout();
    }

    // ✅ REDIRIGIR AL LOGIN DESPUÉS DEL LOGOUT
    console.log("✅ Redirigiendo a login después del logout...");
    navigate('/login', { replace: true });
  };

  // ✅ FUNCIÓN PARA MANEJAR CLIC EN EL LOGO
  const handleLogoClick = (e) => {
    e.preventDefault();
    console.log("🏠 Redirigiendo a página principal desde logo...");
    navigate('/');
  };

  // ✅ FUNCIÓN PARA MANEJAR CLIC EN INICIO
  const handleInicioClick = (e) => {
    e.preventDefault();
    console.log("🏠 Redirigiendo a página principal desde inicio...");
    navigate('/');
  };

  // ✅ SI NO ESTÁ AUTENTICADO, NO RENDERIZAR EL MENÚ
  if (!isAuthenticated) {
    console.log("🚫 No autenticado, no renderizando menú");
    return null;
  }

  console.log("✅ Renderizando menú principal");

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav
        ref={wrapperRef}
        className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/20 shadow-2xl z-50 w-full"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 lg:h-16">
            {/* Logo - VERSIÓN MEJORADA PARA MÓVIL */}
            <div className="flex-shrink-0">
              <a
                href="/"
                onClick={handleLogoClick}
                className="flex items-center space-x-2 lg:space-x-3 group cursor-pointer"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-1.5 lg:p-2 rounded-lg lg:rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                  <div className="w-4 h-4 lg:w-6 lg:h-6 bg-black rounded-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-yellow-400 rounded-full" />
                  </div>
                </div>

                {/* VERSIÓN DESKTOP - Texto en una línea */}
                <div className="hidden lg:flex flex-col">
                  <span className="text-lg lg:text-xl font-bold font-bodoni bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent leading-tight">
                    GOLDEN NAILS
                  </span>
                  <span className="text-[10px] lg:text-xs text-gray-400 font-dancing italic">
                    Descubre tu mejor versión
                  </span>
                </div>

                {/* VERSIÓN MÓVIL - Texto en dos líneas y más pequeño */}
                <div className="lg:hidden flex flex-col items-start ml-2">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-sm font-bold font-bodoni bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                      GOLDEN
                    </span>
                    <span className="text-[11px] font-bold font-bodoni bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                      -NAILS-
                    </span>
                  </div>
                  <span className="text-[8px] text-gray-400 font-dancing italic mt-0.5">
                    Descubre tu mejor versión
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation - CENTRADO */}
            <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
              <div className="flex items-center space-x-1">
                {/* Inicio */}
                <a
                  href="/"
                  onClick={handleInicioClick}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Inicio</span>
                </a>

                {/* ✅ Empleados Dropdown - Solo Admin, Gerente y Supervisor */}
                <HideIfUnauthorized
                  userRole={userRole}
                  allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                >
                  <div className="relative">
                    <button
                      onClick={() => {
                        setEmpleadosOpen(!empleadosOpen);
                        setCitasOpen(false);
                        setVentasOpen(false);
                        setGastosOpen(false);
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <Users className="w-4 h-4" />
                      <span>Empleados</span>
                      <div className={`transform transition-transform ${empleadosOpen ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {empleadosOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden">
                        <div className="p-2">
                          {/* ✅ Nuevo Empleado - Solo Admin y Gerente */}
                          <HideIfUnauthorized
                            userRole={userRole}
                            allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
                          >
                            <Link
                              to="/NuevoEmpleados"
                              onClick={() => setEmpleadosOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-yellow-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Nuevo Empleado</div>
                                <div className="text-xs text-gray-400">Registrar nuevo staff</div>
                              </div>
                            </Link>
                          </HideIfUnauthorized>

                          {/* ✅ Gestión Empleado - Solo Admin y Gerente */}
                          <HideIfUnauthorized
                            userRole={userRole}
                            allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
                          >
                            <Link
                              to="/GestionEmpleados"
                              onClick={() => setEmpleadosOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Gestión Empleado</div>
                                <div className="text-xs text-gray-400">Administrar equipo</div>
                              </div>
                            </Link>
                          </HideIfUnauthorized>

                          {/* ✅ Comisiones - Solo Admin, Gerente y Supervisor */}
                          <HideIfUnauthorized
                            userRole={userRole}
                            allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                          >
                            <Link
                              to="/ComisionDetalles"
                              onClick={() => setEmpleadosOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Comisiones</div>
                                <div className="text-xs text-gray-400">Gestión de pagos</div>
                              </div>
                            </Link>
                          </HideIfUnauthorized>

                          {/* ✅ Asistencias - Solo Admin, Gerente y Supervisor */}
                          <HideIfUnauthorized
                            userRole={userRole}
                            allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                          >
                            <Link
                              to="/Asistencias"
                              onClick={() => setEmpleadosOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Asistencias</div>
                                <div className="text-xs text-gray-400">Control horario</div>
                              </div>
                            </Link>
                          </HideIfUnauthorized>
                        </div>
                      </div>
                    )}
                  </div>
                </HideIfUnauthorized>

                {/* Citas Dropdown - Todos los usuarios autenticados */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setCitasOpen(!citasOpen);
                      setEmpleadosOpen(false);
                      setVentasOpen(false);
                      setGastosOpen(false);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Citas</span>
                    <div className={`transform transition-transform ${citasOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {citasOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden">
                      <div className="p-2">
                        <Link
                          to="/citas"
                          onClick={() => setCitasOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Agenda</div>
                            <div className="text-xs text-gray-400">Calendario de citas</div>
                          </div>
                        </Link>
                        <HideIfUnauthorized
                          userRole={userRole}
                          allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                        >
                          <Link
                            to="/citas/Historial"
                            onClick={() => setCitasOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                              <History className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Historial</div>
                              <div className="text-xs text-gray-400">Citas anteriores</div>
                            </div>
                          </Link>
                        </HideIfUnauthorized>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ventas Dropdown - Todos los usuarios autenticados */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setVentasOpen(!ventasOpen);
                      setEmpleadosOpen(false);
                      setCitasOpen(false);
                      setGastosOpen(false);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Ventas</span>
                    <div className={`transform transition-transform ${ventasOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {ventasOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden">
                      <div className="p-2">
                        <Link
                          to="/Ventas"
                          onClick={() => setVentasOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Ventas</div>
                            <div className="text-xs text-gray-400">Registro de ventas</div>
                          </div>
                        </Link>

                        {/* ✅ Gestión Ventas - Solo Admin, Gerente y Supervisor */}
                        <HideIfUnauthorized
                          userRole={userRole}
                          allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                        >
                          <Link
                            to="/Ventas/GestionVentas"
                            onClick={() => setVentasOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Gestión Ventas</div>
                              <div className="text-xs text-gray-400">Administrar ventas</div>
                            </div>
                          </Link>
                        </HideIfUnauthorized>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Gastos Dropdown - Solo Admin, Gerente y Supervisor */}
                <HideIfUnauthorized
                  userRole={userRole}
                  allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                >
                  <div className="relative">
                    <button
                      onClick={() => {
                        setGastosOpen(!gastosOpen);
                        setEmpleadosOpen(false);
                        setCitasOpen(false);
                        setVentasOpen(false);
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Gastos</span>
                      <div className={`transform transition-transform ${gastosOpen ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {gastosOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden">
                        <div className="p-2">
                          <Link
                            to="/gastos"
                            onClick={() => setGastosOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                              <TrendingDown className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Nuevo Gasto</div>
                              <div className="text-xs text-gray-400">Registrar gasto</div>
                            </div>
                          </Link>
                          <Link
                            to="/gastos/GestionGastos"
                            onClick={() => setGastosOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Gestión Gastos</div>
                              <div className="text-xs text-gray-400">Administrar gastos</div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </HideIfUnauthorized>

                {/* ✅ Reportes - Solo Admin y Gerente */}
                <HideIfUnauthorized
                  userRole={userRole}
                  allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
                >
                  <Link
                    to="/reportes"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Reportes</span>
                  </Link>
                </HideIfUnauthorized>
              </div>
            </div>

            {/* User Section - COMPLETAMENTE A LA DERECHA */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Menú de Usuario - Desktop */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setEmpleadosOpen(false);
                    setCitasOpen(false);
                    setVentasOpen(false);
                    setGastosOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="font-medium">
                    {usuario?.nombre || usuario?.usuario || "Usuario"}
                  </span>
                  {/* ✅ Mostrar badge del rol */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${userRole === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    userRole === ROLES.GERENTE ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      userRole === ROLES.SUPERVISOR ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                    {userRole}
                  </span>
                  <div className={`transform transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden">
                    <div className="p-2">
                      {/* Información del usuario */}
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <div className="font-medium text-white">
                          {usuario?.nombre || "Usuario"} {usuario?.apellido || ""}
                        </div>
                        <div className="text-sm text-gray-400">
                          {usuario?.correo || "usuario@goldennails.com"}
                        </div>
                        <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${userRole === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-400' :
                          userRole === ROLES.GERENTE ? 'bg-blue-500/20 text-blue-400' :
                            userRole === ROLES.SUPERVISOR ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                          }`}>
                          {userRole}
                        </div>
                      </div>

                      {/* Opciones del menú */}
                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Mi Perfil</div>
                          <div className="text-xs text-gray-400">Configurar cuenta</div>
                        </div>
                      </Link>

                      {/* Separador */}
                      <div className="border-t border-gray-700/50 my-2"></div>

                      {/* Botón de Cerrar Sesión */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group w-full text-left"
                      >
                        <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Cerrar Sesión</div>
                          <div className="text-xs text-red-400/70">Salir del sistema</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Versión móvil simplificada del usuario */}
              <div className="flex lg:hidden items-center space-x-2 text-sm text-gray-400">
                <User className="w-4 h-4 text-blue-400" />
                <span>{usuario?.nombre || usuario?.usuario || "Usuario"}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${userRole === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-400' :
                  userRole === ROLES.GERENTE ? 'bg-blue-500/20 text-blue-400' :
                    userRole === ROLES.SUPERVISOR ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                  }`}>
                  {userRole}
                </span>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden fixed top-14 left-0 right-0 bottom-0 bg-gray-900 transform transition-all duration-300 ease-in-out z-40 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
          <div className="px-4 py-6 space-y-4">
            {/* Inicio */}
            <a
              href="/"
              onClick={handleInicioClick}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 text-lg cursor-pointer"
            >
              <Home className="w-5 h-5" />
              <span>Inicio</span>
            </a>

            {/* Empleados - Solo Admin, Gerente y Supervisor */}
            <HideIfUnauthorized
              userRole={userRole}
              allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
            >
              <div className="space-y-2">
                <div className="px-4 py-2 text-gray-400 text-sm font-medium">Empleados</div>

                <HideIfUnauthorized
                  userRole={userRole}
                  allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
                >
                  <Link
                    to="/NuevoEmpleados"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <Users className="w-5 h-5" />
                    <span>Nuevo Empleado</span>
                  </Link>
                </HideIfUnauthorized>

                <HideIfUnauthorized
                  userRole={userRole}
                  allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
                >
                  <Link
                    to="/GestionEmpleados"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <Users className="w-5 h-5" />
                    <span>Gestión Empleado</span>
                  </Link>
                </HideIfUnauthorized>

                <HideIfUnauthorized
                  userRole={userRole}
                  allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                >
                  <Link
                    to="/ComisionDetalles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Comisiones</span>
                  </Link>
                </HideIfUnauthorized>

                <HideIfUnauthorized
                  userRole={userRole}
                  allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                >
                  <Link
                    to="/Asistencias"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Asistencias</span>
                  </Link>
                </HideIfUnauthorized>
              </div>
            </HideIfUnauthorized>

            {/* Citas */}
            <div className="space-y-2">
              <div className="px-4 py-2 text-gray-400 text-sm font-medium">Citas</div>

              <Link
                to="/citas"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
              >
                <Calendar className="w-5 h-5" />
                <span>Agenda</span>
              </Link>

              <HideIfUnauthorized
                userRole={userRole}
                allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
              >
                <Link
                  to="/citas/Historial"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                >
                  <History className="w-5 h-5" />
                  <span>Historial</span>
                </Link>
              </HideIfUnauthorized>
            </div>

            {/* Ventas */}
            <div className="space-y-2">
              <div className="px-4 py-2 text-gray-400 text-sm font-medium">Ventas</div>

              <Link
                to="/Ventas"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Ventas</span>
              </Link>

              <HideIfUnauthorized
                userRole={userRole}
                allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
              >
                <Link
                  to="/Ventas/GestionVentas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Gestión Ventas</span>
                </Link>
              </HideIfUnauthorized>
            </div>

            {/* Gastos - Solo Admin, Gerente y Supervisor */}
            <HideIfUnauthorized
              userRole={userRole}
              allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
            >
              <div className="space-y-2">
                <div className="px-4 py-2 text-gray-400 text-sm font-medium">Gastos</div>

                <Link
                  to="/gastos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>Nuevo Gasto</span>
                </Link>

                <Link
                  to="/gastos/GestionGastos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Gestión Gastos</span>
                </Link>
              </div>
            </HideIfUnauthorized>

            {/* Reportes - Solo Admin y Gerente */}
            <HideIfUnauthorized
              userRole={userRole}
              allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
            >
              <div className="space-y-2">
                <div className="px-4 py-2 text-gray-400 text-sm font-medium">Reportes</div>

                <Link
                  to="/reportes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Reportes</span>
                </Link>
              </div>
            </HideIfUnauthorized>

            {/* Perfil */}
            <div className="pt-4 border-t border-gray-700">
              <Link
                to="/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
              >
                <User className="w-5 h-5" />
                <span>Mi Perfil</span>
              </Link>
            </div>

            {/* Botón de Cerrar Sesión en Mobile */}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MenuPrincipal;