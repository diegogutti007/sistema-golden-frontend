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
  BarChart3,
  History,
  ChevronDown,
  PanelLeft // <-- AÑADIDO
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useInactivity } from "../hooks/useInactivity";

// Importar el logo
import logo from "../logo.png";

// ✅ Breakpoints optimizados
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET_LANDSCAPE: 1024,
  LAPTOP: 1280,
};

// ✅ COMPONENTE PARA OCULTAR ELEMENTOS SEGÚN ROL
const HideIfUnauthorized = ({ children, allowedRoles = [], userRole }) => {
  if (!allowedRoles.includes(userRole)) {
    return null;
  }
  return children;
};

// ✅ COMPONENTE DE ITEM DE SUBMENU
const SubmenuItem = ({ to, onClick, icon: Icon, title, description, iconBg = "bg-yellow-500/10", iconColor = "text-yellow-400" }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
  >
    <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-medium truncate">{title}</div>
      <div className="text-xs text-gray-400 truncate">{description}</div>
    </div>
  </Link>
);

const MenuPrincipal = ({ onLogout, usuario, onToggleSecondaryMenu }) => {
  const [empleadosOpen, setEmpleadosOpen] = useState(false);
  const [citasOpen, setCitasOpen] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(false);
  const [gastosOpen, setGastosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ USAR HOOK DE INACTIVIDAD
  const { handleUserActivity } = useInactivity(20);

  // ✅ DEFINIR ROLES
  const ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    SUPERVISOR: 'supervisor',
    EMPLEADO: 'empleado'
  };

  // Obtener el rol del usuario
  const userRole = usuario?.rol || ROLES.EMPLEADO;

  // ✅ DETECTAR TAMAÑO DE PANTALLA Y ORIENTACIÓN
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setWindowWidth(newWidth);
      setWindowHeight(newHeight);

      // Cerrar menú móvil cuando se cambia a escritorio
      if (newWidth >= BREAKPOINTS.LAPTOP && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      
      // Cerrar submenús en móvil
      if (newWidth < BREAKPOINTS.LAPTOP) {
        setEmpleadosOpen(false);
        setCitasOpen(false);
        setVentasOpen(false);
        setGastosOpen(false);
        setUserMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // ✅ VERIFICACIÓN DE AUTENTICACIÓN
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');

    if (!token || !usuarioData) {
      setIsAuthenticated(false);
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    } else {
      setIsAuthenticated(true);
      if (location.pathname === '/login') {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  // Cerrar submenus al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current || !wrapperRef.current.contains(e.target)) {
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

  // ✅ FUNCIÓN DE LOGOUT
  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setIsAuthenticated(false);

    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  // ✅ FUNCIONES DE NAVEGACIÓN
  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleInicioClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  // ✅ FUNCIÓN PARA TOGGLE DEL MENÚ SECUNDARIO
  const handleToggleSecondaryMenu = () => {
    if (onToggleSecondaryMenu) {
      onToggleSecondaryMenu();
    }
    handleUserActivity();
  };

  // ✅ SI NO ESTÁ AUTENTICADO, NO RENDERIZAR
  if (!isAuthenticated) return null;

  // ✅ DETERMINAR TIPO DE DISPOSITIVO
  const isMobile = windowWidth < BREAKPOINTS.MOBILE;
  const isTablet = windowWidth >= BREAKPOINTS.MOBILE && windowWidth < BREAKPOINTS.LAPTOP;
  const isLaptop = windowWidth >= BREAKPOINTS.LAPTOP;
  
  const shouldUseMobileMenu = isMobile || isTablet;
  const shouldUseDesktopMenu = isLaptop;

  // ✅ Obtener altura del navbar
  const getNavbarHeight = () => {
    if (isMobile) return 'h-14';
    return 'h-16';
  };

  // ✅ Obtener padding superior para contenido
  const getContentPadding = () => {
    if (isMobile) return 'pt-14';
    return 'pt-16';
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && shouldUseMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav
        ref={wrapperRef}
        className="bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/20 shadow-2xl w-full"
        onClick={handleUserActivity}
      >
        <div className={`mx-auto ${
          isMobile ? 'px-3' : 
          isTablet ? 'px-6' : 
          'max-w-7xl px-8'
        }`}>
          <div className={`flex justify-between items-center ${getNavbarHeight()}`}>
            
            {/* ✅ LOGO */}
            <div className="flex-shrink-0">
              <a
                href="/"
                onClick={handleLogoClick}
                className="flex items-center space-x-2 group cursor-pointer"
              >
                <div className={`${
                  isMobile ? 'h-12 w-12' : 
                  'h-14 w-14'
                } relative rounded-full overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-200`}>
                  <img 
                    src={logo} 
                    alt="Golden Nails Logo"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />
                </div>

                {isMobile && windowWidth < 400 && (
                  <div className="flex flex-col ml-2">
                    <span className="text-xs font-bold font-bodoni bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                      GOLDEN NAILS
                    </span>
                    <span className="text-[8px] text-gray-400 font-dancing italic">
                      Tu mejor versión
                    </span>
                  </div>
                )}
              </a>
            </div>

            {/* ✅ BOTÓN PANEL LEFT PARA MOBILE/TABLET */}
            {shouldUseMobileMenu && onToggleSecondaryMenu && (
              <div className="flex items-center mr-2">
                <button
                  onClick={handleToggleSecondaryMenu}
                  className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200"
                  title="Mostrar/Ocultar menú lateral"
                >
                  <PanelLeft className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </button>
              </div>
            )}

            {/* ✅ DESKTOP NAVIGATION */}
            {shouldUseDesktopMenu && (
              <div className="flex items-center justify-center flex-1 mx-8 max-w-3xl">
                <div className="flex items-center space-x-2">
                  {/* Inicio */}
                  <a
                    href="/"
                    onClick={handleInicioClick}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    <span>Inicio</span>
                  </a>

                  {/* Empleados Dropdown */}
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
                          handleUserActivity();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                      >
                        <Users className="w-4 h-4" />
                        <span>Empleados</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${empleadosOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {empleadosOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden animate-fadeIn">
                          <div className="p-2">
                            <HideIfUnauthorized
                              userRole={userRole}
                              allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
                            >
                              <SubmenuItem
                                to="/NuevoEmpleados"
                                onClick={() => setEmpleadosOpen(false)}
                                icon={Users}
                                title="Nuevo Empleado"
                                description="Registrar nuevo staff"
                              />
                              <SubmenuItem
                                to="/GestionEmpleados"
                                onClick={() => setEmpleadosOpen(false)}
                                icon={Users}
                                iconBg="bg-blue-500/10"
                                iconColor="text-blue-400"
                                title="Gestión Empleado"
                                description="Administrar equipo"
                              />
                            </HideIfUnauthorized>
                            <HideIfUnauthorized
                              userRole={userRole}
                              allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                            >
                              <SubmenuItem
                                to="/ComisionDetalles"
                                onClick={() => setEmpleadosOpen(false)}
                                icon={DollarSign}
                                iconBg="bg-green-500/10"
                                iconColor="text-green-400"
                                title="Comisiones"
                                description="Gestión de pagos"
                              />
                              <SubmenuItem
                                to="/Asistencias"
                                onClick={() => setEmpleadosOpen(false)}
                                icon={Calendar}
                                iconBg="bg-purple-500/10"
                                iconColor="text-purple-400"
                                title="Asistencias"
                                description="Control horario"
                              />
                            </HideIfUnauthorized>
                          </div>
                        </div>
                      )}
                    </div>
                  </HideIfUnauthorized>

                  {/* Citas Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setCitasOpen(!citasOpen);
                        setEmpleadosOpen(false);
                        setVentasOpen(false);
                        setGastosOpen(false);
                        setUserMenuOpen(false);
                        handleUserActivity();
                      }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Citas</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${citasOpen ? 'rotate-180' : ''}`} />
                    </button>

                      {citasOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden animate-fadeIn">
                          <div className="p-2">
                            <SubmenuItem
                              to="/citas"
                              onClick={() => setCitasOpen(false)}
                              icon={Calendar}
                              title="Agenda"
                              description="Calendario de citas"
                            />
                            <HideIfUnauthorized
                              userRole={userRole}
                              allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                            >
                              <SubmenuItem
                                to="/citas/Historial"
                                onClick={() => setCitasOpen(false)}
                                icon={History}
                                iconBg="bg-blue-500/10"
                                iconColor="text-blue-400"
                                title="Historial"
                                description="Citas anteriores"
                              />
                            </HideIfUnauthorized>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Ventas Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setVentasOpen(!ventasOpen);
                        setEmpleadosOpen(false);
                        setCitasOpen(false);
                        setGastosOpen(false);
                        setUserMenuOpen(false);
                        handleUserActivity();
                      }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Ventas</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${ventasOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {ventasOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden animate-fadeIn">
                        <div className="p-2">
                          <SubmenuItem
                            to="/Ventas"
                            onClick={() => setVentasOpen(false)}
                            icon={ShoppingCart}
                            title="Ventas"
                            description="Registro de ventas"
                          />
                          <HideIfUnauthorized
                            userRole={userRole}
                            allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}
                          >
                            <SubmenuItem
                              to="/Ventas/GestionVentas"
                              onClick={() => setVentasOpen(false)}
                              icon={DollarSign}
                              iconBg="bg-green-500/10"
                              iconColor="text-green-400"
                              title="Gestión Ventas"
                              description="Administrar ventas"
                            />
                          </HideIfUnauthorized>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gastos Dropdown */}
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
                          handleUserActivity();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                      >
                        <TrendingDown className="w-4 h-4" />
                        <span>Gastos</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${gastosOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {gastosOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden animate-fadeIn">
                          <div className="p-2">
                            <SubmenuItem
                              to="/gastos"
                              onClick={() => setGastosOpen(false)}
                              icon={TrendingDown}
                              title="Nuevo Gasto"
                              description="Registrar gasto"
                            />
                            <SubmenuItem
                              to="/gastos/GestionGastos"
                              onClick={() => setGastosOpen(false)}
                              icon={DollarSign}
                              iconBg="bg-red-500/10"
                              iconColor="text-red-400"
                              title="Gestión Gastos"
                              description="Administrar gastos"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </HideIfUnauthorized>

                  {/* Reportes */}
                  <HideIfUnauthorized
                    userRole={userRole}
                    allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]}
                  >
                    <Link
                      to="/reportes"
                      onClick={handleUserActivity}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Reportes</span>
                    </Link>
                  </HideIfUnauthorized>
                </div>
              </div>
            )}

            {/* ✅ USER SECTION */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Menú de Usuario - Solo para laptops */}
              {shouldUseDesktopMenu && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setEmpleadosOpen(false);
                      setCitasOpen(false);
                      setVentasOpen(false);
                      setGastosOpen(false);
                      handleUserActivity();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm truncate max-w-[120px]">
                        {usuario?.nombre || usuario?.usuario || "Usuario"}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        userRole === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-400' :
                        userRole === ROLES.GERENTE ? 'bg-blue-500/20 text-blue-400' :
                        userRole === ROLES.SUPERVISOR ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {userRole}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden animate-fadeIn">
                      <div className="p-2">
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <div className="font-medium text-white truncate">
                            {usuario?.nombre || "Usuario"} {usuario?.apellido || ""}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            {usuario?.correo || "usuario@goldennails.com"}
                          </div>
                        </div>
                        <SubmenuItem
                          to="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          icon={User}
                          title="Mi Perfil"
                          description="Configurar cuenta"
                        />
                        <div className="border-t border-gray-700/50 my-2"></div>
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
              )}

              {/* Información del usuario para móvil/tablet */}
              {shouldUseMobileMenu && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <User className={`${
                      isMobile ? 'w-3 h-3' : 'w-4 h-4'
                    } text-blue-400`} />
                    <span className={`${
                      isMobile ? 'text-xs' : 'text-sm'
                    } truncate max-w-[100px]`}>
                      {usuario?.nombre || usuario?.usuario || "Usuario"}
                    </span>
                  </div>
                  <span className={`${
                    isMobile ? 'text-[10px]' : 'text-xs'
                  } px-1.5 py-0.5 rounded-full ${
                    userRole === ROLES.ADMIN ? 'bg-purple-500/20 text-purple-400' :
                    userRole === ROLES.GERENTE ? 'bg-blue-500/20 text-blue-400' :
                    userRole === ROLES.SUPERVISOR ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {userRole}
                  </span>
                </div>
              )}

              {/* Mobile Menu Button */}
              {shouldUseMobileMenu && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(!mobileMenuOpen);
                    handleUserActivity();
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200"
                >
                  {mobileMenuOpen ? (
                    <X className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  ) : (
                    <Menu className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ✅ MOBILE & TABLET MENU */}
        {shouldUseMobileMenu && (
          <div className={`fixed top-${getNavbarHeight().split('-')[1]} left-0 right-0 bottom-0 bg-gray-900 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className={`${
              isMobile ? 'px-4 py-4' : 'px-6 py-6'
            } space-y-${isMobile ? '3' : '4'}`}>
              
              {/* Inicio */}
              <a
                href="/"
                onClick={(e) => {
                  handleInicioClick(e);
                  handleUserActivity();
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer"
              >
                <Home className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>Inicio</span>
              </a>

              {/* Empleados */}
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
                      <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      <span>Nuevo Empleado</span>
                    </Link>
                    <Link
                      to="/GestionEmpleados"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                      <DollarSign className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      <span>Comisiones</span>
                    </Link>
                    <Link
                      to="/Asistencias"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                  <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                    <History className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                  <ShoppingCart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                    <DollarSign className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span>Gestión Ventas</span>
                  </Link>
                </HideIfUnauthorized>
              </div>

              {/* Gastos */}
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
                    <TrendingDown className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span>Nuevo Gasto</span>
                  </Link>
                  <Link
                    to="/gastos/GestionGastos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <DollarSign className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span>Gestión Gastos</span>
                  </Link>
                </div>
              </HideIfUnauthorized>

              {/* Reportes */}
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
                    <BarChart3 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                  <User className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>Mi Perfil</span>
                </Link>
              </div>

              {/* Cerrar Sesión */}
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
                >
                  <LogOut className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

// ✅ AÑADIR ANIMACIONES CSS
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;

// ✅ INYECTAR ESTILOS
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default MenuPrincipal;