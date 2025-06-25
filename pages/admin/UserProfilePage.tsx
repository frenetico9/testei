
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, updateUserProfile as apiUpdateUserProfile, getBarbershopDetails } from '../../services/supabaseService';
import { User, Barbershop, UserRole } from '../../types';
import Card from '../../components/ui/Card';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AlertTriangle, CheckCircle, Save, KeyRound, Building } from 'lucide-react';
import { MOCK_BARBERSHOP_ID } from '../../constants'; // For initial state if needed, but should use live data

const UserProfilePage: React.FC = () => {
  const { currentUser, supabaseUser, updateUserProfile, loadingAuth } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Email change is sensitive, might require confirmation
  const [phone, setPhone] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [barbershopName, setBarbershopName] = useState('');
  const [barbershopAddress, setBarbershopAddress] = useState('');
  const [barbershopDetails, setBarbershopDetails] = useState<Barbershop | null>(null);
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  const [loadingBarbershop, setLoadingBarbershop] = useState(false);
  const [barbershopError, setBarbershopError] = useState<string | null>(null);
  const [barbershopSuccess, setBarbershopSuccess] = useState<string | null>(null);


  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      
      if (currentUser.role === UserRole.ADMIN && currentUser.barbershopId) {
        const fetchBsDetails = async () => {
            setLoadingBarbershop(true);
            const details = await getBarbershopDetails(currentUser.barbershopId || MOCK_BARBERSHOP_ID); // Fallback for safety during dev
            if(details){
                setBarbershopDetails(details);
                setBarbershopName(details.name);
                setBarbershopAddress(details.address);
            } else {
                setBarbershopError("Não foi possível carregar os dados da barbearia.");
            }
            setLoadingBarbershop(false);
        }
        fetchBsDetails();
      }
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoadingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const updates: Partial<User> = {};
      if (name !== currentUser.name) updates.name = name;
      if (phone !== currentUser.phone) updates.phone = phone;

      if (Object.keys(updates).length > 0) {
        const updatedUser = await updateUserProfile(updates); // This updates our 'users' table via useAuth hook
        if (updatedUser) {
          setProfileSuccess("Perfil atualizado com sucesso!");
        } else {
          throw new Error("Falha ao atualizar perfil.");
        }
      } else {
        setProfileSuccess("Nenhuma alteração detectada no perfil.");
      }

      // Handle email change separately if it's different (requires Supabase auth update)
      if (email !== currentUser.email && supabaseUser) {
        // Note: Email change often requires user confirmation via email.
        // For simplicity, this mock might directly update or show a message.
        // const { error: emailError } = await supabase.auth.updateUser({ email });
        // if (emailError) throw new Error(`Falha ao atualizar e-mail: ${emailError.message}`);
        setProfileSuccess((prev) => (prev ? prev + " Atualização de e-mail iniciada (verifique sua caixa de entrada se aplicável)." : "Atualização de e-mail iniciada."));
        console.warn("Mock: Email update requested. In a real app, Supabase handles this with confirmation.");
      }

    } catch (err: any) {
      setProfileError(err.message || "Erro ao atualizar perfil.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("As novas senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoadingPassword(true);
    try {
      // In a real app, you might want to re-authenticate the user with currentPassword first for security.
      // Supabase's updateUser doesn't require currentPassword if the user is already authenticated.
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        throw updateError;
      }
      setPasswordSuccess("Senha atualizada com sucesso!");
      setNewPassword('');
      setConfirmNewPassword('');
      setCurrentPassword(''); // Clear current password field too
    } catch (err: any) {
      setPasswordError(err.message || "Erro ao atualizar senha.");
    } finally {
      setLoadingPassword(false);
    }
  };
  
  const handleBarbershopUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== UserRole.ADMIN || !barbershopDetails) return;
    setLoadingBarbershop(true);
    setBarbershopError(null);
    setBarbershopSuccess(null);
    try {
        const updates: Partial<Barbershop> = {};
        if (barbershopName !== barbershopDetails.name) updates.name = barbershopName;
        if (barbershopAddress !== barbershopDetails.address) updates.address = barbershopAddress;

        if (Object.keys(updates).length > 0) {
            const { error: bsUpdateError } = await supabase
                .from<Barbershop>('barbershops')
                .eq('id', barbershopDetails.id)
                .update(updates);
            if (bsUpdateError) throw bsUpdateError;
            setBarbershopSuccess("Dados da barbearia atualizados com sucesso!");
            // Optionally re-fetch barbershopDetails or update local state
             setBarbershopDetails(prev => prev ? {...prev, ...updates} : null);
        } else {
            setBarbershopSuccess("Nenhuma alteração detectada nos dados da barbearia.");
        }
    } catch (err:any) {
        setBarbershopError(err.message || "Erro ao atualizar dados da barbearia.");
    } finally {
        setLoadingBarbershop(false);
    }
  };

  if (loadingAuth || !currentUser) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-vermelho-bordo"></div></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Meu Perfil</h1>

      {profileError && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{profileError}</div>}
      {profileSuccess && <div className="bg-green-700 bg-opacity-50 text-green-300 p-3 rounded-md flex items-center"><CheckCircle size={18} className="mr-2"/>{profileSuccess}</div>}

      <Card title="Informações Pessoais" titleClassName="text-xl">
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input label="Nome Completo" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="E-mail" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
            // disabled // Email change is sensitive, often handled differently or disabled
            helperText="Alterar e-mail pode exigir confirmação."
          />
          <Input label="Telefone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={loadingProfile} leftIcon={<Save size={18}/>}>
              Salvar Perfil
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Alterar Senha" titleClassName="text-xl">
        {passwordError && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md mb-4 flex items-center"><AlertTriangle size={18} className="mr-2"/>{passwordError}</div>}
        {passwordSuccess && <div className="bg-green-700 bg-opacity-50 text-green-300 p-3 rounded-md mb-4 flex items-center"><CheckCircle size={18} className="mr-2"/>{passwordSuccess}</div>}
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          {/* <Input label="Senha Atual" name="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /> */}
          <Input label="Nova Senha" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Mínimo 6 caracteres"/>
          <Input label="Confirmar Nova Senha" name="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={loadingPassword} leftIcon={<KeyRound size={18}/>}>
              Alterar Senha
            </Button>
          </div>
        </form>
      </Card>

      {currentUser.role === UserRole.ADMIN && barbershopDetails && (
        <Card title="Dados da Barbearia" titleClassName="text-xl">
            {barbershopError && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md mb-4 flex items-center"><AlertTriangle size={18} className="mr-2"/>{barbershopError}</div>}
            {barbershopSuccess && <div className="bg-green-700 bg-opacity-50 text-green-300 p-3 rounded-md mb-4 flex items-center"><CheckCircle size={18} className="mr-2"/>{barbershopSuccess}</div>}
             <form onSubmit={handleBarbershopUpdate} className="space-y-4">
                <Input label="Nome da Barbearia" name="barbershopName" value={barbershopName} onChange={(e) => setBarbershopName(e.target.value)} required />
                <Textarea label="Endereço da Barbearia" name="barbershopAddress" value={barbershopAddress} onChange={(e) => setBarbershopAddress(e.target.value)} required rows={3} />
                 {/* Add more fields: phone, description, logoUrl, operatingHours editor etc. */}
                <div className="flex justify-end">
                    <Button type="submit" variant="primary" isLoading={loadingBarbershop} leftIcon={<Building size={18}/>}>
                    Salvar Dados da Barbearia
                    </Button>
                </div>
            </form>
        </Card>
      )}
      
      <Card title="Plano Atual" titleClassName="text-xl">
        <p className="text-gray-300">
            Você está no plano <strong className="text-vermelho-bordo">{currentUser.currentPlan?.toUpperCase() || 'N/A'}</strong>.
        </p>
        {currentUser.planExpiryDate && (
             <p className="text-sm text-gray-400">Seu plano é válido até: {new Date(currentUser.planExpiryDate).toLocaleDateString('pt-BR')}.</p>
        )}
        <div className="mt-4">
            <Button variant='outline' onClick={() => window.location.hash = '/admin/subscription'}>
                Gerenciar Assinatura
            </Button>
        </div>
      </Card>

    </div>
  );
};

export default UserProfilePage;
