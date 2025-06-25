
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, EventProps, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br'; // Import pt-br locale for moment
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../../services/supabaseService';
import { Booking, BookingStatus, Barber } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { MOCK_BARBERS_DATA } from '../../constants';
import { AlertTriangle } from 'lucide-react';

moment.locale('pt-br'); // Set moment to pt-br globally
const localizer = momentLocalizer(moment);

interface CalendarEvent extends Booking {
  title: string;
  start: Date;
  end: Date;
  resourceId?: string; // For resource view (barber)
}

const CustomEvent: React.FC<EventProps<CalendarEvent>> = ({ event }) => {
  let bgColor = 'bg-gray-600'; // Default for other statuses
  if (event.status === BookingStatus.CONFIRMED) bgColor = 'bg-green-600';
  else if (event.status === BookingStatus.PENDING) bgColor = 'bg-yellow-600';
  else if (event.status === BookingStatus.COMPLETED) bgColor = 'bg-blue-600';
  else if (event.status.startsWith('CANCELLED')) bgColor = 'bg-red-700 line-through';
  else if (event.status === BookingStatus.NO_SHOW) bgColor = 'bg-purple-600';


  return (
    <div className={`${bgColor} p-1 text-white rounded-sm text-xs h-full overflow-hidden`}>
      <strong>{event.title}</strong> ({event.barberName})<br />
      {event.clientName}
    </div>
  );
};

const CalendarPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allBarbers, setAllBarbers] = useState<Barber[]>(MOCK_BARBERS_DATA); // Load from constants
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all'); // 'all' or barber.id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.WEEK); // Default view: week

  const fetchBookings = useCallback(async () => {
     if (!currentUser || !currentUser.barbershopId) {
        setError("Usuário ou barbearia não identificados.");
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from<Booking>('bookings')
        .eq('barbershopId', currentUser.barbershopId)
        .select('*');
      if (fetchError) throw fetchError;

      const calendarEvents = (data || []).map(booking => ({
        ...booking,
        title: booking.serviceName,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.barbershopId]);

  useEffect(() => {
    fetchBookings();
    // In real app, fetch barbers for filter
    if (currentUser?.barbershopId) {
        // const fetchedBarbers = await getBarbersForBarbershop(currentUser.barbershopId);
        // setAllBarbers(fetchedBarbers); // Replace MOCK_BARBERS_DATA
    }
  }, [fetchBookings, currentUser?.barbershopId]);

  const filteredEvents = useMemo(() => {
    if (selectedBarberId === 'all') return events;
    return events.filter(event => event.barberId === selectedBarberId);
  }, [events, selectedBarberId]);

  const barberResources = useMemo(() => {
    // Resource view only for Day/Week when multiple barbers are shown
    if (currentView !== Views.DAY && currentView !== Views.WEEK) return undefined; 
    if (selectedBarberId === 'all') {
      return allBarbers.map(barber => ({ resourceId: barber.id, resourceTitle: barber.name }));
    }
    // If a specific barber is selected, resource view is not needed or should show only that one.
    // For simplicity, when one barber is selected, we don't use resource view.
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

  // Define custom styles for calendar elements using eventPropGetter
  const eventStyleGetter = (event: CalendarEvent, start: Date, end: Date, isSelected: boolean) => {
    let style: React.CSSProperties = {
        borderRadius: '3px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 4px',
    };
    if (event.status === BookingStatus.CONFIRMED) style.backgroundColor = '#10B981'; // Green
    else if (event.status === BookingStatus.PENDING) style.backgroundColor = '#F59E0B'; // Amber
    else if (event.status === BookingStatus.COMPLETED) style.backgroundColor = '#3B82F6'; // Blue
    else if (event.status.startsWith('CANCELLED')) {
        style.backgroundColor = '#EF4444'; // Red
        style.textDecoration = 'line-through';
    } else if (event.status === BookingStatus.NO_SHOW) {
        style.backgroundColor = '#8B5CF6'; // Purple
    }
    else style.backgroundColor = '#6B7280'; // Gray for others
    
    return { style };
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Agenda Visual</h1>
      
      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}

      <Card>
        <div className="p-4 mb-4 bg-gray-800 bg-opacity-30 rounded-md border border-gray-700">
          <Select
            name="barberFilter"
            label="Filtrar por Barbeiro:"
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            options={barberOptions}
            containerClassName="max-w-xs"
          />
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-vermelho-bordo"></div></div>
        ) : (
            <div className="h-[70vh] text-branco-nav p-1 bg-azul-marinho rounded-md shadow-inner border border-gray-700 calendar-container">
                <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    components={{ 
                        // event: CustomEvent // Using eventStyleGetter instead for more control with standard rendering
                    }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    defaultView={Views.WEEK}
                    onView={(view) => setCurrentView(view)}
                    messages={messages}
                    culture='pt-br'
                    step={30} 
                    timeslots={2} 
                    min={moment().startOf('day').add(8, 'hours').toDate()} 
                    max={moment().startOf('day').add(22, 'hours').toDate()} 
                    resources={barberResources} // Apply resources if defined
                    resourceIdAccessor="resourceId"
                    resourceTitleAccessor="resourceTitle"
                />
            </div>
        )}
      </Card>

      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={`Detalhes: ${selectedEvent.title}`}>
          <div className="space-y-2 text-sm">
            <p><strong className="text-gray-400">Cliente:</strong> <span className="text-branco-nav">{selectedEvent.clientName}</span></p>
            <p><strong className="text-gray-400">Serviço:</strong> <span className="text-branco-nav">{selectedEvent.serviceName}</span></p>
            <p><strong className="text-gray-400">Barbeiro:</strong> <span className="text-branco-nav">{selectedEvent.barberName}</span></p>
            <p><strong className="text-gray-400">Início:</strong> <span className="text-branco-nav">{moment(selectedEvent.start).format('DD/MM/YYYY HH:mm')}</span></p>
            <p><strong className="text-gray-400">Fim:</strong> <span className="text-branco-nav">{moment(selectedEvent.end).format('DD/MM/YYYY HH:mm')}</span></p>
            <p><strong className="text-gray-400">Status:</strong> <span className="text-branco-nav">{selectedEvent.status.toUpperCase()}</span></p>
            <p><strong className="text-gray-400">Preço:</strong> <span className="text-branco-nav">R$ {selectedEvent.priceAtBooking.toFixed(2)}</span></p>
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