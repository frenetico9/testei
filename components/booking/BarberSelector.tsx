
import React from 'react';
import { Barber } from '../../types';
import { UserCircle } from 'lucide-react'; // Changed from Scissors to UserCircle

interface BarberSelectorProps {
  barbers: Barber[];
  selectedBarberId: string | null;
  onSelectBarber: (barberId: string) => void;
  serviceId: string | null; // To filter barbers based on service if needed
}

const BarberSelector: React.FC<BarberSelectorProps> = ({ barbers, selectedBarberId, onSelectBarber, serviceId }) => {
  // In a real app, you might filter barbers based on who can perform the selectedServiceId
  // For this mock, we assume all listed barbers can perform any service they are generally associated with.
  const availableBarbers = barbers; // Potentially filter here: barbers.filter(b => b.services.includes(serviceId));

  if (!availableBarbers || availableBarbers.length === 0) {
    return <p className="text-gray-400 text-center py-4">Nenhum barbeiro disponível para este serviço.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-roboto-slab font-semibold text-branco-nav mb-3">2. Selecione o Barbeiro</h3>
      <div className="grid md:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {availableBarbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => onSelectBarber(barber.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-azul-marinho flex items-center space-x-3
                        ${selectedBarberId === barber.id 
                          ? 'bg-vermelho-bordo border-vermelho-bordo-light text-branco-nav shadow-lg scale-105' 
                          : 'bg-gray-700 bg-opacity-60 border-gray-600 hover:border-vermelho-bordo text-gray-200 hover:text-branco-nav'
                        }`}
          >
            <img 
              src={barber.profilePictureUrl || `https://picsum.photos/seed/${barber.id}/80/80`} 
              alt={barber.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-500"
            />
            <div>
              <h4 className="font-semibold text-md">{barber.name}</h4>
              {barber.specialties && barber.specialties.length > 0 && (
                <p className={`text-xs ${selectedBarberId === barber.id ? 'text-red-100' : 'text-gray-400'}`}>
                  {barber.specialties.join(', ')}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BarberSelector;
    