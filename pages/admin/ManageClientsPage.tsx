
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseService';
import { User, Booking, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Table, { ColumnDefinition } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Eye, History, UserCircle, AlertTriangle } from 'lucide-react';

const ManageClientsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [clientBookings, setClientBookings] = useState<Booking[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientsAndBookings = useCallback(async () => {
    if (!currentUser || !currentUser.barbershopId) {
      setError("Usuário ou barbearia não identificados.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch all bookings for the current barbershop
      const { data: bookingsData, error: bookingsError } = await supabase
        .from<Booking>('bookings')
        .eq('barbershopId', currentUser.barbershopId)
        .select('*');
      if (bookingsError) throw bookingsError;

      const barbershopBookings = bookingsData || [];
      setClientBookings(barbershopBookings); 

      // Extract unique client IDs from these bookings
      const clientIds = Array.from(new Set(barbershopBookings.map(b => b.clientId)));

      if (clientIds.length > 0) {
        // Fetch user profiles for these client IDs
        // Note: In a real scenario, you might filter by role or ensure these are actual clients
        const { data: usersData, error: usersError } = await supabase
          .from<User>('users')
          .in('id', clientIds)
          //.eq('role', UserRole.CLIENT) // Optionally filter by role if 'users' table contains non-clients
          .select('*');
        if (usersError) throw usersError;
        
        setClients(usersData || []);
      } else {
        setClients([]); // No bookings means no clients derived from bookings
      }

    } catch (err: any) {
      setError(err.message || "Erro ao buscar clientes e agendamentos.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchClientsAndBookings();
  }, [fetchClientsAndBookings]);

  const openHistoryModal = (client: User) => {
    setSelectedClient(client);
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedClient(null);
  };
  
  const getClientHistory = (clientId: string): Booking[] => {
    return clientBookings
      .filter(b => b.clientId === clientId)
      .sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  };

  const columns: ColumnDefinition<User>[] = [
    { 
        key: 'profilePictureUrl', 
        header: 'Foto', 
        render: (c) => <img src={c.profilePictureUrl || `https://ui-avatars.com/api/?name=${c.name.replace(/\s/g, "+")}&background=0D1F2D&color=FFFFFF&size=50`} alt={c.name} className="w-10 h-10 rounded-full object-cover"/> 
    },
    { key: 'name', header: 'Nome', render: (c) => <span className="font-medium text-branco-nav">{c.name}</span> },
    { key: 'email', header: 'E-mail' },
    { key: 'phone', header: 'Telefone' },
    { 
      key: 'lastService', 
      header: 'Último Agendamento',
      render: (c) => {
        const history = getClientHistory(c.id);
        const lastBooking = history[0];
        return lastBooking ? `${lastBooking.serviceName} em ${new Date(lastBooking.startTime).toLocaleDateString('pt-BR')}` : 'N/A';
      }
    },
    { 
      key: 'actions', 
      header: 'Histórico', 
      render: (c) => (
        <Button variant="outline" size="small" onClick={() => openHistoryModal(c)} title="Ver Histórico">
          <History size={14} />
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Gerenciar Clientes</h1>
      
      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}

      <Card>
        <Table<User>
          columns={columns}
          data={clients}
          isLoading={loading && clients.length === 0}
          emptyStateMessage="Nenhum cliente encontrado. Os clientes aparecem aqui após o primeiro agendamento."
        />
      </Card>

      {isHistoryModalOpen && selectedClient && (
        <Modal isOpen={isHistoryModalOpen} onClose={closeHistoryModal} title={`Histórico de ${selectedClient.name}`} size="lg">
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {getClientHistory(selectedClient.id).length > 0 ? (
              getClientHistory(selectedClient.id).map(booking => (
                <div key={booking.id} className="p-3 mb-3 bg-cinza-fundo-elemento bg-opacity-50 rounded-md border border-cinza-borda">
                  <p className="font-semibold text-branco-nav">{booking.serviceName} com {booking.barberName}</p>
                  <p className="text-sm text-gray-300">
                    {new Date(booking.startTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} - R$ {booking.priceAtBooking.toFixed(2)}
                  </p>
                  <p className={`text-xs font-medium px-1.5 py-0.5 inline-block rounded ${booking.status === 'completed' ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}>
                    {booking.status.toUpperCase().replace("_", " ")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nenhum histórico de agendamentos para este cliente.</p>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={closeHistoryModal}>Fechar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageClientsPage;
