// src/hooks/useInactivity.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useInactivity = (timeoutMinutes = 20) => {
  const navigate = useNavigate();
  const inactivityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    // Establecer timeout (minutos * 60 segundos * 1000 milisegundos)
    inactivityTimeoutRef.current = setTimeout(() => {
      handleAutoLogout();
    }, timeoutMinutes * 60 * 1000);
  };

  const handleAutoLogout = () => {
    console.log(`⏰ Sesión expirada por inactividad (${timeoutMinutes} minutos)`);
    
    // Limpiar localStorage
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    
    // Limpiar timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
    
    // Redirigir al login
    navigate('/login', { replace: true });
  };

  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  // Inicializar el timer solo si estamos en una ruta protegida
  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');
    
    if (token && usuarioData) {
      resetInactivityTimer();
      
      // Agregar event listeners para detectar actividad
      const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });

      // Limpiar al desmontar
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
        
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
      };
    }
  }, [timeoutMinutes, navigate]);

  return { resetInactivityTimer, handleUserActivity };
};