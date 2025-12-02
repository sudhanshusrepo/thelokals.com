import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ProviderLanding } from './components/ProviderLanding';
import { RegistrationBanner } from './components/RegistrationBanner';
import { ProviderDashboard } from './components/ProviderDashboard';
import { RegistrationWizard } from './components/RegistrationWizard';
import { ProviderProfile, RegistrationStatus } from './types';
import { backend } from './services/backend';

// Lazy load components
const BookingRequestsPage = lazy(() => import('./src/pages/JobRequests').then(module => ({ default: module.JobRequests })));
const BookingDetailsPage = lazy(() => import('./components/BookingDetailsPage'));
const PaymentPage = lazy(() => import('./components/PaymentPage'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
      <div className="h-4 w-32 bg-slate-200 rounded"></div>
    </div>
  </div>
);

// Auth required placeholder
const AuthRequiredPlaceholder: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
  <div className="text-center py-20 animate-fade-in">
    <div className="text-6xl mb-4">🔐</div>
    <h3 className="text-2xl font-bold">Sign In Required</h3>
    <p className="text-slate-500 mt-2 mb-6">Please sign in to access this page.</p>
    <button
      onClick={onSignIn}
      className="px-6 py-3 rounded-lg font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-md"
    >
      Sign In
    </button>
  </div>
);

// Registration required placeholder
const RegistrationRequiredPlaceholder: React.FC<{ onRegister: () => void }> = ({ onRegister }) => (
  <div className="text-center py-20 animate-fade-in">
    <div className="text-6xl mb-4">📝</div>
    <h3 className="text-2xl font-bold">Registration Required</h3>
    <p className="text-slate-500 mt-2 mb-6">Complete your provider registration to access this feature.</p>
    <button
      onClick={onRegister}
      className="px-6 py-3 rounded-lg font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-md"
    >
      Register Now
    </button>
  </div>
);

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, profile } = useAuth();
  const toast = useToast();

  const [showRegistration, setShowRegistration] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  // Check registration status
  const isRegistered = profile?.registration_status === 'verified';
  const isUnregistered = !profile || profile.registration_status === 'unregistered';
  const isPending = profile?.registration_status === 'pending';

  useEffect(() => {
    // Restore any draft data
    const loadDraft = async () => {
      const draft = await backend.db.getDraft();
      if (draft) {
        // Handle draft restoration if needed
      }
      setIsRestoring(false);
    };
    loadDraft();
  }, []);

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'thelokals - Provider';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/bookings') return 'Booking Requests';
    if (path.startsWith('/booking/')) return 'Booking Details';
    if (path === '/payments') return 'Payments';
    if (path === '/notifications') return 'Notifications';
    if (path === '/profile') return 'Profile';
    return 'thelokals - Provider';
  };

  const handleRegisterClick = () => {
    if (!user) {
      toast.show('Please sign in first', 'error');
      return;
    }
    setShowRegistration(true);
  };

  if (isRestoring || authLoading) {
    return <LoadingSkeleton />;
  }

  // Show registration wizard if triggered
  if (showRegistration) {
    return (
      <RegistrationWizard
        onComplete={() => {
          setShowRegistration(false);
          toast.show('Registration submitted! We will review your application.', 'success');
          navigate('/dashboard');
        }}
        onCancel={() => setShowRegistration(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans pb-20">
      <Helmet>
        <title>{getHeaderTitle()}</title>
        <meta name="description" content="thelokals - Provider Platform. Join our network of service providers and grow your business." />
      </Helmet>

      <Header
        isHome={location.pathname === '/'}
        title={getHeaderTitle()}
        showAutoSaving={false}
      />

      {/* Registration Banner for unregistered users */}
      {user && isUnregistered && location.pathname !== '/' && (
        <RegistrationBanner onRegisterClick={handleRegisterClick} />
      )}

      {/* Pending approval banner */}
      {user && isPending && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Registration Under Review</p>
              <p className="text-sm text-yellow-700">We're reviewing your application. You'll be notified once approved.</p>
            </div>
          </div>
        </div>
      )}

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)',
        }}
      >
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<ProviderLanding onRegisterClick={handleRegisterClick} />} />

            {/* Protected routes - require sign in */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  isRegistered ? (
                    <ProviderDashboard />
                  ) : (
                    <RegistrationRequiredPlaceholder onRegister={handleRegisterClick} />
                  )
                ) : (
                  <AuthRequiredPlaceholder onSignIn={() => navigate('/')} />
                )
              }
            />

            <Route
              path="/bookings"
              element={
                user ? (
                  isRegistered ? (
                    <BookingRequestsPage />
                  ) : (
                    <RegistrationRequiredPlaceholder onRegister={handleRegisterClick} />
                  )
                ) : (
                  <AuthRequiredPlaceholder onSignIn={() => navigate('/')} />
                )
              }
            />

            <Route
              path="/booking/:bookingId"
              element={
                user ? (
                  isRegistered ? (
                    <BookingDetailsPage />
                  ) : (
                    <RegistrationRequiredPlaceholder onRegister={handleRegisterClick} />
                  )
                ) : (
                  <AuthRequiredPlaceholder onSignIn={() => navigate('/')} />
                )
              }
            />

            <Route
              path="/payments"
              element={
                user ? (
                  isRegistered ? (
                    <PaymentPage />
                  ) : (
                    <RegistrationRequiredPlaceholder onRegister={handleRegisterClick} />
                  )
                ) : (
                  <AuthRequiredPlaceholder onSignIn={() => navigate('/')} />
                )
              }
            />

            <Route
              path="/notifications"
              element={
                user ? (
                  <NotificationsPage />
                ) : (
                  <AuthRequiredPlaceholder onSignIn={() => navigate('/')} />
                )
              }
            />

            <Route
              path="/profile"
              element={
                user ? (
                  <div>Profile Page</div>
                ) : (
                  <AuthRequiredPlaceholder onSignIn={() => navigate('/')} />
                )
              }
            />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom Navigation - only show for signed in users */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around max-w-7xl mx-auto rounded-t-2xl shadow-lg" role="navigation" aria-label="Bottom Navigation">
          <NavLink to="/dashboard" label="Dashboard" icon="📊" />
          <NavLink to="/bookings" label="Requests" icon="📋" badge={0} />
          <NavLink to="/payments" label="Payments" icon="💰" />
          <NavLink to="/notifications" label="Alerts" icon="🔔" badge={0} />
          <NavLink to="/profile" label="Profile" icon="👤" />
        </nav>
      )}
    </div>
  );
};

const NavLink: React.FC<{ to: string; label: string; icon?: string; badge?: number }> = ({ to, label, icon, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      className={`relative flex flex-col items-center justify-center flex-1 p-3 text-xs font-semibold transition-colors ${isActive ? 'text-teal-600' : 'text-slate-500'
        }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && <span className="text-lg mb-1">{icon}</span>}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
