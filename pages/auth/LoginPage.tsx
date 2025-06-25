
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { ROUTES } from '../../constants';
import Card from '../../components/ui/Card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        if (user.role === 'admin' || user.role === 'barber') {
          navigate(ROUTES.ADMIN_DASHBOARD);
        } else {
          navigate(ROUTES.HOME); 
        }
      } else {
        setError("Falha no login. Verifique suas credenciais.");
      }
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
          Acessar Painel
        </h2>
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="E-mail"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            required
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
          />
          <Button type="submit" variant="primary" size="large" className="w-full" isLoading={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-gray-400 hover:text-vermelho-bordo transition-colors">
            Esqueceu sua senha?
          </Link>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            Não tem uma conta de barbearia?{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold text-vermelho-bordo hover:text-vermelho-bordo-light transition-colors">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
         <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            É um cliente?{' '}
            <Link to={ROUTES.HOME} className="font-semibold text-vermelho-bordo hover:text-vermelho-bordo-light transition-colors">
              Voltar para o início
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
    