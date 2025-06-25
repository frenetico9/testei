
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, updateUserProfile as apiUpdateUserProfileHook, getBarbershopDetails as fetchBarbershopDetailsApi } from '../../services/supabaseService'; 
import { User, Barbershop, UserRole } from '../../types';
import Card from '../../components/ui/Card';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AlertTriangle, CheckCircle, Save, KeyRound, Building } from 'lucide-react';
import { MOCK_BARBERSHOP_ID } from '../../constants'; 

const UserProfilePage: React.FC = () => {
  const { currentUser, supabaseUser, updateUserProfile: updateUserProfileContext, loadingAuth } = useAuth(); // Renamed context function
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [phone, setPhone] = useState('');
  
  // const [currentPassword, setCurrentPassword] = useState(''); // currentPassword not needed for supabase.auth.updateUser
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [barbershopName, setBarbershopName] = useState('');
  const [barbershopAddress, setBarbershopAddress] = useState('');
  const [barbershopDescription, setBarbershopDescription] = useState('');
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
        const loadBsDetails = async () => {
            setLoadingBarbershop(true);
            const details = await fetchBarbershopDetailsApi(currentUser.barbershopId || MOCK_BARBERSHOP_ID); 
            if(details){
                setBarbershopDetails(details);
                setBarbershopName(details.name);
                setBarbershopAddress(details.address);
                setBarbershopDescription(details.description || '');
            } else {
                setBarbershopError("Não foi possível carregar os dados da barbearia.");
            }
            setLoadingBarbershop(false);
        }
        loadBsDetails();
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
      const updatesForProfileTable: Partial<User> = {};
      if (name !== currentUser.name) updatesForProfileTable.name = name;
      if (phone !== currentUser.phone) updatesForProfileTable.phone = phone;

      // Update non-auth related profile data (name, phone) using the context's updateUserProfile
      // This function should internally call the apiUpdateUserProfileHook or similar for DB persistence
      if (Object.keys(updatesForProfileTable).length > 0) {
        const updatedUser = await updateUserProfileContext(updatesForProfileTable); 
        if (updatedUser) {
          setProfileSuccess("Perfil (nome/telefone) atualizado com sucesso!");
        } else {
          throw new Error("Falha ao atualizar perfil (nome/telefone).");
        }
      } else {
         setProfileSuccess("Nenhuma alteração detectada em nome ou telefone.");
      }

      // Handle email update separately via supabase.auth.updateUser
      if (email !== currentUser.email && supabaseUser) {
        const {data: authUpdateData, error: authEmailError} = await supabase.auth.updateUser({ email: email });
        if (authEmailError) {
            throw new Error(`Falha ao iniciar atualização de e-mail: ${authEmailError.message}`);
        }
        // Also update email in the user profile table if context function doesn't handle it
        await apiUpdateUserProfileHook(currentUser.id, { email: email });
        // Refresh context
        await updateUserProfileContext({ email: email });
        setProfileSuccess((prev) => (prev ? prev + " Atualização de e-mail iniciada (verifique sua caixa de entrada)." : "Atualização de e-mail iniciada (verifique sua caixa de entrada)."));
        // Email in Supabase Auth is updated, UI will reflect after context re-fetch or manual set
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
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        // More specific error handling based on Supabase common errors
        if (updateError.message.includes("same as the old password")) {
            throw new Error("A nova senha não pode ser igual à senha antiga.");
        }
        if (updateError.message.includes("weak password")) {
             throw new Error("Senha muito fraca. Tente uma combinação mais forte.");
        }
        throw updateError;
      }
      setPasswordSuccess("Senha atualizada com sucesso!");
      setNewPassword('');
      setConfirmNewPassword('');
      // setCurrentPassword(''); // Not needed
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
        if (barbershopDescription !== (barbershopDetails.description || '')) updates.description = barbershopDescription;


        if (Object.keys(updates).length > 0) {
            const { error: bsUpdateError } = await supabase
                .from<Barbershop>('barbershops')
                .update(updates)
                .eq('id', barbershopDetails.id);
            if (bsUpdateError) throw bsUpdateError;
            setBarbershopSuccess("Dados da barbearia atualizados com sucesso!");
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
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-azul-primario"></div></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Meu Perfil</h1>

      {profileError && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md mb-2 flex items-center"><AlertTriangle size={18} className="mr-2"/>{profileError}</div>}
      {profileSuccess && <div className="bg-green-700 bg-opacity-50 text-green-300 p-3 rounded-md mb-2 flex items-center"><CheckCircle size={18} className="mr-2"/>{profileSuccess}</div>}

      <Card title="Informações Pessoais" titleClassName="text-xl">
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input label="Nome Completo" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="E-mail" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
            helperText="Alterar e-mail pode exigir confirmação na sua caixa de entrada."
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
          {/* Supabase's updateUser doesn't require currentPassword if the user is authenticated */}
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
                <Textarea label="Endereço da Barbearia" name="barbershopAddress" value={barbershopAddress} onChange={(e) => setBarbershopAddress(e.target.value)} required rows={2} />
                <Textarea label="Descrição da Barbearia" name="barbershopDescription" value={barbershopDescription} onChange={(e) => setBarbershopDescription(e.target.value)} rows={4} placeholder="Conte um pouco sobre sua barbearia..." />
                <p className="text-xs text-gray-400">Para alterar logo, fotos e horário de funcionamento, acesse as seções específicas (funcionalidade em desenvolvimento).</p>
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
            Você está no plano <strong className="text-azul-primario">{currentUser.currentPlan?.toUpperCase() || 'N/A'}</strong>.
        </p>
        {currentUser.planExpiryDate && (
             <p className="text-sm text-gray-400">Seu plano é válido até: {new Date(currentUser.planExpiryDate).toLocaleDateString('pt-BR')}.</p>
        )}
        <div className="mt-4">
            <Button variant='outline' onClick={() => window.location.hash = ROUTES.ADMIN_SUBSCRIPTION}>
                Gerenciar Assinatura
            </Button>
        </div>
      </Card>

    </div>
  );
};

export default UserProfilePage;
