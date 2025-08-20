import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrailsList } from './components/TrailsList';
import { InteractiveMap } from './components/InteractiveMap';
import { canyonLakesTrails } from './data/trails';
import { Trail, Trip } from './types/trail';
import { Mountain, MapPin, Shield, Calendar, ChevronDown, X, Search, Lock, Image, TreePine, Pencil } from 'lucide-react';
import { TripsTable, TripsTableRef } from './components/TripsTable';

// Add the initial trips data
const initialTrips: Trip[] = [
  { date: '2024-05-23', trail: 'Greyrock & Greyrock Meadows', partners: 'Jeanne Corbin', treesCleared: '' },
  { date: '2024-06-05', trail: 'North Fork', partners: 'Carol Springberg', treesCleared: '' },
  { date: '2024-06-16', trail: 'Hewlett Gulch', partners: 'Joe Cox +', treesCleared: '' },
  { date: '2024-06-19', trail: 'Young Gulch', partners: 'Lisa Permer', treesCleared: '' },
  { date: '2024-07-15', trail: 'Lily Mountain', partners: 'Jennifer Collins', treesCleared: '' },
  { date: '2024-08-02', trail: 'Mt Margaret & Divide', partners: 'Shannon Anderson', treesCleared: '' },
  { date: '2025-03-27', trail: 'Mt. McConnel & Kreutzer', partners: 'Steve Musial', treesCleared: '2' },
  { date: '2025-03-27', trail: 'Fish Creek', partners: 'Steve Musial', treesCleared: '41' },
  { date: '2025-04-07', trail: 'Little Beaver Creek', partners: 'Steve Musial, Mike Shearer, Don Gibbs', treesCleared: '36' },
  { date: '2025-05-31', trail: 'Mt Margaret & Divide', partners: 'Sawyer Cert', treesCleared: '' },
  { date: '2025-06-09', trail: 'Beaver Creek', partners: 'Steve Musial', treesCleared: '' },
  { date: '2025-06-09', trail: 'Comanche Lake', partners: 'Steve Musial', treesCleared: '' },
  { date: '2025-06-10', trail: 'Comanche Lake', partners: 'Steve Musial', treesCleared: '' },
  { date: '2025-06-10', trail: 'Beaver Creek', partners: 'Steve Musial', treesCleared: '51' },
];

const getFilterButtonColor = (difficulty: string, isActive: boolean) => {
  if (!isActive) {
    return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
  }
  
  switch (difficulty.toLowerCase()) {
    case 'all':
      return 'bg-gray-200 text-gray-800 border-gray-300';
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'moderate':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'difficult':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'trips':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

function App() {
  const [selectedTrail, setSelectedTrail] = useState<Trail | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [tripsSortBy, setTripsSortBy] = useState<'date' | 'trail' | 'trees'>('date');
  const [tripsSortDesc, setTripsSortDesc] = useState(true);
  const [tripsUpdateTrigger, setTripsUpdateTrigger] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tripsTableRef = useRef<TripsTableRef>(null);
  
  // Password authentication state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Check if device is remembered on mount
  useEffect(() => {
    const remembered = localStorage.getItem('trailsMapper.remembered');
    if (remembered === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ng!stayAct1ve') {
      setIsAuthenticated(true);
      if (rememberDevice) {
        localStorage.setItem('trailsMapper.remembered', 'true');
      }
      setShowPasswordModal(false);
      setPassword('');
      setRememberDevice(false);
      
      // Execute the pending action
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      alert('Incorrect password');
    }
  };

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPasswordModal(true);
    }
  };

  const filteredTrails = useMemo(() => {
    let filtered = canyonLakesTrails;
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all' && difficultyFilter !== 'trips') {
      filtered = filtered.filter(trail => trail.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
    }
    
    // Apply search filter (only for trails mode)
    if (difficultyFilter !== 'trips' && searchTerm) {
      filtered = filtered.filter(trail =>
        trail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [searchTerm, difficultyFilter]);

  const handleTrailSelect = (trail: Trail) => {
    setSelectedTrail(trail);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    // Clear selected trail when search changes to avoid showing a trail that's not in filtered results
    if (selectedTrail) {
      const newFilteredTrails = canyonLakesTrails.filter(trail => {
        const matchesSearch = trail.name.toLowerCase().includes(term.toLowerCase()) ||
          trail.difficulty.toLowerCase().includes(term.toLowerCase()) ||
          trail.features.some(feature => feature.toLowerCase().includes(term.toLowerCase()));
        
        const matchesDifficulty = difficultyFilter === 'all' || trail.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
        
        return matchesSearch && matchesDifficulty;
      });
      if (!newFilteredTrails.find(t => t.id === selectedTrail.id)) {
        setSelectedTrail(undefined);
      }
    }
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setDifficultyFilter(difficulty);
    // Clear selected trail when filter changes
    if (selectedTrail) {
      const newFilteredTrails = canyonLakesTrails.filter(trail => {
        const matchesSearch = !searchTerm || trail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trail.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trail.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesDifficulty = difficulty === 'all' || trail.difficulty.toLowerCase() === difficulty.toLowerCase();
        
        return matchesSearch && matchesDifficulty;
      });
      if (!newFilteredTrails.find(t => t.id === selectedTrail.id)) {
        setSelectedTrail(undefined);
      }
    }
  };

  // Add a handler for selecting a trail by name (for trips)
  const handleTripTrailSelect = (trailName: string) => {
    // Try exact match first
    let trail = canyonLakesTrails.find(t => t.name.toLowerCase() === trailName.toLowerCase());
    
    // If no exact match, try partial matches
    if (!trail) {
      trail = canyonLakesTrails.find(t => 
        t.name.toLowerCase().includes(trailName.toLowerCase()) ||
        trailName.toLowerCase().includes(t.name.toLowerCase())
      );
    }
    
    // If still no match, try matching key words
    if (!trail) {
      const trailWords = trailName.toLowerCase().split(/\s+/);
      trail = canyonLakesTrails.find(t => 
        trailWords.some(word => 
          t.name.toLowerCase().includes(word) && word.length > 2
        )
      );
    }
    
    if (trail) {
      setSelectedTrail(trail);
    }
  };

  // Add a handler for adding trips
  const handleAddTrip = () => {
    requireAuth(() => {
      tripsTableRef.current?.add();
    });
  };

  const handleSort = (sortBy: 'date' | 'trail' | 'trees') => {
    if (tripsSortBy === sortBy) {
      setTripsSortDesc(!tripsSortDesc);
    } else {
      setTripsSortBy(sortBy);
      setTripsSortDesc(true);
    }
    setShowSortDropdown(false);
  };

  const getSortLabel = () => {
    switch (tripsSortBy) {
      case 'date': return 'Date';
      case 'trail': return 'Trail';
      case 'trees': return 'Trees';
      default: return 'Date';
    }
  };

  // Calculate totals for trips
  const calculateTotals = () => {
    // Get current trips from localStorage to calculate real-time totals
    const savedTrips = localStorage.getItem('trailsMapper.trips');
    const currentTrips = savedTrips ? JSON.parse(savedTrips) : initialTrips;
    
    const totalPatrols = currentTrips.length;
    const totalClearedTrees = currentTrips.reduce((sum: number, trip: Trip) => {
      const trees = parseInt(trip.treesCleared) || 0;
      return sum + trees;
    }, 0);
    return { totalPatrols, totalClearedTrees };
  };

  // Force totals to recalculate when trips change
  const refreshTotals = () => {
    setTripsUpdateTrigger(prev => prev + 1);
  };

  const { totalPatrols, totalClearedTrees } = useMemo(() => calculateTotals(), [tripsUpdateTrigger]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Mountain className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Canyon Lakes (PWV) Trails</h1>
                <p className="text-sm text-gray-600">Roosevelt National Forest, Colorado</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                  {filteredTrails.length} of {canyonLakesTrails.length} Hiking Trails
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[400px] xl:w-[420px] 2xl:w-[480px] flex-shrink-0 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-lg">
              {/* Shared Header with Filter Buttons */}
              <div className="p-6 border-b border-gray-200">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* All Button */}
                  <button
                    onClick={() => {
                      handleDifficultyFilter('all');
                      setSelectedTrail(undefined);
                    }}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${getFilterButtonColor('all', difficultyFilter === 'all')}`}
                    aria-label="Show all trails"
                  >
                    All
                  </button>
                  {/* Easy Button */}
                  <button
                    onClick={() => handleDifficultyFilter('easy')}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${getFilterButtonColor('easy', difficultyFilter === 'easy')}`}
                    aria-label="Easy trails"
                  >
                    <Mountain className="w-5 h-5" />
                  </button>
                  {/* Moderate Button */}
                  <button
                    onClick={() => handleDifficultyFilter('moderate')}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${getFilterButtonColor('moderate', difficultyFilter === 'moderate')}`}
                    aria-label="Moderate trails"
                  >
                    <span className="flex"><Mountain className="w-5 h-5" /><Mountain className="w-5 h-5 -ml-2" /></span>
                  </button>
                  {/* Difficult Button */}
                  <button
                    onClick={() => handleDifficultyFilter('difficult')}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${getFilterButtonColor('difficult', difficultyFilter === 'difficult')}`}
                    aria-label="Difficult trails"
                  >
                    <span className="flex"><Mountain className="w-5 h-5" /><Mountain className="w-5 h-5 -ml-2" /><Mountain className="w-5 h-5 -ml-2" /></span>
                  </button>
                  {/* Trips Button */}
                  <button
                    onClick={() => handleDifficultyFilter('trips')}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${getFilterButtonColor('trips', difficultyFilter === 'trips')}`}
                    aria-label="Trips"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                  {/* Images Button */}
                  <a
                    href="https://photos.app.goo.gl/oMj76Xa8i8enAdyR9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                    aria-label="Trail Crew Photos"
                  >
                    <Image className="w-5 h-5" />
                  </a>
                </div>

                {/* Dynamic Content Area */}
                {difficultyFilter === 'trips' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                    {/* Sort Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Calendar className="w-4 h-4" />
                        {getSortLabel()} {tripsSortDesc ? '▼' : '▲'}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showSortDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => handleSort('date')}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              tripsSortBy === 'date' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700'
                            }`}
                          >
                            Date {tripsSortBy === 'date' && (tripsSortDesc ? '▼' : '▲')}
                          </button>
                          <button
                            onClick={() => handleSort('trail')}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              tripsSortBy === 'trail' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700'
                            }`}
                          >
                            Trail {tripsSortBy === 'trail' && (tripsSortDesc ? '▼' : '▲')}
                          </button>
                          <button
                            onClick={() => handleSort('trees')}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              tripsSortBy === 'trees' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700'
                            }`}
                          >
                            Trees {tripsSortBy === 'trees' && (tripsSortDesc ? '▼' : '▲')}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Totals Section */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="font-bold">{totalPatrols}</span>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                        <TreePine className="w-4 h-4 mr-1" />
                        <span className="font-bold">{totalClearedTrees}</span>
                      </div>
                    </div>

                    {/* Add Patrol Button */}
                    <button
                      onClick={handleAddTrip}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search trails by name, difficulty, or features..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="h-[40vh] lg:h-[calc(100vh-12rem)] overflow-hidden">
                {difficultyFilter === 'trips' ? (
                  <TripsTable 
                    ref={tripsTableRef}
                    initialTrips={initialTrips} 
                    onTrailSelect={handleTripTrailSelect}
                    sortBy={tripsSortBy}
                    sortDesc={tripsSortDesc}
                    isAuthenticated={isAuthenticated}
                    requireAuth={requireAuth}
                    refreshTotals={refreshTotals}
                  />
                ) : (
                  <TrailsList
                    trails={filteredTrails}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onTrailSelect={handleTrailSelect}
                    selectedTrail={selectedTrail}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 order-2 lg:order-2">
            <div className="h-[60vh] lg:h-[calc(100vh-12rem)] rounded-lg overflow-hidden shadow-lg">
              <InteractiveMap
                key={`map-${difficultyFilter}`}
                trails={filteredTrails}
                selectedTrail={selectedTrail}
                onTrailSelect={handleTrailSelect}
                difficultyFilter={difficultyFilter}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Please enter the password to edit trip data.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember this device
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setRememberDevice(false);
                    setPendingAction(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            Explore the beautiful trails of Canyon Lakes Ranger District patrolled by Poudre Wilderness Volunteers • Click on any trail to learn more
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;