
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseService';
import { Barber, Service, AvailabilitySlot, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Table, { ColumnDefinition } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { PlusCircle, Edit3, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { MOCK_SERVICES_DATA, DAYS_OF_WEEK_PT, DEFAULT_BARBER_AVAILABILITY, DAYS_OF_WEEK } from '../../constants';


const ManageBarbersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBarber, setCurrentBarber] = useState<Partial<Barber> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchBarbers = useCallback(async () => {
    if (!currentUser || !currentUser.barbershopId) {
        setError("Usuário ou barbearia não identificados.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from<Barber>('barbers')
        .eq('barbershopId', currentUser.barbershopId)
        .select('*');
      if (fetchError) throw fetchError;
      setBarbers(data || []);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar funcionários.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const openModal = (barber?: Barber) => {
    setIsEditMode(!!barber);
    const initialAvailability = barber?.availability && barber.availability.length === DAYS_OF_WEEK.length 
        ? barber.availability.map(a => ({...a})) 
        : DEFAULT_BARBER_AVAILABILITY.map(a => ({...a}));

    setCurrentBarber(barber ? { ...barber, availability: initialAvailability } : { 
        name: '', email: '', specialties: [], availability: initialAvailability, 
        profilePictureUrl: '', bio: '', barbershopId: currentUser?.barbershopId, 
        // userId should be generated upon creation if not provided or linked to an existing User
        userId: `temp_user_${Date.now()}` 
    });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBarber(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!currentBarber) return;
    const { name, value } = e.target;
    if (name === 'specialties') {
        setCurrentBarber({ ...currentBarber, specialties: value.split(',').map(s => s.trim()) });
    } else {
        setCurrentBarber({ ...currentBarber, [name]: value });
    }
  };

  const handleAvailabilityChange = (dayIndex: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    if (!currentBarber || !currentBarber.availability) return;
    const updatedAvailability = currentBarber.availability.map((slot, index) => {
        if (index === dayIndex) {
            return { ...slot, [field]: value };
        }
        return slot;
    });
    setCurrentBarber({ ...currentBarber, availability: updatedAvailability });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBarber || !currentBarber.name || !currentBarber.email || !currentUser?.barbershopId) {
      setError("Nome e E-mail são obrigatórios.");
      return;
    }
    setError(null);
    setLoading(true);

    // Prepare data for DB
    const barberPayload: Partial<Barber> = {
        ...currentBarber,
        barbershopId: currentUser.barbershopId,
         // Ensure userId is properly set or generated if creating new user implicitly
        userId: currentBarber.userId || `barber_user_${Date.now()}` // Mock user ID generation
    };
    if (!isEditMode) delete barberPayload.id; // Remove id for insert operations


    try {
      if (isEditMode && currentBarber.id) {
        const { id, ...updateData } = barberPayload; // id is part of currentBarber for edit
        const { error: updateError } = await supabase
            .from<Barber>('barbers')
            .update(updateData)
            .eq('id', currentBarber.id);
        if (updateError) throw updateError;
      } else {
         // This is a simplified mock. In a real app, you might first create a User in 'users' table,
         // get their ID, then create the Barber profile linked to that userId.
         // For now, we assume direct insert into 'barbers' with mock userId.
        const { error: insertError } = await supabase
            .from<Barber>('barbers')
            .insert(barberPayload as Barber); // Cast because insert might expect all fields
        if (insertError) throw insertError;
      }
      await fetchBarbers();
      closeModal();
    } catch (err: any) {
      console.error("Erro ao salvar funcionário:", err);
      setError(err.message || "Erro ao salvar funcionário.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (barberId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este funcionário?")) return;
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from<Barber>('barbers')
        .delete()
        .eq('id', barberId);
      if (deleteError) throw deleteError;
      await fetchBarbers(); 
    } catch (err: any) {
      setError(err.message || "Erro ao excluir funcionário.");
    } finally {
      setLoading(false);
    }
  };
  
  const columns: ColumnDefinition<Barber>[] = [
    { key: 'profilePictureUrl', header: 'Foto', render: (b) => <img src={b.profilePictureUrl || `https://ui-avatars.com/api/?name=${b.name.replace(/\s/g, "+")}&background=0D1F2D&color=FFFFFF&size=50`} alt={b.name} className="w-10 h-10 rounded-full object-cover"/> },
    { key: 'name', header: 'Nome', render: (b) => <span className="font-medium text-branco-nav">{b.name}</span> },
    { key: 'email', header: 'E-mail' },
    { key: 'specialties', header: 'Especialidades', render: (b) => (b.specialties || []).join(', ') },
    { 
      key: 'actions', 
      header: 'Ações', 
      render: (b) => (
        <div className="space-x-2">
          <Button variant="outline" size="small" onClick={() => openModal(b)} title="Editar"><Edit3 size={14} /></Button>
          <Button variant="danger" size="small" onClick={() => handleDelete(b.id)} title="Excluir"><Trash2 size={14} /></Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Gerenciar Funcionários</h1>
        <Button variant="primary" onClick={() => openModal()} leftIcon={<UserPlus size={18}/>}>Adicionar Funcionário</Button>
      </div>
      
      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}

      <Card>
        <Table<Barber>
          columns={columns}
          data={barbers}
          isLoading={loading && barbers.length === 0}
          emptyStateMessage="Nenhum funcionário cadastrado."
        />
      </Card>

      {isModalOpen && currentBarber && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditMode ? "Editar Funcionário" : "Adicionar Novo Funcionário"} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Input label="Nome Completo" name="name" value={currentBarber.name || ''} onChange={handleInputChange} required />
            <Input label="E-mail" name="email" type="email" value={currentBarber.email || ''} onChange={handleInputChange} required 
              helperText="Este e-mail pode ser usado para o funcionário acessar o sistema no futuro (funcionalidade pendente)."
            />
            <Input label="URL da Foto de Perfil (Opcional)" name="profilePictureUrl" value={currentBarber.profilePictureUrl || ''} onChange={handleInputChange} placeholder="https://exemplo.com/foto.jpg"/>
            <Input label="Especialidades (separadas por vírgula)" name="specialties" value={(currentBarber.specialties || []).join(', ') || ''} onChange={handleInputChange} placeholder="Corte Moderno, Barba Clássica"/>
            <Textarea label="Bio (Opcional)" name="bio" value={currentBarber.bio || ''} onChange={handleInputChange} rows={3} />

            <h4 className="text-lg font-roboto-slab font-semibold pt-2 text-branco-nav">Disponibilidade Semanal</h4>
            {currentBarber.availability?.map((slot, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-x-3 gap-y-2 items-center p-2 border border-cinza-borda rounded-md bg-cinza-fundo-elemento bg-opacity-30">
                <span className="text-gray-300 col-span-4 sm:col-span-1">{DAYS_OF_WEEK_PT[slot.dayOfWeek]}</span>
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`startTime-${index}`} className="text-xs text-gray-400">Início</label>
                    <Input type="time" name={`startTime-${index}`} id={`startTime-${index}`} value={slot.startTime} onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)} disabled={!slot.isWorking} containerClassName="mb-0" className="py-1.5"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`endTime-${index}`} className="text-xs text-gray-400">Fim</label>
                    <Input type="time" name={`endTime-${index}`} id={`endTime-${index}`} value={slot.endTime} onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)} disabled={!slot.isWorking} containerClassName="mb-0" className="py-1.5"/>
                </div>
                <div className="flex items-center justify-start sm:justify-end col-span-4 sm:col-span-1 pt-2 sm:pt-0">
                    <input type="checkbox" id={`isWorking-${index}`} checked={slot.isWorking} onChange={(e) => handleAvailabilityChange(index, 'isWorking', e.target.checked)} className="h-4 w-4 text-azul-primario border-gray-500 rounded focus:ring-azul-primario"/>
                    <label htmlFor={`isWorking-${index}`} className="ml-2 text-sm text-gray-300">Trabalha</label>
                </div>
              </div>
            ))}
            
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="primary" isLoading={loading}>{isEditMode ? "Salvar Alterações" : "Adicionar Funcionário"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageBarbersPage;
