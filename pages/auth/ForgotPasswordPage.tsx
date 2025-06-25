
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { supabase } from '../../services/supabaseService'; // Direct Supabase for this, or via useAuth if preferred
import { ROUTES } from '../../constants';
import Card from '../../components/ui/Card';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      // In a real app, this would be:
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: window.location.origin + '/reset-password', // URL to your password reset page
      // });
      // Mocking the behavior:
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log(`Mock password reset email sent to ${email}`);
      // if (error) throw error;
      setMessage("Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-azul-marinho p-4 bg-leather-texture">
      <div className="mb-8">
        <Logo size="large" />
      </div>
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-roboto-slab font-bold text-center text-branco-nav mb-6">
          Recuperar Senha
        </h2>
        {message && <p className="bg-green-500/20 text-green-300 p-3 rounded-md mb-4 text-sm">{message}</p>}
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
        
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-300 text-center">
              Digite seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
            </p>
            <Input
              label="E-mail"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />
            <Button type="submit" variant="primary" size="large" className="w-full" isLoading={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to={ROUTES.LOGIN} className="text-sm text-gray-400 hover:text-vermelho-bordo transition-colors">
            Voltar para o Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
    