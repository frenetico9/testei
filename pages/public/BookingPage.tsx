
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Barbershop, Service, Barber, Booking, User } from '../../types';
import { 
    getBarbershopDetails, getServicesForBarbershop, getBarbersForBarbershop, 
    createBooking 
} from '../../services/supabaseService'; // Mocked services
import { useAuth } from '../../hooks/useAuth';
import ServiceSelector from '../../components/booking/ServiceSelector';
import BarberSelector from '../../components/booking/BarberSelector';
import DateTimePicker from '../../components/booking/DateTimePicker';
import BookingForm from '../../components/booking/BookingForm';
import BookingConfirmation from '../../components/booking/BookingConfirmation';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { ROUTES } from '../../constants';

type BookingStep = 'service' | 'barber' | 'datetime' | 'details' | 'confirmation';

const BookingPage: React.FC = () => {
  const { barbershopId } = useParams<{ barbershopId: string }>();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allBarbers, setAllBarbers] = useState<Barber[]>([]);
  
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(searchParams.get('service'));
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(searchParams.get('barber'));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState({ name: '', email: '', phone: '' });
  
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!barbershopId) {
        setError("ID da barbearia não fornecido.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [bsData, srvData, brbData] = await Promise.all([
          getBarbershopDetails(barbershopId),
          getServicesForBarbershop(barbershopId),
          getBarbersForBarbershop(barbershopId),
        ]);
        
        if (!bsData) {
          setError("Barbearia não encontrada.");
          setLoading(false);
          return;
        }
        setBarbershop(bsData);
        setAllServices(srvData.filter(s => s.isActive)); // Only active services
        setAllBarbers(brbData);

        // Auto-advance if service/barber pre-selected from URL
        if (searchParams.get('service') && srvData.length > 0) {
            if (searchParams.get('barber') && brbData.length > 0) {
                setCurrentStep('datetime');
            } else if (brbData.length > 0) {
                 setCurrentStep('barber');
            } else {
                setCurrentStep('datetime'); // No barbers to select, proceed to datetime
            }
        }

      } catch (err) {
        console.error("Erro ao buscar dados para agendamento:", err);
        setError("Não foi possível carregar os dados para agendamento.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [barbershopId, searchParams]);
  
  const selectedService = useMemo(() => allServices.find(s => s.id === selectedServiceId), [allServices, selectedServiceId]);
  const selectedBarber = useMemo(() => allBarbers.find(b => b.id === selectedBarberId), [allBarbers, selectedBarberId]);

  // Filter barbers based on selected service (if service has assignedBarberIds)
  const availableBarbersForService = useMemo(() => {
    if (!selectedService || !selectedService.assignedBarberIds || selectedService.assignedBarberIds.length === 0) {
      return allBarbers; // If service doesn't specify, all barbers are available
    }
    return allBarbers.filter(barber => selectedService.assignedBarberIds.includes(barber.id));
  }, [selectedService, allBarbers]);


  const handleNextStep = () => {
    setSubmitError(null); // Clear previous errors
    switch (currentStep) {
      case 'service':
        if (!selectedServiceId) { setSubmitError("Por favor, selecione um serviço."); return; }
        if(availableBarbersForService.length === 0){ // No barbers for this service or no barbers at all
            setSelectedBarberId(null); // Ensure no barber is selected
            setCurrentStep('datetime'); // Skip barber selection
        } else if (availableBarbersForService.length === 1) {
            setSelectedBarberId(availableBarbersForService[0].id); // Auto-select if only one
            setCurrentStep('datetime');
        }
        else {
            setCurrentStep('barber');
        }
        break;
      case 'barber':
        if (!selectedBarberId && availableBarbersForService.length > 0) { setSubmitError("Por favor, selecione um barbeiro."); return; }
        setCurrentStep('datetime');
        break;
      case 'datetime':
        if (!selectedDate || !selectedTime) { setSubmitError("Por favor, selecione data e horário."); return; }
        setCurrentStep('details');
        break;
      case 'details':
        if (!clientDetails.name || !clientDetails.email || !clientDetails.phone) { 
          setSubmitError("Por favor, preencha todos os seus dados."); return; 
        }
        handleSubmitBooking();
        break;
      default:
        break;
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    switch (currentStep) {
      case 'barber':
        setCurrentStep('service');
        break;
      case 'datetime':
         if(availableBarbersForService.length === 0 || availableBarbersForService.length === 1){
            setCurrentStep('service'); // Skip barber selection back
        } else {
            setCurrentStep('barber');
        }
        break;
      case 'details':
        setCurrentStep('datetime');
        break;
      default:
        break;
    }
  };

  const handleClientDetailsChange = (field: keyof typeof clientDetails, value: string) => {
    setClientDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitBooking = async () => {
    if (!barbershopId || !selectedServiceId || (!selectedBarberId && availableBarbersForService.length > 0) || !selectedDate || !selectedTime || !selectedService) {
      setSubmitError("Informações incompletas para finalizar o agendamento.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const bookingStartTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      
      const bookingData = {
        barbershopId,
        clientId: currentUser?.id || 'guest_user', // Handle guest users
        clientName: clientDetails.name,
        clientEmail: clientDetails.email,
        clientPhone: clientDetails.phone,
        serviceId: selectedServiceId,
        serviceName: selectedService.name,
        // If no barbers, selectedBarberId might be null. Adapt backend if this is allowed.
        // Forcing a default or error if no barbers for service and barber required.
        // For this mock, if selectedBarberId is null and availableBarbersForService is empty, it's okay.
        // If availableBarbersForService is not empty but selectedBarberId is null, it's an issue.
        barberId: selectedBarberId || (availableBarbersForService.length === 0 ? 'any_available_mock' : ''), 
        barberName: selectedBarber?.name || (availableBarbersForService.length === 0 ? 'Qualquer Barbeiro' : ''),
        startTime: bookingStartTime,
        priceAtBooking: selectedService.price,
        notes: '', // Optional field
      };

      if (availableBarbersForService.length > 0 && !selectedBarberId) {
          throw new Error("Barbeiro não selecionado, mas é necessário para este serviço.");
      }

      // @ts-ignore
      const newBooking = await createBooking(bookingData);
      setConfirmedBooking(newBooking);
      setCurrentStep('confirmation');
    } catch (err: any) {
      console.error("Erro ao criar agendamento:", err);
      setSubmitError(err.message || "Não foi possível finalizar o agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStepTitle = () => {
    if (!barbershop) return "Carregando...";
    switch(currentStep) {
        case 'service': return `Agendar em ${barbershop.name}`;
        case 'barber': return `Escolha seu Barbeiro`;
        case 'datetime': return `Escolha Data e Horário`;
        case 'details': return `Confirme seus Dados`;
        case 'confirmation': return `Agendamento Realizado!`;
        default: return "Agendamento Online";
    }
  }

  const minBookingDate = new Date(); // Bookings can be made for today onwards

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vermelho-bordo"></div></div>;
  if (error) return <div className="text-center py-10 text-red-400">{error} <Link to={ROUTES.HOME} className="text-vermelho-bordo underline">Voltar</Link></div>;
  if (!barbershop) return <div className="text-center py-10 text-gray-400">Barbearia não encontrada.</div>;

  return (
    <div className="min-h-screen bg-azul-marinho py-8 px-4 md:px-0">
      <div className="max-w-2xl mx-auto">
        <Card title={getStepTitle()} titleClassName="text-2xl text-center" className="shadow-2xl">
          {currentStep !== 'confirmation' && (
            <div className="mb-6 flex justify-between items-center text-sm text-gray-400">
               <Link to={`${ROUTES.BARBERSHOP_PUBLIC}/${barbershopId}`} className="hover:text-vermelho-bordo flex items-center">
                 <ArrowLeft size={16} className="mr-1"/> Voltar para Barbearia
               </Link>
               <span>Passo: {Object.keys({'service':1, 'barber':2, 'datetime':3, 'details':4, 'confirmation':5}).indexOf(currentStep) + 1} de 4</span>
            </div>
          )}

          {submitError && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-300 p-3 rounded-md mb-6 text-sm flex items-center">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
              {submitError}
            </div>
          )}

          {currentStep === 'service' && (
            <ServiceSelector services={allServices} selectedServiceId={selectedServiceId} onSelectService={setSelectedServiceId} />
          )}
          {currentStep === 'barber' && (
            <BarberSelector barbers={availableBarbersForService} selectedBarberId={selectedBarberId} onSelectBarber={setSelectedBarberId} serviceId={selectedServiceId} />
          )}
          {currentStep === 'datetime' && (
            <DateTimePicker
              barbershopId={barbershopId!}
              selectedBarberId={selectedBarberId}
              selectedServiceId={selectedServiceId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={setSelectedDate}
              onSelectTime={setSelectedTime}
              minDate={minBookingDate}
            />
          )}
          {currentStep === 'details' && (
            <BookingForm clientDetails={clientDetails} onDetailsChange={handleClientDetailsChange} currentUser={currentUser} />
          )}
          {currentStep === 'confirmation' && confirmedBooking && selectedService && (selectedBarber || availableBarbersForService.length === 0) && (
            <BookingConfirmation 
              booking={confirmedBooking} 
              service={selectedService} 
              // Pass selectedBarber if it exists, otherwise a mock/placeholder if no barbers were selectable
              barber={selectedBarber || (availableBarbersForService.length === 0 ? {id: 'any', name: 'Qualquer Barbeiro'} as Barber : undefined)}
              barbershopName={barbershop.name}
              barbershopAddress={barbershop.address}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep !== 'confirmation' && (
            <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={handlePrevStep} 
                disabled={currentStep === 'service' || isSubmitting}
                leftIcon={<ArrowLeft size={18}/>}
              >
                Voltar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleNextStep} 
                isLoading={isSubmitting && currentStep === 'details'}
                disabled={isSubmitting}
                rightIcon={currentStep === 'details' ? <Check size={18}/> : undefined}
              >
                {currentStep === 'details' ? 'Confirmar Agendamento' : 'Próximo'}
              </Button>
            </div>
          )}
          {currentStep === 'confirmation' && (
             <div className="mt-8 text-center">
                <Link to={`${ROUTES.BARBERSHOP_PUBLIC}/${barbershopId}`}>
                    <Button variant="primary">Voltar para a Barbearia</Button>
                </Link>
             </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
    