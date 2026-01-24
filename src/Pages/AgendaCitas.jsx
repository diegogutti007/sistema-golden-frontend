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


//modificacion
const [slotHeight, setSlotHeight] = useState(60); // Altura inicial de 60px
const [slotDuration, setSlotDuration] = useState('00:30:00'); // Duración inicial de 30 min/

////////////////////



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
    setModalCita(false); // ← AÑADE ESTA LÍNEA
    cargarCitas();
  };


  const handleCloseVentaModal = () => {
    setIsVentaModalOpen(false);
    setModalCita(false); // ← AÑADE ESTA LÍNEA
  };

  /*   const cargarCitas = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/citas`);
        const data = await res.json(); 
        console.log("🧾 Datos crudos desde API:", data);
        const eventosConvertidos = data.map((cita) => {
          let backgroundColor = "#00aae4";
          if (cita.extendedProps.estado === "Programada") backgroundColor = "#00aae4";
          else if (cita.extendedProps.estado === "En progreso") backgroundColor = "#f59e0b";
          else if (cita.extendedProps.estado === "Completada") backgroundColor = "#16a34a";
          else if (cita.extendedProps.estado === "Cancelada") backgroundColor = "#dc2626";
  
          return {
            id: cita.id,
            title: cita.title,
            start: cita.start,
            end: cita.end,
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
    }; */

   const cargarCitas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/citas`);
      const data = await res.json();
      console.log("🧾 Datos crudos desde API:", data);

      const eventosConvertidos = data.map((cita) => {
        // CONVERSIÓN EXPLÍCITA DE FECHAS
        let startDate, endDate;

        // Opción A: Si vienen como string ISO (recomendado)
/*         startDate = new Date(cita.start);
        endDate = new Date(cita.end); */

        // Opción B: Si vienen en otro formato, ajustar
         startDate = new Date(cita.start.replace(' ', 'T'));
         endDate = new Date(cita.end.replace(' ', 'T'));

        // Verificar si las fechas son válidas
        console.log(`Fecha start original: ${cita.start}, convertida: ${startDate}`);
        console.log(`Fecha end original: ${cita.end}, convertida: ${endDate}`);

        // Manejar fechas inválidas
        if (isNaN(startDate.getTime())) {
          console.error("Fecha start inválida:", cita.start);
          startDate = new Date(); // valor por defecto
        }

        if (isNaN(endDate.getTime())) {
          console.error("Fecha end inválida:", cita.end);
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora
        }

        let backgroundColor = "#00aae4";
        if (cita.extendedProps.estado === "Programada") backgroundColor = "#00aae4";
        else if (cita.extendedProps.estado === "En progreso") backgroundColor = "#f59e0b";
        else if (cita.extendedProps.estado === "Completada") backgroundColor = "#16a34a";
        else if (cita.extendedProps.estado === "Cancelada") backgroundColor = "#dc2626";

        return {
          id: cita.id,
          title: cita.title,
          start: startDate, // Usar la fecha convertida
          end: endDate,     // Usar la fecha convertida
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

  /* const cargarCitas = async () => {
  setIsLoading(true);
  try {
    const res = await fetch(`${BACKEND_URL}/api/citas`);
    const data = await res.json();
    console.log("🧾 Datos crudos desde API:", data);

    // Obtener la zona horaria de Perú (UTC-5)
    const timeZone = 'America/Lima';
    
    const eventosConvertidos = data.map((cita) => {
      // FUNCIÓN PARA CONVERTIR A HORA PERUANA
      const convertirAPeruTime = (dateString) => {
        // Opción 1: Si la fecha ya viene en ISO (ej: "2024-01-15T10:00:00Z")
        let fecha = new Date(dateString);
        
        // Opción 2: Si viene sin zona horaria (ajustar según tu formato)
        // if (!dateString.includes('Z') && !dateString.includes('+')) {
        //   fecha = new Date(`${dateString}-05:00`);
        // } else {
        //   fecha = new Date(dateString);
        // }
        
        // Convertir a zona horaria de Perú
        return new Date(fecha.toLocaleString('en-US', { timeZone }));
      };

      let startDate, endDate;

      // CONVERSIÓN CON ZONA HORARIA DE PERÚ
      startDate = convertirAPeruTime(cita.start);
      endDate = convertirAPeruTime(cita.end);

      // Verificar si las fechas son válidas
      console.log(`Fecha start original: ${cita.start}, convertida Perú: ${startDate}`);
      console.log(`Fecha end original: ${cita.end}, convertida Perú: ${endDate}`);
      
      console.log(`Start en UTC: ${startDate.toISOString()}, Local: ${startDate.toString()}`);
      console.log(`End en UTC: ${endDate.toISOString()}, Local: ${endDate.toString()}`);

      // Manejar fechas inválidas
      if (isNaN(startDate.getTime())) {
        console.error("Fecha start inválida:", cita.start);
        startDate = new Date(new Date().toLocaleString('en-US', { timeZone }));
      }

      if (isNaN(endDate.getTime())) {
        console.error("Fecha end inválida:", cita.end);
        // +1 hora en horario peruano
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        endDate = new Date(endDate.toLocaleString('en-US', { timeZone }));
      }

      let backgroundColor = "#00aae4";
      if (cita.extendedProps.estado === "Programada") backgroundColor = "#00aae4";
      else if (cita.extendedProps.estado === "En progreso") backgroundColor = "#f59e0b";
      else if (cita.extendedProps.estado === "Completada") backgroundColor = "#16a34a";
      else if (cita.extendedProps.estado === "Cancelada") backgroundColor = "#dc2626";

      return {
        id: cita.id,
        title: cita.title,
        start: startDate,
        end: endDate,
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
}; */

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

 /*  const manejarClickCelda = (clickInfo) => {
    console.log("🟢 Click en celda:", clickInfo);

    // Obtener la fecha local correctamente (sin problemas de zona horaria)
    const fechaClick = new Date(clickInfo.date);

    // Crear fecha de inicio (usando métodos locales)
    const fechaInicio = new Date(fechaClick);

    // Crear fecha de fin (1 hora después)
    const fechaFin = new Date(fechaClick);
    fechaFin.setHours(fechaFin.getHours() + 1);

    // Formatear a ISO string sin problemas de zona horaria
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
    console.log("⏰ Hora inicio:", formatoISO(fechaInicio));
    console.log("⏰ Hora fin:", formatoISO(fechaFin));

    setModalKey(prev => prev + 1);
    setModalCita(true);
  }; */

const manejarClickCelda = (clickInfo) => {
  console.log("🟢 Click en celda:", clickInfo);

  // El calendario está configurado con timeZone='America/Lima'
  // clickInfo.dateStr viene formateada en esa zona horaria
  const fechaClick = new Date(clickInfo.dateStr);
  //const fechaClick = clickInfo.dateStr;
  console.log('este es un ejemplo',fechaClick);
  // Crear fecha de fin (1 hora después)
  const fechaFin = new Date(fechaClick);
  //const fechaFin = fechaClick;
  fechaFin.setHours(fechaFin.getHours() + 1);

  // Formatear para input datetime-local (YYYY-MM-DDTHH:MM)
  const formatoInput = (fecha) => {
    return fecha.toISOString().slice(0, 16);
  };

  setForm({
    CitaID: null,
    ClienteID: "",
    EmpId: "",
    Titulo: "",
    Descripcion: "",
    clienteNombre: "",
    FechaInicio: formatoInput(fechaClick),
    FechaFin: formatoInput(fechaFin),
    Estado: "Programada",
    EstadoOriginal: "Programada"
  });

  console.log("📝 Nueva cita - Horario Perú:");
  console.log("⏰ Inicio:", formatoInput(fechaClick));
  console.log("⏰ Fin:", formatoInput(fechaFin));
  console.log("📅 Fecha objeto:", fechaClick.toString());

  setModalKey(prev => prev + 1);
  setModalCita(true);
};



  const manejarClickEvento = (clickInfo) => {
    console.log("🟡 Click en evento:", clickInfo);
    const ev = clickInfo.event;
    const props = ev.extendedProps || {};

    setForm({
      CitaID: ev.id,
      Titulo: props.Titulo || ev.title || "",
      clienteNombre: props.ClienteNombre,
      Descripcion: props.Descripcion || "",
      FechaInicio: ev.startStr,
      FechaFin: ev.endStr || ev.startStr,
      ClienteID: props.ClienteID || "",
      EmpId: props.EmpId || "",
      Estado: props.Estado || "Programada",
      EstadoOriginal: props.Estado || "Programada",
    });

    console.log("📝 Formulario configurado para editar cita");
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

      const cuerpoCita = {
        ...form,
        title: form.Titulo,
        descripcion: form.Descripcion,
        start: form.FechaInicio,
        end: form.FechaFin,
        extendedProps: {
          clienteID: form.ClienteID,
          EmpId: form.EmpId,
          estado: form.Estado
        }
      };

      console.log("📤 Enviando datos:", cuerpoCita);

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
              <p className="text-gray-600 text-xs">Horario: 9:00 AM - 11:00 PM</p>
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
            timeZone='America/Lima' // ← Agrega esta línea
            timeZoneParam='UTC'  // ← INDICA QUE EL BACKEND ENVÍA EN UTC
            nowIndicator={true}
            height="auto"
            // HORARIO CONFIGURADO: 9AM - 11PM
            slotMinTime="09:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            // CAMBIO IMPORTANTE: Slot de 30 minutos para permitir eventos en medias horas
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00" // Mostrar etiquetas cada hora
            locale={esLocale}
            firstDay={1}
            displayEventTime={true} // MOSTRAR TIEMPO en los eventos
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
              meridiem: 'short'
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
                // CAMBIO IMPORTANTE: Slot de 30 minutos
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00:00',
                allDaySlot: false,
                expandRows: true,
                dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'short' },
                dateClick: manejarClickCelda,
                slotEventOverlap: false,
                // CELDAS MÁS ALTAS PARA MEJOR VISUALIZACIÓN
                slotHeight: 60, // Reducido porque ahora hay el doble de slots
                contentHeight: 'auto',
                dayMinHeight: 120,
                dayMaxEvents: true,  // ✅ Permitir todos los eventos
                moreLinkClick: "popover",  // ✅ Popover para eventos adicionales
                // MEJOR ALINEACIÓN DE EVENTOS
                eventPositioned: (info) => {
                  // Forzar alineación correcta
                  const eventEl = info.el;
                  if (eventEl) {
                    eventEl.style.position = 'absolute';
                    eventEl.style.top = '0px';
                  }
                }
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
            // EVENTOS CON MEJOR ALINEACIÓN Y ESPACIADO INTERNO
            eventContent={(arg) => {
              const empleado = arg.event.extendedProps?.EmpleadoNombre || "";
              const titulo = arg.event.title || "";
              const cliente = arg.event.extendedProps?.ClienteNombre || "";
              const estado = arg.event.extendedProps?.Estado || "";

              const horaInicio = arg.timeText || "";

              // Icono según estado
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
                    <div className="font-bold text-white text-[12px] leading-tight truncate flex-1 
                tracking-tight antialiased">
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
                  {horaInicio && (
                    <div className="text-white text-[10px] leading-tight flex items-center gap-1">
                      <span className="text-[8px] flex-shrink-0">🕒</span>
                      <span className="fruncate flex-1">{horaInicio} </span>
                    </div>
                  )}
                  {/* Empleado */}
                  {/*                   {empleado && (
                    <div className="text-white text-[9px] leading-tight opacity-90 flex items-center gap-1">
                      <span className="text-[8px] flex-shrink-0">💼</span>
                      <span className="truncate flex-1">{empleado}</span>
                    </div>
                  )} */}
                </div>
              );
            }}
            // Configuración para mejor alineación
            dayMaxEvents={6}
            moreLinkClick="week"
            moreLinkContent={(args) => {
              return `+${args.num} más`;
            }}
            eventClassNames="border-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer mx-0.5 mb-0.5 align-top"
            dayHeaderClassNames="bg-gray-50 text-gray-700 font-semibold text-sm py-2"
            slotLabelClassNames="text-gray-600 font-medium text-[15px] py-2"
            // nowIndicatorClassNames="bg-red-500 h-full"
            // Configuración de altura
            slotHeight={60}
            expandRows={true}
            contentHeight="auto"
            // Espaciado entre eventos
            eventMargin={1}
            // Configuración adicional para mejor alineación
            dayCellClassNames="min-h-[60px]"
            eventDisplay="block"
            eventMinHeight={40}
            eventShortHeight={40}
            // MEJOR ALINEACIÓN: Forzar que los eventos empiecen en el top
            eventDidMount={(info) => {
              // Asegurar que el evento ocupe el espacio correcto
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
        onClose={handleCloseVentaModal} // ← USA LA NUEVA FUNCIÓN
        onRequestClose={handleCloseVentaModal} // ← ESTA LÍNEA ES IMPORTANTE PARA CUANDO SE HACE CLICK FUERA DEL MODAL
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