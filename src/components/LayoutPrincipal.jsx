import React, { useState, useEffect } from 'react';
import MenuPrincipal from './MenuPrincipal';
import MenuSecundario from './MenuSecundario';

const LayoutPrincipal = ({ children, usuario, onLogout }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);
  
  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // En desktop (≥1280px), siempre mostrar el menú secundario
      if (width >= 1280) {
        setIsSecondaryMenuOpen(true);
      } else {
        // En mobile/tablet, cerrar el menú
        setIsSecondaryMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileOrTablet = windowWidth < 1280;
  const isDesktop = windowWidth >= 1280;

  // Función para toggle del menú secundario
  const handleToggleSecondaryMenu = () => {
    setIsSecondaryMenuOpen(!isSecondaryMenuOpen);
  };

  // Función para cerrar menú secundario
  const handleCloseSecondaryMenu = () => {
    if (isMobileOrTablet) {
      setIsSecondaryMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.05)_1px,_transparent_0)] bg-[length:10px_10px] pointer-events-none z-0"></div>

      {/* Menú Principal - Fijo en la parte superior */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <MenuPrincipal 
          usuario={usuario}
          onLogout={onLogout}
          onToggleSecondaryMenu={handleToggleSecondaryMenu}
        />
      </div>

      {/* Contenedor principal */}
      <div className="pt-16 min-h-screen flex">
        {/* Menú Secundario */}
        <MenuSecundario 
          onClose={handleCloseSecondaryMenu}
          isMobile={isMobileOrTablet}
          isOpen={isSecondaryMenuOpen}
        />

        {/* Overlay para mobile/tablet */}
        {isMobileOrTablet && isSecondaryMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseSecondaryMenu}
          />
        )}

        {/* Contenido Principal */}
        <main className={`
          flex-1 transition-all duration-300
          ${isDesktop && isSecondaryMenuOpen ? 'ml-64' : 'ml-0'}
          min-h-[calc(100vh-64px)]
          overflow-auto
        `}>
          <div className="p-4 md:p-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 min-h-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 text-center text-gray-500 text-xs z-10 relative">
        © 2025 Pilona System v2.0
      </footer>
    </div>
  );
};

export default LayoutPrincipal;