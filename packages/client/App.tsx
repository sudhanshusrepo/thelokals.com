
import React, { useState, useEffect, useMemo } from 'react';
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

type View = 'home' | 'results' | 'dashboard';

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

// --- Unauthenticated User Placeholder ---
const AuthRequiredPlaceholder: React.FC<{ onSignIn: () => void, view: DashboardView }> = ({ onSignIn, view }) => (
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

// --- Main Application Component ---
const MainLayout: React.FC = () => {
  const { user } = useAuth(); // Use auth context
  const [view, setView] = useState<View>('home');
  const [dashboardView, setDashboardView] = useState<DashboardView>('Bookings');

  const [allWorkers, setAllWorkers] = useState<WorkerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkerCategory | null>(null);
  const [sortBy, setSortBy] = useState('relevance');

  const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_CENTER);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const workers = await workerService.getWorkers();
        setAllWorkers(workers);
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setUserLocation(DEFAULT_CENTER) 
        );
      } catch (error) {
        console.error("Failed to initialize app data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const handleSearch = (query: string, category: WorkerCategory | null) => {
    setSearchQuery(query);
    setSelectedCategory(category);
    setView('results');
  };

  const handleCategoryClick = (category: WorkerCategory) => {
    setSearchQuery('');
    setSelectedCategory(category);
    setView('results');
  };

  const handleBottomNavClick = (newView: View, dashView: DashboardView = 'Bookings') => {
      setView(newView);
      setDashboardView(dashView);
  }

  const goHome = () => {
      setView('home');
      setSelectedCategory(null);
      setSearchQuery('');
  }

  const filteredAndSortedWorkers = useMemo(() => {
    // This calculation is expensive, so it's memoized.
    const workersWithDistance = allWorkers.map(worker => ({
      ...worker,
      distanceKm: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, worker.location.lat, worker.location.lng)
    }));

    const filtered = workersWithDistance.filter(worker => {
      if (selectedCategory && worker.category !== selectedCategory) return false;
      if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const searchableText = [worker.name, worker.description, ...worker.expertise].join(' ').toLowerCase();
          if (!searchableText.includes(query)) return false;
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

  const isSubPage = view === 'results' || view === 'dashboard';
  const getHeaderTitle = () => {
      if (view === 'results') return selectedCategory || 'Search Results';
      if (view === 'dashboard') return dashboardView;
      return 'The Lokals';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20">
      <BookingModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} onAuthReq={() => { setSelectedWorker(null); setShowAuthModal(true); }} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <Header 
        isHome={!isSubPage && view !== 'dashboard'} 
        onBack={goHome} 
        onLogoClick={goHome}
        title={getHeaderTitle()}
        onSignInClick={() => setShowAuthModal(true)}
        // The dashboard button in the header is removed to avoid confusion
      />

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {view === 'home' && (
          <div className="space-y-8 animate-fade-in-up">
            <SearchBar onSearch={handleSearch} />
            <div className="space-y-4">
              {Object.values(SERVICE_GROUPS).map((group) => (
                <div key={group.name} className="rounded-2xl shadow-sm border dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                  <h2 className="font-bold text-lg dark:text-white mb-4">{group.name}</h2>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {group.categories.map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 p-4 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-600/50 transition-all h-28 group"
                      >
                         <span className="text-3xl mb-2">{CATEGORY_ICONS[cat]}</span>
                         <span className="text-xs font-bold text-center text-gray-600 dark:text-gray-300 group-hover:text-indigo-600">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'results' && (
          <div className="animate-fade-in">
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

            {isLoading ? (
              <div className="text-center py-20"><p>Loading workers...</p></div>
            ) : (
              <>
                <p className="text-gray-500 text-sm my-4 font-medium">{filteredAndSortedWorkers.length} experts found</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedWorkers.map(worker => (
                      <WorkerCard key={worker.id} worker={worker} distanceKm={worker.distanceKm} onConnect={setSelectedWorker} />
                    ))}
                </div>
                {filteredAndSortedWorkers.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <h3 className="text-xl font-bold">No professionals found</h3>
                        <p className="text-gray-500">Try a different category or search term.</p>
                    </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'dashboard' && (
            user ? (
                <UserDashboard initialView={dashboardView} />
            ) : (
                <AuthRequiredPlaceholder onSignIn={() => setShowAuthModal(true)} view={dashboardView} />
            )
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around max-w-5xl mx-auto rounded-t-2xl shadow-lg">
            <NavButton label="Home" view="home" currentView={view} dashboardView={dashboardView} onClick={() => handleBottomNavClick('home')} />
            <NavButton label="Bookings" view="dashboard" currentView={view} dashboardView={dashboardView} data-subview="Bookings" onClick={() => handleBottomNavClick('dashboard', 'Bookings')} />
            <NavButton label="Profile" view="dashboard" currentView={view} dashboardView={dashboardView} data-subview="Profile" onClick={() => handleBottomNavClick('dashboard', 'Profile')} />
      </nav>
    </div>
  );
};

interface NavButtonProps {
    label: string;
    view: View;
    currentView: View;
    dashboardView: DashboardView;
    onClick: () => void;
    'data-subview'?: DashboardView;
}

const NavButton: React.FC<NavButtonProps> = ({ label, view, currentView, dashboardView, onClick, 'data-subview': dataSubview }) => {
    const isActive = view === currentView && (view !== 'dashboard' || dashboardView === dataSubview);
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center flex-1 p-3 text-sm font-semibold transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
            {label}
        </button>
    )
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
