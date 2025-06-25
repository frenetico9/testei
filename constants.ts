import { Plan, PlanTier, Review, Service, Barber, Booking, BookingStatus, User, UserRole, Barbershop as BarbershopType } from './types'; // Renamed Barbershop to BarbershopType to avoid conflict
import { FaMoneyBillWave, FaUsers, FaCalendarCheck, FaClock } from 'react-icons/fa'; // Example icons

export const APP_NAME = "Navalha Digital";

export const COLORS = {
  primary: '#0D1F2D', // Azul Marinho (Base Dark Blue)
  secondary: '#FFFFFF', // Branco
  accent: '#3B82F6',   // New Primary Blue (replacing vermelho-bordo)
  accentHover: '#2563EB', // Darker shade for hover
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0', // Lighter gray for less emphasis
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  disabled: '#6B7280', // Gray
  borderDefault: '#374151', // Default border color (gray-700)
  elementBackground: '#1F2937', // Default element background on dark (gray-800)
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  BOOKING: '/book', // Will be /book/:barbershopId
  BARBERSHOP_PUBLIC: '/barbershop', // Will be /barbershop/:barbershopId

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_BARBERS: '/admin/barbers',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_CALENDAR: '/admin/calendar',
  ADMIN_SUBSCRIPTION: '/admin/subscription',
  ADMIN_PROFILE: '/admin/profile',
};

export const MOCK_BARBERSHOP_ID = "barbershop_123"; // For routing in examples

export const PREDEFINED_REVIEWS: Omit<Review, 'id' | 'barbershopId' | 'bookingId' | 'clientId' | 'serviceId' | 'barberId' | 'createdAt' | 'isApproved'>[] = [
  {
    clientName: "Carlos Silva",
    serviceName: "Corte Masculino",
    barberName: "João Mestre",
    rating: 5,
    comment: "Ótimo atendimento, o corte ficou impecável! Ambiente limpo e barbeiro atencioso.",
  },
  {
    clientName: "Fernanda Lima",
    serviceName: "Combo (Corte + Barba)",
    barberName: "Pedro Estilo",
    rating: 5,
    comment: "A Navalha Digital salvou meu tempo, agendei pelo celular e fui direto ser atendido.",
  },
  {
    clientName: "Ricardo Alves",
    serviceName: "Barba Desenhada",
    barberName: "João Mestre",
    rating: 4,
    comment: "Profissional pontual, corte rápido e na régua!",
  },
  {
    clientName: "Juliana Costa",
    serviceName: "Pigmentação de Barba",
    barberName: "Marcos Artista",
    rating: 5,
    comment: "Recomendo muito o serviço. Já sou cliente fixa.",
  },
   {
    clientName: "André Souza",
    serviceName: "Corte Degradê",
    barberName: "Pedro Estilo",
    rating: 5,
    comment: "Melhor degradê da cidade! Pedro é um artista.",
  },
  {
    clientName: "Beatriz Almeida",
    serviceName: "Sobrancelha Masculina",
    barberName: "João Mestre",
    rating: 4,
    comment: "Sobrancelha bem feita, atendimento rápido.",
  }
];


export const PLANS: Plan[] = [
  {
    id: PlanTier.FREE,
    name: 'Gratuito',
    pricePerMonth: 0,
    maxBookingsPerMonth: 20,
    maxBarbers: 1,
    features: ['Até 20 agendamentos/mês', '1 Funcionário', 'Gestão de Clientes Básica'],
  },
  {
    id: PlanTier.PRO,
    name: 'Pro',
    pricePerMonth: 29.90,
    maxBookingsPerMonth: undefined, // Unlimited
    maxBarbers: 5,
    features: ['Agendamentos ilimitados', 'Até 5 Funcionários', 'Gestão Avançada', 'Suporte Prioritário'],
  },
  {
    id: PlanTier.PREMIUM,
    name: 'Premium',
    pricePerMonth: 59.90,
    maxBookingsPerMonth: undefined, // Unlimited
    maxBarbers: undefined, // Unlimited
    features: ['Todos os recursos Pro', 'Funcionários Ilimitados', 'Lembretes WhatsApp (simulado)', 'Integração Google Calendar (simulado)', 'Marketing Tools'],
  },
];

export const MOCK_SERVICES_DATA: Service[] = [
  { id: 'serv1', barbershopId: MOCK_BARBERSHOP_ID, name: 'Corte Masculino Clássico', duration: 30, price: 50, assignedBarberIds: ['barber1', 'barber2'], isActive: true, description: 'Corte tradicional na tesoura e máquina, para um visual atemporal.', category: "Cabelo" },
  { id: 'serv2', barbershopId: MOCK_BARBERSHOP_ID, name: 'Barba Terapia Completa', duration: 45, price: 70, assignedBarberIds: ['barber1'], isActive: true, description: 'Barba modelada com toalha quente, navalha e produtos especiais para hidratação.', category: "Barba" },
  { id: 'serv3', barbershopId: MOCK_BARBERSHOP_ID, name: 'Combo Executivo (Corte + Barba)', duration: 75, price: 110, assignedBarberIds: ['barber1', 'barber2'], isActive: true, description: 'Pacote completo para cabelo e barba, ideal para manter o estilo em dia.', category: "Combos" },
  { id: 'serv4', barbershopId: MOCK_BARBERSHOP_ID, name: 'Pigmentação de Barba', duration: 60, price: 90, assignedBarberIds: ['barber2'], isActive: true, description: 'Técnica para cobrir falhas e realçar a densidade da barba, com resultado natural.', category: "Especiais" },
  { id: 'serv5', barbershopId: MOCK_BARBERSHOP_ID, name: 'Sobrancelha Masculina Design', duration: 20, price: 30, assignedBarberIds: ['barber1', 'barber2'], isActive: true, description: 'Design e limpeza de sobrancelhas, realçando o olhar masculino.', category: "Especiais" },
  { id: 'serv6', barbershopId: MOCK_BARBERSHOP_ID, name: 'Corte Degradê Navalhado', duration: 45, price: 65, assignedBarberIds: ['barber2'], isActive: true, description: 'Degradê preciso finalizado com navalha para um acabamento impecável.', category: "Cabelo" },
  { id: 'serv7', barbershopId: MOCK_BARBERSHOP_ID, name: 'Hidratação Capilar Premium', duration: 30, price: 55, assignedBarberIds: ['barber1'], isActive: true, description: 'Tratamento profundo para revitalizar e fortalecer os fios.', category: "Tratamentos" },
  { id: 'serv8', barbershopId: MOCK_BARBERSHOP_ID, name: 'Pezinho (Acabamento)', duration: 15, price: 20, assignedBarberIds: ['barber1', 'barber2'], isActive: true, description: 'Acabamento do corte, contorno da nuca e costeletas.', category: "Cabelo" },
];

export const MOCK_BARBERS_DATA: Barber[] = [
  { 
    id: 'barber1', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    userId: 'user_barber1', 
    name: 'João Mestre', 
    email: 'joao.mestre@example.com', 
    specialties: ['Corte Clássico', 'Barba Terapia', 'Sobrancelha'], 
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '12:00', isWorking: true }, // Meio período
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '20:00', isWorking: true }, // Estendido
      { dayOfWeek: 'Saturday', startTime: '08:00', endTime: '16:00', isWorking: true },
      { dayOfWeek: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }, // Folga
    ],
    profilePictureUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFyYmVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=200&q=60',
    bio: 'Barbeiro experiente com mais de 10 anos de mercado, apaixonado por cortes clássicos e um atendimento impecável. Mestre em barbas bem feitas.'
  },
  { 
    id: 'barber2', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    userId: 'user_barber2', 
    name: 'Pedro Estilo', 
    email: 'pedro.estilo@example.com', 
    specialties: ['Cortes Modernos', 'Degradê Navalhado', 'Pigmentação'], 
    availability: [
      { dayOfWeek: 'Monday', startTime: '10:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 'Wednesday', startTime: '13:00', endTime: '19:00', isWorking: true }, // Entra mais tarde
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 'Friday', startTime: '10:00', endTime: '21:00', isWorking: true }, // Estendido
      { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }, // Folga
    ],
    profilePictureUrl: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJhcmJlcnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=200&q=60',
    bio: 'Especialista em tendências e cortes modernos, sempre atualizado com as últimas novidades do mundo da barbearia. Perfeccionista em degradês.'
  },
  { 
    id: 'barber3', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    userId: 'user_barber3', 
    name: 'Marcos Artista', 
    email: 'marcos.artista@example.com', 
    specialties: ['Pigmentação', 'Tratamentos Capilares', 'Barba Desenhada'], 
    availability: [
      { dayOfWeek: 'Monday', startTime: '00:00', endTime: '00:00', isWorking: false }, // Folga
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 'Thursday', startTime: '11:00', endTime: '20:00', isWorking: true }, // Horário diferenciado
      { dayOfWeek: 'Friday', startTime: '11:00', endTime: '20:00', isWorking: true },
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false }, // Folga
    ],
    profilePictureUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7ba3847?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJhcmJlcnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=200&q=60',
    bio: 'Focado nos detalhes, Marcos é o profissional ideal para quem busca serviços de pigmentação e tratamentos que revitalizam cabelo e barba.'
  },
];

export const MOCK_CLIENTS_DATA: User[] = [
    { id: 'client1', name: 'Carlos Silva', email: 'carlos@example.com', phone: '11987654321', role: UserRole.CLIENT, profilePictureUrl: 'https://picsum.photos/seed/carlossilva/100/100' },
    { id: 'client2', name: 'Fernanda Lima', email: 'fernanda@example.com', phone: '21912345678', role: UserRole.CLIENT, profilePictureUrl: 'https://picsum.photos/seed/fernandalima/100/100' },
    { id: 'client3', name: 'Ricardo Alves', email: 'ricardo@example.com', phone: '31988887777', role: UserRole.CLIENT, profilePictureUrl: 'https://picsum.photos/seed/ricardoalves/100/100' },
];


export const MOCK_BOOKINGS_DATA: Booking[] = [
  { 
    id: 'booking1', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    clientId: 'client1', 
    clientName: 'Carlos Silva',
    clientEmail: 'carlos@example.com',
    clientPhone: '11987654321',
    serviceId: 'serv1', 
    serviceName: 'Corte Masculino Clássico',
    barberId: 'barber1', 
    barberName: 'João Mestre',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    endTime: new Date(Date.now() + (2 * 60 + 30) * 60 * 1000).toISOString(), // 2.5 hours from now
    status: BookingStatus.CONFIRMED,
    priceAtBooking: 50,
    createdAt: new Date().toISOString(),
  },
  { 
    id: 'booking2', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    clientId: 'client2', 
    clientName: 'Fernanda Lima',
    clientEmail: 'fernanda@example.com',
    clientPhone: '21912345678',
    serviceId: 'serv3', 
    serviceName: 'Combo Executivo (Corte + Barba)',
    barberId: 'barber2', 
    barberName: 'Pedro Estilo',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + (24 * 60 + 75) * 60 * 1000).toISOString(),
    status: BookingStatus.CONFIRMED,
    priceAtBooking: 110,
    createdAt: new Date().toISOString(),
  },
   { 
    id: 'booking3', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    clientId: 'client3', 
    clientName: 'Ricardo Alves',
    clientEmail: 'ricardo@example.com',
    clientPhone: '31988887777',
    serviceId: 'serv2', 
    serviceName: 'Barba Terapia Completa',
    barberId: 'barber1', 
    barberName: 'João Mestre',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    endTime: new Date(Date.now() - (2 * 24 * 60 - 45) * 60 * 1000).toISOString(),
    status: BookingStatus.COMPLETED,
    priceAtBooking: 70,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 60*60*1000).toISOString(),
  },
];

export const MOCK_REVIEWS_DATA: Review[] = PREDEFINED_REVIEWS.map((review, index) => ({
    ...review,
    id: `review${index + 1}`,
    barbershopId: MOCK_BARBERSHOP_ID,
    bookingId: `booking${index + 1 > MOCK_BOOKINGS_DATA.length ? MOCK_BOOKINGS_DATA[0].id : MOCK_BOOKINGS_DATA[index].id}`, 
    clientId: `client${index + 1 > MOCK_CLIENTS_DATA.length ? MOCK_CLIENTS_DATA[0].id : MOCK_CLIENTS_DATA[index].id}`, 
    serviceId: MOCK_SERVICES_DATA[index % MOCK_SERVICES_DATA.length].id,
    barberId: MOCK_BARBERS_DATA[index % MOCK_BARBERS_DATA.length].id,
    createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(), // Staggered creation dates
    isApproved: true,
}));

export const MOCK_BARBERSHOP_DETAILS_DATA: BarbershopType = { 
    id: MOCK_BARBERSHOP_ID, 
    name: 'Navalha Digital Barbershop Exemplar', 
    address: 'Rua das Tesouras Douradas, 123, Centro, Barbópolis', 
    logoUrl: 'https://via.placeholder.com/150/0D1F2D/FFFFFF?text=ND', 
    ownerId: 'admin_user_id',
    phone: '(11) 98765-4321',
    description: 'A barbearia Navalha Digital Exemplar combina tradição e modernidade para oferecer a melhor experiência em cuidados masculinos. Nossos profissionais são altamente qualificados e utilizam produtos de primeira linha. Agende seu horário e descubra o poder de um bom corte!',
    photos: [
        'https://images.unsplash.com/photo-1585749922230-dd9c159982ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFyYmVyc2hvcCUyMGludGVyaW9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1622288432454-2415490075af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFyYmVyc2hvcCUyMGludGVyaW9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1599351549021-f9b867a00a94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFyYmVyc2hvcCUyMGludGVyaW9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1616479808906-13837549de0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFyYmVyc2hvcCUyMGludGVyaW9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1512496015851-a90137ba0a44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFyYmVyJTIwc2hvcCUyMHNlcnZpY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60', // Service shot
        'https://images.unsplash.com/photo-1532710093739-9470acff878f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJhcmJlciUyMHNob3AlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60' // Products shot
    ],
    operatingHours: [
        { day: 'Monday', open: '09:00', close: '19:00' },
        { day: 'Tuesday', open: '09:00', close: '19:00' },
        { day: 'Wednesday', open: '09:00', close: '19:00' },
        { day: 'Thursday', open: '09:00', close: '20:00' }, // Extended
        { day: 'Friday', open: '09:00', close: '20:00' }, // Extended
        { day: 'Saturday', open: '08:00', close: '18:00' },
        { day: 'Sunday', open: '00:00', close: '00:00', isClosed: true },
    ]
};


export const DASHBOARD_STATS_ITEMS = [
    { title: "Agendamentos no Mês", icon: FaCalendarCheck, dataKey: "monthlyBookings" },
    { title: "Clientes Atendidos", icon: FaUsers, dataKey: "clientsServed" },
    { title: "Receita Estimada (Mês)", icon: FaMoneyBillWave, dataKey: "estimatedRevenue", prefix: "R$" },
    { title: "Próximos Agendamentos (Hoje)", icon: FaClock, dataKey: "todayBookingsCount" },
];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const DAYS_OF_WEEK_PT = {
  Sunday: 'Domingo',
  Monday: 'Segunda-feira',
  Tuesday: 'Terça-feira',
  Wednesday: 'Quarta-feira',
  Thursday: 'Quinta-feira',
  Friday: 'Sexta-feira',
  Saturday: 'Sábado',
};

export const TIME_SLOTS_INTERVAL = 30; // in minutes for generating time slots

// Example availability for a new barber
export const DEFAULT_BARBER_AVAILABILITY: Barber['availability'] = [
  { dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00', isWorking: true },
  { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '18:00', isWorking: true },
  { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '18:00', isWorking: true },
  { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '18:00', isWorking: true },
  { dayOfWeek: 'Friday', startTime: '09:00', endTime: '18:00', isWorking: true },
  { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '16:00', isWorking: false },
  { dayOfWeek: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false },
];