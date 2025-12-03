import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { AppLayout, AppHeader, BottomNav, BottomNavItem } from '@thelocals/core';
import { AuthModal } from './components/AuthModal';
import { UserDashboard, DashboardView } from './components/UserDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DEFAULT_CENTER, CATEGORY_DISPLAY_NAMES, LOWERCASE_TO_WORKER_CATEGORY } from './constants';
import { Coordinates, ServiceType } from '@thelocals/core/types';
import { bookingService } from '@thelocals/core/services/bookingService';
import { HomeSkeleton, BookingSkeleton, ProfileSkeleton } from './components/Skeleton';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import NotFound from './components/NotFound';
import { LiveSearch } from './components/LiveSearch';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { Toaster } from 'react-hot-toast';

// Lazy load page components
const GroupDetailPage = lazy(() => import('./components/GroupDetailPage').then(module => ({ default: module.GroupDetailPage })));
const ServiceRequestPage = lazy(() => import('./components/ServiceRequestPage').then(module => ({ default: module.ServiceRequestPage })));
const BookingConfirmation = lazy(() => import('./components/BookingConfirmation'));
const HomePage = lazy(() => import('./components/HomePage').then(module => ({ default: module.HomePage })));
const SchedulePage = lazy(() => import('./components/SchedulePage').then(module => ({ default: module.SchedulePage })));
const CategoryPage = lazy(() => import('./components/CategoryPage').then(module => ({ default: module.CategoryPage })));

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
    const { view } = useParams<{ view: string }>();
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Map URL params to DashboardView types
    let capitalizedView: DashboardView = 'Bookings';

    if (view) {
        const lowerView = view.toLowerCase();
        if (lowerView === 'terms') {
            capitalizedView = 'Terms & Conditions';
        } else if (lowerView === 'privacy') {
            capitalizedView = 'Privacy Policy';
        } else {
            capitalizedView = (view.charAt(0).toUpperCase() + view.slice(1)) as DashboardView;
        }
    }

    if (isLoading) {
        return capitalizedView === 'Bookings' ? <BookingSkeleton /> : <ProfileSkeleton />;
    }

    if (!user) {
        return <AuthRequiredPlaceholder onSignIn={() => setShowAuthModal(true)} view={capitalizedView} />;
    }

    return <UserDashboard initialView={capitalizedView} />;
}

// Component to scroll to top on route change
const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading, signOut } = useAuth();

    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_CENTER);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Use auth loading state
    const isLoading = authLoading;

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
        return (
            <Suspense fallback={<div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex items-center justify-center">Loading search...</div>}>
                <LiveSearch onCancel={() => setIsSearching(false)} />
            </Suspense>
        );
    }

    const bottomNavItems: BottomNavItem[] = [
        { label: "Home", to: "/", icon: "🏠" },
        { label: "Bookings", to: "/dashboard/bookings", icon: "📋" },
        { label: "Profile", to: "/dashboard/profile", icon: "👤" },
        { label: "Support", to: "/dashboard/support", icon: "💬" }
    ];

    return (
        <SkeletonTheme baseColor="#dcfce7" highlightColor="#bbf7d0">
            <Helmet>
                <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png" />
                <link rel="manifest" href="/assets/images/site.webmanifest" />
            </Helmet>
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

            <AppLayout
                header={
                    <AppHeader
                        isHome={location.pathname === '/'}
                        title={getHeaderTitle()}
                        user={user}
                        onSignInClick={() => setShowAuthModal(true)}
                        onSignOutClick={signOut}
                        onSearch={() => { /* Not implemented for AI flow */ }}
                        showSearch={true}
                    />
                }
                bottomNav={<BottomNav items={bottomNavItems} />}
            >
                {isLoading ? <HomeSkeleton /> : (
                    <Suspense fallback={<HomeSkeleton />}>
                        <ScrollToTop />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/schedule" element={<SchedulePage />} />
                            <Route path="/group/:groupId" element={<GroupDetailPage />} />
                            <Route path="/service/:category" element={<ServiceRequestPage />} />
                            <Route path="/booking/:bookingId" element={<BookingConfirmation />} />
                            <Route path="/dashboard/:view" element={<DashboardPage isLoading={isLoading} />} />

                            {/* SEO Category Routes */}
                            <Route path="/login" element={<AuthModal onClose={() => navigate('/')} />} />
                            <Route path="/home-cleaning-maids" element={
                                <CategoryPage
                                    title="Home Cleaning & Maids"
                                    description="Professional home cleaning and maid services in your area. Book trusted cleaners for deep cleaning, regular maintenance, and more."
                                    services={['Deep Cleaning', 'Regular Cleaning', 'Part-time Maid', 'Full-time Maid']}
                                    icon="🧹"
                                />
                            } />
                            <Route path="/cooks-tiffin" element={
                                <CategoryPage
                                    title="Cooks, Tiffin & Catering"
                                    description="Find experienced cooks and reliable tiffin services near you. Fresh, home-cooked meals delivered to your doorstep."
                                    services={['Personal Cook', 'Tiffin Service', 'Party Catering', 'Bulk Orders']}
                                    icon="🍳"
                                />
                            } />
                            <Route path="/electricians-plumbers" element={
                                <CategoryPage
                                    title="Electricians & Plumbers"
                                    description="Expert electricians and plumbers available 24/7 for emergency repairs and installations."
                                    services={['Electrical Repair', 'Plumbing Fixes', 'Installation', 'Maintenance']}
                                    icon="🔧"
                                />
                            } />
                            <Route path="/appliance-repair" element={
                                <CategoryPage
                                    title="Appliance Repairs"
                                    description="Fast and reliable repair services for ACs, refrigerators, washing machines, and more."
                                    services={['AC Repair', 'Refrigerator Repair', 'Washing Machine', 'Microwave']}
                                    icon="⚙️"
                                />
                            } />
                            <Route path="/tutors-home-tuitions" element={
                                <CategoryPage
                                    title="Tutors & Home Tuitions"
                                    description="Qualified tutors for all subjects and grades. Personalized home tuition to help your child excel."
                                    services={['Math Tutor', 'Science Tutor', 'English Tutor', 'Competitive Exams']}
                                    icon="📚"
                                />
                            } />
                            <Route path="/car-care" element={
                                <CategoryPage
                                    title="Car Wash & Car Care"
                                    description="Premium car wash and detailing services at your doorstep. Keep your vehicle looking brand new."
                                    services={['Car Wash', 'Interior Detailing', 'Polishing', 'Ceramic Coating']}
                                    icon="🚗"
                                />
                            } />
                            <Route path="/salon-at-home" element={
                                <CategoryPage
                                    title="Salon & Grooming at Home"
                                    description="Luxury salon services at home. Haircuts, facials, manicures, and more from top stylists."
                                    services={['Haircut', 'Facial', 'Manicure/Pedicure', 'Massage']}
                                    icon="💇‍♀️"
                                />
                            } />

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                )}
            </AppLayout>
        </SkeletonTheme>
    );
};

const NavLink: React.FC<{ to: string, label: string, icon?: string }> = ({ to, label, icon }) => {
    const location = useLocation();
    // Fix: Only highlight if the exact path matches
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center flex-1 p-3 text-xs font-semibold transition-colors ${isActive ? 'text-teal-600' : 'text-slate-500'}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon && <span className="text-lg mb-1">{icon}</span>}
            {label}
        </Link>
    )
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <MainLayout />
                        <ToastContainer />
                        <Toaster position="top-center" />
                    </BrowserRouter>
                </ToastProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
