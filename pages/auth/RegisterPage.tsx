
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { ROUTES } from '../../constants';
import Card from '../../components/ui/Card';
import { UserRole } from '../../types';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Registering as an Admin for a new barbershop
      const user = await register(name, email, phone, password, UserRole.ADMIN);
      if (user) {
        navigate(ROUTES.ADMIN_DASHBOARD); // Or a setup wizard page
      } else {
         setError("Falha no cadastro. Verifique os dados e tente novamente.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro durante o cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-azul-marinho p-4">
      <div className="mb-8">
        <Logo size="large" />
      </div>
      <Card className="w-full max-w-lg">
        <h2 className="text-3xl font-roboto-slab font-bold text-center text-branco-nav mb-6">
          Crie sua Conta Navalha Digital
        </h2>
        <p className="text-center text-gray-300 mb-6 text-sm">Gerencie sua barbearia de forma eficiente.</p>
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Barbearia (ou seu nome)"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Barbearia Estilo Único"
            required
          />
          <Input
            label="E-mail de Administrador"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            required
          />
          <Input
            label="Telefone de Contato"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(XX) XXXXX-XXXX"
            required
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />
          <Input
            label="Confirmar Senha"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita sua senha"
            required
          />
          <div className="pt-2">
            <Button type="submit" variant="primary" size="large" className="w-full" isLoading={loading}>
              {loading ? 'Registrando...' : 'Criar Conta'}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Já tem uma conta?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-azul-primario hover:text-azul-primario-hover transition-colors">
              Faça login
            </Link>
          </p>
        </div>
         <p className="mt-4 text-xs text-gray-400 text-center">
            Ao se registrar, você concorda com nossos{' '}
            <Link to="/terms" className="underline hover:text-azul-primario">Termos de Serviço</Link> e{' '}
            <Link to="/privacy" className="underline hover:text-azul-primario">Política de Privacidade</Link>.
          </p>
      </Card>
    </div>
  );
};

export default RegisterPage;