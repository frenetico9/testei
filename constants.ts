
import { Plan, PlanTier, Review, Service, Barber, Booking, BookingStatus, User, UserRole } from './types';
import { FaMoneyBillWave, FaUsers, FaCalendarCheck, FaClock } from 'react-icons/fa'; // Example icons

export const APP_NAME = "Navalha Digital";

export const COLORS = {
  primary: '#0D1F2D', // Azul Marinho
  secondary: '#FFFFFF', // Branco
  accent: '#8B0000',   // Vermelho Bordô
  accentLight: '#a52a2a',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0', // Lighter gray for less emphasis
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  disabled: '#6B7280' // Gray
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
  { id: 'serv1', barbershopId: MOCK_BARBERSHOP_ID, name: 'Corte Masculino', duration: 30, price: 50, assignedBarberIds: ['barber1', 'barber2'], isActive: true, description: 'Corte clássico ou moderno, tesoura e máquina.' },
  { id: 'serv2', barbershopId: MOCK_BARBERSHOP_ID, name: 'Barba Terapia', duration: 45, price: 70, assignedBarberIds: ['barber1'], isActive: true, description: 'Barba feita com toalha quente e produtos especiais.' },
  { id: 'serv3', barbershopId: MOCK_BARBERSHOP_ID, name: 'Combo (Corte + Barba)', duration: 75, price: 110, assignedBarberIds: ['barber1', 'barber2'], isActive: true, description: 'Pacote completo para cabelo e barba.' },
  { id: 'serv4', barbershopId: MOCK_BARBERSHOP_ID, name: 'Pigmentação de Barba', duration: 60, price: 90, assignedBarberIds: ['barber2'], isActive: true, description: 'Cobertura de falhas e realce da barba.' },
  { id: 'serv5', barbershopId: MOCK_BARBERSHOP_ID, name: 'Sobrancelha Masculina', duration: 15, price: 25, assignedBarberIds: ['barber1', 'barber2'], isActive: false, description: 'Design e limpeza de sobrancelhas.' },
];

export const MOCK_BARBERS_DATA: Barber[] = [
  { 
    id: 'barber1', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    userId: 'user_barber1', 
    name: 'João Mestre', 
    email: 'joao.mestre@example.com', 
    specialties: ['Corte Clássico', 'Barba Terapia'], 
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '12:00', isWorking: true },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '20:00', isWorking: true },
      { dayOfWeek: 'Saturday', startTime: '08:00', endTime: '16:00', isWorking: true },
      { dayOfWeek: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false },
    ],
    profilePictureUrl: 'https://picsum.photos/seed/joaomestre/200/200',
    bio: 'Barbeiro experiente com paixão por cortes clássicos e um atendimento impecável.'
  },
  { 
    id: 'barber2', 
    barbershopId: MOCK_BARBERSHOP_ID, 
    userId: 'user_barber2', 
    name: 'Pedro Estilo', 
    email: 'pedro.estilo@example.com', 
    specialties: ['Cortes Modernos', 'Pigmentação'], 
    availability: [
      { dayOfWeek: 'Monday', startTime: '10:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 'Wednesday', startTime: '13:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 'Friday', startTime: '10:00', endTime: '21:00', isWorking: true },
      { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 'Sunday', startTime: '00:00', endTime: '00:00', isWorking: false },
    ],
    profilePictureUrl: 'https://picsum.photos/seed/pedroestilo/200/200',
    bio: 'Especialista em tendências e cortes modernos, sempre atualizado com as últimas novidades.'
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
    serviceName: 'Corte Masculino',
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
    serviceName: 'Combo (Corte + Barba)',
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
    serviceName: 'Barba Terapia',
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
    bookingId: `booking${index + 1}`, // Assuming booking exists
    clientId: `client${index + 1}`, // Assuming client exists
    serviceId: MOCK_SERVICES_DATA[index % MOCK_SERVICES_DATA.length].id,
    barberId: MOCK_BARBERS_DATA[index % MOCK_BARBERS_DATA.length].id,
    createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(), // Staggered creation dates
    isApproved: true,
}));

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
    