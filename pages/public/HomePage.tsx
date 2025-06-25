
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { APP_NAME, MOCK_BARBERSHOP_ID, PREDEFINED_REVIEWS, MOCK_SERVICES_DATA, ROUTES } from '../../constants';
import { Scissors, Star, CalendarPlus, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import StarRating from '../../components/ui/StarRating';

const HomePage: React.FC = () => {
  const featuredServices = MOCK_SERVICES_DATA.slice(0, 4); 
  const featuredReviews = PREDEFINED_REVIEWS.slice(0, 3);

  return (
    <div className="text-branco-nav">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1567894340340-10a141d4ee38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJhcmJlcnNob3B8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1920&q=80'), linear-gradient(rgba(13,31,45,0.85), rgba(13,31,45,0.85))", backgroundBlendMode: 'overlay' }}>
        <div className="absolute inset-0 bg-azul-marinho opacity-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-roboto-slab font-bold mb-6">
            Bem-vindo ao <span className="text-azul-primario">{APP_NAME}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8">
            A plataforma definitiva para agendar seus horários na barbearia e para barbearias gerenciarem seus negócios com estilo e eficiência.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
            <Link to={`${ROUTES.BARBERSHOP_PUBLIC}/${MOCK_BARBERSHOP_ID}`}>
              <Button variant="primary" size="large" className="w-full sm:w-auto">
                <CalendarPlus size={20} className="mr-2" /> Ver Barbearia Exemplo
              </Button>
            </Link>
             <Link to={ROUTES.REGISTER}>
              <Button variant="outline" size="large" className="w-full sm:w-auto">
                <Users size={20} className="mr-2" /> Sou Dono de Barbearia
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-azul-marinho">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-roboto-slab font-bold text-center mb-12">Por que escolher o {APP_NAME}?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="hover:shadow-azul-primario/20 transition-shadow duration-300 transform hover:-translate-y-1">
              <Scissors size={48} className="mx-auto mb-4 text-azul-primario" />
              <h3 className="text-xl font-roboto-slab font-semibold mb-2">Agendamento Fácil</h3>
              <p className="text-gray-400">Clientes agendam online em minutos, escolhendo serviço, barbeiro e horário.</p>
            </Card>
            <Card className="hover:shadow-azul-primario/20 transition-shadow duration-300 transform hover:-translate-y-1">
              <CalendarPlus size={48} className="mx-auto mb-4 text-azul-primario" />
              <h3 className="text-xl font-roboto-slab font-semibold mb-2">Gestão Completa</h3>
              <p className="text-gray-400">Painel administrativo robusto para gerenciar agendamentos, serviços, funcionários e clientes.</p>
            </Card>
            <Card className="hover:shadow-azul-primario/20 transition-shadow duration-300 transform hover:-translate-y-1">
              <Star size={48} className="mx-auto mb-4 text-azul-primario" />
              <h3 className="text-xl font-roboto-slab font-semibold mb-2">Estilo e Profissionalismo</h3>
              <p className="text-gray-400">Design moderno que reflete a identidade da sua barbearia premium.</p>
            </Card>
          </div>
        </div>
      </section>

       {/* Featured Services (Example from a mock barbershop) */}
      <section className="py-16 md:py-24 bg-cinza-fundo-elemento bg-opacity-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-roboto-slab font-bold text-center mb-12">Serviços Populares</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map(service => (
              <Card key={service.id} className="text-center bg-azul-marinho hover:border-azul-primario transition-colors transform hover:shadow-xl">
                 <Scissors size={32} className="mx-auto mb-3 text-azul-primario" />
                <h3 className="text-lg font-roboto-slab font-semibold mb-1">{service.name}</h3>
                <p className="text-azul-primario font-semibold mb-2">R$ {service.price.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mb-3">{service.duration} min</p>
                <Link to={`${ROUTES.BOOKING}/${MOCK_BARBERSHOP_ID}?service=${service.id}`}>
                  <Button variant="outline" size="small" className="w-full">Agendar</Button>
                </Link>
              </Card>
            ))}
          </div>
           <div className="text-center mt-12">
            <Link to={`${ROUTES.BARBERSHOP_PUBLIC}/${MOCK_BARBERSHOP_ID}`}>
                <Button variant="primary" size="medium">Ver todos os serviços</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-azul-marinho">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-roboto-slab font-bold text-center mb-12">O que Nossos Clientes Dizem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredReviews.map((review, index) => (
              <Card key={index} className="flex flex-col bg-cinza-fundo-elemento bg-opacity-40">
                <div className="flex-grow">
                  <StarRating rating={review.rating} readOnly={true} size={18} className="mb-3" color="text-yellow-400" />
                  <p className="text-gray-300 italic mb-3">"{review.comment}"</p>
                </div>
                <div>
                  <p className="font-semibold text-branco-nav">{review.clientName}</p>
                  <p className="text-sm text-gray-400">Serviço: {review.serviceName}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action for Barbershops */}
      <section className="py-16 md:py-24 bg-azul-primario text-branco-nav">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-roboto-slab font-bold mb-6">Pronto para Modernizar sua Barbearia?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Junte-se ao {APP_NAME} e ofereça a melhor experiência de agendamento para seus clientes.
            Comece gratuitamente ou escolha um plano que se adapte às suas necessidades.
          </p>
          <Link to={ROUTES.REGISTER}>
            <Button variant="secondary" size="large" className="bg-branco-nav text-azul-marinho hover:bg-gray-200">
              Cadastre sua Barbearia Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;