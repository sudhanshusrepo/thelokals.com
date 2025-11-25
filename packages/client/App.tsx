
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { WorkerCard } from './components/WorkerCard';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { CATEGORY_ICONS, DEFAULT_CENTER, SERVICE_GROUPS } from './constants';
import { WorkerCategory, WorkerProfile, Coordinates } from './types';
import { workerService } from './services/workerService';
import SearchBar from './components/SearchBar';

// --- Helper Functions ---

// Haversine formula for distance calculation
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Main Application Component ---

const MainLayout: React.FC = () => {
  // --- State Management ---
  
  // View & Navigation State
  const [view, setView] = useState<'home' | 'results' | 'dashboard' | 'bookings' | 'offers' | 'profile'>('home');

  // Data State
  const [allWorkers, setAllWorkers] = useState<WorkerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkerCategory | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [maxDistance, setMaxDistance] = useState(50);

  // User & Modal State
  const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_CENTER);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- Data Fetching and Initialization ---

  useEffect(() => {
    // Initial data load and location request
    const initialize = async () => {
      setIsLoading(true);
      try {
        const workers = await workerService.getWorkers();
        setAllWorkers(workers);
        await requestLocation();
      } catch (error) {
        console.error("Failed to initialize app data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  // --- Location Handling ---

  const requestLocation = (): Promise<Coordinates> => {
      return new Promise((resolve) => {
          if (locationPermission === 'granted' && userLocation) return resolve(userLocation);
          if (locationPermission === 'denied') return resolve(DEFAULT_CENTER);

          setShowLocationModal(true);
          (window as any).handleAllowLocation = () => {
              setShowLocationModal(false);
              navigator.geolocation.getCurrentPosition(
                  (position) => {
                      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                      setUserLocation(coords);
                      setLocationPermission('granted');
                      resolve(coords);
                  },
                  () => {
                      setUserLocation(DEFAULT_CENTER);
                      setLocationPermission('denied');
                      resolve(DEFAULT_CENTER);
                  }
              );
          };
          (window as any).handleDenyLocation = () => {
              setShowLocationModal(false);
              setUserLocation(DEFAULT_CENTER);
              setLocationPermission('denied');
              resolve(DEFAULT_CENTER);
          };
      });
  }

  // --- Event Handlers ---

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

  const clearFiltersAndGoHome = () => {
      setView('home');
      setSearchQuery('');
      setSelectedCategory(null);
      setSortBy('relevance');
  }

  // --- Derived State (Filtering & Sorting) ---

  const filteredAndSortedWorkers = useMemo(() => {
    const workersWithDistance = allWorkers.map(worker => ({
      ...worker,
      distanceKm: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, worker.location.lat, worker.location.lng)
    }));

    const filtered = workersWithDistance.filter(worker => {
      if (worker.distanceKm > maxDistance) return false;
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
      
      // Relevance scoring (lower is better)
      const getScore = (w: typeof a) => {
          let score = w.distanceKm * 0.5; // Distance is a primary factor
          score -= w.rating * 2; // Higher rating is better
          if (w.isVerified) score -= 5; // Verified is much better
          if (w.status === 'AVAILABLE') score -= 10; // Availability is key
          return score;
      };
      return getScore(a) - getScore(b);
    });

    return filtered;
  }, [allWorkers, userLocation, selectedCategory, searchQuery, sortBy, maxDistance]);

  const headerTitle = view === 'results' ? (selectedCategory || 'Search Results') : 'The Lokals';

  // --- JSX Rendering ---

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20">
      {/* --- Modals --- */}
      {showLocationModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                  <h3 className="text-xl font-bold dark:text-white mb-2">Enable Location</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">To find professionals near you, we need access to your location.</p>
                  <div className="flex gap-4">
                      <button onClick={() => (window as any).handleDenyLocation()} className="flex-1 px-4 py-3 rounded-lg font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">Not Now</button>
                      <button onClick={() => (window as any).handleAllowLocation()} className="flex-1 px-4 py-3 rounded-lg font-bold bg-indigo-600 text-white">Allow</button>
                  </div>
              </div>
          </div>
      )}
      <BookingModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} onAuthReq={() => { setSelectedWorker(null); setShowAuthModal(true); }} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* --- Header --- */}
      <Header 
        isHome={view === 'home'} 
        onBack={clearFiltersAndGoHome} 
        onLogoClick={clearFiltersAndGoHome}
        title={headerTitle}
        onSignInClick={() => setShowAuthModal(true)}
        onDashboardClick={() => setView('dashboard')}
      />

      {/* --- Main Content --- */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {view === 'home' && (
          <div className="space-y-8 animate-fade-in-up">
            <SearchBar onSearch={handleSearch} />
            <div className="space-y-4">
              {Object.values(SERVICE_GROUPS).map((group) => (
                <div key={group.name} className="rounded-2xl shadow-sm border dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`text-2xl p-2 rounded-lg`}>{group.icon}</span>
                    <span className="font-bold text-lg dark:text-white">{group.name}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.categories.map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 p-4 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-600/50 transition-all h-28 group"
                      >
                         <span className="text-3xl mb-2">{CATEGORY_ICONS[cat]}</span>
                         <span className="text-xs font-bold text-center text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{cat}</span>
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
                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border ${sortBy === sortType ? 'bg-gray-900 dark:bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setSortBy(sortType)}
                  >
                    {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                  </button>
               ))}
            </div>

            {isLoading ? (
              <div className="text-center py-20"><p>Loading...</p></div>
            ) : (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-sm my-4 font-medium">{filteredAndSortedWorkers.length} experts found</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedWorkers.map(worker => (
                      <WorkerCard key={worker.id} worker={worker} distanceKm={worker.distanceKm} onConnect={setSelectedWorker} />
                    ))}
                    {filteredAndSortedWorkers.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <h3 className="text-xl font-bold dark:text-white">No professionals found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
              </>
            )}
          </div>
        )}

        {view === 'dashboard' && <UserDashboard />}
      </main>

      {/* --- Sticky Nav --- */}
       <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around max-w-5xl mx-auto rounded-t-2xl">
            <button onClick={() => setView('home')} className={`flex flex-col items-center p-3 text-sm font-semibold ${view === 'home' ? 'text-indigo-600' : 'text-gray-500'}`}>Home</button>
            <button onClick={() => setView('bookings')} className={`flex flex-col items-center p-3 text-sm font-semibold ${view === 'bookings' ? 'text-indigo-600' : 'text-gray-500'}`}>Bookings</button>
            <button onClick={() => setView('profile')} className={`flex flex-col items-center p-3 text-sm font-semibold ${view === 'profile' ? 'text-indigo-600' : 'text-gray-500'}`}>Profile</button>
        </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
