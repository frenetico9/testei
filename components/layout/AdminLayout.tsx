
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, CalendarDays, Scissors, Users, Star, Wrench, CreditCard, UserCircle, LogOut, Menu, X, Building
} from 'lucide-react';
import { ROUTES } from '../../constants';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== ROUTES.ADMIN_DASHBOARD && location.pathname.startsWith(to) && to !== ROUTES.ADMIN_PROFILE);
   // Special case for profile as it might be a common parent route
  const isProfileActive = to === ROUTES.ADMIN_PROFILE && location.pathname.startsWith(ROUTES.ADMIN_PROFILE);


  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-md transition-colors duration-200
                    ${(isActive || isProfileActive)
                      ? 'bg-azul-primario text-branco-nav shadow-md' 
                      : 'text-gray-300 hover:bg-cinza-fundo-elemento hover:text-branco-nav'
                    }`}
      >
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  );
};


const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };
  
  const navItems = [
    { to: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: ROUTES.ADMIN_CALENDAR, icon: <CalendarDays size={20} />, label: 'Agenda Visual' },
    { to: ROUTES.ADMIN_BOOKINGS, icon: <Wrench size={20} />, label: 'Agendamentos' },
    { to: ROUTES.ADMIN_SERVICES, icon: <Scissors size={20} />, label: 'Serviços' },
    { to: ROUTES.ADMIN_BARBERS, icon: <Building size={20} />, label: 'Funcionários' },
    { to: ROUTES.ADMIN_CLIENTS, icon: <Users size={20} />, label: 'Clientes' },
    { to: ROUTES.ADMIN_REVIEWS, icon: <Star size={20} />, label: 'Avaliações' },
    { to: ROUTES.ADMIN_SUBSCRIPTION, icon: <CreditCard size={20} />, label: 'Assinatura' },
    { to: ROUTES.ADMIN_PROFILE, icon: <UserCircle size={20} />, label: 'Meu Perfil' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-cinza-borda">
        <Logo size="medium" showText={true} />
      </div>
      <nav className="flex-grow p-4 space-y-1">
        <ul>
          {navItems.map(item => (
            <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-cinza-borda">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 rounded-md text-gray-300 hover:bg-azul-primario hover:text-branco-nav transition-colors duration-200"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-azul-marinho text-branco-nav">
      {/* Static Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-cinza-fundo-elemento bg-opacity-50 border-r border-cinza-borda shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative flex flex-col w-64 max-w-[80vw] bg-azul-marinho border-r border-cinza-borda shadow-xl z-50">
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-branco-nav p-1"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar for Mobile Toggle and User Info */}
        <header className="bg-cinza-fundo-elemento bg-opacity-70 shadow-md md:hidden border-b border-cinza-borda sticky top-0 z-30">
          <div className="px-4 h-16 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-gray-300 hover:text-branco-nav p-2 -ml-2"
              aria-label="Toggle sidebar"
            >
              <Menu size={28} />
            </button>
            <span className="font-roboto-slab text-lg font-semibold">{currentUser?.name || 'Admin'}</span>
             <Link to={ROUTES.ADMIN_PROFILE} className="text-gray-300 hover:text-branco-nav">
                <UserCircle size={28} />
             </Link>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-azul-marinho p-4 md:p-6 lg:p-8"> {/* Removed bg-leather-texture */}
           <div className="max-w-7xl mx-auto">
            <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;