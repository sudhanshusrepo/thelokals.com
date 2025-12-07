import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout, AppHeader, BottomNav, BottomNavItem } from '@thelocals/core';
import { ProviderLanding } from './components/ProviderLanding';
import { RegistrationBanner } from './components/RegistrationBanner';
import { ProviderDashboard } from './components/ProviderDashboard';
import { RegistrationWizard } from './components/RegistrationWizard';
import { AuthModal } from './components/AuthModal';
import { backend } from './services/backend';

// Lazy load components
const BookingRequestsPage = lazy(() => import('./components/BookingRequestsPage'));
const BookingDetailsPage = lazy(() => import('./components/BookingDetailsPage'));
const PaymentPage = lazy(() => import('./components/PaymentPage'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));
const AvailabilitySettings = lazy(() => import('./components/AvailabilitySettings'));

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
  const { user, loading: authLoading, profile, signOut } = useAuth();

  const [showRegistration, setShowRegistration] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  // Check registration status
  const isRegistered = profile?.registration_status === 'verified';
  const isUnregistered = !profile || profile.registration_status === 'unregistered';
  const isPending = profile?.registration_status === 'pending';

  useEffect(() => {
    // Restore any draft data
    const loadDraft = async () => {
      try {
        const draft = await backend.db.getDraft();
        if (draft) {
          // Handle draft restoration if needed
        }
      } catch (e) {
        console.error('App.tsx: getDraft failed', e);
      } finally {
        setIsRestoring(false);
      }
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
      toast.error('Please sign in first');
      setShowAuthModal(true);
      return;
    }
    setShowRegistration(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
          toast.success('Registration submitted! We will review your application.');
          navigate('/dashboard');
        }}
        onCancel={() => setShowRegistration(false)}
      />
    );
  }

  const navItems: BottomNavItem[] = [
    { label: 'Dashboard', to: '/dashboard', icon: '📊' },
    { label: 'Requests', to: '/bookings', icon: '📋', badge: 0 },
    { label: 'Payments', to: '/payments', icon: '💰' },
    { label: 'Alerts', to: '/notifications', icon: '🔔', badge: 0 },
    { label: 'Calendar', to: '/calendar', icon: '📅' },
    { label: 'Profile', to: '/profile', icon: '👤' },
  ];

  return (
    <AppLayout
      header={
        <AppHeader
          isHome={location.pathname === '/'}
          title={getHeaderTitle()}
          user={user}
          onSignInClick={() => setShowAuthModal(true)}
          onSignOutClick={handleSignOut}
          appName="thelokals - Provider"
        />
      }
      bottomNav={user ? <BottomNav items={navItems} /> : null}
    >
      <Helmet>
        <title>{getHeaderTitle()}</title>
        <meta name="description" content="thelokals - Provider Platform. Join our network of service providers and grow your business." />
      </Helmet>

      {/* Registration Banner for unregistered users */}
      {user && isUnregistered && location.pathname !== '/' && (
        <RegistrationBanner onRegisterClick={handleRegisterClick} />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      )}

      {/* Pending approval banner */}
      {user && isPending && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 mb-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Registration Under Review</p>
              <p className="text-sm text-yellow-700">We're reviewing your application. You'll be notified once approved.</p>
            </div>
          </div>
        </div>
      )}

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
          <Route
            path="/calendar"
            element={
              user ? (
                <AvailabilitySettings />
              ) : (
                <AuthRequiredPlaceholder onSignIn={() => navigate('/')} />
              )
            }
          />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
