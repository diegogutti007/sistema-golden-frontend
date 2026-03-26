import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { BACKEND_URL } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  Download,
  Percent
} from "lucide-react";

export default function ComisionDetalleModal({ empleado, onClose, fechaInicio, fechaFin }) {
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(false);
  console.log('fechaInicio:', fechaInicio);
  console.log('fechaFin:', fechaFin);
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
    cargarDetalle();
  }, [empleado.empId, fechaInicio, fechaFin]);

  // Calcular totales
  const totalVentas = detalle.reduce((sum, d) => sum + (parseFloat(d.Importe) || 0), 0);
  const totalComision = empleado.porcentaje ? (totalVentas * empleado.porcentaje) / 100 : 0;

  // Calcular comisión por cada venta
  const calcularComisionVenta = (importe) => {
    if (!empleado.porcentaje) return 0;
    return (parseFloat(importe) * empleado.porcentaje) / 100;
  };

  // Función para formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      
      return `${dia}/${mes}/${anio}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para exportar a PDF
  const exportarPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const primaryColor = [16, 185, 129];
      
      // Título y encabezado
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Comisiones', 20, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(String(empleado.nombre || ''), 20, 30);
      doc.text(String(empleado.cargo || 'Sin cargo'), 20, 35);
      
      // Información del empleado
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL EMPLEADO', 20, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const employeeInfo = [
        ['ID Empleado:', String(empleado.empId || '—')],
        ['Cargo:', String(empleado.cargo || '—')],
        ['Tipo:', String(empleado.tipo || '—')],
        ['% Comisión:', empleado.porcentaje ? `${empleado.porcentaje}%` : '—']
      ];
      
      let yPos = 62;
      employeeInfo.forEach(info => {
        doc.setFont('helvetica', 'bold');
        doc.text(String(info[0]), 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(info[1]), 70, yPos);
        yPos += 6;
      });
      
      // Período
      doc.setFont('helvetica', 'bold');
      doc.text('PERÍODO DE CONSULTA', 20, yPos + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${fechaInicio} - ${fechaFin}`, 20, yPos + 11);
      
      // Resumen de ventas
      const summaryY = yPos + 20;
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE VENTAS', 20, summaryY);
      
      // Cuadro de resumen
      doc.setFillColor(240, 240, 240);
      doc.rect(20, summaryY + 5, 170, 25, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Ventas:', 30, summaryY + 15);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`S/ ${totalVentas.toFixed(2)}`, 80, summaryY + 15);
      
      if (empleado.porcentaje) {
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'bold');
        doc.text('Comisión Total:', 30, summaryY + 23);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(`S/ ${totalComision.toFixed(2)}`, 80, summaryY + 23);
      }
      
      // Tabla de ventas detalladas con comisión por venta
      const tableY = summaryY + 40;
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE VENTAS', 20, tableY);
      
      // Preparar datos para la tabla - Incluyendo comisión por venta
      const tableData = detalle.map(d => {
        const importe = parseFloat(d.Importe || 0);
        const comisionVenta = calcularComisionVenta(importe);
        
        return [
          String(formatearFecha(d.FechaVenta)),
          `#${String(d.VentaID)}`,
          String(d.Articulo || ''),
          String(d.Cantidad || '0'),
          `S/ ${parseFloat(d.PrecioUnitario || 0).toFixed(2)}`,
          `S/ ${importe.toFixed(2)}`,
          `S/ ${comisionVenta.toFixed(2)}`
        ];
      });
      
      // Configuración de la tabla con 7 columnas
      autoTable(doc, {
        startY: tableY + 5,
        head: [['Fecha', 'Venta ID', 'Artículo', 'Cant.', 'P. Unitario', 'Importe', 'Comisión']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 22, halign: 'center' },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 45 },
          3: { cellWidth: 12, halign: 'right' },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 22, halign: 'right' },
          6: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = data.pageNumber;
          
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          const footerText = `Generado el ${new Date().toLocaleString()} - Página ${currentPage} de ${pageCount}`;
          doc.text(
            footerText,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });
      
      // Agregar firma y notas al final
      const finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Este reporte es generado automáticamente por el sistema de gestión de comisiones.',
        20,
        finalY
      );
      doc.text(
        'Para cualquier consulta, contactar al departamento de administración.',
        20,
        finalY + 5
      );
      
      // Línea de separación
      doc.setDrawColor(200, 200, 200);
      doc.line(20, finalY + 12, 190, finalY + 12);
      
      // Firmas
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('_________________________', 30, finalY + 25);
      doc.text('_________________________', 130, finalY + 25);
      doc.text('Administrador', 45, finalY + 30);
      doc.text('Empleado', 145, finalY + 30);
      
      // Guardar el PDF
      const fileName = `Comisiones_${String(empleado.nombre).replace(/[^a-z0-9]/gi, '_')}_${fechaInicio}_${fechaFin}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert(`Error al generar el PDF: ${error.message || 'Por favor, intenta nuevamente.'}`);
    }
  };

  // Función para exportar a PDF con vista previa
  const exportarPDFConVistaPrevia = () => {
    if (detalle.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    const confirmar = window.confirm(
      `¿Deseas exportar el reporte de ${String(empleado.nombre)}?\n\n` +
      `Período: ${fechaInicio} - ${fechaFin}\n` +
      `Total ventas: S/ ${totalVentas.toFixed(2)}\n` +
      `${empleado.porcentaje ? `Comisión: S/ ${totalComision.toFixed(2)}` : ''}`
    );
    
    if (confirmar) {
      exportarPDF();
    }
  };

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    const scrollY = window.scrollY;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Contenido del modal
  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        {/* Header del Modal - Fijo */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 py-4 flex justify-between items-center flex-shrink-0 rounded-t-2xl">
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
              onClick={exportarPDFConVistaPrevia}
              disabled={detalle.length === 0}
              className={`hidden sm:flex items-center space-x-2 text-white px-3 py-2 rounded-xl transition-all duration-200 font-semibold text-sm ${
                detalle.length === 0 
                  ? 'bg-white/10 cursor-not-allowed opacity-50' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Información del Periodo - Fijo */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-gray-700">
                  {fechaInicio} - {fechaFin}
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
            <div className="flex flex-wrap gap-2">
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

        {/* Contenido del Modal - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}>
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
              {/* Vista Desktop - Tabla con comisión por venta */}
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
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
                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center space-x-2 justify-end">
                            <Percent className="w-4 h-4 text-gray-400" />
                            <span>Comisión</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {detalle.map((d, i) => {
                        const importe = parseFloat(d.Importe || 0);
                        const comisionVenta = calcularComisionVenta(importe);
                        
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {d.FechaVenta}
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
                            <td className="py-3 px-4 text-sm text-blue-600 font-semibold text-right">
                              S/ {importe.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm text-green-600 font-bold text-right">
                              S/ {comisionVenta.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vista Móvil - Tarjetas con comisión por venta */}
              <div className="lg:hidden space-y-3">
                {detalle.map((d, i) => {
                  const importe = parseFloat(d.Importe || 0);
                  const comisionVenta = calcularComisionVenta(importe);
                  
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{d.VentaID}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatearFecha(d.FechaVenta)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          Com: S/ {comisionVenta.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                            {d.Articulo}
                          </span>
                        </div>
                        <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span>Cantidad:</span>
                            <span className="font-semibold">{d.Cantidad}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>P. Unitario:</span>
                            <span className="font-semibold">S/ {parseFloat(d.PrecioUnitario).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Importe:</span>
                            <span className="font-semibold text-blue-600">S/ {importe.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                        <p className="text-emerald-600">Comisión Total</p>
                        <p className="font-bold text-emerald-800 text-lg">S/ {totalComision.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-xs text-emerald-600">Comisión por venta: {empleado.porcentaje || 0}%</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer del Modal - Fijo */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50 flex-shrink-0 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Mostrando {detalle.length} venta{detalle.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportarPDFConVistaPrevia}
                disabled={detalle.length === 0}
                className={`sm:hidden flex items-center justify-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  detalle.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
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

  // Renderizar el modal usando Portal
  return ReactDOM.createPortal(modalContent, document.body);
}