
import React from 'react';
import { Service, Barber, Booking } from '../../types';
import { CheckCircle, Calendar, Clock, User, ScissorsIcon, MapPin, UserCircle as UserCircleIcon } from 'lucide-react'; // Renamed to avoid conflict

interface BookingConfirmationProps {
  booking: Booking; 
  service: Service | undefined;
  barber: Barber | undefined;
  barbershopName: string; 
  barbershopAddress: string; 
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, service, barber, barbershopName, barbershopAddress }) => {
  if (!service || !barber) {
    return <p className="text-red-400">Erro ao carregar detalhes da confirmação.</p>;
  }

  const startTime = new Date(booking.startTime);

  return (
    <div className="text-center p-6 bg-cinza-fundo-elemento bg-opacity-50 rounded-lg shadow-xl border border-cinza-borda">
      <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
      <h2 className="text-3xl font-roboto-slab font-bold text-branco-nav mb-4">Agendamento Confirmado!</h2>
      <p className="text-gray-300 mb-6">
        Seu horário em <strong className="text-azul-primario">{barbershopName}</strong> foi confirmado com sucesso.
      </p>

      <div className="text-left space-y-3 bg-azul-marinho p-4 rounded-md border border-gray-700">
        <p className="flex items-center text-gray-200">
          <User size={18} className="mr-3 text-azul-primario" />
          <span className="font-semibold mr-1">Cliente:</span> {booking.clientName}
        </p>
        <p className="flex items-center text-gray-200">
          <ScissorsIcon size={18} className="mr-3 text-azul-primario" />
          <span className="font-semibold mr-1">Serviço:</span> {service.name} (R$ {booking.priceAtBooking.toFixed(2)})
        </p>
        <p className="flex items-center text-gray-200">
          <UserCircleIcon size={18} className="mr-3 text-azul-primario" />
          <span className="font-semibold mr-1">Barbeiro:</span> {barber.name}
        </p>
        <p className="flex items-center text-gray-200">
          <Calendar size={18} className="mr-3 text-azul-primario" />
          <span className="font-semibold mr-1">Data:</span> {startTime.toLocaleDateString('pt-BR')}
        </p>
        <p className="flex items-center text-gray-200">
          <Clock size={18} className="mr-3 text-azul-primario" />
          <span className="font-semibold mr-1">Horário:</span> {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
         <p className="flex items-start text-gray-200">
          <MapPin size={18} className="mr-3 mt-1 text-azul-primario flex-shrink-0" />
          <div>
            <span className="font-semibold mr-1">Local:</span> {barbershopName} <br/>
            <span className="text-sm text-gray-400">{barbershopAddress}</span>
          </div>
        </p>
      </div>

      <p className="text-sm text-gray-400 mt-6">
        Você receberá um e-mail de confirmação em breve. Lembretes serão enviados 1 dia e 1 hora antes do seu agendamento.
        (Funcionalidade de e-mail e lembretes simulada para esta demonstração).
      </p>
       <p className="text-sm text-gray-400 mt-2">
        ID do Agendamento: <span className="font-mono text-xs bg-gray-700 px-1 py-0.5 rounded">{booking.id}</span>
      </p>
    </div>
  );
};

export default BookingConfirmation;