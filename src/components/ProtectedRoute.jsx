// src/components/ProtectedRoute.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInactivity } from '../hooks/useInactivity';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  
  // Usar el hook de inactividad (20 minutos)
  useInactivity(20);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');

    if (!token || !usuarioData) {
      console.log('🔒 Ruta protegida: redirigiendo a login');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return children;
};

export default ProtectedRoute;