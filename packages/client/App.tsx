
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { WorkerCard } from './components/WorkerCard';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard, DashboardView } from './components/UserDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CATEGORY_ICONS, DEFAULT_CENTER, SERVICE_GROUPS } from './constants';
import { WorkerCategory, WorkerProfile, Coordinates } from './types';
import { workerService } from './services/workerService';
import SearchBar from './components/SearchBar';
import { HomeSkeleton, SearchResultsSkeleton, BookingSkeleton, ProfileSkeleton } from './components/Skeleton';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import NoData from './components/NoData';
import { ServiceStructuredData } from './components/StructuredData';
import NotFound from './components/NotFound';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const AuthRequiredPlaceholder: React.FC<{ onSignIn: () => void, view: string }> = ({ onSignIn, view }) => (
    <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-2xl font-bold dark:text-white">Authentication Required</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Please sign in to view your {view.toLowerCase()}.</p>
        <button
            onClick={onSignIn}
            className="px-6 py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
        >
            Sign In
        </button>
    </div>
);

const OfferBanner: React.FC = () => (
    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md shadow-md">
        <p className="font-bold">20% off cleaning services!</p>
        <p>Use code CLEAN20 at checkout.</p>
    </div>
);

const EmergencyBanner: React.FC = () => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md shadow-md">
        <p className="font-bold">Emergency Help Needed?</p>
        <p>Call our 24/7 hotline at 1-800-123-4567.</p>
    </div>
);

const HomePage: React.FC<{ 
    handleSearch: (query: string, category: WorkerCategory | null) => void, 
    handleCategorySelect: (category: WorkerCategory) => void,
    isLoading: boolean 
}> = ({ handleSearch, handleCategorySelect, isLoading }) => {
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const initialCollapsedState = Object.keys(SERVICE_GROUPS).reduce((acc, groupName) => {
            acc[groupName] = false;
            return acc;
        }, {} as Record<string, boolean>);
        setCollapsedCategories(initialCollapsedState);
    }, []);

    const toggleCategory = (groupName: string) => {
        setCollapsedCategories(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    }

    if (isLoading) {
        return <HomeSkeleton />;
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <Helmet>
                <title>Thelokals.com - Find and Book Local Services</title>
                <meta name="description" content="Thelokals.com is your one-stop platform to find, book, and manage services from skilled local professionals. From cleaning to repairs, we connect you with the best experts in your neighborhood." />
            </Helmet>
            <SearchBar onSearch={handleSearch} />
            <div className="space-y-4">
                {Object.values(SERVICE_GROUPS).map((group) => (
                    <div key={group.name} className="rounded-2xl shadow-sm border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all duration-300">
                        <button onClick={() => toggleCategory(group.name)} className="w-full flex justify-between items-center">
                            <h2 className="font-bold text-lg dark:text-white">{group.name}</h2>
                            <span className={`transform transition-transform duration-300 ${!collapsedCategories[group.name] ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{group.helperText}</p>
                        <div className={`grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 transition-all duration-300 overflow-hidden ${collapsedCategories[group.name] ? 'max-h-0' : 'max-h-full'}`}>
                            {group.categories.map((cat) => (
                                <button
                                    onClick={() => handleCategorySelect(cat as WorkerCategory)}
                                    key={cat}
                                    className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 p-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-600/50 transition-all h-24 group"
                                >
                                    <span className="text-2xl mb-1">{CATEGORY_ICONS[cat]}</span>
                                    <span className="text-xs font-bold text-center text-gray-600 dark:text-gray-300 group-hover:text-indigo-600">{cat}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="py-4">
                <OfferBanner />
                <EmergencyBanner />
            </div>
        </div>
    );
};

const ResultsPage: React.FC<{ allWorkers: WorkerProfile[], userLocation: Coordinates, isLoading: boolean, setSelectedWorker: (worker: WorkerProfile) => void }> = ({ allWorkers, userLocation, isLoading, setSelectedWorker }) => {
    const { category } = useParams<{ category: WorkerCategory }>();
    const location = useLocation();
    const [searchParams] = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q') || '';
    const [sortBy, setSortBy] = useState('relevance');

    const selectedCategory = category;

    const filteredAndSortedWorkers = useMemo(() => {
        const workersWithDistance = allWorkers.map(worker => ({
            ...worker,
            distanceKm: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, worker.location.lat, worker.location.lng)
        }));

        const filtered = workersWithDistance.filter(worker => {
            const categoryMatch = selectedCategory ? worker.category.toLowerCase() === selectedCategory.toLowerCase() : true;
            if (!categoryMatch) return false;

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchableText = [
                    worker.name,
                    worker.description,
                    worker.category,
                    ...worker.expertise
                ].join(' ').toLowerCase();
                return searchableText.includes(query);
            }
            return true;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'price') return a.price - b.price;
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'distance') return a.distanceKm - b.distanceKm;

            const getScore = (w: typeof a) => {
                let score = w.distanceKm * 0.5;
                score -= w.rating * 2;
                if (w.isVerified) score -= 5;
                if (w.status === 'AVAILABLE') score -= 10;
                return score;
            };
            return getScore(a) - getScore(b);
        });

        return filtered;
    }, [allWorkers, userLocation, selectedCategory, searchQuery, sortBy]);

    if (isLoading) {
        return <SearchResultsSkeleton />;
    }

    return (
        <div className="animate-fade-in">
            <Helmet>
                <title>Thelokals.com | {selectedCategory || 'Services'}</title>
                <meta name="description" content={`Find and book the best ${selectedCategory || 'local service providers'} in your area. Quick, reliable, and verified professionals.`} />
            </Helmet>
            <ServiceStructuredData name={selectedCategory || 'Thelokals.com Services'} description={`Find the best ${selectedCategory} in your area.`} url={window.location.href} />
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
                {['relevance', 'rating', 'distance', 'price'].map(sortType => (
                    <button
                        key={sortType}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border ${sortBy === sortType ? 'bg-gray-900 dark:bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800'}`}
                        onClick={() => setSortBy(sortType)}
                    >
                        {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                    </button>
                ))}
            </div>
            <p className="text-gray-500 text-sm my-4 font-medium">{filteredAndSortedWorkers.length} experts found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedWorkers.map(worker => (
                    <WorkerCard key={worker.id} worker={worker} distanceKm={worker.distanceKm} onConnect={setSelectedWorker} />
                ))}
            </div>
            {filteredAndSortedWorkers.length === 0 && (
                <NoData message="Try a different category or search term." />
            )}
        </div>
    );
};

const DashboardPage: React.FC<{isLoading: boolean}> = ({isLoading}) => {
    const { view } = useParams<{ view: DashboardView }>();
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    if(isLoading){
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
    const { category } = useParams<{ category: string }>();
    const { view: dashboardView } = useParams<{ view: string }>();

    const [allWorkers, setAllWorkers] = useState<WorkerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_CENTER);
    const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            try {
                const workers = await workerService.getWorkers();
                setAllWorkers(workers);
            } catch (error) {
                console.error("Failed to initialize app data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
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
                alert("Location access was denied. Showing results from a default location. For more accurate results, please enable location services for this site.");
                setUserLocation(DEFAULT_CENTER);
                setIsLocationLoading(false);
                callback(DEFAULT_CENTER);
            }
        );
    }, []);

    const handleSearch = (query: string, category: WorkerCategory | null) => {
        requestLocationAndProceed(() => {
            const path = category ? `/category/${category.toLowerCase()}` : '/search';
            navigate(`${path}?q=${query}`);
        });
    };

    const handleCategorySelect = (category: WorkerCategory) => {
        requestLocationAndProceed(() => {
            navigate(`/category/${category.toLowerCase()}`);
        });
    };

    const getHeaderTitle = () => {
        const path = location.pathname;
        if (path.startsWith('/category')) return category?.toUpperCase();
        if (path.startsWith('/dashboard')) return dashboardView?.toUpperCase();
        if (path.startsWith('/search')) return 'Search Results';
        return 'Thelokals.com';
    }

    const isResultsPageLoading = isLoading || isLocationLoading;

    return (
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20">
                <BookingModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} onAuthReq={() => { setSelectedWorker(null); setShowAuthModal(true); }} />
                {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

                <Header
                    isHome={location.pathname === '/'}
                    title={getHeaderTitle()}
                    onSignInClick={() => setShowAuthModal(true)}
                />

                <main className="max-w-5xl mx-auto px-4 pt-6">
                    <Routes>
                        <Route path="/" element={<HomePage handleSearch={handleSearch} handleCategorySelect={handleCategorySelect} isLoading={isLoading}/>} />
                        <Route path="/category/:category" element={<ResultsPage allWorkers={allWorkers} userLocation={userLocation} isLoading={isResultsPageLoading} setSelectedWorker={setSelectedWorker} />} />
                        <Route path="/search" element={<ResultsPage allWorkers={allWorkers} userLocation={userLocation} isLoading={isResultsPageLoading} setSelectedWorker={setSelectedWorker} />} />
                        <Route path="/dashboard/:view" element={<DashboardPage isLoading={isLoading}/>} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>

                <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around max-w-5xl mx-auto rounded-t-2xl shadow-lg">
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
    const isActive = location.pathname === to || (to.startsWith('/dashboard') && location.pathname.startsWith(to));

    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center flex-1 p-3 text-sm font-semibold transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
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
