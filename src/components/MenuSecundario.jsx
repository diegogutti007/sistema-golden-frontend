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
  Menu,
  X
} from "lucide-react";

const MenuSecundario = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar el tamaño de la pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    {
      titulo: "Dashboard",
      icon: BarChart3,
      sub: [
        { nombre: "Ventas", ruta: "/dashboard/ventas", icon: TrendingUp },
        { nombre: "Comisiones", ruta: "/dashboard/comisiones", icon: Users },
        { nombre: "Citas", ruta: "/dashboard/citas", icon: Calendar },
      ],
    },
    {
      titulo: "Ventas",
      icon: ShoppingCart,
      sub: [
        { nombre: "Productos", ruta: "/ventas/productos", icon: Package },
        { nombre: "Servicios", ruta: "/ventas/servicios", icon: ShoppingCart },
      ],
    },
    {
      titulo: "Inventario",
      icon: Package,
      sub: [
        { nombre: "Stock", ruta: "/inventario/stock", icon: Box },
        { nombre: "Proveedores", ruta: "/inventario/proveedores", icon: Truck },
      ],
    },
  ];

  const isLinkActive = (ruta) => {
    return location.pathname === ruta;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Botón para abrir/cerrar el menú en móvil
  const MobileToggleButton = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg shadow-lg"
    >
      {isMobileOpen ? (
        <X className="w-5 h-5 text-black" />
      ) : (
        <Menu className="w-5 h-5 text-black" />
      )}
    </button>
  );

  // Overlay para móvil
  const MobileOverlay = () => (
    isMobileOpen && (
      <div 
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsMobileOpen(false)}
      />
    )
  );

  const MenuContent = () => (
    <div className={`
      w-64 bg-gradient-to-b from-gray-900 to-black border-r border-yellow-500/20 h-screen 
      transition-all duration-300 z-40
      ${isMobile 
        ? `fixed top-0 left-0 transform ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }` 
        : 'fixed top-16 left-0'
      }
    `}>
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
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 text-gray-400 hover:text-yellow-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-120px)]">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            <button
              onClick={() => setActiveSection(activeSection === section.titulo ? "" : section.titulo)}
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
                {section.sub.map((item, itemIndex) => (
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
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-yellow-500/20">
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-1">Pichona 2.0</div>
          <div className="text-[8px] text-gray-600 uppercase tracking-wider">
            v2.0.1
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileToggleButton />
      <MobileOverlay />
      <MenuContent />
      
      {/* Espacio para el contenido principal en móvil */}
      {isMobile && (
        <div className={`md:hidden transition-all duration-300 ${
          isMobileOpen ? 'ml-64' : 'ml-0'
        }`} />
      )}
    </>
  );
};

export default MenuSecundario;