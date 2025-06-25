
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import BookingPage from './pages/public/BookingPage';
import BarbershopPublicPage from './pages/public/BarbershopPublicPage'; // Added for specific barbershop view

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import ManageServicesPage from './pages/admin/ManageServicesPage';
import ManageBarbersPage from './pages/admin/ManageBarbersPage';
import ManageClientsPage from './pages/admin/ManageClientsPage';
import ManageReviewsPage from './pages/admin/ManageReviewsPage';
import CalendarPage from './pages/admin/CalendarPage';
import SubscriptionPage from './pages/admin/SubscriptionPage'; // Ensure this component has a default export
import UserProfilePage from './pages/admin/UserProfilePage'; // For managing own subscription etc.

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loadingAuth } = useAuth();
  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen bg-azul-marinho"><Spinner /></div>; // Or a more styled loading screen
  }
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="barbershop/:barbershopId" element={<BarbershopPublicPage />} />
          <Route path="book/:barbershopId" element={<BookingPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
          <Route path="services" element={<ManageServicesPage />} />
          <Route path="barbers" element={<ManageBarbersPage />} />
          <Route path="clients" element={<ManageClientsPage />} />
          <Route path="reviews" element={<ManageReviewsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="profile" element={<UserProfilePage />} /> {/* User can manage their own barber shop subscription here */}
        </Route>

        <Route path="*" element={<Navigate to="/" />} /> 
      </Routes>
    </HashRouter>
  );
};

// Simple Spinner component for loading states
const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-primario"></div>
);


export default App;