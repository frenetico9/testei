
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogIn, UserPlus, UserCircle, LogOut } from 'lucide-react';
import { ROUTES } from '../../constants';
import { UserRole } from '../../types'; // Added import for UserRole

const PublicLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const commonLinkClasses = "text-branco-nav hover:text-vermelho-bordo transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium";
  const mobileLinkClasses = "block px-3 py-2 rounded-md text-base font-medium text-branco-nav hover:bg-gray-700 hover:text-vermelho-bordo";

  const handleLogout = async () => {
    await logout();
    // Optionally navigate to home or login page
  };

  return (
    <div className="min-h-screen flex flex-col bg-azul-marinho">
      <nav className="bg-azul-marinho bg-opacity-80 shadow-lg sticky top-0 z-40 backdrop-filter backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Logo size="medium" />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to={ROUTES.HOME} className={commonLinkClasses}>Início</Link>
              {/* <Link to="/barbershops" className={commonLinkClasses}>Barbearias</Link> */}
              {/* <Link to="/services" className={commonLinkClasses}>Serviços</Link> */}
              {currentUser ? (
                <>
                  {currentUser.role === UserRole.ADMIN && (
                     <Link to={ROUTES.ADMIN_DASHBOARD} className={commonLinkClasses}>Painel</Link>
                  )}
                   <Link to={ROUTES.ADMIN_PROFILE} className={commonLinkClasses}>
                    <UserCircle className="inline-block mr-1 h-5 w-5" /> Minha Conta
                   </Link>
                  <Button onClick={handleLogout} variant="outline" size="small">
                    <LogOut size={16} className="mr-1" /> Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className={commonLinkClasses}>
                    <LogIn size={16} className="mr-1 inline-block" /> Entrar
                  </Link>
                  <Link to={ROUTES.REGISTER} className={commonLinkClasses}>
                    <UserPlus size={16} className="mr-1 inline-block"/> Cadastrar Barbearia
                  </Link>
                </>
              )}
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-branco-nav hover:text-vermelho-bordo focus:outline-none p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-azul-marinho border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to={ROUTES.HOME} className={mobileLinkClasses} onClick={()=>setIsMobileMenuOpen(false)}>Início</Link>
              {/* <Link to="/barbershops" className={mobileLinkClasses} onClick={()=>setIsMobileMenuOpen(false)}>Barbearias</Link> */}
              {/* <Link to="/services" className={mobileLinkClasses} onClick={()=>setIsMobileMenuOpen(false)}>Serviços</Link> */}
               {currentUser ? (
                <>
                   {currentUser.role === UserRole.ADMIN && (
                     <Link to={ROUTES.ADMIN_DASHBOARD} className={mobileLinkClasses} onClick={()=>setIsMobileMenuOpen(false)}>Painel</Link>
                  )}
                  <Link to={ROUTES.ADMIN_PROFILE} className={mobileLinkClasses} onClick={()=>setIsMobileMenuOpen(false)}>Minha Conta</Link>
                  <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false);}} variant="primary" size="medium" className="w-full mt-2">Sair</Button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className={mobileLinkClasses} onClick={()=>setIsMobileMenuOpen(false)}>Entrar</Link>
                  <Link to={ROUTES.REGISTER} className={mobileLinkClasses} onClick={()=>setIsMobileMenuOpen(false)}>Cadastrar Barbearia</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-900 bg-opacity-70 border-t border-gray-700 text-center py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Logo size="small" className="justify-center mb-2" />
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Navalha Digital. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <Link to="/terms" className="hover:text-vermelho-bordo">Termos de Serviço</Link> | <Link to="/privacy" className="hover:text-vermelho-bordo">Política de Privacidade</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;