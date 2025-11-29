
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { UserDashboard, DashboardView } from './components/UserDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DEFAULT_CENTER, CATEGORY_DISPLAY_NAMES, LOWERCASE_TO_WORKER_CATEGORY } from './constants';
import { Coordinates, ServiceType } from '@core/types';
import { bookingService } from '@core/services/bookingService';
import { HomeSkeleton, BookingSkeleton, ProfileSkeleton } from './components/Skeleton';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import NotFound from './components/NotFound';
import { LiveSearch } from './components/LiveSearch';
import { GroupDetailPage } from './components/GroupDetailPage';
import { ServiceRequestPage } from './components/ServiceRequestPage';
import BookingConfirmation from './components/BookingConfirmation';
import { HomePage } from './components/HomePage';

const AuthRequiredPlaceholder: React.FC<{ onSignIn: () => void, view: string }> = ({ onSignIn, view }) => (
    <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-2xl font-bold dark:text-white">Authentication Required</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Please sign in to view your {view.toLowerCase()}.</p>
        <button
            onClick={onSignIn}
            className="px-6 py-3 rounded-lg font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-md"
        >
            Sign In
        </button>
    </div>
);

const DashboardPage: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    const { view } = useParams<{ view: DashboardView }>();
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    if (isLoading) {
        return view === 'Bookings' ? <BookingSkeleton /> : <ProfileSkeleton />;
    }

    if (!user) {
        return <AuthRequiredPlaceholder onSignIn={() => setShowAuthModal(true)} view={view || 'Bookings'} />;
    }

    return <UserDashboard initialView={view || 'Bookings'} />;
}

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_CENTER);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Simulate initial data loading
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    const requestLocationAndProceed = useCallback((callback: (location: Coordinates) => void) => {
        setIsLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(newLocation);
                setIsLocationLoading(false);
                callback(newLocation);
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Location access was denied. Using default location.");
                setUserLocation(DEFAULT_CENTER);
                setIsLocationLoading(false);
                callback(DEFAULT_CENTER);
            }
        );
    }, []);

    const handleBookService = async (serviceCategory: string, requirements: object, checklist: string[], estimatedCost: number, notes?: string) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        setIsSearching(true);
        requestLocationAndProceed(async (location) => {
            try {
                const { bookingId } = await bookingService.createAIBooking({
                    clientId: user.id,
                    serviceCategory,
                    requirements,
                    aiChecklist: checklist,
                    estimatedCost,
                    location,
                    address: {}, // Placeholder
                    notes,
                });
                navigate(`/booking/${bookingId}`);
            } catch (error) {
                console.error("Booking failed:", error);
                alert("There was an error creating your booking.");
            } finally {
                setIsSearching(false);
            }
        });
    };

    const getHeaderTitle = () => {
        const path = location.pathname;
        const pathParts = path.split('/');

        if (path.startsWith('/group/') && pathParts.length >= 3) {
            return decodeURIComponent(pathParts[2]);
        }
        if (path.startsWith('/service/') && pathParts.length >= 3) {
            const categoryKey = pathParts[2];
            const workerCategory = LOWERCASE_TO_WORKER_CATEGORY[categoryKey];
            return workerCategory ? CATEGORY_DISPLAY_NAMES[workerCategory] : 'Service';
        }
        if (path.startsWith('/dashboard/')) {
            return pathParts[2]?.toUpperCase() || 'DASHBOARD';
        }
        if (path.startsWith('/booking/')) {
            return 'Booking Confirmation';
        }
        return 'Thelokals.com';
    }

    if (isSearching) {
        return <LiveSearch onCancel={() => setIsSearching(false)} />;
    }

    return (
        <SkeletonTheme baseColor="#dcfce7" highlightColor="#bbf7d0">
            <div className="min-h-screen bg-[#f0fdf4] dark:bg-slate-900 font-sans pb-20">
                <Helmet>
                    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png" />
                    <link rel="manifest" href="/assets/images/site.webmanifest" />
                </Helmet>
                {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

                <Header
                    isHome={location.pathname === '/'}
                    title={getHeaderTitle()}
                    onSignInClick={() => setShowAuthModal(true)}
                    onSearch={() => { /* Not implemented for AI flow */ }}
                />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                     {isLoading ? <HomeSkeleton /> : (
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/group/:groupId" element={<GroupDetailPage />} />
                            <Route path="/service/:category" element={<ServiceRequestPage />} />
                            <Route path="/booking/:bookingId" element={<BookingConfirmation />} />
                            <Route path="/dashboard/:view" element={<DashboardPage isLoading={isLoading} />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                     )}
                </main>

                <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex justify-around max-w-7xl mx-auto rounded-t-2xl shadow-lg">
                    <NavLink to="/" label="Home" />
                    <NavLink to="/dashboard/bookings" label="Bookings" />
                    <NavLink to="/dashboard/profile" label="Profile" />
                </nav>
            </div>
        </SkeletonTheme>
    );
};

const NavLink: React.FC<{ to: string, label: string }> = ({ to, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (location.pathname.startsWith('/dashboard') && to.startsWith('/dashboard'));

    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center flex-1 p-3 text-sm font-semibold transition-colors ${isActive ? 'text-teal-600' : 'text-slate-500'}`}>
            {label}
        </Link>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <MainLayout />
            </BrowserRouter>
        </AuthProvider>
    );
}
