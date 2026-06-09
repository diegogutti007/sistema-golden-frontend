import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  BarChart3,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Calendar,
  Box,
  Truck,
  X,
  PieChart,
  DollarSign,
  Clock,
  Tag,
  CreditCard,
  AlertCircle,
  Layers,
  Settings,
  Award,
  Target,
  Zap,
  Heart,
  Sparkles,
  LayoutDashboard,
  Grid3x3,
  Warehouse,
  Gem
} from "lucide-react";

const HideIfUnauthorized = ({ children, allowedRoles = [], userRole }) => {
  if (!allowedRoles.includes(userRole)) return null;
  return children;
};

const MenuSecundario = ({ onClose, isMobile, isOpen, usuario }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredItem, setHoveredItem] = useState(null);

  const ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    SUPERVISOR: 'supervisor',
    EMPLEADO: 'empleado'
  };

  const userRole = usuario?.rol || ROLES.EMPLEADO;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const path = location.pathname;
    if (path.includes('/dashboard')) setActiveSection("Dashboard");
    else if (path.includes('/maestro')) setActiveSection("Maestro");
    else if (path.includes('/inventario')) setActiveSection("Inventario");

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const isDesktop = windowWidth >= 1280;

  const menuItems = [
    {
      titulo: "Dashboard",
      icon: LayoutDashboard,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-600/20 to-transparent",
      sub: [
        {
          nombre: "Ventas",
          ruta: "/dashboard/ventas",
          icon: TrendingUp,
          iconColor: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          description: "Análisis de ventas",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO]
        },
        {
          nombre: "Comisiones",
          ruta: "/dashboard/comisiones",
          icon: Award,
          iconColor: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
          description: "Comisiones del personal",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]
        },
        {
          nombre: "Citas",
          ruta: "/dashboard/citas",
          icon: Calendar,
          iconColor: "text-pink-400",
          bgColor: "bg-pink-500/10",
          description: "Calendario de citas",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO]
        },
        {
          nombre: "Rendimiento",
          ruta: "/dashboard/rendimiento",
          icon: Target,
          iconColor: "text-orange-400",
          bgColor: "bg-orange-500/10",
          description: "Métricas de desempeño",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]
        },
      ],
    },
    {
      titulo: "Maestro",
      icon: Grid3x3,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-600/20 to-transparent",
      sub: [
        {
          nombre: "Productos",
          ruta: "/maestro/productos",
          icon: Package,
          iconColor: "text-cyan-400",
          bgColor: "bg-cyan-500/10",
          description: "Gestión de productos",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO]
        },
        {
          nombre: "Servicios",
          ruta: "/maestro/servicios",
          icon: Sparkles,
          iconColor: "text-purple-400",
          bgColor: "bg-purple-500/10",
          description: "Catálogo de servicios",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO]
        },
        {
          nombre: "Clientes",
          ruta: "/maestro/clientes",
          icon: Heart,
          iconColor: "text-red-400",
          bgColor: "bg-red-500/10",
          description: "Base de clientes",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO]
        },
        {
          nombre: "Categorías",
          ruta: "/maestro/categorias",
          icon: Tag,
          iconColor: "text-indigo-400",
          bgColor: "bg-indigo-500/10",
          description: "Clasificación",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE]
        },
      ],
    },
    {
      titulo: "Inventario",
      icon: Warehouse,
      iconColor: "text-green-400",
      bgColor: "bg-green-500/10",
      gradient: "from-green-600/20 to-transparent",
      sub: [
        {
          nombre: "Stock Actual",
          ruta: "/inventario/stock",
          icon: Package,
          iconColor: "text-green-400",
          bgColor: "bg-green-500/10",
          description: "Control de inventario",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]
        },
        {
          nombre: "Movimientos",
          ruta: "/inventario/movimientos",
          icon: Truck,
          iconColor: "text-blue-400",
          bgColor: "bg-blue-500/10",
          description: "Entradas y salidas",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]
        },
        {
          nombre: "Proveedores",
          ruta: "/inventario/proveedores",
          icon: Truck,
          iconColor: "text-orange-400",
          bgColor: "bg-orange-500/10",
          description: "Gestión de proveedores",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE]
        },
        {
          nombre: "Alertas Stock",
          ruta: "/inventario/alertas",
          icon: AlertCircle,
          iconColor: "text-red-400",
          bgColor: "bg-red-500/10",
          description: "Productos por agotarse",
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR]
        },
      ],
    },
  ];

  const isLinkActive = (ruta) => {
    return location.pathname === ruta;
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleSectionClick = (section) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  const shouldShow = isDesktop || (isMobile && isOpen);

  return (
    <>
      {/* Overlay para móvil/tablet */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Contenido del menú */}
      <aside className={`
        ${isDesktop
          ? 'w-80 fixed top-16 left-0 h-[calc(100vh-64px)] z-30'
          : shouldShow
            ? 'w-80 fixed top-16 left-0 h-[calc(100vh-64px)] z-30 translate-x-0'
            : 'w-80 fixed top-16 left-0 h-[calc(100vh-64px)] z-30 -translate-x-full'
        }
        bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950
        border-r border-yellow-500/20
        transition-transform duration-300 ease-in-out shadow-2xl
        flex flex-col
      `}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}>
        
        {/* Header llamativo */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl" />
          
          <div className="relative p-5 border-b border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-45">
                    <Gem className="w-5 h-5 text-black -rotate-45" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                </div>
                
                <div>
                  <h2 className="text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Golden Panel
                  </h2>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">
                    Control Executive
                  </p>
                </div>
              </div>

              {isMobile && shouldShow && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500/50 to-yellow-500/0" />
          </div>
        </div>

        {/* Navegación principal - con padding bottom para no tapar el footer */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ paddingBottom: '60px' }}>
          {menuItems.map((section, sectionIndex) => {
            const filteredSubItems = section.sub.filter(item =>
              item.allowedRoles.includes(userRole)
            );

            if (filteredSubItems.length === 0) return null;

            const isActive = activeSection === section.titulo;

            return (
              <div key={sectionIndex} className="space-y-2">
                <button
                  onClick={() => handleSectionClick(section.titulo)}
                  onMouseEnter={() => setHoveredItem(section.titulo)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative overflow-hidden group w-full transition-all duration-300
                    ${isActive
                      ? 'bg-gradient-to-r ' + section.gradient
                      : 'hover:bg-gray-800/30'
                    }`}
                >
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                      ? `${section.bgColor} border ${section.iconColor.replace('text', 'border')}/30`
                      : "border border-transparent"
                    }
                    ${hoveredItem === section.titulo ? 'transform translate-x-1' : ''}
                  `}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-xl transition-all duration-200 
                        ${isActive 
                          ? section.bgColor 
                          : 'bg-gray-800/50 group-hover:bg-yellow-500/10'
                        }
                        ${hoveredItem === section.titulo ? 'scale-110' : ''}
                      `}>
                        <section.icon className={`w-4 h-4 ${isActive ? section.iconColor : 'text-gray-500 group-hover:text-yellow-400'}`} />
                      </div>
                      <span className={`font-bold text-sm ${isActive ? section.iconColor : 'text-gray-300 group-hover:text-yellow-400'}`}>
                        {section.titulo}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-all duration-300 
                        ${isActive ? "rotate-90 text-yellow-400" : "text-gray-600 group-hover:text-yellow-400"}
                        ${hoveredItem === section.titulo ? 'translate-x-1' : ''}
                      `}
                    />
                  </div>
                  
                  {hoveredItem === section.titulo && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500 to-yellow-500/0 animate-pulse" style={{ width: '100%' }} />
                  )}
                </button>

                {isActive && (
                  <div className="space-y-1 ml-3 pl-3 border-l-2 border-yellow-500/30 animate-fadeIn">
                    {filteredSubItems.map((item, itemIndex) => {
                      const active = isLinkActive(item.ruta);
                      return (
                        <Link
                          key={itemIndex}
                          to={item.ruta}
                          onClick={handleLinkClick}
                          onMouseEnter={() => setHoveredItem(item.nombre)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group
                            ${active
                              ? "bg-yellow-500/15 border border-yellow-500/30 shadow-lg"
                              : "hover:bg-gray-800/30 border border-transparent"
                            }
                            ${hoveredItem === item.nombre ? 'transform translate-x-2' : ''}
                          `}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200
                            ${active
                              ? `${item.bgColor} shadow-md`
                              : "bg-gray-800/50 group-hover:bg-yellow-500/10"
                            }
                            ${hoveredItem === item.nombre ? 'scale-110' : ''}
                          `}>
                            <item.icon className={`w-3.5 h-3.5 ${active ? item.iconColor : 'text-gray-500 group-hover:text-yellow-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium text-xs ${active ? 'text-yellow-400' : 'text-gray-300 group-hover:text-yellow-400'}`}>
                              {item.nombre}
                            </div>
                            <div className="text-[10px] text-gray-500">{item.description}</div>
                          </div>
                          {active && (
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-glow" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer compacto - No tapa el contenido */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-yellow-500/20 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" />
            <div className="text-[8px] text-gray-500 uppercase tracking-wider font-mono">
              GOLDEN NAILS SPA
            </div>
            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </aside>

      {/* Estilos de animación */}
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
          animation: fadeIn 0.3s ease-out;
        }
        
        .shadow-glow {
          box-shadow: 0 0 8px rgba(234, 179, 8, 0.6);
        }
        
        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.4);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.6);
        }
      `}</style>
    </>
  );
};

export default MenuSecundario;