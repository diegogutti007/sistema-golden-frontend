import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import { FaPlus, FaCalendarAlt, FaSyncAlt } from "react-icons/fa";
import esLocale from "@fullcalendar/core/locales/es";
import listPlugin from "@fullcalendar/list";
import "@fullcalendar/bootstrap5";
import "bootstrap/dist/css/bootstrap.min.css";
import ModalCita from "../Modales/ModalCita";
import ModalVenta from "../Modales/ModalVenta";
import ModalCliente from "../Modales/ModalCliente";
import { BACKEND_URL } from '../config';

Modal.setAppElement("#root");

export default function AgendaCitas() {
  const [estadoAnterior, setEstadoAnterior] = useState("Programada");
  const [eventos, setEventos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [Empleados, setEmpleados] = useState([]);
  const [modalCita, setModalCita] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const [form, setForm] = useState({
    CitaID: null,
    ClienteID: "",
    EmpId: "",
    Titulo: "",
    clienteNombre: "",
    Descripcion: "",
    FechaInicio: "",
    FechaFin: "",
    Estado: "Programada"
  });

  // Leyenda de estados
  const leyendaEstados = [
    { estado: "Programada", color: "#00aae4", icono: "⏰" },
    { estado: "En progreso", color: "#f59e0b", icono: "🔄" },
    { estado: "Completada", color: "#16a34a", icono: "✅" },
    { estado: "Cancelada", color: "#dc2626", icono: "❌" }
  ];

  // Configuración de zona horaria
  const TIME_ZONE = 'America/Lima';

  // Detectar si es móvil
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value;
    setEstadoAnterior(form.Estado);
    setForm((prev) => ({ ...prev, Estado: nuevoEstado }));
  };

  const handleGuardarVenta = (datosVenta) => {
    console.log("✅ Venta registrada:", datosVenta);
    setIsVentaModalOpen(false);
    setModalCita(false);
    cargarCitas();
  };

  const handleCloseVentaModal = () => {
    setIsVentaModalOpen(false);
    setModalCita(false);
  };

  // Función para convertir fecha a formato ISO con zona horaria Perú
  const toPeruTimeISO = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Si ya es una fecha válida, convertir a string en zona horaria peruana
    if (!isNaN(date.getTime())) {
      // Obtener componentes en horario peruano
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    return dateString;
  };

  // Función para formatear fecha a string legible en horario peruano
  const formatToPeruTimeString = (date) => {
    return date.toLocaleString('es-PE', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const cargarCitas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/citas`);
      const data = await res.json();
      console.log("🧾 Datos crudos desde API:", data);

      const eventosConvertidos = data.map((cita) => {
        // Convertir fechas a objetos Date
        let startDate = new Date(cita.start);
        let endDate = new Date(cita.end);

        // Verificar si las fechas son válidas
        if (isNaN(startDate.getTime())) {
          console.error("Fecha start inválida:", cita.start);
          startDate = new Date(); // valor por defecto
        }

        if (isNaN(endDate.getTime())) {
          console.error("Fecha end inválida:", cita.end);
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora
        }

        // Log de conversión para depuración
        console.log(`Fecha original: ${cita.start} -> Convertida: ${startDate.toISOString()}`);
        console.log(`En horario Perú: ${formatToPeruTimeString(startDate)}`);

        let backgroundColor = "#00aae4";
        if (cita.extendedProps.estado === "Programada") backgroundColor = "#00aae4";
        else if (cita.extendedProps.estado === "En progreso") backgroundColor = "#f59e0b";
        else if (cita.extendedProps.estado === "Completada") backgroundColor = "#16a34a";
        else if (cita.extendedProps.estado === "Cancelada") backgroundColor = "#dc2626";

        return {
          id: cita.id,
          title: cita.title,
          start: startDate, // FullCalendar manejará la zona horaria
          end: endDate,     // FullCalendar manejará la zona horaria
          backgroundColor,
          borderColor: "#000000",
          textColor: "#fafbfd",
          extendedProps: {
            Descripcion: cita.descripcion,
            ClienteID: cita.extendedProps.clienteID,
            EmpId: cita.extendedProps.EmpId,
            ClienteNombre: cita.extendedProps.clienteNombre,
            EmpleadoNombre: cita.extendedProps.empleadoNombre,
            Estado: cita.extendedProps.estado,
          },
        };
      });

      setEventos(eventosConvertidos);
    } catch (error) {
      console.error("❌ Error al cargar citas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/listaempleado`);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("❌ Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    cargarCitas();
    cargarClientes();
    cargarEmpleados();
  }, []);

  const manejarClickCelda = (clickInfo) => {
    console.log("🟢 Click en celda:", clickInfo);

    // Obtener la fecha del click (ya viene en la zona horaria configurada del calendario)
    const fechaClick = new Date(clickInfo.dateStr);

    // Crear fecha de inicio
    const fechaInicio = new Date(fechaClick);

    // Crear fecha de fin (1 hora después)
    const fechaFin = new Date(fechaClick);
    fechaFin.setHours(fechaFin.getHours() + 1);

    // Formatear para el formulario (mantener en zona horaria local)
    const formatoISO = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setForm({
      CitaID: null,
      ClienteID: "",
      EmpId: "",
      Titulo: "",
      Descripcion: "",
      clienteNombre: "",
      FechaInicio: formatoISO(fechaInicio),
      FechaFin: formatoISO(fechaFin),
      Estado: "Programada",
      EstadoOriginal: "Programada"
    });

    console.log("📝 Formulario configurado para nueva cita");
    console.log("⏰ Hora inicio Perú:", formatoISO(fechaInicio));
    console.log("⏰ Hora fin Perú:", formatoISO(fechaFin));

    setModalKey(prev => prev + 1);
    setModalCita(true);
  };

  const manejarClickEvento = (clickInfo) => {
    console.log("🟡 Click en evento:", clickInfo);
    const ev = clickInfo.event;
    const props = ev.extendedProps || {};

    // Convertir las fechas del evento a formato ISO local para el formulario
    const formatEventDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setForm({
      CitaID: ev.id,
      Titulo: props.Titulo || ev.title || "",
      clienteNombre: props.ClienteNombre,
      Descripcion: props.Descripcion || "",
      FechaInicio: formatEventDate(ev.start),
      FechaFin: formatEventDate(ev.end) || formatEventDate(ev.start),
      ClienteID: props.ClienteID || "",
      EmpId: props.EmpId || "",
      Estado: props.Estado || "Programada",
      EstadoOriginal: props.Estado || "Programada",
    });

    console.log("📝 Formulario configurado para editar cita");
    console.log("📅 Fecha inicio:", formatEventDate(ev.start));
    console.log("📅 Fecha fin:", formatEventDate(ev.end));

    setModalKey(prev => prev + 1);
    setModalCita(true);
  };

  const guardarCita = async (e) => {
    e.preventDefault();
    console.log("💾 Guardando cita:", form);

    try {
      if (!form.Titulo || !form.FechaInicio || !form.ClienteID) {
        alert("⚠️ Completa el título, la fecha y el cliente.");
        return;
      }

      if (form.Estado === "Completada") {
        setIsVentaModalOpen(true);
        return;
      }

      const metodo = form.CitaID ? "PUT" : "POST";
      const url = form.CitaID
        ? `${BACKEND_URL}/api/citas/${form.CitaID}`
        : `${BACKEND_URL}/api/citas`;

      // IMPORTANTE: Asegurar que las fechas se envíen en formato ISO
      const fechaInicioISO = new Date(form.FechaInicio).toISOString();
      const fechaFinISO = new Date(form.FechaFin).toISOString();

      const cuerpoCita = {
        ...form,
        title: form.Titulo,
        descripcion: form.Descripcion,
        start: fechaInicioISO, // Enviar en formato ISO
        end: fechaFinISO,      // Enviar en formato ISO
        extendedProps: {
          clienteID: form.ClienteID,
          EmpId: form.EmpId,
          estado: form.Estado,
          clienteNombre: form.clienteNombre || ""
        }
      };

      console.log("📤 Enviando datos al servidor:", cuerpoCita);

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpoCita),
      });

      if (!respuesta.ok) throw new Error("Error al guardar cita");

      const resultado = await respuesta.json();
      console.log("✅ Respuesta del servidor:", resultado);

      alert(form.CitaID ? "✅ Cita actualizada." : "✅ Cita registrada.");
      setModalCita(false);
      cargarCitas();
    } catch (error) {
      console.error("❌ Error al guardar cita:", error);
      alert("❌ No se pudo registrar la cita.");
    }
  };

  const eliminarCita = async () => {
    if (!form.CitaID) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        await fetch(`${BACKEND_URL}/api/citas/${form.CitaID}`, {
          method: "DELETE"
        });
        setModalCita(false);
        cargarCitas();
        alert("✅ Cita eliminada correctamente.");
      } catch (error) {
        alert("❌ Error al eliminar la cita.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6">
      {/* Header ultra compacto */}
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-3 border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <FaCalendarAlt className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Agenda de Citas</h1>
              <p className="text-gray-600 text-xs">Horario Perú: 9:00 AM - 11:00 PM (GMT-5)</p>
            </div>
          </div>

          <button
            onClick={cargarCitas}
            disabled={isLoading}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FaSyncAlt className={`${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {/* Leyenda de estados - CENTRADA */}
        <div className="flex justify-center mt-3">
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            {leyendaEstados.map((item) => (
              <div key={item.estado} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-gray-700 flex items-center gap-1">
                  <span className="text-[10px]">{item.icono}</span>
                  <span className="hidden sm:inline">{item.estado}</span>
                  <span className="sm:hidden">
                    {item.estado === "Programada" ? "Prog." :
                      item.estado === "En progreso" ? "Progreso" :
                        item.estado === "Completada" ? "Comp." : "Canc."}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Container - MUY GRANDE con scroll horizontal */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-auto">
        <div className="min-w-[1200px]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
            selectable={false}
            dateClick={manejarClickCelda}
            events={eventos}
            eventClick={manejarClickEvento}
            
            // CONFIGURACIÓN PARA HORARIO PERUANO
            timeZone={TIME_ZONE}
            nowIndicator={true}
            height="auto"
            
            // HORARIO CONFIGURADO: 9AM - 11PM (Horario Perú)
            slotMinTime="09:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            
            // Configuración de slots
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            
            // Configuración regional
            locale={esLocale}
            firstDay={1}
            
            // Mostrar tiempo en eventos
            displayEventTime={true}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              meridiem: 'short'
            }}
            
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              meridiem: 'short',
              timeZoneName: 'short'
            }}
            
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              list: "Lista",
            }}
            
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayMaxEvents: 3,
                fixedWeekCount: false,
                dateClick: manejarClickCelda
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                slotLabelFormat: {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  meridiem: 'short'
                },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00:00',
                allDaySlot: false,
                expandRows: true,
                dayHeaderFormat: { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'short' 
                },
                dateClick: manejarClickCelda,
                slotEventOverlap: false,
                slotHeight: 60,
                contentHeight: 'auto',
                dayMinHeight: 120,
                dayMaxEvents: true,
                moreLinkClick: "popover",
              },
              timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00:00',
                dateClick: manejarClickCelda,
                slotEventOverlap: false,
                slotHeight: 60,
                contentHeight: 'auto',
                dayMinHeight: 120
              },
              listWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                listDayFormat: {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                },
                listDaySideFormat: false
              }
            }}
            
            eventMaxStack={2}
            eventOrder="start,title"
            eventOverlap={false}
            slotEventOverlap={false}
            eventConstraint={{
              startTime: '09:00',
              endTime: '23:00'
            }}
            
            eventContent={(arg) => {
              const empleado = arg.event.extendedProps?.EmpleadoNombre || "";
              const titulo = arg.event.title || "";
              const cliente = arg.event.extendedProps?.ClienteNombre || "";
              const estado = arg.event.extendedProps?.Estado || "";
              const horaInicio = arg.timeText || "";

              const iconoEstado = {
                'Programada': '⏰',
                'En progreso': '🔄',
                'Completada': '✅',
                'Cancelada': '❌'
              }[estado] || '📅';

              return (
                <div className="p-1 text-left h-full overflow-hidden flex flex-col justify-start gap-0.5 leading-tight bg-opacity-90 hover:bg-opacity-100 transition-all duration-150">
                  {/* Estado y Título */}
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] flex-shrink-0">{iconoEstado}</span>
                    <div className="font-bold text-white text-[12px] leading-tight truncate flex-1 tracking-tight antialiased">
                      {titulo}
                    </div>
                  </div>

                  {/* Cliente */}
                  {cliente && (
                    <div className="text-white text-[10px] leading-tight flex items-center gap-1">
                      <span className="text-[8px] flex-shrink-0">👤</span>
                      <span className="truncate flex-1">{cliente}</span>
                    </div>
                  )}
                  
                  {/* Hora */}
                  {horaInicio && (
                    <div className="text-white text-[10px] leading-tight flex items-center gap-1">
                      <span className="text-[8px] flex-shrink-0">🕒</span>
                      <span className="truncate flex-1">{horaInicio}</span>
                    </div>
                  )}
                </div>
              );
            }}
            
            dayMaxEvents={6}
            moreLinkClick="week"
            moreLinkContent={(args) => {
              return `+${args.num} más`;
            }}
            
            eventClassNames="border-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer mx-0.5 mb-0.5 align-top"
            dayHeaderClassNames="bg-gray-50 text-gray-700 font-semibold text-sm py-2"
            slotLabelClassNames="text-gray-600 font-medium text-[15px] py-2"
            
            slotHeight={60}
            expandRows={true}
            contentHeight="auto"
            eventMargin={1}
            dayCellClassNames="min-h-[60px]"
            eventDisplay="block"
            eventMinHeight={40}
            eventShortHeight={40}
            
            eventDidMount={(info) => {
              const eventEl = info.el;
              if (eventEl) {
                eventEl.style.position = 'absolute';
                eventEl.style.top = '1px';
                eventEl.style.left = '2px';
                eventEl.style.right = '2px';
                eventEl.style.bottom = '1px';
              }
            }}
          />
        </div>
      </div>

      {/* Botón flotante para móvil - SOLO en móvil */}
      {isMobile && (
        <button
          onClick={() => {
            const ahora = new Date();
            const fechaInicio = ahora.toISOString().slice(0, 16);
            const fechaFin = new Date(ahora.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);

            setForm({
              CitaID: null,
              ClienteID: "",
              EmpId: "",
              Titulo: "",
              Descripcion: "",
              clienteNombre: "",
              FechaInicio: fechaInicio,
              FechaFin: fechaFin,
              Estado: "Programada",
              EstadoOriginal: "Programada"
            });
            setModalKey(prev => prev + 1);
            setModalCita(true);
          }}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-40"
        >
          <FaPlus className="text-xl" />
        </button>
      )}

      {/* Modales */}
      <ModalCita
        key={modalKey}
        modalCita={modalCita}
        setModalCita={setModalCita}
        form={form}
        setForm={setForm}
        guardarCita={guardarCita}
        eliminarCita={eliminarCita}
        clientes={clientes}
        Empleados={Empleados}
        setModalCliente={setModalCliente}
        handleEstadoChange={handleEstadoChange}
      />

      <ModalVenta
        isOpen={isVentaModalOpen}
        onClose={handleCloseVentaModal}
        onRequestClose={handleCloseVentaModal}
        citaInfo={form}
        onSave={handleGuardarVenta}
      />

      <ModalCliente
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        recargarClientes={cargarClientes}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
            <FaSyncAlt className="animate-spin text-blue-500 text-xl" />
            <span className="text-gray-700 font-medium">Cargando citas...</span>
          </div>
        </div>
      )}
    </div>
  );
}