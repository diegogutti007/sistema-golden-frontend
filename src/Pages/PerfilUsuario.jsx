import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    nuevoPassword: '',
    confirmarPassword: ''
  });
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Para Create React App usa REACT_APP_API_URL
    const url = "https://sistemagolden-backend-production.up.railway.app"//process.env.REACT_APP_API_URL || "http://localhost:5000"//"https://sistemagolden-backend-production.up.railway.app";//
    //"https://sistemagolden-backend-production.up.railway.app"
    setBackendUrl(url);
    console.log("🔗 URL del backend detectada:", url);
  }, []);


  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const usuarioData = localStorage.getItem('usuario');
        if (usuarioData) {
          const usuarioObj = JSON.parse(usuarioData);
          setUsuario(usuarioObj);
          setFormData({
            nombre: usuarioObj.nombre || '',
            apellido: usuarioObj.apellido || '',
            correo: usuarioObj.correo || '',
            telefono: usuarioObj.telefono || '',
            direccion: usuarioObj.direccion || ''
          });
          console.log(usuarioObj);
        }
                
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarUsuario();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarPerfil = async () => {
    try {
      setCargando(true);
      // Aquí iría la llamada a la API para actualizar el perfil
      const response = await fetch(`${backendUrl}/api/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar localStorage con los nuevos datos
        const usuarioActualizado = { ...usuario, ...formData };
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
        setEditando(false);
        alert('Perfil actualizado correctamente');
      } else {
        throw new Error('Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setCargando(false);
    }
  };

  const cambiarPassword = async () => {
    if (passwordData.nuevoPassword !== passwordData.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.nuevoPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`${backendUrl}/api/auth/cambiar-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          passwordActual: passwordData.passwordActual,
          nuevoPassword: passwordData.nuevoPassword
        })
      });

      if (response.ok) {
        alert('Contraseña cambiada correctamente');
        setPasswordData({
          passwordActual: '',
          nuevoPassword: '',
          confirmarPassword: ''
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al cambiar la contraseña');
    } finally {
      setCargando(false);
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gerente':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'empleado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRolTexto = (rol) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'gerente':
        return 'Gerente';
      case 'supervisor':
        return 'Supervisor';
      case 'empleado':
        return 'Empleado';
      default:
        return rol;
    }
  };

  if (cargando && !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">No se encontraron datos del usuario</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-2">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {usuario.nombre} {usuario.apellido}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRolColor(usuario.rol)}`}>
                    {getRolTexto(usuario.rol)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    usuario.estado === 'activo' 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {usuario.estado || 'Activo'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={guardarPerfil}
                    disabled={cargando}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{cargando ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                  <button
                    onClick={() => setEditando(false)}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-yellow-500" />
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  {editando ? (
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {usuario.nombre || 'No especificado'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  {editando ? (
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {usuario.apellido || 'No especificado'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Correo Electrónico
                  </label>
                  {editando ? (
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {usuario.correo || 'No especificado'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Teléfono
                  </label>
                  {editando ? (
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {usuario.telefono || 'No especificado'}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Dirección
                  </label>
                  {editando ? (
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {usuario.direccion || 'No especificado'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cambiar Contraseña */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2 text-yellow-500" />
                Cambiar Contraseña
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? "text" : "password"}
                      name="passwordActual"
                      value={passwordData.passwordActual}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {mostrarPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="nuevoPassword"
                    value={passwordData.nuevoPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmarPassword"
                    value={passwordData.confirmarPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <button
                  onClick={cambiarPassword}
                  disabled={cargando}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cargando ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </div>
          </div>

          {/* Información de Cuenta */}
          <div className="space-y-6">
            {/* Información de la Cuenta */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-yellow-500" />
                Información de la Cuenta
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de Usuario
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-mono">
                    {usuario.usuario}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Usuario
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm">
                    #{usuario.usuario_id}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Último Acceso
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {new Date().toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Reciente
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sesión Activa</span>
                  <span className="text-sm font-medium text-green-600">Ahora</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Citas Hoy</span>
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ventas del Mes</span>
                  <span className="text-sm font-medium text-green-600">24</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}