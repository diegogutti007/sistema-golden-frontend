import React, { useState, useEffect } from 'react';
import MenuPrincipal from './MenuPrincipal';
import MenuSecundario from './MenuSecundario';

const LayoutPrincipal = ({ children, usuario, onLogout }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1280;
  const isDesktop = windowWidth >= 1280;

  const handleToggleSecondaryMenu = () => {
    setIsSecondaryMenuOpen(!isSecondaryMenuOpen);
  };

  const handleCloseSecondaryMenu = () => {
    setIsSecondaryMenuOpen(false);
  };

  const getMainMargin = () => {
    if (isDesktop && isSecondaryMenuOpen) {
      return 'ml-80';
    }
    return 'ml-0';
  };

  const getMaxWidth = () => {
    if (isDesktop && isSecondaryMenuOpen) {
      return 'max-w-[1440px]';
    }
    if (isDesktop && !isSecondaryMenuOpen) {
      return 'max-w-[1600px]';
    }
    return 'max-w-full';
  };

  const getPadding = () => {
    if (isDesktop) {
      return 'p-8 lg:p-10';
    }
    return 'p-4 md:p-6';
  };

  // Pasar información de dispositivo al MenuPrincipal para posicionar el botón
  const deviceInfo = { isMobile, isTablet, isDesktop };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(59,130,246,0.05)_1px,_transparent_0)] bg-[length:10px_10px] pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="fixed top-0 left-0 right-0 z-50">
        <MenuPrincipal 
          usuario={usuario}
          onLogout={onLogout}
          onToggleSecondaryMenu={handleToggleSecondaryMenu}
          deviceInfo={deviceInfo}
        />
      </div>

      <div className="pt-16 min-h-screen">
        <MenuSecundario 
          onClose={handleCloseSecondaryMenu}
          isMobile={isMobile}
          isOpen={isSecondaryMenuOpen}
          usuario={usuario}
        />

        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${getMainMargin()}
          min-h-[calc(100vh-64px)]
          relative z-10
        `}>
          <div className="w-full h-full flex justify-center">
            <div className={`
              w-full
              ${getMaxWidth()}
              mx-auto
              ${getPadding()}
            `}>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-5 text-center text-gray-500 text-xs z-10 relative">
        <div className={`mx-auto ${getMaxWidth()} px-8 lg:px-10`}>
          <p>© 2025 Golden Nails Spa - Sistema de Gestión v2.0</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Todos los derechos reservados
          </p>
        </div>
      </footer>

      <style jsx>{`
        main {
          transition-property: margin-left;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        main::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        main::-webkit-scrollbar-track {
          background: rgba(203, 213, 225, 0.3);
          border-radius: 10px;
        }
        
        main::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
          border-radius: 10px;
        }
        
        main::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
        
        .bg-white\/95 {
          transition: box-shadow 0.3s ease;
        }
        
        .bg-white\/95:hover {
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default LayoutPrincipal;