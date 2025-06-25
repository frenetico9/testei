
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Barbershop, Service, Barber, Review as ReviewType } from '../../types';
import { getBarbershopDetails as fetchBarbershopDetails, getServicesForBarbershop, getBarbersForBarbershop, getReviewsForBarbershop } from '../../services/supabaseService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StarRating from '../../components/ui/StarRating';
import { MapPin, Phone, Clock, Scissors, Users, Star as StarIcon, CalendarPlus, ImageIcon, Award, Sparkles, MessageSquare } from 'lucide-react';
import { ROUTES, MOCK_BARBERSHOP_ID, DAYS_OF_WEEK_PT, DAYS_OF_WEEK } from '../../constants'; 
import Modal from '../../components/ui/Modal'; // For gallery modal

const BarbershopPublicPage: React.FC = () => {
  const { barbershopId } = useParams<{ barbershopId: string }>();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const currentId = barbershopId || MOCK_BARBERSHOP_ID; 
      if (!currentId) {
        setError("ID da barbearia não fornecido.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [barbershopData, servicesData, barbersData, reviewsData] = await Promise.all([
          fetchBarbershopDetails(currentId),
          getServicesForBarbershop(currentId),
          getBarbersForBarbershop(currentId),
          getReviewsForBarbershop(currentId),
        ]);

        if (!barbershopData) {
          setError("Barbearia não encontrada.");
          setBarbershop(null);
        } else {
          setBarbershop(barbershopData);
          setServices(servicesData.filter(s => s.isActive));
          setBarbers(barbersData);
          setReviews(reviewsData.filter(r => r.isApproved));
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

  const openGalleryModal = (imageUrl: string) => {
    setSelectedImageForModal(imageUrl);
    setIsGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
    setSelectedImageForModal(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-azul-marinho"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-azul-primario"></div></div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-400 bg-azul-marinho min-h-screen"><p className="text-xl">{error}</p><Link to={ROUTES.HOME} className="text-azul-primario hover:underline mt-4 inline-block">Voltar para a Home</Link></div>;
  }

  if (!barbershop) {
    return <div className="text-center py-20 text-gray-400 bg-azul-marinho min-h-screen"><p className="text-xl">Barbearia não encontrada.</p><Link to={ROUTES.HOME} className="text-azul-primario hover:underline mt-4 inline-block">Voltar para a Home</Link></div>;
  }
  
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const serviceCategories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));


  return (
    <div className="bg-azul-marinho text-branco-nav min-h-screen">
      {/* Banner/Header */}
      <section 
        className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${barbershop.photos?.[0] || 'https://images.unsplash.com/photo-1549236184-8d9fea70094e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmFyYmVyc2hvcHxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=1200&q=80'}), linear-gradient(rgba(13,31,45,0.8), rgba(13,31,45,0.8))`, 
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-azul-marinho opacity-40"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {barbershop.logoUrl && <img src={barbershop.logoUrl} alt={`${barbershop.name} logo`} className="w-28 h-28 md:w-36 md:h-36 rounded-full mx-auto mb-6 border-4 border-azul-primario object-cover shadow-lg" />}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-roboto-slab font-bold mb-4">{barbershop.name}</h1>
          {averageRating > 0 && (
            <div className="flex justify-center items-center space-x-2 mb-4">
                <StarRating rating={averageRating} readOnly size={24} color="text-yellow-400" />
                <span className="text-gray-200 text-lg">({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})</span>
            </div>
          )}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">{barbershop.description || "Bem-vindo à nossa barbearia!"}</p>
          <Link to={`${ROUTES.BOOKING}/${barbershop.id}`}>
            <Button variant="primary" size="large" className="text-lg px-8 py-3 transform hover:scale-105 transition-transform">
              <CalendarPlus size={22} className="mr-2" /> Agendar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Content Area - Navigation for sections could be added here */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12 md:space-y-16">
            
            {/* Services Section */}
            <section id="services">
              <h2 className="text-3xl font-roboto-slab font-bold mb-8 text-azul-primario flex items-center"><Scissors size={30} className="mr-3" /> Nossos Serviços</h2>
              {serviceCategories.length > 0 ? serviceCategories.map(category => (
                <div key={category} className="mb-8">
                  <h3 className="text-2xl font-roboto-slab font-semibold mb-4 text-branco-nav border-b-2 border-azul-primario pb-2">{category}</h3>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
                    {services.filter(s => s.category === category).map(service => (
                      <Card key={service.id} className="bg-cinza-fundo-elemento hover:border-azul-primario transition-all duration-300 transform hover:shadow-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-xl font-roboto-slab font-semibold text-branco-nav mb-2">{service.name}</h4>
                          <p className="text-sm text-gray-400 mb-3 h-16 overflow-hidden">{service.description || 'Descrição do serviço não disponível.'}</p>
                          <div className="flex justify-between items-center text-sm text-gray-300 mb-3">
                              <span><Clock size={16} className="inline mr-1 text-azul-claro"/> {service.duration} min</span>
                              <span className="text-xl font-bold text-azul-primario">R$ {service.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <Link to={`${ROUTES.BOOKING}/${barbershop.id}?service=${service.id}`}>
                            <Button variant="outline" size="medium" className="w-full mt-3">Agendar Serviço</Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              )) : (services.length > 0 ? ( 
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
                    {services.map(service => (
                       <Card key={service.id} className="bg-cinza-fundo-elemento hover:border-azul-primario transition-all duration-300 transform hover:shadow-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-xl font-roboto-slab font-semibold text-branco-nav mb-2">{service.name}</h4>
                          <p className="text-sm text-gray-400 mb-3 h-16 overflow-hidden">{service.description || 'Descrição do serviço não disponível.'}</p>
                          <div className="flex justify-between items-center text-sm text-gray-300 mb-3">
                              <span><Clock size={16} className="inline mr-1 text-azul-claro"/> {service.duration} min</span>
                              <span className="text-xl font-bold text-azul-primario">R$ {service.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <Link to={`${ROUTES.BOOKING}/${barbershop.id}?service=${service.id}`}>
                            <Button variant="outline" size="medium" className="w-full mt-3">Agendar Serviço</Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
              ) : <p className="text-gray-400">Nenhum serviço disponível no momento.</p>)
              }
            </section>

            {/* Barbers Section */}
            {barbers.length > 0 && (
              <section id="barbers">
                <h2 className="text-3xl font-roboto-slab font-bold mb-8 text-azul-primario flex items-center"><Users size={30} className="mr-3" /> Nossa Equipe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                  {barbers.map(barber => (
                    <Card key={barber.id} className="bg-cinza-fundo-elemento text-center p-6 hover:border-azul-primario transition-all duration-300 transform hover:shadow-2xl">
                      <img src={barber.profilePictureUrl || `https://ui-avatars.com/api/?name=${barber.name.replace(/\s/g, "+")}&background=0D1F2D&color=FFFFFF&size=128`} alt={barber.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-azul-primario shadow-md" />
                      <h3 className="text-2xl font-roboto-slab font-semibold text-branco-nav">{barber.name}</h3>
                      {barber.specialties && barber.specialties.length > 0 && (
                        <p className="text-sm text-azul-claro mb-2 font-medium">{barber.specialties.join(' • ')}</p>
                      )}
                      <p className="text-sm text-gray-400 mb-4 h-20 overflow-hidden">{barber.bio || 'Profissional dedicado e apaixonado pela arte da barbearia.'}</p>
                      <Link to={`${ROUTES.BOOKING}/${barbershop.id}?barber=${barber.id}`}>
                           <Button variant="primary" size="medium" className="w-full sm:w-auto">Agendar com {barber.name.split(' ')[0]}</Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <section id="reviews">
                <h2 className="text-3xl font-roboto-slab font-bold mb-8 text-azul-primario flex items-center"><MessageSquare size={30} className="mr-3" /> O Que Nossos Clientes Dizem</h2>
                <div className="space-y-6">
                  {reviews.slice(0, 5).map(review => ( 
                    <Card key={review.id} className="bg-cinza-fundo-elemento p-5">
                      <div className="flex items-start mb-2">
                        <StarRating rating={review.rating} readOnly size={20} color="text-yellow-400"/>
                        <p className="ml-3 font-semibold text-branco-nav text-lg">{review.clientName}</p>
                      </div>
                      <p className="text-gray-300 italic mb-2">"{review.comment}"</p>
                      <p className="text-xs text-gray-500">Serviço: {review.serviceName} com {review.barberName} - {new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}

             {/* Gallery Section */}
            {barbershop.photos && barbershop.photos.length > 1 && (
                 <section id="gallery">
                    <h2 className="text-3xl font-roboto-slab font-bold mb-8 text-azul-primario flex items-center"><ImageIcon size={30} className="mr-3" /> Galeria de Fotos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {barbershop.photos.map((photo, index) => ( 
                            <div key={index} className="aspect-square rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-azul-primario/40" onClick={() => openGalleryModal(photo)}>
                                <img src={photo} alt={`Foto da barbearia ${index+1}`} className="w-full h-full object-cover " />
                            </div>
                        ))}
                    </div>
                 </section>
            )}

          </div>

          {/* Right Sidebar / Info Column */}
          <aside className="lg:col-span-4 space-y-8 sticky top-24 self-start">
            <Card title="Informações" titleClassName="text-xl font-roboto-slab">
              <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                  <MapPin size={20} className="mr-3 mt-0.5 text-azul-primario flex-shrink-0" />
                  <span className="text-gray-300">{barbershop.address || 'Endereço não informado'}</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="mr-3 text-azul-primario flex-shrink-0" />
                  <span className="text-gray-300">{barbershop.phone || 'Telefone não informado'}</span>
                </li>
              </ul>
              <div className="mt-6 h-48 bg-cinza-fundo-elemento rounded-md flex items-center justify-center text-gray-500 border border-cinza-borda">
                <MapPin size={32} className="mr-2"/>
                <span>Localização no Mapa (Em Breve)</span>
              </div>
            </Card>

             {barbershop.operatingHours && barbershop.operatingHours.length > 0 && (
                <Card title="Horário de Funcionamento" titleClassName="text-xl font-roboto-slab">
                <ul className="space-y-2 text-sm">
                    {DAYS_OF_WEEK.map(dayKey => { 
                        const oh = barbershop.operatingHours?.find(h => h.day.toLowerCase() === dayKey.toLowerCase());
                        if (!oh) return <li key={dayKey} className="flex justify-between items-center text-gray-500 py-1 border-b border-cinza-borda last:border-b-0"><span>{DAYS_OF_WEEK_PT[dayKey]}:</span> <span>Não definido</span></li>;
                        return (
                            <li key={oh.day} className="flex justify-between items-center text-gray-300 py-1 border-b border-cinza-borda last:border-b-0">
                                <span className="font-medium">{DAYS_OF_WEEK_PT[oh.day]}:</span>
                                <span className="font-semibold text-branco-nav">{oh.isClosed ? 'Fechado' : `${oh.open} - ${oh.close}`}</span>
                            </li>
                        );
                    })}
                </ul>
                </Card>
            )}
            
            <Card title="Por que nos Escolher?" titleClassName="text-xl font-roboto-slab">
                <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start"><Award size={18} className="mr-2 mt-0.5 text-azul-primario flex-shrink-0" /> Profissionais Qualificados e Experientes.</li>
                    <li className="flex items-start"><Sparkles size={18} className="mr-2 mt-0.5 text-azul-primario flex-shrink-0" /> Ambiente Moderno e Aconchegante.</li>
                    <li className="flex items-start"><ImageIcon size={18} className="mr-2 mt-0.5 text-azul-primario flex-shrink-0" /> Produtos de Alta Qualidade.</li>
                    <li className="flex items-start"><CalendarPlus size={18} className="mr-2 mt-0.5 text-azul-primario flex-shrink-0" /> Agendamento Online Fácil e Rápido.</li>
                </ul>
            </Card>
          </aside>
        </div>
      </div>
      {isGalleryModalOpen && selectedImageForModal && (
        <Modal isOpen={isGalleryModalOpen} onClose={closeGalleryModal} title="Visualizar Imagem" size="2xl" bodyClassName="p-0">
          <img src={selectedImageForModal} alt="Imagem da galeria da barbearia" className="w-full h-auto max-h-[80vh] object-contain rounded-b-lg" />
        </Modal>
      )}
    </div>
  );
};

export default BarbershopPublicPage;
