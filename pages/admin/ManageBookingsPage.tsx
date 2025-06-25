
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabaseService';
import { Booking, BookingStatus, Barber, Service } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Table, { ColumnDefinition } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Edit3, Trash2, Filter, Download, PlusCircle, AlertTriangle } from 'lucide-react';
import { MOCK_BARBERS_DATA, MOCK_SERVICES_DATA } from '../../constants'; 
import { UserRole } from '../../types';

const ManageBookingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBarbers, setAllBarbers] = useState<Barber[]>([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'cancel' | 'create'>('create');
  const [formStatus, setFormStatus] = useState<BookingStatus>(BookingStatus.PENDING);


  const [filters, setFilters] = useState<{ status: string; date: string; barberId: string }>({
    status: '',
    date: '',
    barberId: '',
  });

  const fetchBookingsAndRelatedData = useCallback(async () => {
    if (!currentUser || !currentUser.barbershopId) {
        setError("Usuário ou barbearia não identificados.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch barbers first
      const { data: barbersData, error: barbersError } = await supabase
        .from<Barber>('barbers')
        .eq('barbershopId', currentUser.barbershopId)
        .select('*');
      if (barbersError) throw barbersError;
      setAllBarbers(barbersData || MOCK_BARBERS_DATA); // Fallback to mock if needed, though real data is preferred

      // Fetch bookings
      const { data: bookingsData, error: fetchError } = await supabase
        .from<Booking>('bookings')
        .eq('barbershopId', currentUser.barbershopId)
        .select('*');
      if (fetchError) throw fetchError;
      
      setBookings((bookingsData || []).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())); 
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBookingsAndRelatedData();
  }, [fetchBookingsAndRelatedData]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const statusMatch = !filters.status || booking.status === filters.status;
      const dateMatch = !filters.date || booking.startTime.startsWith(filters.date);
      const barberMatch = !filters.barberId || booking.barberId === filters.barberId;
      return statusMatch && dateMatch && barberMatch;
    });
  }, [bookings, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openModal = (mode: 'edit' | 'cancel' | 'create', booking?: Booking) => {
    setModalMode(mode);
    setSelectedBooking(booking || null);
    if (booking && mode === 'edit') {
      setFormStatus(booking.status);
    } else {
      setFormStatus(BookingStatus.PENDING); // Default for create or reset for cancel
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveBooking = async () => { // Removed updatedBookingData from params, will use formStatus
    if (!selectedBooking || !selectedBooking.id) return;
    setLoading(true);
    setError(null);
    try {
        // Only status is editable in this simplified modal
        const payloadToUpdate: Partial<Booking> = { status: formStatus };
        
        const { data, error: updateError } = await supabase
            .from<Booking>('bookings')
            .update(payloadToUpdate)
            .eq('id', selectedBooking.id); // Corrected: update first, then eq

        if (updateError) throw updateError;
        
        await fetchBookingsAndRelatedData(); 
        closeModal();
    } catch (err: any) {
        setError("Erro ao salvar agendamento: " + err.message);
    } finally {
        setLoading(false);
    }
  };
  
  const handleCancelBooking = async (bookingToCancel: Booking) => {
    console.log(`Booking ${bookingToCancel.id} will be marked as CANCELLED_ADMIN`);
    setSelectedBooking(bookingToCancel); // Ensure selectedBooking is set
    setFormStatus(BookingStatus.CANCELLED_ADMIN); // Set status for saving
    // Directly call save logic as if it was an edit
    setLoading(true);
    setError(null);
    try {
        const { error: updateError } = await supabase
            .from<Booking>('bookings')
            .update({ status: BookingStatus.CANCELLED_ADMIN })
            .eq('id', bookingToCancel.id);

        if (updateError) throw updateError;
        
        await fetchBookingsAndRelatedData(); 
        closeModal();
    } catch (err: any) {
        setError("Erro ao cancelar agendamento: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) return;
    const headers = ['ID Cliente', 'Nome Cliente', 'Serviço', 'Barbeiro', 'Data', 'Hora', 'Status', 'Preço'];
    const rows = filteredBookings.map(b => [
      b.clientId,
      b.clientName,
      b.serviceName,
      b.barberName,
      new Date(b.startTime).toLocaleDateString('pt-BR'),
      new Date(b.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      b.status,
      `R$ ${b.priceAtBooking.toFixed(2)}`
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agendamentos_navalha_digital.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDefinition<Booking>[] = [
    { key: 'clientName', header: 'Cliente', render: (b) => (
        <div>
            <p className="font-medium text-branco-nav">{b.clientName}</p>
            <p className="text-xs text-gray-400">{b.clientEmail}</p>
            <p className="text-xs text-gray-400">{b.clientPhone}</p>
        </div>
    )},
    { key: 'serviceName', header: 'Serviço', render: (b) => (
        <div>
            <p>{b.serviceName}</p>
            <p className="text-xs text-azul-primario font-semibold">R$ {b.priceAtBooking.toFixed(2)}</p>
        </div>
    )},
    { key: 'barberName', header: 'Barbeiro' },
    { key: 'startTime', header: 'Data/Hora', render: (b) => `${new Date(b.startTime).toLocaleDateString('pt-BR')} ${new Date(b.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}` },
    { 
      key: 'status', 
      header: 'Status', 
      render: (b) => {
        let colorClass = 'bg-gray-600 text-gray-200';
        if (b.status === BookingStatus.CONFIRMED) colorClass = 'bg-green-600 text-green-100';
        else if (b.status === BookingStatus.PENDING) colorClass = 'bg-yellow-600 text-yellow-100';
        else if (b.status === BookingStatus.COMPLETED) colorClass = 'bg-blue-600 text-blue-100';
        else if (b.status.startsWith('CANCELLED')) colorClass = 'bg-red-700 text-red-100';
        else if (b.status === BookingStatus.NO_SHOW) colorClass = 'bg-purple-700 text-purple-100';
        return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${colorClass}`}>{b.status.replace(/_/g, ' ').toUpperCase()}</span>;
      }
    },
    { 
      key: 'actions', 
      header: 'Ações', 
      render: (b) => (
        <div className="space-x-2">
          <Button variant="outline" size="small" onClick={(e) => { e.stopPropagation(); openModal('edit', b); }} title="Editar">
            <Edit3 size={14} />
          </Button>
          {b.status !== BookingStatus.CANCELLED_ADMIN && b.status !== BookingStatus.CANCELLED_CLIENT && b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.NO_SHOW && (
            <Button variant="danger" size="small" onClick={(e) => { e.stopPropagation(); openModal('cancel', b); }} title="Cancelar">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )
    },
  ];
  
  const statusOptions = Object.values(BookingStatus).map(s => ({ value: s, label: s.replace(/_/g, ' ').toUpperCase() }));
  const barberOptions = [{value: '', label: 'Todos Barbeiros'}, ...allBarbers.map(b => ({ value: b.id, label: b.name }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Gestão de Agendamentos</h1>
        <div className="flex gap-2">
           {/* <Button variant="primary" onClick={() => openModal('create')} leftIcon={<PlusCircle size={18}/>}>Novo Agendamento</Button> */}
           <Button variant="outline" onClick={exportToCSV} disabled={filteredBookings.length === 0} leftIcon={<Download size={18}/>}>Exportar CSV</Button>
        </div>
      </div>

      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-cinza-fundo-elemento bg-opacity-30 rounded-md border border-cinza-borda">
            <h3 className="md:col-span-4 text-lg font-semibold text-branco-nav flex items-center"><Filter size={18} className="mr-2 text-azul-primario"/>Filtros</h3>
            <Select name="status" label="Status" value={filters.status} onChange={handleFilterChange} options={[{value: '', label: 'Todos Status'}, ...statusOptions]} />
            <div>
                 <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Data</label>
                <input type="date" name="date" id="date" value={filters.date} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-700 border border-cinza-borda rounded-md text-branco-nav focus:ring-azul-primario focus:border-azul-primario"/>
            </div>
            <Select name="barberId" label="Barbeiro" value={filters.barberId} onChange={handleFilterChange} options={barberOptions} />
            <div className="md:col-start-4 flex items-end">
                <Button variant="outline" onClick={() => setFilters({ status: '', date: '', barberId: '' })} className="w-full">Limpar Filtros</Button>
            </div>
        </div>
        <Table<Booking>
            columns={columns}
            data={filteredBookings}
            isLoading={loading && bookings.length === 0} // Show loading only if no data yet
            emptyStateMessage="Nenhum agendamento encontrado com os filtros atuais."
        />
      </Card>

      {isModalOpen && selectedBooking && (modalMode === 'edit' || modalMode === 'cancel') && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'edit' ? "Editar Agendamento" : "Cancelar Agendamento"}>
          {modalMode === 'edit' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBooking(); }}>
              <p className="mb-2 text-gray-300">Cliente: <span className="font-semibold text-branco-nav">{selectedBooking.clientName}</span></p>
              <p className="mb-2 text-gray-300">Serviço: <span className="font-semibold text-branco-nav">{selectedBooking.serviceName}</span></p>
              <p className="mb-4 text-gray-300">Horário: <span className="font-semibold text-branco-nav">{new Date(selectedBooking.startTime).toLocaleString('pt-BR')}</span></p>
              
              <Select
                name="status"
                label="Novo Status"
                value={formStatus} // Controlled component
                onChange={(e) => setFormStatus(e.target.value as BookingStatus)}
                options={statusOptions}
                containerClassName="mb-6"
              />
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={closeModal}>Fechar</Button>
                <Button type="submit" variant="primary" isLoading={loading}>Salvar Alterações</Button>
              </div>
            </form>
          )}
          {modalMode === 'cancel' && (
            <div>
              <p className="mb-4 text-gray-200">Tem certeza que deseja cancelar o agendamento de <strong className="text-branco-nav">{selectedBooking.clientName}</strong> para <strong className="text-branco-nav">{selectedBooking.serviceName}</strong> em <strong className="text-branco-nav">{new Date(selectedBooking.startTime).toLocaleString('pt-BR')}</strong>?</p>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={closeModal}>Não</Button>
                <Button type="button" variant="danger" onClick={() => handleCancelBooking(selectedBooking)} isLoading={loading}>Sim, Cancelar</Button>
              </div>
            </div>
          )}
        </Modal>
      )}
      {isModalOpen && modalMode === 'create' && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title="Novo Agendamento Manual">
            <p className="text-gray-300">Formulário de criação de agendamento manual.</p>
            <p className="text-sm text-yellow-400 my-4">Esta funcionalidade de criação manual está em desenvolvimento. Por favor, utilize o fluxo de agendamento do cliente ou edite um existente.</p>
            <div className="flex justify-end mt-4">
                 <Button type="button" variant="outline" onClick={closeModal}>Fechar</Button>
            </div>
        </Modal>
      )}

    </div>
  );
};

export default ManageBookingsPage;
