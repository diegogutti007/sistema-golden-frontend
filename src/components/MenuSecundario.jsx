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
  X
} from "lucide-react";

// ✅ COMPONENTE PARA OCULTAR ELEMENTOS SEGÚN ROL (mismo que en MenuPrincipal)
const HideIfUnauthorized = ({ children, allowedRoles = [], userRole }) => {
  if (!allowedRoles.includes(userRole)) {
    return null;
  }
  return children;
};

const MenuSecundario = ({ onClose, isMobile, isOpen, usuario }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ DEFINIR ROLES (mismo que en MenuPrincipal)
  const ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    SUPERVISOR: 'supervisor',
    EMPLEADO: 'empleado'
  };

  // Obtener el rol del usuario
  const userRole = usuario?.rol || ROLES.EMPLEADO;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Determinar sección activa basada en la ruta
    const path = location.pathname;
    if (path.includes('/dashboard')) setActiveSection("Dashboard");
    else if (path.includes('/ventas')) setActiveSection("Ventas");
    else if (path.includes('/inventario')) setActiveSection("Inventario");

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const isDesktop = windowWidth >= 1280;

  // ✅ Estructura de menú con permisos integrados
  const menuItems = [
    {
      titulo: "Dashboard",
      icon: BarChart3,
      sub: [
        { 
          nombre: "Ventas", 
          ruta: "/dashboard/ventas", 
          icon: TrendingUp,
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO] // Todos pueden ver
        },
        { 
          nombre: "Comisiones", 
          ruta: "/dashboard/comisiones", 
          icon: Users,
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR] // Solo admin, gerente y supervisor
        },
        { 
          nombre: "Citas", 
          ruta: "/dashboard/citas", 
          icon: Calendar,
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO] // Todos pueden ver
        },
      ],
    },
    {
      titulo: "Ventas",
      icon: ShoppingCart,
      sub: [
        { 
          nombre: "Productos", 
          ruta: "/ventas/productos", 
          icon: Package,
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO] // Todos pueden ver
        },
        { 
          nombre: "Servicios", 
          ruta: "/ventas/servicios", 
          icon: ShoppingCart,
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR, ROLES.EMPLEADO] // Todos pueden ver
        },
      ],
    },
    {
      titulo: "Inventario",
      icon: Package,
      sub: [
        { 
          nombre: "Stock", 
          ruta: "/inventario/stock", 
          icon: Box,
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SUPERVISOR] // Solo admin, gerente y supervisor
        },
        { 
          nombre: "Proveedores", 
          ruta: "/inventario/proveedores", 
          icon: Truck,
          allowedRoles: [ROLES.ADMIN, ROLES.GERENTE] // Solo admin y gerente
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

  // Determinar si el menú debe mostrarse
  const shouldShow = isDesktop || (isMobile && isOpen);

  return (
    <>
      {/* Overlay para móvil/tablet cuando el menú está abierto - SOLO PARA CERRAR */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={onClose}
          style={{ 
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Contenido del menú */}
      <aside className={`
        ${isDesktop 
          ? 'w-64 fixed top-16 left-0 h-[calc(100vh-64px)] z-30' 
          : shouldShow 
            ? 'w-64 fixed top-16 left-0 h-[calc(100vh-64px)] z-30 translate-x-0' 
            : 'w-64 fixed top-16 left-0 h-[calc(100vh-64px)] z-30 -translate-x-full'
        }
        bg-gradient-to-b from-gray-900 to-black border-r border-yellow-500/20
        transition-transform duration-300 ease-in-out shadow-2xl
        overflow-y-auto
      `}
      style={{
        WebkitOverflowScrolling: 'touch', // Scroll suave en iOS
      }}>
        {/* Header */}
        <div className="p-4 border-b border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-1.5 rounded-lg">
                <div className="w-4 h-4 bg-black rounded-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  Panel Control
                </h2>
                {isMobile && (
                  <p className="text-xs text-gray-400 mt-0.5">Menú lateral</p>
                )}
              </div>
            </div>
            
            {/* Botón de cerrar solo en mobile/tablet */}
            {isMobile && shouldShow && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navegación con permisos */}
        <nav className="p-4 space-y-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {menuItems.map((section, sectionIndex) => {
            // Filtrar los items del submenú según el rol
            const filteredSubItems = section.sub.filter(item => 
              item.allowedRoles.includes(userRole)
            );

            // Si no hay items permitidos en esta sección, no mostrar la sección
            if (filteredSubItems.length === 0) return null;

            return (
              <div key={sectionIndex} className="space-y-2">
                <button
                  onClick={() => handleSectionClick(section.titulo)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeSection === section.titulo
                      ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                      : "text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{section.titulo}</span>
                  </div>
                  <ChevronRight 
                    className={`w-3 h-3 transition-transform duration-200 ${
                      activeSection === section.titulo ? "rotate-90 text-yellow-400" : "text-gray-600"
                    }`} 
                  />
                </button>

                {activeSection === section.titulo && (
                  <div className="space-y-1 ml-2">
                    {filteredSubItems.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        to={item.ruta}
                        onClick={handleLinkClick}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 group ${
                          isLinkActive(item.ruta)
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "text-gray-300 hover:text-yellow-400 hover:bg-gray-800/30 border border-transparent"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors duration-200 ${
                          isLinkActive(item.ruta)
                            ? "bg-yellow-500/20"
                            : "bg-gray-800 group-hover:bg-yellow-500/10"
                        }`}>
                          <item.icon className={`w-3 h-3 ${
                            isLinkActive(item.ruta)
                              ? "text-yellow-400"
                              : "text-gray-400 group-hover:text-yellow-400"
                          }`} />
                        </div>
                        <span className="font-medium">{item.nombre}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-yellow-500/20 bg-gray-900/80">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 mb-1">Golden Nails</div>
            <div className="text-[8px] text-gray-600 uppercase tracking-wider">
              Sistema de Gestión
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MenuSecundario;