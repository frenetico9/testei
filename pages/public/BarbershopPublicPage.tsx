
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Barbershop, Service, Barber, Review as ReviewType } from '../../types';
import { getBarbershopDetails, getServicesForBarbershop, getBarbersForBarbershop, getReviewsForBarbershop } from '../../services/supabaseService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StarRating from '../../components/ui/StarRating';
import { MapPin, Phone, Clock, Scissors, Users, Star as StarIcon, CalendarPlus } from 'lucide-react';
import { ROUTES, MOCK_BARBERSHOP_ID } from '../../constants'; // Using MOCK_BARBERSHOP_ID for links

const BarbershopPublicPage: React.FC = () => {
  const { barbershopId } = useParams<{ barbershopId: string }>();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!barbershopId) {
        setError("ID da barbearia não fornecido.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [barbershopData, servicesData, barbersData, reviewsData] = await Promise.all([
          getBarbershopDetails(barbershopId),
          getServicesForBarbershop(barbershopId),
          getBarbersForBarbershop(barbershopId),
          getReviewsForBarbershop(barbershopId),
        ]);

        if (!barbershopData) {
          setError("Barbearia não encontrada.");
          setBarbershop(null);
        } else {
          setBarbershop(barbershopData);
          setServices(servicesData);
          setBarbers(barbersData);
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error("Erro ao buscar dados da barbearia:", err);
        setError("Não foi possível carregar os dados da barbearia.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barbershopId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-azul-marinho"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vermelho-bordo"></div></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-400">{error}</div>;
  }

  if (!barbershop) {
    return <div className="text-center py-10 text-gray-400">Barbearia não encontrada.</div>;
  }
  
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return (
    <div className="bg-azul-marinho text-branco-nav min-h-screen">
      {/* Banner/Header */}
      <section className="relative py-16 md:py-24 bg-cover bg-center" style={{ backgroundImage: `url(${barbershop.photos?.[0] || 'https://picsum.photos/seed/barbershopheader/1200/400'}), linear-gradient(rgba(13,31,45,0.7), rgba(13,31,45,0.7))`, backgroundBlendMode: 'overlay'}}>
        <div className="absolute inset-0 bg-azul-marinho opacity-60"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {barbershop.logoUrl && <img src={barbershop.logoUrl} alt={`${barbershop.name} logo`} className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 border-4 border-vermelho-bordo object-cover" />}
          <h1 className="text-4xl md:text-5xl font-roboto-slab font-bold mb-3">{barbershop.name}</h1>
          <div className="flex justify-center items-center space-x-2 mb-4">
            {averageRating > 0 && (
                <>
                <StarRating rating={averageRating} readOnly size={20} />
                <span className="text-gray-300">({reviews.length} avaliações)</span>
                </>
            )}
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">{barbershop.description || "Bem-vindo à nossa barbearia!"}</p>
          <Link to={`${ROUTES.BOOKING}/${MOCK_BARBERSHOP_ID}`}> {/* Should use barbershopId but for mock routing, MOCK_BARBERSHOP_ID */}
            <Button variant="primary" size="large">
              <CalendarPlus size={20} className="mr-2" /> Agendar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column / Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Services Section */}
            <Card title="Nossos Serviços" titleClassName="text-2xl">
              <div className="grid sm:grid-cols-2 gap-6">
                {services.length > 0 ? services.map(service => (
                  <div key={service.id} className="p-4 bg-gray-800 bg-opacity-40 rounded-lg border border-gray-700 hover:border-vermelho-bordo transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-roboto-slab font-semibold">{service.name}</h3>
                        <Scissors size={20} className="text-vermelho-bordo" />
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{service.description || 'Descrição do serviço não disponível.'}</p>
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-lg font-semibold text-vermelho-bordo">R$ {service.price.toFixed(2)}</p>
                        <span className="text-xs text-gray-500">{service.duration} min</span>
                    </div>
                     <Link to={`${ROUTES.BOOKING}/${MOCK_BARBERSHOP_ID}?service=${service.id}`}>
                        <Button variant="outline" size="small" className="w-full mt-3">Agendar este serviço</Button>
                    </Link>
                  </div>
                )) : <p className="text-gray-400">Nenhum serviço disponível no momento.</p>}
              </div>
            </Card>

            {/* Barbers Section */}
            <Card title="Nossos Barbeiros" titleClassName="text-2xl">
              <div className="grid sm:grid-cols-2 gap-6">
                {barbers.length > 0 ? barbers.map(barber => (
                  <div key={barber.id} className="p-4 bg-gray-800 bg-opacity-40 rounded-lg text-center border border-gray-700 hover:border-vermelho-bordo transition-all">
                    <img src={barber.profilePictureUrl || `https://picsum.photos/seed/${barber.id}/150/150`} alt={barber.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-2 border-vermelho-bordo" />
                    <h3 className="text-lg font-roboto-slab font-semibold">{barber.name}</h3>
                    {barber.specialties && barber.specialties.length > 0 && (
                      <p className="text-sm text-vermelho-bordo-light mb-1">{barber.specialties.join(', ')}</p>
                    )}
                    <p className="text-xs text-gray-400 mb-3">{barber.bio || 'Barbeiro profissional e dedicado.'}</p>
                    <Link to={`${ROUTES.BOOKING}/${MOCK_BARBERSHOP_ID}?barber=${barber.id}`}>
                         <Button variant="outline" size="small" className="w-full">Agendar com {barber.name.split(' ')[0]}</Button>
                    </Link>
                  </div>
                )) : <p className="text-gray-400">Nenhum barbeiro cadastrado.</p>}
              </div>
            </Card>

            {/* Reviews Section */}
            <Card title="Avaliações de Clientes" titleClassName="text-2xl">
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review.id} className="py-4 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <StarRating rating={review.rating} readOnly size={18} />
                    <p className="ml-2 font-semibold text-branco-nav">{review.clientName}</p>
                  </div>
                  <p className="text-sm text-gray-300 italic mb-1">"{review.comment}"</p>
                  <p className="text-xs text-gray-500">Serviço: {review.serviceName} com {review.barberName}</p>
                  <p className="text-xs text-gray-500">Em: {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-gray-400">Ainda não há avaliações para esta barbearia.</p>}
            </Card>
          </div>

          {/* Right Sidebar / Info Column */}
          <aside className="lg:col-span-1 space-y-6">
            <Card title="Informações" titleClassName="text-xl">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <MapPin size={18} className="mr-3 mt-0.5 text-vermelho-bordo flex-shrink-0" />
                  <span>{barbershop.address || 'Endereço não informado'}</span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-3 text-vermelho-bordo flex-shrink-0" />
                  <span>{barbershop.phone || 'Telefone não informado'}</span>
                </li>
              </ul>
            </Card>
             {barbershop.operatingHours && barbershop.operatingHours.length > 0 && (
                <Card title="Horário de Funcionamento" titleClassName="text-xl">
                <ul className="space-y-1 text-sm">
                    {barbershop.operatingHours.map(oh => (
                    <li key={oh.day} className="flex justify-between items-center text-gray-300 py-0.5">
                        <span>{formatDayOfWeek(oh.day)}:</span>
                        <span className="font-medium">{oh.isClosed ? 'Fechado' : `${oh.open} - ${oh.close}`}</span>
                    </li>
                    ))}
                </ul>
                </Card>
            )}
            {/* Can add Map integration here */}
            {barbershop.photos && barbershop.photos.length > 1 && (
                 <Card title="Galeria" titleClassName="text-xl">
                    <div className="grid grid-cols-2 gap-2">
                        {barbershop.photos.slice(0, 4).map((photo, index) => ( // Show up to 4 photos
                            <img key={index} src={photo} alt={`Foto da barbearia ${index+1}`} className="w-full h-24 object-cover rounded-md" />
                        ))}
                    </div>
                 </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

const formatDayOfWeek = (day: string): string => {
    const days: { [key: string]: string } = {
        Monday: 'Segunda', Tuesday: 'Terça', Wednesday: 'Quarta',
        Thursday: 'Quinta', Friday: 'Sexta', Saturday: 'Sábado', Sunday: 'Domingo'
    };
    return days[day] || day;
}


export default BarbershopPublicPage;
    