import React, { useState } from 'react';
import { TrailsList } from './components/TrailsList';
import { InteractiveMap } from './components/InteractiveMap';
import { canyonLakesTrails } from './data/trails';
import { Trail } from './types/trail';
import { Mountain, Trees, MapPin } from 'lucide-react';

function App() {
  const [selectedTrail, setSelectedTrail] = useState<Trail | undefined>();

  const handleTrailSelect = (trail: Trail) => {
    setSelectedTrail(trail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Mountain className="w-8 h-8 text-emerald-600" />
                <Trees className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Canyon Lakes Trails</h1>
                <p className="text-sm text-gray-600">Roosevelt National Forest, Colorado</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                  {canyonLakesTrails.length} Hiking Trails
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="h-[calc(100vh-12rem)] rounded-lg overflow-hidden">
              <TrailsList
                trails={canyonLakesTrails}
                onTrailSelect={handleTrailSelect}
                selectedTrail={selectedTrail}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="h-[calc(100vh-12rem)] rounded-lg overflow-hidden shadow-lg">
              <InteractiveMap
                trails={canyonLakesTrails}
                selectedTrail={selectedTrail}
                onTrailSelect={handleTrailSelect}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            Explore the beautiful trails of Canyon Lakes Ranger District • Click on any trail to learn more
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;