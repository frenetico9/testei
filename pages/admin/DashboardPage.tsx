
import React, { useEffect, useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabaseService';
import { Booking, BookingStatus, Service, Barber, UserRole } from '../../types';
import { Link } from 'react-router-dom';
import { ROUTES, DASHBOARD_STATS_ITEMS } from '../../constants';
import Button from '../../components/ui/Button';
import { ArrowRight, CalendarClock, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardData {
  monthlyBookings: number;
  clientsServed: number; // This might be unique clients in a period
  estimatedRevenue: number;
  todayBookingsCount: number;
  todayBookingsList: Booking[];
  bookingsByDay: { date: string; count: number }[]; // For chart
  revenueByDay: { date: string; revenue: number }[]; // For chart
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<{ size?: number }>; linkTo?: string }> = ({ title, value, icon, linkTo }) => (
  <Card className="hover:shadow-vermelho-bordo/20 transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400 truncate">{title}</p>
        <p className="mt-1 text-3xl font-roboto-slab font-semibold text-branco-nav">{value}</p>
      </div>
      <div className="flex-shrink-0 p-3 bg-vermelho-bordo bg-opacity-20 rounded-full text-vermelho-bordo">
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
    {linkTo && (
      <Link to={linkTo} className="block text-xs text-vermelho-bordo hover:underline mt-2">
        Ver mais <ArrowRight size={12} className="inline"/>
      </Link>
    )}
  </Card>
);

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || currentUser.role !== UserRole.ADMIN || !currentUser.barbershopId) {
        setError("Acesso não autorizado ou barbearia não configurada.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const barbershopId = currentUser.barbershopId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const todayStart = new Date(new Date(now).setHours(0,0,0,0)).toISOString(); // Corrected todayStart
        const todayEnd = new Date(new Date(now).setHours(23,59,59,999)).toISOString(); // Corrected todayEnd


        const { data: allBookings, error: bookingsError } = await supabase
          .from<Booking>('bookings')
          .eq('barbershopId', barbershopId)
          .select('*');
        
        if (bookingsError) throw bookingsError;
        
        const currentBarbershopBookings = allBookings || [];
        
        const monthBookings = currentBarbershopBookings.filter(
            b => new Date(b.startTime) >= new Date(startOfMonth) && new Date(b.startTime) <= new Date(endOfMonth)
        );
        
        const completedMonthBookings = monthBookings.filter(b => b.status === BookingStatus.COMPLETED);
        
        const estimatedRevenue = completedMonthBookings.reduce((sum, b) => sum + b.priceAtBooking, 0);
        
        const clientsServedIds = new Set(completedMonthBookings.map(b => b.clientId));
        
        const todayBookingsList = currentBarbershopBookings.filter(
            b => new Date(b.startTime) >= new Date(todayStart) && new Date(b.startTime) <= new Date(todayEnd) && 
                 (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING)
        ).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());


        // Data for charts (last 7 days for example)
        const bookingsByDay: { date: string; count: number }[] = [];
        const revenueByDay: { date: string; revenue: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date(); // Use a new Date object for each iteration
            day.setDate(now.getDate() - i);
            const dayStr = day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            
            const bookingsOnThisDay = currentBarbershopBookings.filter(b => 
                new Date(b.startTime).toDateString() === day.toDateString() &&
                (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
            ).length;
            bookingsByDay.push({ date: dayStr, count: bookingsOnThisDay });

            const revenueOnThisDay = currentBarbershopBookings
                .filter(b => new Date(b.startTime).toDateString() === day.toDateString() && b.status === BookingStatus.COMPLETED)
                .reduce((sum, b) => sum + b.priceAtBooking, 0);
            revenueByDay.push({ date: dayStr, revenue: revenueOnThisDay });
        }


        setDashboardData({
          monthlyBookings: monthBookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED).length,
          clientsServed: clientsServedIds.size,
          estimatedRevenue: estimatedRevenue,
          todayBookingsCount: todayBookingsList.length,
          todayBookingsList: todayBookingsList,
          bookingsByDay,
          revenueByDay,
        });

      } catch (err: any) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError(err.message || "Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const statsToDisplay = useMemo(() => {
    if (!dashboardData) return [];
    return DASHBOARD_STATS_ITEMS.map(item => ({
      ...item,
      value: item.prefix 
        ? `${item.prefix} ${(dashboardData[item.dataKey as keyof DashboardData] as number || 0).toFixed(2)}`
        : dashboardData[item.dataKey as keyof DashboardData] || 0,
      icon: <item.icon /> // Ensure icon is instantiated here for StatCard prop type
    }));
  }, [dashboardData]);


  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-vermelho-bordo"></div></div>;
  if (error) return <div className="text-red-400 p-4 bg-red-900_bg-opacity-30 rounded-md">{error}</div>;
  if (!dashboardData) return <div className="text-gray-400">Nenhum dado para exibir.</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsToDisplay.map(stat => (
          <StatCard 
            key={stat.title} 
            title={stat.title} 
            value={stat.value as string | number} 
            icon={stat.icon as React.ReactElement<{ size?: number }>} 
            linkTo={
                stat.dataKey === "monthlyBookings" ? ROUTES.ADMIN_BOOKINGS :
                stat.dataKey === "clientsServed" ? ROUTES.ADMIN_CLIENTS :
                stat.dataKey === "todayBookingsCount" ? ROUTES.ADMIN_CALENDAR : undefined
            }
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Agendamentos (Últimos 7 Dias)">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.bookingsByDay} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }} itemStyle={{color: '#e5e7eb'}}/>
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Bar dataKey="count" name="Agendamentos" fill="#8B0000" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Receita (R$) (Últimos 7 Dias - Concluídos)">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.revenueByDay} margin={{ top: 5, right: 0, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `R$${value}`} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [`R$${value.toFixed(2)}`, "Receita"]} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }} itemStyle={{color: '#e5e7eb'}}/>
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Line type="monotone" dataKey="revenue" name="Receita" stroke="#8B0000" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
          </Card>
      </div>

      {/* Today's Bookings */}
      <Card title="Agendamentos de Hoje" actions={
        <Link to={ROUTES.ADMIN_CALENDAR}>
            <Button variant="outline" size="small" leftIcon={<CalendarClock size={16}/>}>Ver Agenda Completa</Button>
        </Link>
      }>
        {dashboardData.todayBookingsList.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {dashboardData.todayBookingsList.map(booking => (
              <div key={booking.id} className="p-4 bg-gray-800 bg-opacity-60 rounded-lg flex items-center justify-between border border-gray-700 hover:border-vermelho-bordo transition-colors">
                <div>
                  <p className="font-semibold text-branco-nav">{booking.clientName}</p>
                  <p className="text-sm text-gray-400">{booking.serviceName} com {booking.barberName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-vermelho-bordo">{new Date(booking.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    booking.status === BookingStatus.CONFIRMED ? 'bg-green-700 text-green-200' : 
                    booking.status === BookingStatus.PENDING ? 'bg-yellow-700 text-yellow-200' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                 <Link to={`${ROUTES.ADMIN_BOOKINGS}?bookingId=${booking.id}`}>
                    <Button variant="outline" size="small" className="ml-4">
                        <Eye size={14}/>
                    </Button>
                 </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Nenhum agendamento para hoje.</p>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;