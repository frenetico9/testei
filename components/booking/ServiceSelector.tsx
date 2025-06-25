
import React from 'react';
import { Service } from '../../types';
import { Scissors } from 'lucide-react';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services, selectedServiceId, onSelectService }) => {
  if (!services || services.length === 0) {
    return <p className="text-gray-400 text-center py-4">Nenhum serviço disponível para seleção.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-roboto-slab font-semibold text-branco-nav mb-3">1. Selecione o Serviço</h3>
      <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-azul-marinho
                        ${selectedServiceId === service.id 
                          ? 'bg-azul-primario border-azul-primario-hover text-branco-nav shadow-lg scale-105' 
                          : 'bg-cinza-fundo-elemento bg-opacity-60 border-cinza-borda hover:border-azul-primario text-gray-200 hover:text-branco-nav'
                        }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-md">{service.name}</h4>
              <Scissors size={18} className={selectedServiceId === service.id ? 'text-white' : 'text-azul-primario'} />
            </div>
            <p className={`text-xs mb-2 ${selectedServiceId === service.id ? 'text-blue-100' : 'text-gray-400'}`}>
              {service.description || 'Detalhes do serviço.'}
            </p>
            <div className="flex justify-between items-baseline">
              <span className={`font-bold text-lg ${selectedServiceId === service.id ? 'text-white' : 'text-azul-primario'}`}>
                R$ {service.price.toFixed(2)}
              </span>
              <span className={`text-xs ${selectedServiceId === service.id ? 'text-blue-100' : 'text-gray-500'}`}>
                Duração: {service.duration} min
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelector;