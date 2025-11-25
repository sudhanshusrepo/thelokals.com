
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { WorkerCard } from './components/WorkerCard';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CATEGORY_ICONS, ICONS, DEFAULT_CENTER, SERVICE_GROUPS } from './constants';
import { WorkerCategory, WorkerProfile, Coordinates } from './types';
import { interpretSearchQuery } from './services/geminiService';
import { workerService } from './services/workerService';
import { databaseService } from './services/databaseService';
import SearchBar from './components/SearchBar';

// Haversine formula for distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const MainLayout: React.FC = () => {
  const [view, setView] = useState<'home' | 'results' | 'dashboard' | 'bookings' | 'offers' | 'profile'>('home');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WorkerCategory | null>(null);
  const [activeFilters, setActiveFilters] = useState<{ sortBy: string, maxDistance: number }>({ sortBy: 'relevance', maxDistance: 50 });
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Data State
  const [allWorkers, setAllWorkers] = useState<WorkerProfile[]>([]);
  const [searchResults, setSearchResults] = useState<WorkerProfile[]>([]);
  
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Initialize Location and Fetch Workers
  useEffect(() => {
    // Handle auth redirect
    if (window.location.hash.includes('&type=signup')) {
        setView('dashboard');
    }

    const initData = async () => {
        const workers = await workerService.getWorkers();
        setAllWorkers(workers);
        setSearchResults(workers); // Default to showing all until filtered
    };
    initData();

    // Run database migrations
    databaseService.setupNewUserTrigger();
    databaseService.removeInsertPolicy();

  }, []);

  const requestLocation = (): Promise<Coordinates> => {
    return new Promise((resolve) => {
        if (locationPermission === 'granted' && userLocation) {
            return resolve(userLocation);
        }

        if (locationPermission === 'denied') {
            return resolve(DEFAULT_CENTER);
        }

        setShowLocationModal(true);

        const handleAllow = () => {
            setShowLocationModal(false);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setUserLocation(coords);
                        setLocationPermission('granted');
                        resolve(coords);
                    },
                    (error) => {
                        console.warn("Geolocation denied, using default center", error);
                        setUserLocation(DEFAULT_CENTER);
                        setLocationPermission('denied');
                        resolve(DEFAULT_CENTER);
                    }
                );
            } else {
                setUserLocation(DEFAULT_CENTER);
                setLocationPermission('denied');
                resolve(DEFAULT_CENTER);
            }
        };

        const handleDeny = () => {
            setShowLocationModal(false);
            setUserLocation(DEFAULT_CENTER);
            setLocationPermission('denied');
            resolve(DEFAULT_CENTER);
        };

        // This is a bit of a hack to pass the handlers to the modal
        (window as any).handleAllowLocation = handleAllow;
        (window as any).handleDenyLocation = handleDeny;
    });
  }

  // Search Handler
  const handleSearch = async (query: string, category: WorkerCategory | null) => {
    if (!query.trim() && !category) {
         if(category) {
             setView('results');
             return;
         }
         return; 
    }

    setIsSearching(true);
    setSearchQuery(query);
    setSelectedCategory(category);
    
    try {
      const center = await requestLocation();
      let categoryToFilter = category;
      let keywords: string[] = [];
      let sortBy = activeFilters.sortBy;

      // If there is a text query, use Gemini to understand intent
      if (query.trim()) {
        const intent = await interpretSearchQuery(query);
        categoryToFilter = intent.category || category;
        keywords = intent.keywords || [];
        if (intent.sortBy) sortBy = intent.sortBy;
      }

      // Filter Logic
      const filtered = allWorkers.map(worker => {
        const dist = getDistanceFromLatLonInKm(center.lat, center.lng, worker.location.lat, worker.location.lng);
        return { ...worker, _distance: dist };
      }).filter(worker => {
        // Category match
        if (categoryToFilter && worker.category !== categoryToFilter) return false;
        
        // Keyword match (basic implementation)
        if (keywords.length > 0) {
           const text = (worker.name + ' ' + worker.description + ' ' + worker.expertise.join(' ')).toLowerCase();
           const hasMatch = keywords.some(k => text.includes(k.toLowerCase()));
           if (!categoryToFilter && !hasMatch) return false;
        }

        // Distance Filter
        if ((worker as any)._distance > activeFilters.maxDistance) return false;

        return true;
      });

      // Sort Logic
      filtered.sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'rating') return b.rating - b.rating;
        if (sortBy === 'distance') return (a as any)._distance - (b as any)._distance;
        
        // Relevance default: mix of distance, rating, and STATUS
        const getScore = (w: any) => {
            let score = (w._distance * 0.4) - (w.rating * 2);
            // Boost available workers (lower score is better)
            if (w.status === 'AVAILABLE') score -= 5;
            if (w.status === 'BUSY') score += 2; 
            if (w.status === 'OFFLINE') score += 5;
            return score;
        };

        return getScore(a) - getScore(b);
      });

      setSearchResults(filtered);
      setActiveFilters(prev => ({ ...prev, sortBy }));
      setView('results');

    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = (cat: WorkerCategory) => {
    handleSearch('', cat);
  };

  const sortedResultsWithDistance = useMemo(() => {
     const center = userLocation || DEFAULT_CENTER;
     return searchResults.map(w => ({
         ...w,
         distanceKm: getDistanceFromLatLonInKm(center.lat, center.lng, w.location.lat, w.location.lng)
     }));
  }, [searchResults, userLocation]);

  // Determine header title
  const getHeaderTitle = () => {
    if (view === 'dashboard') return 'Dashboard';
    if (view === 'results') return selectedCategory ? `${selectedCategory}s Nearby` : 'Search Results';
    return 'The Lokals';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20 selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">
        {showLocationModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                    <div className="text-5xl mb-4">📍</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enable Location Services</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">To find the best professionals near you, The Lokals needs access to your device's location.</p>
                    <div className="flex gap-4">
                        <button onClick={() => (window as any).handleDenyLocation()} className="flex-1 px-4 py-3 rounded-lg font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">Not Now</button>
                        <button onClick={() => (window as any).handleAllowLocation()} className="flex-1 px-4 py-3 rounded-lg font-bold bg-indigo-600 text-white">Allow</button>
                    </div>
                </div>
            </div>
        )}

      {/* Modals */}
      <BookingModal 
        worker={selectedWorker} 
        onClose={() => setSelectedWorker(null)} 
        onAuthReq={() => {
            setSelectedWorker(null);
            setShowAuthModal(true);
        }}
      />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Navbar */}
      <Header 
        isHome={view === 'home'} 
        onBack={() => {
            setView('home');
            setSearchQuery('');
            setSelectedCategory(null);
        }} 
        onLogoClick={() => setView('home')}
        title={getHeaderTitle()}
        onSignInClick={() => setShowAuthModal(true)}
        onDashboardClick={() => setView('dashboard')}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {view === 'home' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Service Groups */}
            <div className="space-y-4">
              {Object.values(SERVICE_GROUPS).map((group) => (
                <div key={group.name} className="rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`text-2xl bg-${group.color}-100 dark:bg-${group.color}-900/50 p-2 rounded-lg`}>{group.icon}</span>
                    <span className="font-bold text-lg text-gray-800 dark:text-white">{group.name}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.categories.map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 p-4 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-600/50 hover:-translate-y-1 transition-all h-28 group"
                      >
                         <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 ease-out">{CATEGORY_ICONS[cat]}</span>
                         <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-center leading-tight">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-[2rem] flex items-center justify-between border border-orange-100 dark:border-orange-800/30 relative overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-none transition-all">
                    <div className="relative z-10">
                        <span className="text-xs font-bold bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-md mb-2 inline-block">LIMITED OFFER</span>
                        <h4 className="font-bold text-xl text-orange-900 dark:text-orange-100 mb-1">20% off cleaning</h4>
                        <p className="text-orange-700 dark:text-orange-300 text-sm font-medium opacity-80">Use code CLEAN20 on your first order</p>
                    </div>
                    <span className="text-6xl group-hover:scale-110 transition-transform rotate-12">🧹</span>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-200 dark:bg-orange-800 rounded-full blur-2xl opacity-50"></div>
                </div>
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2rem] flex items-center justify-between border border-blue-100 dark:border-blue-800/30 relative overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-none transition-all">
                    <div className="relative z-10">
                        <span className="text-xs font-bold bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md mb-2 inline-block">24/7 SUPPORT</span>
                        <h4 className="font-bold text-xl text-blue-900 dark:text-blue-100 mb-1">Emergency Repair?</h4>
                        <p className="text-blue-700 dark:text-blue-300 text-sm font-medium opacity-80">Experts available in under 30 mins</p>
                    </div>
                    <span className="text-6xl group-hover:scale-110 transition-transform -rotate-12">🚨</span>
                     <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full blur-2xl opacity-50"></div>
                </div>
            </div>
          </div>
        )}

        {view === 'results' && (
          // Results View
          <div className="animate-fade-in">
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
               {['relevance', 'rating', 'distance', 'price'].map(sortType => (
                   <button 
                    key={sortType}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFilters.sortBy === sortType ? 'bg-gray-900 dark:bg-indigo-600 text-white border-gray-900 dark:border-indigo-600 shadow-lg shadow-gray-200 dark:shadow-none' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                    onClick={() => setActiveFilters(p => ({...p, sortBy: sortType}))}
                  >
                    {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                  </button>
               ))}
            </div>

            {isSearching && (
              <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Curating the best experts for you...</p>
              </div>
            )}

            {!isSearching && (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">{sortedResultsWithDistance.length} experts found nearby</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {sortedResultsWithDistance.map(worker => (
                    <WorkerCard 
                        key={worker.id} 
                        worker={worker}
                        distanceKm={worker.distanceKm}
                        onConnect={(w) => setSelectedWorker(w)}
                    />
                    ))}
                    {sortedResultsWithDistance.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <div className="text-6xl mb-4">🤷‍♂️</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No professionals found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search area.</p>
                        </div>
                    )}
                </div>
              </>
            )}
          </div>
        )}

        {view === 'dashboard' && <UserDashboard />}
        {view === 'bookings' && <div className="text-center py-20"><h2 className="text-2xl font-bold">My Bookings</h2></div>}
        {view === 'offers' && <div className="text-center py-20"><h2 className="text-2xl font-bold">Special Offers</h2></div>}
        {view === 'profile' && <UserDashboard />}
      </main>

        {/* Sticky Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg flex justify-around max-w-5xl mx-auto rounded-t-2xl">
            <button onClick={() => setView('home')} className={`flex flex-col items-center p-3 text-sm font-semibold ${view === 'home' ? 'text-indigo-600' : 'text-gray-500'}`}>
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7 4h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 001 1z" /></svg>
                Home
            </button>
            <button onClick={() => setView('bookings')} className={`flex flex-col items-center p-3 text-sm font-semibold ${view === 'bookings' ? 'text-indigo-600' : 'text-gray-500'}`}>
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Bookings
            </button>
            <button onClick={() => setView('offers')} className={`flex flex-col items-center p-3 text-sm font-semibold ${view === 'offers' ? 'text-indigo-600' : 'text-gray-500'}`}>
                 <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-7-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm14 0c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/></svg>
                Offers
            </button>
            <button onClick={() => setView('profile')} className={`flex flex-col items-center p-3 text-sm font-semibold ${view === 'profile' ? 'text-indigo-600' : 'text-gray-500'}`}>
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Profile
            </button>
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
