
import React, { useState, useEffect, useCallback } from 'react';
import { getAvailableTimeSlots } from '../../services/supabaseService'; 
import { Calendar, Clock } from 'lucide-react';
import Button from '../ui/Button';

interface DateTimePickerProps {
  barbershopId: string;
  selectedBarberId: string | null;
  selectedServiceId: string | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTime: string | null; // HH:mm
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  minDate?: Date; // Minimum selectable date
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  barbershopId,
  selectedBarberId,
  selectedServiceId,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  minDate
}) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(minDate || Date.now()));
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0,0,0,0); 

  const effectiveMinDate = minDate ? new Date(minDate) : today;
  effectiveMinDate.setHours(0,0,0,0);


  const fetchTimes = useCallback(async (date: string) => {
    // If barber can be "any", allow fetching if service is selected.
    // The getAvailableTimeSlots mock might need adjustment for "any" barber.
    // If selectedBarberId is null it means "any barber" for services that allow it
    if (!selectedServiceId) {
        setAvailableTimes([]);
        setCalendarError("Selecione um serviço primeiro.");
        return;
    }

    setLoadingTimes(true);
    setCalendarError(null);
    try {
      const times = await getAvailableTimeSlots(barbershopId, selectedBarberId, selectedServiceId, date);
      setAvailableTimes(times);
      if (times.length === 0) {
        setCalendarError("Nenhum horário disponível para esta data e combinação.");
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
      setCalendarError("Erro ao buscar horários. Tente novamente.");
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  }, [barbershopId, selectedBarberId, selectedServiceId]); 
  

  useEffect(() => {
    if (selectedDate && selectedServiceId) { // Ensure service is selected before fetching times
      fetchTimes(selectedDate);
    } else {
      setAvailableTimes([]); 
      if (!selectedServiceId && selectedDate) {
        setCalendarError("Selecione um serviço para ver os horários.")
      }
    }
  }, [selectedDate, fetchTimes, selectedServiceId]);

  const handleDateChange = (date: Date) => {
    if (date < effectiveMinDate) {
        return; 
    }
    const dateString = date.toISOString().split('T')[0];
    onSelectDate(dateString);
    onSelectTime(''); 
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const dayCells: React.ReactNode[] = [];

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayNames.forEach(day => {
      dayCells.push(<div key={`header-${day}`} className="text-center text-xs font-semibold text-gray-400 p-1">{day}</div>);
    });

    for (let i = 0; i < firstDay; i++) {
      dayCells.push(<div key={`empty-${i}`} className="p-1"></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      date.setHours(0,0,0,0); 
      const dateString = date.toISOString().split('T')[0];
      const isPast = date < effectiveMinDate;
      const isSelected = selectedDate === dateString;

      dayCells.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateChange(date)}
          disabled={isPast || !selectedServiceId} // Disable if service not selected
          className={`w-full text-center py-2.5 rounded-md text-sm transition-colors duration-150 focus:outline-none
            ${isPast || !selectedServiceId ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-azul-primario hover:text-white focus:ring-2 focus:ring-azul-primario'}
            ${isSelected ? 'bg-azul-primario text-white font-bold ring-2 ring-azul-primario-hover' : 'text-gray-200'}
            ${!selectedServiceId && !isPast ? 'opacity-50' : ''}
          `}
          title={!selectedServiceId && !isPast ? "Selecione um serviço primeiro" : undefined}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-cinza-fundo-elemento bg-opacity-50 p-4 rounded-lg border border-cinza-borda">
        <div className="flex justify-between items-center mb-3">
          <Button size="small" variant="outline" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} disabled={currentMonth <= effectiveMinDate && currentMonth.getMonth() === effectiveMinDate.getMonth() && currentMonth.getFullYear() === effectiveMinDate.getFullYear()}>
            Anterior
          </Button>
          <h4 className="font-semibold text-branco-nav">
            {currentMonth.toLocaleString('default', { month: 'long' })} {year}
          </h4>
          <Button size="small" variant="outline" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
            Próximo
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayCells}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-roboto-slab font-semibold text-branco-nav mb-3 flex items-center">
            <Calendar size={22} className="mr-2 text-azul-primario" /> 3. Escolha a Data
        </h3>
        {renderCalendar()}
      </div>

      {selectedDate && selectedServiceId && ( // Only show time picker if date and service are selected
        <div>
          <h3 className="text-xl font-roboto-slab font-semibold text-branco-nav mb-3 flex items-center">
            <Clock size={22} className="mr-2 text-azul-primario" /> 4. Escolha o Horário
          </h3>
          {loadingTimes && <p className="text-gray-400">Carregando horários...</p>}
          {calendarError && !loadingTimes && <p className="text-red-400 text-sm">{calendarError}</p>}
          {!loadingTimes && availableTimes.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => onSelectTime(time)}
                  className={`w-full ${selectedTime === time ? 'text-white' : 'text-azul-primario hover:text-white'}`}
                >
                  {time}
                </Button>
              ))}
            </div>
          )}
          {!loadingTimes && availableTimes.length === 0 && !calendarError && (
             <p className="text-gray-400">Nenhum horário disponível para a data selecionada.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
