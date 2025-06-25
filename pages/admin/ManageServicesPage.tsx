
import React, { useEffect, useState, useCallback } from 'react';
import { supabase, getBarbersForBarbershop } from '../../services/supabaseService';
import { Service, Barber } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Table, { ColumnDefinition } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { PlusCircle, Edit3, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
// import { MOCK_BARBERS_DATA } from '../../constants'; // Keep for fallback if needed

const ManageServicesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [allBarbers, setAllBarbers] = useState<Barber[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchServicesAndBarbers = useCallback(async () => {
    if (!currentUser || !currentUser.barbershopId) {
        setError("Usuário ou barbearia não identificados.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const barbershopId = currentUser.barbershopId;
      const [servicesData, barbersData] = await Promise.all([
          supabase.from<Service>('services').eq('barbershopId', barbershopId).select('*'),
          getBarbersForBarbershop(barbershopId) // Using the exported function
      ]);

      if (servicesData.error) throw servicesData.error;
      // Barbers data fetching error can be handled or just use empty if it fails
      if (barbersData) { // getBarbersForBarbershop returns Barber[] directly
        setAllBarbers(barbersData);
      } else {
        console.warn("Could not fetch barbers for service management.");
        setAllBarbers([]); // Or fallback to MOCK_BARBERS_DATA if absolutely necessary
      }
      
      setServices(servicesData.data || []);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchServicesAndBarbers();
  }, [fetchServicesAndBarbers]);

  const openModal = (service?: Service) => {
    setIsEditMode(!!service);
    setCurrentService(service ? { ...service } : { isActive: true, duration: 30, price: 0, assignedBarberIds: [], barbershopId: currentUser?.barbershopId, name: '', description: '', category: '' });
    setIsModalOpen(true);
    setError(null); 
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!currentService) return;
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        setCurrentService({ ...currentService, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === "assignedBarberIds") {
        const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
        setCurrentService({ ...currentService, assignedBarberIds: selectedOptions });
    } else {
        setCurrentService({ ...currentService, [name]: type === 'number' ? parseFloat(value) : value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService || !currentService.name || !currentService.duration || currentService.price == null || !currentUser?.barbershopId) {
      setError("Por favor, preencha todos os campos obrigatórios (Nome, Duração, Preço).");
      return;
    }
    setError(null); 
    setLoading(true);

    const servicePayload: Partial<Service> = { 
        ...currentService,
        barbershopId: currentUser.barbershopId, 
        // Ensure numbers are numbers
        price: Number(currentService.price) || 0,
        duration: Number(currentService.duration) || 30,
    };
    // Remove ID if it's for insert, keep for update
    if (!isEditMode) delete servicePayload.id;


    try {
      if (isEditMode && currentService.id) {
        const { id, ...updateData } = servicePayload; // Exclude ID from update payload if it's there
        const { error: updateError } = await supabase
            .from<Service>('services')
            .update(updateData) 
            .eq('id', currentService.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
            .from<Service>('services')
            .insert(servicePayload as Service); // Cast because insert needs full object for TS
        if (insertError) throw insertError;
      }
      await fetchServicesAndBarbers();
      closeModal();
    } catch (err: any) {
      console.error("Erro ao salvar serviço:", err);
      setError(err.message || "Erro ao salvar serviço.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from<Service>('services')
        .delete()
        .eq('id', serviceId);
      if (deleteError) throw deleteError;
      await fetchServicesAndBarbers(); 
    } catch (err: any) {
      setError(err.message || "Erro ao excluir serviço.");
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    setLoading(true);
    setError(null);
    try {
        const { error: updateError } = await supabase
            .from<Service>('services')
            .update({ isActive: !service.isActive })
            .eq('id', service.id);
        if (updateError) throw updateError;
        await fetchServicesAndBarbers();
    } catch (err:any) {
        setError(err.message || "Erro ao alterar status do serviço.");
    } finally {
        setLoading(false);
    }
  };

  const columns: ColumnDefinition<Service>[] = [
    { key: 'name', header: 'Nome do Serviço', render: (s) => <span className="font-medium text-branco-nav">{s.name}</span> },
    { key: 'duration', header: 'Duração (min)', render: (s) => `${s.duration} min` },
    { key: 'price', header: 'Preço', render: (s) => `R$ ${s.price.toFixed(2)}` },
    { 
      key: 'assignedBarberIds', 
      header: 'Barbeiros', 
      render: (s) => (s.assignedBarberIds && s.assignedBarberIds.length > 0 
                        ? s.assignedBarberIds.map(id => allBarbers.find(b=>b.id===id)?.name || id).join(', ') 
                        : 'Todos')
    },
    { 
      key: 'isActive', 
      header: 'Status', 
      render: (s) => (
        <button onClick={() => toggleServiceStatus(s)} title={s.isActive ? "Desativar" : "Ativar"} className="focus:outline-none">
          {s.isActive 
            ? <ToggleRight size={24} className="text-green-500 cursor-pointer hover:text-green-400" /> 
            : <ToggleLeft size={24} className="text-gray-500 cursor-pointer hover:text-gray-400" />}
        </button>
      ) 
    },
    { 
      key: 'actions', 
      header: 'Ações', 
      render: (s) => (
        <div className="space-x-2">
          <Button variant="outline" size="small" onClick={() => openModal(s)} title="Editar"><Edit3 size={14} /></Button>
          <Button variant="danger" size="small" onClick={() => handleDelete(s.id)} title="Excluir"><Trash2 size={14} /></Button>
        </div>
      )
    },
  ];

  const barberOptions = allBarbers.map(b => ({ value: b.id, label: b.name }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Gerenciar Serviços</h1>
        <Button variant="primary" onClick={() => openModal()} leftIcon={<PlusCircle size={18}/>}>Adicionar Serviço</Button>
      </div>

      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}
      
      <Card>
        <Table<Service>
          columns={columns}
          data={services}
          isLoading={loading && services.length === 0}
          emptyStateMessage="Nenhum serviço cadastrado."
        />
      </Card>

      {isModalOpen && currentService && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditMode ? "Editar Serviço" : "Adicionar Novo Serviço"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome do Serviço" name="name" value={currentService.name || ''} onChange={handleInputChange} required />
            <Input label="Categoria (Opcional)" name="category" value={currentService.category || ''} onChange={handleInputChange} placeholder="Ex: Cabelo, Barba, Combo"/>
            <Textarea label="Descrição (Opcional)" name="description" value={currentService.description || ''} onChange={handleInputChange} rows={3} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Duração (minutos)" name="duration" type="number" value={String(currentService.duration || '')} onChange={handleInputChange} required min="5"/>
                <Input label="Preço (R$)" name="price" type="number" step="0.01" value={String(currentService.price || '')} onChange={handleInputChange} required min="0"/>
            </div>
            
            <div>
                <label htmlFor="assignedBarberIds" className="block text-sm font-medium text-gray-300 mb-1">Barbeiros Habilitados (Opcional)</label>
                <select 
                    id="assignedBarberIds"
                    name="assignedBarberIds"
                    multiple 
                    value={currentService.assignedBarberIds || []} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-cinza-borda rounded-md text-branco-nav focus:outline-none focus:ring-2 focus:ring-azul-primario h-32"
                >
                    {barberOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Segure Ctrl (ou Cmd) para selecionar múltiplos. Se nenhum for selecionado, todos os barbeiros poderão realizar o serviço.</p>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="isActive" name="isActive" checked={currentService.isActive === undefined ? true : currentService.isActive} onChange={handleInputChange} className="h-4 w-4 text-azul-primario border-gray-500 rounded focus:ring-azul-primario"/>
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Serviço Ativo</label>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="primary" isLoading={loading}>{isEditMode ? "Salvar Alterações" : "Adicionar Serviço"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageServicesPage;
