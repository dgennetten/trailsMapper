import React from 'react';
import { Search, MapPin, Mountain, X, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Trail } from '../types/trail';

interface TrailsListProps {
  trails: Trail[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onTrailSelect: (trail: Trail) => void;
  selectedTrail?: Trail;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Moderate':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Difficult':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Very Difficult':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return <Mountain className="w-3 h-3" />;
    case 'Moderate':
      return (
        <div className="flex">
          <Mountain className="w-3 h-3" />
          <Mountain className="w-3 h-3 -ml-1" />
        </div>
      );
    case 'Difficult':
      return (
        <div className="flex">
          <Mountain className="w-3 h-3" />
          <Mountain className="w-3 h-3 -ml-1" />
          <Mountain className="w-3 h-3 -ml-1" />
        </div>
      );
    case 'Very Difficult':
      return <AlertTriangle className="w-3 h-3" />;
    default:
      return <Mountain className="w-3 h-3" />;
  }
};

export const TrailsList: React.FC<TrailsListProps> = ({ 
  trails, 
  searchTerm, 
  onSearchChange, 
  onTrailSelect, 
  selectedTrail 
}) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="bg-white h-full flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Canyon Lakes Trails</h2>
        <p className="text-sm text-gray-600 mb-4">Roosevelt National Forest, Colorado</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search trails by name, difficulty, or features..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {trails.map((trail) => (
            <div
              key={trail.id}
              onClick={() => onTrailSelect(trail)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTrail?.id === trail.id
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-semibold text-lg ${
                  selectedTrail?.id === trail.id ? 'text-emerald-900' : 'text-gray-900'
                }`}>
                  {trail.name}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getDifficultyColor(trail.difficulty)}`}>
                  {getDifficultyIcon(trail.difficulty)}
                  {trail.difficulty}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{trail.length}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{trail.elevationGain}</span>
                </div>
                <div className="flex items-center">
                  <Mountain className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{trail.trailheadElevation}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{trail.season}</span>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                {trail.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {trail.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {trail.features.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{trail.features.length - 3} more
                  </span>
                )}
              </div>
              
              {trail.permitRequired && (
                <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Permit Required
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600 text-center">
          {trails.length} trails
        </p>
      </div>
    </div>
  );
};