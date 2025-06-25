
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, EventProps, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase, getBarbersForBarbershop } from '../../services/supabaseService';
import { Booking, BookingStatus, Barber } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
// import { MOCK_BARBERS_DATA } from '../../constants'; // Use fetched data primarily
import { AlertTriangle } from 'lucide-react';

moment.locale('pt-br'); 
const localizer = momentLocalizer(moment);

interface CalendarEvent extends Booking {
  title: string;
  start: Date;
  end: Date;
  resourceId?: string; 
}

const CalendarPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allBarbers, setAllBarbers] = useState<Barber[]>([]); 
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.WEEK); 

  const fetchCalendarData = useCallback(async () => {
     if (!currentUser || !currentUser.barbershopId) {
        setError("Usuário ou barbearia não identificados.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const barbershopId = currentUser.barbershopId;
      const [bookingsResponse, barbersData] = await Promise.all([
        supabase.from<Booking>('bookings').eq('barbershopId', barbershopId).select('*'),
        getBarbersForBarbershop(barbershopId)
      ]);

      if (bookingsResponse.error) throw bookingsResponse.error;
      // Handle barbersData error if necessary, or proceed if it's not critical for basic calendar view
      if (barbersData) {
        setAllBarbers(barbersData);
      } else {
        console.warn("Could not fetch barbers for calendar resources.");
        setAllBarbers([]); // Or fallback
      }
      

      const calendarEvents = (bookingsResponse.data || []).map(booking => ({
        ...booking,
        title: `${booking.clientName} - ${booking.serviceName}`, // More descriptive title
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        resourceId: booking.barberId,
      }));
      setEvents(calendarEvents);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar agendamentos para o calendário.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const filteredEvents = useMemo(() => {
    if (selectedBarberId === 'all') return events;
    return events.filter(event => event.barberId === selectedBarberId);
  }, [events, selectedBarberId]);

  const barberResources = useMemo(() => {
    // Enable resources for Day and Week view when 'all' barbers are selected for column view
    if ((currentView === Views.DAY || currentView === Views.WEEK) && selectedBarberId === 'all' && allBarbers.length > 0) {
      return allBarbers.map(barber => ({ resourceId: barber.id, resourceTitle: barber.name }));
    }
    // If a specific barber is selected, or view is month/agenda, don't use resource columns.
    // The calendar will filter events by selectedBarberId if not 'all'.
    return undefined; 
  }, [allBarbers, selectedBarberId, currentView]);


  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };
  
  const messages = {
    allDay: 'Dia Inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
    showMore: (total: number) => `+ Ver mais (${total})`
  };

  const barberOptions = [{ value: 'all', label: 'Todos Barbeiros' }, ...allBarbers.map(b => ({ value: b.id, label: b.name }))];

  const eventStyleGetter = (event: CalendarEvent, start: Date, end: Date, isSelected: boolean) => {
    let style: React.CSSProperties = {
        borderRadius: '3px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '3px 5px',
        fontSize: '0.75rem', 
    };
    if (event.status === BookingStatus.CONFIRMED) style.backgroundColor = '#10B981'; 
    else if (event.status === BookingStatus.PENDING) style.backgroundColor = '#F59E0B'; 
    else if (event.status === BookingStatus.COMPLETED) style.backgroundColor = '#3B82F6'; 
    else if (event.status.startsWith('CANCELLED')) {
        style.backgroundColor = '#EF4444'; 
        style.textDecoration = 'line-through';
    } else if (event.status === BookingStatus.NO_SHOW) {
        style.backgroundColor = '#8B5CF6'; 
    }
    else style.backgroundColor = '#6B7280'; 
    
    if (isSelected) {
        style.outline = `2px solid ${style.backgroundColor || '#3B82F6'}`; 
        style.outlineOffset = '2px';
        style.opacity = 1;
    }

    return { style };
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Agenda Visual</h1>
      
      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}

      <Card>
        <div className="p-4 mb-4 bg-cinza-fundo-elemento bg-opacity-30 rounded-md border border-cinza-borda">
          <Select
            name="barberFilter"
            label="Filtrar por Barbeiro:"
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            options={barberOptions}
            containerClassName="max-w-xs mb-0"
          />
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-azul-primario"></div></div>
        ) : (
            <div className="h-[70vh] text-branco-nav p-1 bg-azul-marinho rounded-md shadow-inner border border-cinza-borda calendar-container">
                <style>{`
                    .rbc-event { padding: 3px 5px !important; }
                    .rbc-event-label { font-size: 0.7rem !important; }
                    .rbc-event-content { font-size: 0.75rem !important; white-space: normal; } /* Allow text wrapping */
                    .rbc-toolbar button { color: #BFDBFE !important; background-color: transparent !important; border-color: #3B82F6 !important; }
                    .rbc-toolbar button:hover, .rbc-toolbar button:focus { color: #FFFFFF !important; background-color: #3B82F6 !important; border-color: #2563EB !important; }
                    .rbc-toolbar button.rbc-active { color: #FFFFFF !important; background-color: #3B82F6 !important; box-shadow: none !important; }
                    .rbc-header { border-bottom: 1px solid #374151; color: #BFDBFE; text-align: center; }
                    .rbc-time-header-gutter .rbc-header, .rbc-time-slot, .rbc-timeslot-group { border-color: #374151 !important; }
                    .rbc-day-bg { border-color: #374151 !important; }
                    .rbc-today { background-color: rgba(59, 130, 246, 0.1) !important; }
                    .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: #374151 !important; }
                    .rbc-agenda-table th, .rbc-agenda-table td { border-color: #374151 !important; color: #E0E0E0; }
                    .rbc-agenda-date-cell { color: #BFDBFE; }
                    .rbc-off-range-bg { background-color: #162435 !important; } 
                    .rbc-time-content > .rbc-event { /* Specific for week/day view events */
                        min-height: 20px; /* Ensure a minimum height */
                    }
                    .rbc-month-row .rbc-event-content { /* For month view events */
                         white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    }
                     .calendar-container .rbc-time-gutter, .calendar-container .rbc-header {
                        color: #E0E0E0; /* Lighter text for time gutter and headers */
                    }
                    .calendar-container .rbc-current-time-indicator {
                        background-color: #FACC15; /* Yellow for current time */
                        height: 2px !important;
                    }

                `}</style>
                <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    defaultView={Views.WEEK}
                    view={currentView}
                    onView={(view) => setCurrentView(view)}
                    messages={messages}
                    culture='pt-br'
                    step={30} 
                    timeslots={2} 
                    min={moment().startOf('day').add(8, 'hours').toDate()} 
                    max={moment().startOf('day').add(22, 'hours').toDate()} 
                    resources={barberResources} 
                    resourceIdAccessor="resourceId"
                    resourceTitleAccessor="resourceTitle"
                    popup 
                    selectable
                    onSelectSlot={(slotInfo) => {
                        console.log("Slot selected:", slotInfo);
                        // Potentially open a modal to create a new booking here
                    }}
                />
            </div>
        )}
      </Card>

      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={`Detalhes: ${selectedEvent.serviceName}`}>
          <div className="space-y-2 text-sm">
            <p><strong className="text-gray-400">Cliente:</strong> <span className="text-branco-nav">{selectedEvent.clientName}</span></p>
            <p><strong className="text-gray-400">Serviço:</strong> <span className="text-branco-nav">{selectedEvent.serviceName}</span></p>
            <p><strong className="text-gray-400">Barbeiro:</strong> <span className="text-branco-nav">{selectedEvent.barberName}</span></p>
            <p><strong className="text-gray-400">Início:</strong> <span className="text-branco-nav">{moment(selectedEvent.start).format('DD/MM/YYYY HH:mm')}</span></p>
            <p><strong className="text-gray-400">Fim:</strong> <span className="text-branco-nav">{moment(selectedEvent.end).format('DD/MM/YYYY HH:mm')}</span></p>
            <p><strong className="text-gray-400">Status:</strong> <span className="text-branco-nav">{selectedEvent.status.replace(/_/g, ' ').toUpperCase()}</span></p>
            <p><strong className="text-gray-400">Preço:</strong> <span className="text-branco-nav">R$ {selectedEvent.priceAtBooking.toFixed(2)}</span></p>
            {selectedEvent.notes && <p><strong className="text-gray-400">Notas:</strong> <span className="text-branco-nav">{selectedEvent.notes}</span></p>}
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={closeModal}>Fechar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;
