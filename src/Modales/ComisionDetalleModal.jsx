import React, { useEffect, useState } from "react";
import { BACKEND_URL } from '../config';

import {
  X,
  Calendar,
  DollarSign,
  Package,
  Hash,
  TrendingUp,
  User,
  Briefcase,
  Target,
  Download
} from "lucide-react";

export default function ComisionDetalleModal({ empleado, onClose, fechaInicio, fechaFin }) {
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarDetalle = async () => {
      setCargando(true);
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/comisiones/${empleado.empId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
        );
        const data = await res.json(); 
        setDetalle(data);
      } catch (err) {
        console.error("Error al cargar detalle:", err);
      } finally {
        setCargando(false);
      }
    };
    console.log('hop', empleado);
    cargarDetalle();
  }, [empleado.empId, fechaInicio, fechaFin]);

  // Calcular totales
  const totalVentas = detalle.reduce((sum, d) => sum + (parseFloat(d.Importe) || 0), 0);
  const totalComision = empleado.porcentaje ? (totalVentas * empleado.porcentaje) / 100 : 0;

  const exportarPDF = () => {
    // Aquí puedes implementar la exportación a PDF
    alert("Funcionalidad de exportación PDF próximamente");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Detalle de Ventas y Comisiones</h2>
              <p className="text-emerald-100 text-xs sm:text-sm">
                {empleado.nombre} • {empleado.cargo || "Sin cargo"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportarPDF}
              className="hidden sm:flex items-center space-x-2 bg-white/20 text-white px-3 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold text-sm"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Información del Periodo */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-gray-700">
                  {new Date(fechaInicio).toLocaleDateString()} - {new Date(fechaFin).toLocaleDateString()}
                </span>
              </div>
              {empleado.porcentaje && (
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-gray-700">{empleado.porcentaje}% Comisión</span>
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Ventas Totales</p>
                  <p className="font-bold text-blue-600">S/ {totalVentas.toFixed(2)}</p>
                </div>
              </div>
              {empleado.porcentaje && (
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Comisión Total</p>
                    <p className="font-bold text-green-600">S/ {totalComision.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando detalle de ventas...</p>
            </div>
          ) : detalle.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay registros de ventas</h3>
              <p className="text-gray-500 text-sm">
                No se encontraron ventas para {empleado.nombre} en el periodo seleccionado.
              </p>
            </div>
          ) : (
            <>
              {/* Vista Desktop */}
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Fecha</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span>Venta ID</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>Artículo</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        P. Unitario
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Importe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detalle.map((d, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {d.FechaVenta ? (() => {
                            const parts = d.FechaVenta.split('/');
                            if (parts.length === 3) {
                              // Formato: DD/MM/YYYY -> MM/DD/YYYY
                              const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
                              return !isNaN(date) ? date.toLocaleDateString('es-ES') : 'Fecha inválida';
                            }
                            return 'Formato incorrecto';
                          })() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{d.VentaID}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {d.Articulo}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {d.Cantidad}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          S/ {parseFloat(d.PrecioUnitario).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-green-600 font-semibold text-right">
                          S/ {parseFloat(d.Importe).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Móvil */}
              <div className="lg:hidden space-y-3">
                {detalle.map((d, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    {/* Header de la venta */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          #{d.VentaID}
                        </span>
                        <span className="text-xs text-gray-500">
                          {d.FechaVenta ? (() => {
                            const parts = d.FechaVenta.split('/');
                            if (parts.length === 3) {
                              // Formato: DD/MM/YYYY -> MM/DD/YYYY
                              const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
                              return !isNaN(date) ? date.toLocaleDateString('es-ES') : 'Fecha inválida';
                            }
                            return 'Formato incorrecto';
                          })() : '—'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        S/ {parseFloat(d.Importe).toFixed(2)}
                      </span>
                    </div>

                    {/* Detalles del artículo */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                          {d.Articulo}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span>Cantidad:</span>
                          <span className="font-semibold">{d.Cantidad}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>P. Unitario:</span>
                          <span className="font-semibold">S/ {parseFloat(d.PrecioUnitario).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen Móvil */}
              <div className="lg:hidden bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200 mt-4">
                <div className="text-center">
                  <h4 className="font-semibold text-emerald-800 text-sm mb-3">Resumen de Ventas</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-emerald-600">Total Ventas</p>
                      <p className="font-bold text-emerald-800 text-lg">S/ {totalVentas.toFixed(2)}</p>
                    </div>
                    {empleado.porcentaje && (
                      <div>
                        <p className="text-emerald-600">Comisión</p>
                        <p className="font-bold text-emerald-800 text-lg">S/ {totalComision.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Mostrando {detalle.length} venta{detalle.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportarPDF}
                className="sm:hidden flex items-center justify-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all duration-200 font-semibold text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exportar PDF</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center space-x-2 bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold text-sm"
              >
                <X className="w-4 h-4" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}