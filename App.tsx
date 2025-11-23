import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { WorkerCard } from './components/WorkerCard';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CATEGORY_ICONS, ICONS, DEFAULT_CENTER } from './constants';
import { WorkerCategory, WorkerProfile, Coordinates } from './types';
import { interpretSearchQuery } from './services/geminiService';
import { workerService } from './services/workerService';
import { databaseService } from './services/databaseService';

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
  const [view, setView] = useState<'home' | 'results' | 'dashboard' | 'worker-dashboard'>('home');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WorkerCategory | null>(null);
  const [activeFilters, setActiveFilters] = useState<{ sortBy: string, maxDistance: number }>({ sortBy: 'relevance', maxDistance: 50 });
  
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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation denied or failed, using default center", error);
          setUserLocation(DEFAULT_CENTER);
        }
      );
    } else {
      setUserLocation(DEFAULT_CENTER);
    }
  }, []);

  // Search Handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim() && !selectedCategory) {
         if(selectedCategory) {
             setView('results');
             return;
         }
         return; 
    }

    setIsSearching(true);
    
    try {
      let categoryToFilter = selectedCategory;
      let keywords: string[] = [];
      let sortBy = activeFilters.sortBy;

      // If there is a text query, use Gemini to understand intent
      if (searchQuery.trim()) {
        const intent = await interpretSearchQuery(searchQuery);
        categoryToFilter = intent.category || null;
        keywords = intent.keywords || [];
        if (intent.sortBy) sortBy = intent.sortBy;
      }

      // Filter Logic
      const center = userLocation || DEFAULT_CENTER;
      
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
        if (sortBy === 'rating') return b.rating - a.rating;
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
    setSelectedCategory(cat);
    setSearchQuery('');
    setIsSearching(true);
    
    // Simulating search delay for UX
    setTimeout(() => {
        const center = userLocation || DEFAULT_CENTER;
        const filtered = allWorkers.map(w => ({
            ...w,
            _distance: getDistanceFromLatLonInKm(center.lat, center.lng, w.location.lat, w.location.lng)
        })).filter(w => w.category === cat);
        
        // Sort with availability boost
        filtered.sort((a, b) => {
             const scoreA = a._distance - (a.status === 'AVAILABLE' ? 10 : 0);
             const scoreB = b._distance - (b.status === 'AVAILABLE' ? 10 : 0);
             return scoreA - scoreB;
        });
        
        setSearchResults(filtered);
        setIsSearching(false);
        setView('results');
    }, 600);
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
    if (view === 'worker-dashboard') return 'Professional Portal';
    if (view === 'dashboard') return 'Dashboard';
    if (view === 'results') return selectedCategory ? `${selectedCategory}s Nearby` : 'Search Results';
    return 'thelocals.co';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-20 selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">
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
        onProfessionalClick={() => setView('worker-dashboard')}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {view === 'home' && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Categories Grid */}
            <div>
              <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Browse Categories</h3>
                  <button 
                    onClick={() => { setView('results'); setSelectedCategory(null); setSearchQuery(''); setSearchResults(allWorkers); }}
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    View all
                  </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.values(WorkerCategory).map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 dark:border-gray-700 h-32 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-3xl mb-2 relative z-10 group-hover:scale-110 transition-transform duration-300 ease-out">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 relative z-10 text-center leading-tight">{cat === 'Other' ? 'Others' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gray-900 dark:bg-black rounded-[2rem] p-8 md:p-12 text-center text-white shadow-2xl shadow-gray-300 dark:shadow-gray-900 relative overflow-hidden group">
              {/* Abstract BG shapes */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-transparent"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-30 group-hover:scale-150 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide mb-6 text-indigo-200">
                    ✨ LIVE BOOKING AVAILABLE
                </span>
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                   Local experts. <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Instant solutions.</span>
                </h2>
                <p className="text-gray-300 mb-10 text-lg max-w-xl mx-auto font-medium">
                  Connect with verified plumbers, cleaners, tutors, and mechanics nearby. Track your service in real-time.
                </p>
                
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group-focus-within:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Describe your issue (e.g. 'flat tire on main st')" 
                    className="relative w-full pl-14 pr-32 py-5 rounded-2xl text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-xl outline-none font-semibold text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.SEARCH} />
                    </svg>
                  </div>
                  <button 
                    type="submit"
                    className="absolute right-2.5 top-2.5 bottom-2.5 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white px-6 rounded-xl font-bold transition-colors flex items-center gap-2"
                  >
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Search</>
                    )}
                  </button>
                </form>
              </div>
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

        {view === 'dashboard' && (
            <UserDashboard />
        )}

        {view === 'worker-dashboard' && (
            <WorkerDashboard />
        )}
      </main>
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