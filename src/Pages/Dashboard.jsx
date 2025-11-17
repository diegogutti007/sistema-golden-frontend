import { Link } from "react-router-dom";
import { 
  Star, 
  Users, 
  Calendar, 
  DollarSign, 
  ShoppingCart,
  TrendingDown,
  BarChart3,
  MapPin,
  Phone,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      icon: Calendar,
      label: "Citas Hoy",
      value: "12",
      change: "+2",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: DollarSign,
      label: "Ventas del Día",
      value: "$1,240",
      change: "+15%",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: Users,
      label: "Clientes Activos",
      value: "89",
      change: "+5",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: ShoppingCart,
      label: "Productos Vendidos",
      value: "24",
      change: "+8%",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const quickActions = [
    {
      icon: Calendar,
      title: "Nueva Cita",
      description: "Agendar cita con cliente",
      link: "/citas",
      color: "bg-blue-500 text-white hover:bg-blue-600"
    },
    {
      icon: DollarSign,
      title: "Registrar Venta",
      description: "Crear nueva venta",
      link: "/Ventas",
      color: "bg-green-500 text-white hover:bg-green-600"
    },
    {
      icon: TrendingDown,
      title: "Registrar Gasto",
      description: "Agregar nuevo gasto",
      link: "/gastos",
      color: "bg-red-500 text-white hover:bg-red-600"
    }
  ];


  return (
    <div className="min-h-screen bg-white pt-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-yellow-50 to-amber-50 overflow-hidden">
        <div className="absolute inset-0 bg-white/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 relative">
          <div className="text-center">
            {/* Logo Elegante */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 border-4 border-white">
                  <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center transform -rotate-3 border-2 border-yellow-300">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Star className="w-5 h-5 text-black" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-amber-800 bg-clip-text text-transparent">
                GOLDEN NAILS
              </span>
            </h1>
            
            <p className="text-2xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed font-light">
              Descubre <span className="text-yellow-600 font-semibold">tu mejor versión</span> 
            </p>
            
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transformamos tus uñas en obras de arte. Experiencia premium, resultados excepcionales 
              y un servicio que redefine el lujo en cuidado de manos y pies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                to="/citas"
                className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 border-2 border-yellow-500"
              >
                <Calendar className="w-5 h-5" />
                <span>Agendar Cita</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <p className="text-gray-600">Accede rápidamente a las funciones principales del sistema</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white border border-gray-200 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 group hover:shadow-lg hover:border-yellow-300 text-center"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 mx-auto transition-colors`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}