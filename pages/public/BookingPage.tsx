
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Barbershop, Service, Barber, Booking, User } from '../../types';
import { 
    getBarbershopDetails, getServicesForBarbershop, getBarbersForBarbershop, 
    createBooking 
} from '../../services/supabaseService'; 
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
  
  const initialServiceId = searchParams.get('service');
  const initialBarberId = searchParams.get('barber');

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(initialServiceId);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(initialBarberId);
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
        setError(null);
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
        const activeServices = srvData.filter(s => s.isActive);
        setAllServices(activeServices); 
        setAllBarbers(brbData);

        // Pre-select service if in query params and valid
        if (initialServiceId && !activeServices.find(s => s.id === initialServiceId)) {
            setSelectedServiceId(null); // Invalid service ID from params
        }

        // Determine initial step based on query params and data
        if (initialServiceId && activeServices.find(s => s.id === initialServiceId)) {
            const serviceAllowsAnyBarber = activeServices.find(s => s.id === initialServiceId)?.assignedBarberIds.length === 0;
            const barbersForService = brbData.filter(b => activeServices.find(s => s.id === initialServiceId)?.assignedBarberIds.includes(b.id));

            if (initialBarberId && brbData.find(b => b.id === initialBarberId)) {
                setCurrentStep('datetime');
            } else if (serviceAllowsAnyBarber || barbersForService.length === 0) { // No specific barbers or any barber is fine
                setSelectedBarberId(null); // Explicitly set to null for 'any'
                setCurrentStep('datetime');
            } else if (brbData.length > 0) { // Barbers exist, need selection
                 setCurrentStep('barber');
            } else { // No barbers at all
                setSelectedBarberId(null);
                setCurrentStep('datetime'); 
            }
        } else {
            setCurrentStep('service'); // Default start
        }

      } catch (err) {
        console.error("Erro ao buscar dados para agendamento:", err);
        setError("Não foi possível carregar os dados para agendamento.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbershopId]); // Removed searchParams to avoid re-fetch on unrelated query changes after initial load
  
  useEffect(() => {
    if (currentUser) {
        setClientDetails({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || ''
        })
    }
  }, [currentUser]);

  const selectedService = useMemo(() => allServices.find(s => s.id === selectedServiceId), [allServices, selectedServiceId]);
  const selectedBarber = useMemo(() => allBarbers.find(b => b.id === selectedBarberId), [allBarbers, selectedBarberId]);

  const availableBarbersForService = useMemo(() => {
    if (!selectedService) return []; // No service selected, no barbers available for it
    // If service has no assigned barbers, it means any barber can do it (from allBarbers)
    if (!selectedService.assignedBarberIds || selectedService.assignedBarberIds.length === 0) {
      return allBarbers; 
    }
    return allBarbers.filter(barber => selectedService.assignedBarberIds.includes(barber.id));
  }, [selectedService, allBarbers]);


  const handleNextStep = () => {
    setSubmitError(null); 
    switch (currentStep) {
      case 'service':
        if (!selectedServiceId) { setSubmitError("Por favor, selecione um serviço."); return; }
        // If the selected service has specific barbers, and none are available, this is an issue.
        // For now, assume if assignedBarberIds is empty, any barber is okay.
        // If assignedBarberIds is populated, but availableBarbersForService is empty, it's a data setup issue.
        if(availableBarbersForService.length === 0 && selectedService && selectedService.assignedBarberIds.length > 0) {
            setSubmitError("Nenhum barbeiro disponível para este serviço. Por favor, contate a barbearia."); return;
        }
        if(availableBarbersForService.length === 0 || (selectedService && selectedService.assignedBarberIds.length === 0)){ 
            setSelectedBarberId(null); // Explicitly 'any' barber if no specific ones or service allows all
            setCurrentStep('datetime'); 
        } else if (availableBarbersForService.length === 1) {
            setSelectedBarberId(availableBarbersForService[0].id); 
            setCurrentStep('datetime');
        }
        else {
            setCurrentStep('barber');
        }
        break;
      case 'barber':
        // If selectedBarberId is null, it means "any", so proceed.
        // If availableBarbersForService > 0, a selection is expected unless service allows any.
        if (!selectedBarberId && availableBarbersForService.length > 0 && selectedService && selectedService.assignedBarberIds.length > 0) { 
            setSubmitError("Por favor, selecione um barbeiro."); return; 
        }
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
         if(availableBarbersForService.length === 0 || availableBarbersForService.length === 1 || (selectedService && selectedService.assignedBarberIds.length === 0)){
            setCurrentStep('service'); 
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
    if (!barbershopId || !selectedServiceId || !selectedDate || !selectedTime || !selectedService) {
      setSubmitError("Informações incompletas para finalizar o agendamento.");
      return;
    }
    // If service requires specific barbers, one must be selected.
    // If selectedService.assignedBarberIds is empty, selectedBarberId can be null (meaning 'any')
    if (selectedService.assignedBarberIds.length > 0 && !selectedBarberId) {
        setSubmitError("Barbeiro não selecionado, mas é necessário para este serviço.");
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const bookingStartTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      
      // The Omit type in supabaseService.ts for createBooking implies id, createdAt, endTime, status are auto-generated or handled.
      const bookingDataToCreate: Omit<Booking, 'id' | 'createdAt' | 'endTime' | 'status'> & {priceAtBooking: number} = {
        barbershopId,
        clientId: currentUser?.id || `guest_${Date.now()}`, 
        clientName: clientDetails.name,
        clientEmail: clientDetails.email,
        clientPhone: clientDetails.phone,
        serviceId: selectedServiceId,
        serviceName: selectedService.name,
        // If selectedBarberId is null, pass a special value or let backend assign if that's the logic
        barberId: selectedBarberId || 'any_available_mock', // 'any_available_mock' handled by mock, real backend needs logic
        barberName: selectedBarber?.name || 'Qualquer Barbeiro',
        startTime: bookingStartTime,
        priceAtBooking: selectedService.price,
        notes: '', 
      };

      const newBooking = await createBooking(bookingDataToCreate);
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

  const minBookingDate = new Date(); 

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-primario"></div></div>;
  if (error) return <div className="text-center py-10 text-red-400">{error} <Link to={ROUTES.HOME} className="text-azul-primario underline">Voltar</Link></div>;
  if (!barbershop) return <div className="text-center py-10 text-gray-400">Barbearia não encontrada.</div>;

  return (
    <div className="min-h-screen bg-azul-marinho py-8 px-4 md:px-0">
      <div className="max-w-2xl mx-auto">
        <Card title={getStepTitle()} titleClassName="text-2xl text-center" className="shadow-2xl">
          {currentStep !== 'confirmation' && (
            <div className="mb-6 flex justify-between items-center text-sm text-gray-400">
               <Link to={`${ROUTES.BARBERSHOP_PUBLIC}/${barbershopId}`} className="hover:text-azul-primario flex items-center">
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
              selectedBarberId={selectedBarberId} // Pass null if 'any'
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
          {currentStep === 'confirmation' && confirmedBooking && selectedService && (
            <BookingConfirmation 
              booking={confirmedBooking} 
              service={selectedService} 
              barber={selectedBarber || {id: 'any_mock_id', name: 'Qualquer Barbeiro'} as Barber} // Provide a fallback Barber object if selectedBarber is null
              barbershopName={barbershop.name}
              barbershopAddress={barbershop.address}
            />
          )}

          {currentStep !== 'confirmation' && (
            <div className="mt-8 pt-6 border-t border-cinza-borda flex justify-between items-center">
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
                disabled={isSubmitting || (currentStep === 'service' && !selectedServiceId) || (currentStep === 'datetime' && (!selectedDate || !selectedTime))}
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
                <Link to={ROUTES.HOME} className="ml-4">
                    <Button variant="outline">Ir para Home</Button>
                </Link>
             </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
