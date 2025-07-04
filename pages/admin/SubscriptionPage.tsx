
import React, { useState }from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Plan, PlanTier } from '../../types';
import { PLANS } from '../../constants';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { CheckCircle, XCircle, Star, AlertTriangle } from 'lucide-react';
import { updateUserPlan } from '../../services/supabaseService'; 

const SubscriptionPage: React.FC = () => {
  const { currentUser, updateUserProfile: refreshUserProfileViaContext, loadingAuth } = useAuth(); // Renamed to avoid conflict
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectPlan = async (planId: PlanTier) => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    console.log(`Simulating payment process for plan: ${planId}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
      const updatedUserFromApi = await updateUserPlan(currentUser.id, planId); // This is the direct API call
      if (updatedUserFromApi) {
        // Now, update the context with the new plan details from the API response
        await refreshUserProfileViaContext({ 
            currentPlan: updatedUserFromApi.currentPlan, 
            planExpiryDate: updatedUserFromApi.planExpiryDate 
        });
        setSuccessMessage(`Plano ${PLANS.find(p=>p.id === planId)?.name} ativado com sucesso!`);
      } else {
        throw new Error("Não foi possível atualizar o plano do usuário via API.");
      }
    } catch (err: any) {
      console.error("Erro ao selecionar plano:", err);
      setError(err.message || "Ocorreu um erro ao tentar mudar seu plano. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAuth || !currentUser) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-azul-primario"></div></div>;
  }
  
  const currentPlanDetails = PLANS.find(p => p.id === currentUser.currentPlan);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-roboto-slab font-bold text-branco-nav">Minha Assinatura</h1>

      {error && <div className="bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/>{error}</div>}
      {successMessage && <div className="bg-green-700 bg-opacity-50 text-green-300 p-3 rounded-md flex items-center"><CheckCircle size={18} className="mr-2"/>{successMessage}</div>}

      <Card title="Seu Plano Atual" className="bg-azul-primario text-branco-nav shadow-lg">
        {currentPlanDetails ? (
          <div>
            <h2 className="text-2xl font-roboto-slab font-semibold">{currentPlanDetails.name}</h2>
            <p className="text-blue-100">R$ {currentPlanDetails.pricePerMonth.toFixed(2)} / mês</p>
            {currentUser.planExpiryDate && (
              <p className="text-sm text-blue-200 mt-1">Válido até: {new Date(currentUser.planExpiryDate).toLocaleDateString('pt-BR')}</p>
            )}
            <ul className="mt-3 space-y-1 text-sm">
              {currentPlanDetails.features.map(feature => (
                <li key={feature} className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-green-300" /> {feature}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Você não possui um plano ativo.</p>
        )}
      </Card>

      <Card title="Escolha um Novo Plano">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`p-6 rounded-lg border-2 flex flex-col justify-between
                          ${currentUser.currentPlan === plan.id 
                            ? 'bg-azul-primario border-azul-primario-hover shadow-xl relative' 
                            : 'bg-cinza-fundo-elemento bg-opacity-50 border-cinza-borda hover:border-azul-primario transition-all'}`
              }
            >
              {currentUser.currentPlan === plan.id && (
                <div className="absolute top-2 right-2 bg-branco-nav text-azul-primario px-2 py-0.5 rounded-full text-xs font-semibold">Plano Atual</div>
              )}
              <div>
                <h3 className={`text-2xl font-roboto-slab font-semibold mb-1 ${currentUser.currentPlan === plan.id ? 'text-white' : 'text-azul-primario'}`}>
                  {plan.name} {plan.id === PlanTier.PREMIUM && <Star size={20} className="inline mb-1 ml-1 text-yellow-400"/>}
                </h3>
                <p className={`text-3xl font-bold mb-4 ${currentUser.currentPlan === plan.id ? 'text-blue-100' : 'text-branco-nav'}`}>
                  R$ {plan.pricePerMonth.toFixed(2)}<span className="text-sm font-normal">/mês</span>
                </p>
                <ul className="space-y-2 text-sm mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className={`flex items-start ${currentUser.currentPlan === plan.id ? 'text-blue-200' : 'text-gray-300'}`}>
                      <CheckCircle size={18} className={`mr-2 mt-0.5 flex-shrink-0 ${currentUser.currentPlan === plan.id ? 'text-green-300' : 'text-green-500'}`} /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                variant={currentUser.currentPlan === plan.id ? 'secondary' : 'primary'} 
                className={`w-full ${currentUser.currentPlan === plan.id ? 'bg-white text-azul-primario hover:bg-gray-200' : ''}`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isLoading || currentUser.currentPlan === plan.id}
                isLoading={isLoading && currentUser.currentPlan !== plan.id && currentUser.currentPlan !== plan.id} // Ensure loading only for the button being clicked
              >
                {currentUser.currentPlan === plan.id ? 'Plano Atual' : 'Selecionar Plano'}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6 text-center">
            A cobrança é simulada. Ao selecionar um plano, sua conta será atualizada instantaneamente para fins de demonstração.
        </p>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
