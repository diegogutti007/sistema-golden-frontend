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
  Activity,
  TrendingDown,
  LogOut,
  BarChart3,
  History,
  Wallet,
  Target,
  ChevronDown,
  PanelLeft,
  Briefcase,
  Clock,
  CheckSquare,
  FileText,
  PieChart,
  CreditCard,
  Gift,
  Settings,
  Bell,
  Shield,
  Star,
  Award,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Percent,
  Calculator,
  FolderOpen,
  Layers,
  Timer,
  MapPin
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useInactivity } from "../hooks/useInactivity";
import logo from "../logo.png";

const BREAKPOINTS = {
  MOBILE: 768,
  TABLET_LANDSCAPE: 1024,
  LAPTOP: 1280,
};

const HideIfUnauthorized = ({ children, allowedRoles = [], userRole }) => {
  if (!allowedRoles.includes(userRole)) return null;
  return children;
};

const SubmenuItem = ({ to, onClick, icon: Icon, title, description, iconBg, iconColor }) => {
  const defaultIconBg = iconBg || "bg-gray-700/50";
  const defaultIconColor = iconColor || "text-gray-300";
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200 group"
    >
      <div className={`w-8 h-8 ${defaultIconBg} rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105`}>
        <Icon className={`w-4 h-4 ${defaultIconColor} transition-colors group-hover:text-yellow-400`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-sm">{title}</div>
        <div className="text-xs text-gray-400 truncate">{description}</div>
      </div>
    </Link>
  );
};

const MenuPrincipal = ({ onLogout, usuario, onToggleSecondaryMenu }) => {
  const [empleadosOpen, setEmpleadosOpen] = useState(false);
  const [citasOpen, setCitasOpen] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(false);
  const [gastosOpen, setGastosOpen] = useState(false);
  const [horariosOpen, setHorariosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const wrapperRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleUserActivity } = useInactivity(20);

  const ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    SUPERVISOR: 'supervisor',
    EMPLEADO: 'empleado'
  };

  const userRole = usuario?.rol || ROLES.EMPLEADO;

  // Función para obtener el texto del rol en español
  const getRoleText = () => {
    switch(userRole) {
      case ROLES.ADMIN: return 'Administrador';
      case ROLES.GERENTE: return 'Gerente';
      case ROLES.SUPERVISOR: return 'Supervisor';
      case ROLES.EMPLEADO: return 'Empleado';
      default: return userRole;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (newWidth >= BREAKPOINTS.LAPTOP && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      if (newWidth < BREAKPOINTS.LAPTOP) {
        setEmpleadosOpen(false);
        setCitasOpen(false);
        setVentasOpen(false);
        setGastosOpen(false);
        setHorariosOpen(false);
        setUserMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current || !wrapperRef.current.contains(e.target)) {
        setEmpleadosOpen(false);
        setCitasOpen(false);
        setVentasOpen(false);
        setGastosOpen(false);
        setHorariosOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleInicioClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleToggleSecondaryMenu = () => {
    if (onToggleSecondaryMenu) {
      onToggleSecondaryMenu();
    }
    handleUserActivity();
  };

  if (!isAuthenticated) return null;

  const isMobile = windowWidth < BREAKPOINTS.MOBILE;
  const isTablet = windowWidth >= BREAKPOINTS.MOBILE && windowWidth < BREAKPOINTS.LAPTOP;
  const isLaptop = windowWidth >= BREAKPOINTS.LAPTOP;
  const shouldUseMobileMenu = isMobile || isTablet;
  const shouldUseDesktopMenu = isLaptop;
  const navbarHeight = isMobile ? 'h-14' : 'h-16';

  // Configuración de colores por módulo
  const moduleColors = {
    empleados: { bg: "bg-blue-500/10", icon: "text-blue-400", hover: "hover:bg-blue-500/20" },
    citas: { bg: "bg-purple-500/10", icon: "text-purple-400", hover: "hover:bg-purple-500/20" },
    ventas: { bg: "bg-green-500/10", icon: "text-green-400", hover: "hover:bg-green-500/20" },
    gastos: { bg: "bg-red-500/10", icon: "text-red-400", hover: "hover:bg-red-500/20" },
    horarios: { bg: "bg-teal-500/10", icon: "text-teal-400", hover: "hover:bg-teal-500/20" },
    perfil: { bg: "bg-indigo-500/10", icon: "text-indigo-400", hover: "hover:bg-indigo-500/20" }
  };

  // Obtener nombre completo del usuario
  const nombreCompleto = `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim();
  const primerNombre = nombreCompleto.split(' ')[0] || usuario?.usuario || "Usuario";

  // Colores para el badge de rol
  const getRoleBadgeColor = () => {
    switch(userRole) {
      case ROLES.ADMIN: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case ROLES.GERENTE: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case ROLES.SUPERVISOR: return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      {mobileMenuOpen && shouldUseMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav
        ref={wrapperRef}
        className="bg-gradient-to-r from-gray-900 via-gray-900 to-black border-b border-yellow-500/20 shadow-2xl w-full fixed top-0 left-0 right-0 z-50"
        onClick={handleUserActivity}
      >
        <div className={`mx-auto ${isMobile ? 'px-3' : isTablet ? 'px-6' : 'max-w-7xl px-8'}`}>
          <div className={`flex justify-between items-center ${navbarHeight}`}>
            {/* Logo */}
            <div className="flex-shrink-0">
              <a
                href="/"
                onClick={handleLogoClick}
                className="flex items-center space-x-2 group cursor-pointer"
              >
                <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} relative rounded-full overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-200`}>
                  <img src={logo} alt="Golden Nails Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent pointer-events-none" />
                </div>
              </a>
            </div>

            {/* Botón Panel Left para móvil/tablet */}
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

            {/* Desktop Navigation */}
            {shouldUseDesktopMenu && (
              <div className="flex items-center justify-center flex-1 mx-8">
                <div className="flex items-center space-x-1">
                  <a
                    href="/"
                    onClick={handleInicioClick}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-sm">Inicio</span>
                  </a>

                  {/* Empleados Dropdown */}
                  <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setEmpleadosOpen(!empleadosOpen);
                          setCitasOpen(false);
                          setVentasOpen(false);
                          setGastosOpen(false);
                          setHorariosOpen(false);
                          setUserMenuOpen(false);
                          handleUserActivity();
                        }}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Empleados</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${empleadosOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {empleadosOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                          <div className="p-2">
                            <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.GERENTE]}>
                              <SubmenuItem
                                to="/NuevoEmpleados"
                                onClick={() => setEmpleadosOpen(false)}
                                icon={User}
                                iconBg={moduleColors.empleados.bg}
                                iconColor={moduleColors.empleados.icon}
                                title="Nuevo Empleado"
                                description="Registrar nuevo staff"
                              />
                              <SubmenuItem
                                to="/ListaEmpleado"
                                onClick={() => setEmpleadosOpen(false)}
                                icon={Users}
                                iconBg={moduleColors.empleados.bg}
                                iconColor={moduleColors.empleados.icon}
                                title="Gestión Empleado"
                                description="Administrar equipo"
                              />
                            </HideIfUnauthorized>
                            <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                              <SubmenuItem
                                to="/ComisionDetalles"
                                onClick={() => setEmpleadosOpen(false)}
                                icon={Percent}
                                iconBg="bg-green-500/10"
                                iconColor="text-green-400"
                                title="Comisiones"
                                description="Gestión de pagos"
                              />
                            </HideIfUnauthorized>
                          </div>
                        </div>
                      )}
                    </div>
                  </HideIfUnauthorized>

                  {/* Horarios Dropdown */}
                  <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setHorariosOpen(!horariosOpen);
                          setEmpleadosOpen(false);
                          setCitasOpen(false);
                          setVentasOpen(false);
                          setGastosOpen(false);
                          setUserMenuOpen(false);
                          handleUserActivity();
                        }}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                      >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Horarios</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${horariosOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {horariosOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                          <div className="p-2">
                            <SubmenuItem
                              to="/GestionHorariosSemanales"
                              onClick={() => setHorariosOpen(false)}
                              icon={Calendar}
                              iconBg={moduleColors.horarios.bg}
                              iconColor={moduleColors.horarios.icon}
                              title="Gestión Horarios"
                              description="Administrar horarios semanales"
                            />
                            <SubmenuItem
                              to="/Asistencias"
                              onClick={() => setHorariosOpen(false)}
                              icon={CheckSquare}
                              iconBg="bg-teal-500/10"
                              iconColor="text-teal-400"
                              title="Asistencias"
                              description="Control horario"
                            />
                            <SubmenuItem
                              to="/MarcacionEmpleados"
                              onClick={() => setHorariosOpen(false)}
                              icon={Timer}
                              iconBg="bg-orange-500/10"
                              iconColor="text-orange-400"
                              title="Marcación"
                              description="Registro de entrada"
                            />
                            <SubmenuItem
                              to="/Horarios"
                              onClick={() => setHorariosOpen(false)}
                              icon={Calendar}
                              iconBg="bg-purple-500/10"
                              iconColor="text-purple-400"
                              title="Configurar Turnos"
                              description="Definir horarios"
                            />
                            <SubmenuItem
                              to="/PanelAsistencia"
                              onClick={() => setHorariosOpen(false)}
                              icon={BarChart3}
                              iconBg="bg-blue-500/10"
                              iconColor="text-blue-400"
                              title="Panel Asistencia"
                              description="Reporte de asistencia"
                            />
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
                        setHorariosOpen(false);
                        setVentasOpen(false);
                        setGastosOpen(false);
                        setUserMenuOpen(false);
                        handleUserActivity();
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Citas</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${citasOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {citasOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                        <div className="p-2">
                          <SubmenuItem
                            to="/citas"
                            onClick={() => setCitasOpen(false)}
                            icon={Calendar}
                            iconBg={moduleColors.citas.bg}
                            iconColor={moduleColors.citas.icon}
                            title="Agenda"
                            description="Calendario de citas"
                          />
                          <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
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
                        setHorariosOpen(false);
                        setCitasOpen(false);
                        setGastosOpen(false);
                        setUserMenuOpen(false);
                        handleUserActivity();
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Ventas</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${ventasOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {ventasOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                        <div className="p-2">
                          <SubmenuItem
                            to="/Ventas"
                            onClick={() => setVentasOpen(false)}
                            icon={ShoppingCart}
                            iconBg={moduleColors.ventas.bg}
                            iconColor={moduleColors.ventas.icon}
                            title="Ventas"
                            description="Registro de ventas"
                          />
                          <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                            <SubmenuItem
                              to="/Ventas/GestionVentas"
                              onClick={() => setVentasOpen(false)}
                              icon={CreditCard}
                              iconBg="bg-cyan-500/10"
                              iconColor="text-cyan-400"
                              title="Gestión Ventas"
                              description="Administrar ventas"
                            />
                            <SubmenuItem
                              to="/Ventas/CierreCaja"
                              onClick={() => setVentasOpen(false)}
                              icon={Wallet}
                              iconBg="bg-yellow-500/10"
                              iconColor="text-yellow-400"
                              title="Cierre de Caja"
                              description="Cierre diario"
                            />
                          </HideIfUnauthorized>
                          <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.GERENTE]}>
                            <SubmenuItem
                              to="/Ventas/EstadoResultados"
                              onClick={() => setVentasOpen(false)}
                              icon={TrendingUp}
                              iconBg="bg-emerald-500/10"
                              iconColor="text-emerald-400"
                              title="Estado Resultados"
                              description="Resultados mensuales"
                            />
                            <SubmenuItem
                              to="/Ventas/BalanceGeneral"
                              onClick={() => setVentasOpen(false)}
                              icon={PieChart}
                              iconBg="bg-indigo-500/10"
                              iconColor="text-indigo-400"
                              title="Balance General"
                              description="Balance general"
                            />
                            <SubmenuItem
                              to="/Ventas/FlujoEfectivo"
                              onClick={() => setVentasOpen(false)}
                              icon={Calculator}
                              iconBg="bg-blue-500/10"
                              iconColor="text-blue-400"
                              title="Flujo Efectivo"
                              description="Flujo de efectivo"
                            />
                          </HideIfUnauthorized>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gastos Dropdown */}
                  <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setGastosOpen(!gastosOpen);
                          setEmpleadosOpen(false);
                          setHorariosOpen(false);
                          setCitasOpen(false);
                          setVentasOpen(false);
                          setUserMenuOpen(false);
                          handleUserActivity();
                        }}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group"
                      >
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm">Gastos</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${gastosOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {gastosOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                          <div className="p-2">
                            <SubmenuItem
                              to="/gastos"
                              onClick={() => setGastosOpen(false)}
                              icon={AlertTriangle}
                              iconBg={moduleColors.gastos.bg}
                              iconColor={moduleColors.gastos.icon}
                              title="Nuevo Gasto"
                              description="Registrar gasto"
                            />
                            <SubmenuItem
                              to="/gastos/GestionGastos"
                              onClick={() => setGastosOpen(false)}
                              icon={FolderOpen}
                              iconBg="bg-red-500/10"
                              iconColor="text-red-400"
                              title="Gestión Gastos"
                              description="Administrar gastos"
                            />
                            <SubmenuItem
                              to="/gastos/PresupuestosGastos"
                              onClick={() => setGastosOpen(false)}
                              icon={Target}
                              iconBg="bg-amber-500/10"
                              iconColor="text-amber-400"
                              title="Presupuestos"
                              description="Gestionar presupuestos"
                            />
                            <SubmenuItem
                              to="/gastos/DashboardGastos"
                              onClick={() => setGastosOpen(false)}
                              icon={PieChart}
                              iconBg="bg-green-500/10"
                              iconColor="text-green-400"
                              title="Dashboard Gastos"
                              description="Resumen de gastos"
                            />
                            <SubmenuItem
                              to="/gastos/DashboardPagosPersonal"
                              onClick={() => setGastosOpen(false)}
                              icon={Users}
                              iconBg="bg-purple-500/10"
                              iconColor="text-purple-400"
                              title="Dashboard Pagos"
                              description="Resumen de pagos"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </HideIfUnauthorized>
                </div>
              </div>
            )}

            {/* User Section - Cargo alineado a la derecha */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {shouldUseDesktopMenu && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setEmpleadosOpen(false);
                      setHorariosOpen(false);
                      setCitasOpen(false);
                      setVentasOpen(false);
                      setGastosOpen(false);
                      handleUserActivity();
                    }}
                    className="flex items-center justify-between space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200 group min-w-[220px]"
                  >
                    {/* Parte izquierda: Avatar + Nombre */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-yellow-500/30">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">
                          {nombreCompleto || usuario?.usuario || "Usuario"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Parte derecha: Badge de cargo + Chevron */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium border ${getRoleBadgeColor()}`}>
                        {getRoleText()}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-yellow-500/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                      <div className="p-2">
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <div className="font-medium text-white">
                            {nombreCompleto || "Usuario"}
                          </div>
                          <div className="text-xs text-gray-400 truncate mt-1">
                            {usuario?.correo || "usuario@goldennails.com"}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Shield className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-500 capitalize">{getRoleText()}</span>
                          </div>
                        </div>
                        <SubmenuItem
                          to="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          icon={Settings}
                          iconBg={moduleColors.perfil.bg}
                          iconColor={moduleColors.perfil.icon}
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

              {/* Información usuario para móvil/tablet */}
              {shouldUseMobileMenu && (
                <div className="flex items-center space-x-2 text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <User className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-400`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium truncate max-w-[100px]`}>
                      {primerNombre}
                    </span>
                    <span className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} capitalize ${
                      userRole === ROLES.ADMIN ? 'text-purple-400' :
                      userRole === ROLES.GERENTE ? 'text-blue-400' :
                      userRole === ROLES.SUPERVISOR ? 'text-green-400' :
                      'text-gray-400'
                    }`}>
                      {getRoleText()}
                    </span>
                  </div>
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

        {/* Mobile & Tablet Menu */}
        {shouldUseMobileMenu && (
          <div
            ref={mobileMenuRef}
            className={`fixed left-0 right-0 bottom-0 bg-gradient-to-b from-gray-900 to-black transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              height: `calc(100vh - ${isMobile ? '3.5rem' : '4rem'})`,
              top: isMobile ? '3.5rem' : '4rem',
            }}
          >
            <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6'} space-y-4 pb-8`}>
              {/* Inicio */}
              <a
                href="/"
                onClick={(e) => {
                  handleInicioClick(e);
                  setMobileMenuOpen(false);
                  handleUserActivity();
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-200 cursor-pointer"
              >
                <Home className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                <div>
                  <div className="font-semibold">Inicio</div>
                  <div className="text-xs text-gray-400">Panel principal</div>
                </div>
              </a>

              {/* Horarios */}
              <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Gestión de Horarios</span>
                  </div>
                  <div className="space-y-1 pl-4">
                    <Link
                      to="/GestionHorariosSemanales"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-400`} />
                      <span>Gestión Horarios</span>
                    </Link>
                    <Link
                      to="/Asistencias"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <CheckSquare className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-teal-400`} />
                      <span>Asistencias</span>
                    </Link>
                    <Link
                      to="/MarcacionEmpleados"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Timer className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-orange-400`} />
                      <span>Marcación</span>
                    </Link>
                    <Link
                      to="/Horarios"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-400`} />
                      <span>Configurar Turnos</span>
                    </Link>
                    <Link
                      to="/PanelAsistencia"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <BarChart3 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                      <span>Panel Asistencia</span>
                    </Link>
                  </div>
                </div>
              </HideIfUnauthorized>

              {/* Empleados */}
              <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                    <Users className="w-4 h-4" />
                    <span>Gestión de Personal</span>
                  </div>
                  <div className="space-y-1 pl-4">
                    <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.GERENTE]}>
                      <Link
                        to="/NuevoEmpleados"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                      >
                        <User className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                        <span>Nuevo Empleado</span>
                      </Link>
                      <Link
                        to="/ListaEmpleado"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                      >
                        <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                        <span>Gestión Empleado</span>
                      </Link>
                    </HideIfUnauthorized>
                    <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                      <Link
                        to="/ComisionDetalles"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                      >
                        <Percent className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-400`} />
                        <span>Comisiones</span>
                      </Link>
                    </HideIfUnauthorized>
                  </div>
                </div>
              </HideIfUnauthorized>

              {/* Citas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Gestión de Citas</span>
                </div>
                <div className="space-y-1 pl-4">
                  <Link
                    to="/citas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-400`} />
                    <span>Agenda</span>
                  </Link>
                  <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                    <Link
                      to="/citas/Historial"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <History className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                      <span>Historial</span>
                    </Link>
                  </HideIfUnauthorized>
                </div>
              </div>

              {/* Ventas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  <span>Gestión de Ventas</span>
                </div>
                <div className="space-y-1 pl-4">
                  <Link
                    to="/Ventas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                  >
                    <ShoppingCart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-400`} />
                    <span>Ventas</span>
                  </Link>
                  <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                    <Link
                      to="/Ventas/GestionVentas"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <CreditCard className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-cyan-400`} />
                      <span>Gestión Ventas</span>
                    </Link>
                    <Link
                      to="/Ventas/CierreCaja"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Wallet className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400`} />
                      <span>Cierre de Caja</span>
                    </Link>
                  </HideIfUnauthorized>
                  <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.GERENTE]}>
                    <Link
                      to="/Ventas/EstadoResultados"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-400`} />
                      <span>Estado de Resultados</span>
                    </Link>
                    <Link
                      to="/Ventas/BalanceGeneral"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <PieChart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-indigo-400`} />
                      <span>Balance General</span>
                    </Link>
                    <Link
                      to="/Ventas/FlujoEfectivo"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Calculator className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                      <span>Flujo de Efectivo</span>
                    </Link>
                  </HideIfUnauthorized>
                </div>
              </div>

              {/* Gastos */}
              <HideIfUnauthorized userRole={userRole} allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4" />
                    <span>Gestión de Gastos</span>
                  </div>
                  <div className="space-y-1 pl-4">
                    <Link
                      to="/gastos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-400`} />
                      <span>Nuevo Gasto</span>
                    </Link>
                    <Link
                      to="/gastos/GestionGastos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <FolderOpen className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-400`} />
                      <span>Gestión Gastos</span>
                    </Link>
                    <Link
                      to="/gastos/PresupuestosGastos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Target className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-amber-400`} />
                      <span>Presupuestos Gastos</span>
                    </Link>
                    <Link
                      to="/gastos/DashboardGastos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <PieChart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-400`} />
                      <span>Dashboard Gastos</span>
                    </Link>
                    <Link
                      to="/gastos/DashboardPagosPersonal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-400`} />
                      <span>Dashboard Pagos Personal</span>
                    </Link>
                  </div>
                </div>
              </HideIfUnauthorized>

              {/* Perfil */}
              <div className="pt-4 border-t border-gray-700">
                <Link
                  to="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-200"
                >
                  <Settings className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-indigo-400`} />
                  <div>
                    <div className="font-medium">Mi Perfil</div>
                    <div className="text-xs text-gray-400">Configura tu cuenta</div>
                  </div>
                </Link>
              </div>

              {/* Cerrar Sesión */}
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
                >
                  <LogOut className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  <div>
                    <div className="font-medium">Cerrar Sesión</div>
                    <div className="text-xs text-red-400/70">Salir del sistema</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
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
      `}</style>
    </>
  );
};

export default MenuPrincipal;