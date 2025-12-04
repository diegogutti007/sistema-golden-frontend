import React, { useEffect, useState } from "react";

export default function ModalVentaDetalle({ ventaId, onClose }) {
  const [venta, setVenta] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!ventaId) return;

    const fetchVenta = async () => {
      setCargando(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/venta/${ventaId}`);
        const data = await res.json();
        setVenta(data.venta);
        setDetalles(data.detalles || []);
        setPagos(data.pagos || []);
      } catch (err) {
        console.error("Error al obtener detalle de venta:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchVenta();
  }, [ventaId]);

  if (!ventaId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6 animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        {cargando ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-10 w-10 border-t-4 border-indigo-500 border-solid rounded-full"></div>
          </div>
        ) : !venta ? (
          <p className="text-center text-gray-500 mt-10">❌ No se encontró la venta</p>
        ) : (
          <>
            {/* Encabezado */}
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              Detalle de Venta #{venta.VentaID}
            </h2>

            {/* Datos principales */}
            <div className="bg-indigo-50 rounded-lg p-4 mb-6 grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Cliente</p>
                <p className="font-medium">{venta.ClienteNombre}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha</p>
                <p className="font-medium">
                  {new Date(venta.FechaVenta).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold text-green-600">S/ {venta.Total}</p>
              </div>
              <div>
                <p className="text-gray-500">Estado</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    venta.Estado === "Pagada"
                      ? "bg-green-100 text-green-700"
                      : venta.Estado === "Anulada"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {venta.Estado}
                </span>
              </div>
              {venta.Observaciones && (
                <div className="col-span-2">
                  <p className="text-gray-500">Observaciones</p>
                  <p className="font-medium">{venta.Observaciones}</p>
                </div>
              )}
            </div>

            {/* Detalle de artículos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🧾 Artículos Vendidos
              </h3>
              {detalles.length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-indigo-100 text-indigo-700">
                    <tr>
                      <th className="text-left p-2 border">Artículo</th>
                      <th className="text-right p-2 border">Cantidad</th>
                      <th className="text-right p-2 border">Precio Unit.</th>
                      <th className="text-right p-2 border">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((d) => (
                      <tr key={d.DetalleID} className="border-t hover:bg-gray-50">
                        <td className="p-2">{d.ArticuloNombre}</td>
                        <td className="p-2 text-right">{d.Cantidad}</td>
                        <td className="p-2 text-right">S/ {d.PrecioUnitario}</td>
                        <td className="p-2 text-right font-medium text-gray-700">
                          S/ {d.Importe}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-sm">Sin artículos registrados.</p>
              )}
            </div>

            {/* Pagos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                💰 Pagos
              </h3>
              {pagos.length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-green-100 text-green-700">
                    <tr>
                      <th className="text-left p-2 border">Tipo de Pago</th>
                      <th className="text-right p-2 border">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((p) => (
                      <tr key={p.venta_pago_id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{p.TipoPago}</td>
                        <td className="p-2 text-right font-medium text-gray-700">
                          S/ {p.monto}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold border-t bg-gray-50">
                      <td className="p-2 text-right">Total Pagado:</td>
                      <td className="p-2 text-right text-green-600">
                        S/{" "}
                        {pagos
                          .reduce((acc, p) => acc + parseFloat(p.monto), 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-sm">No se registraron pagos.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
