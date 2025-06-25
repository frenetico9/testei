
import React from 'react';
import Input from '../ui/Input';
import { User } from '../../types';
import { User as UserIcon } from 'lucide-react';
import { ROUTES } from '../../constants'; // Added import for ROUTES

interface BookingFormProps {
  clientDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onDetailsChange: (field: keyof BookingFormProps['clientDetails'], value: string) => void;
  currentUser: User | null; // If user is logged in, prefill
}

const BookingForm: React.FC<BookingFormProps> = ({ clientDetails, onDetailsChange, currentUser }) => {
  
  React.useEffect(() => {
    if (currentUser) {
      onDetailsChange('name', currentUser.name || '');
      onDetailsChange('email', currentUser.email || '');
      onDetailsChange('phone', currentUser.phone || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Only on currentUser change

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-roboto-slab font-semibold text-branco-nav mb-3 flex items-center">
        <UserIcon size={22} className="mr-2 text-vermelho-bordo" /> 5. Seus Dados
      </h3>
      {currentUser && (
        <p className="text-sm text-gray-300 mb-4">
          Olá, {currentUser.name}! Seus dados foram preenchidos. Confira se estão corretos.
        </p>
      )}
      <Input
        label="Nome Completo"
        name="clientName"
        value={clientDetails.name}
        onChange={(e) => onDetailsChange('name', e.target.value)}
        placeholder="Seu nome completo"
        required
        disabled={!!currentUser}
      />
      <Input
        label="E-mail"
        name="clientEmail"
        type="email"
        value={clientDetails.email}
        onChange={(e) => onDetailsChange('email', e.target.value)}
        placeholder="seuemail@exemplo.com"
        required
        disabled={!!currentUser}
      />
      <Input
        label="Telefone (com DDD)"
        name="clientPhone"
        type="tel"
        value={clientDetails.phone}
        onChange={(e) => onDetailsChange('phone', e.target.value)}
        placeholder="(XX) XXXXX-XXXX"
        required
        disabled={!!currentUser}
      />
      {!currentUser && (
        <p className="text-xs text-gray-400">
            Já tem conta? <a href={`#${ROUTES.LOGIN}?redirect=${encodeURIComponent(window.location.hash)}`} className="text-vermelho-bordo hover:underline">Faça login</a> para agilizar.
        </p>
      )}
    </div>
  );
};

export default BookingForm;