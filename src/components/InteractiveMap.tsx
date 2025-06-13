import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Trail } from '../types/trail';
import { Layers, Mountain, TrendingUp, Clock, MapPin, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom marker icons based on difficulty
const easyTrailIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const moderateTrailIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const difficultTrailIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const veryDifficultTrailIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedTrailIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -42],
  shadowSize: [49, 49]
});

const getTrailIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return easyTrailIcon;
    case 'Moderate':
      return moderateTrailIcon;
    case 'Difficult':
      return difficultTrailIcon;
    case 'Very Difficult':
      return veryDifficultTrailIcon;
    default:
      return easyTrailIcon;
  }
};

// Map layer configurations
const mapLayers = {
  street: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors'
  },
  dark: {
    name: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

interface MapControllerProps {
  selectedTrail?: Trail;
}

const MapController: React.FC<MapControllerProps> = ({ selectedTrail }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedTrail) {
      map.flyTo([selectedTrail.latitude, selectedTrail.longitude], 14, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  }, [selectedTrail, map]);

  return null;
};

interface InteractiveMapProps {
  trails: Trail[];
  selectedTrail?: Trail;
  onTrailSelect: (trail: Trail) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  trails, 
  selectedTrail, 
  onTrailSelect 
}) => {
  const mapRef = useRef<any>(null);
  const [currentLayer, setCurrentLayer] = useState<keyof typeof mapLayers>('terrain');
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  const toggleLayerPicker = () => {
    setShowLayerPicker(!showLayerPicker);
  };

  const selectLayer = (layerKey: keyof typeof mapLayers) => {
    setCurrentLayer(layerKey);
    setShowLayerPicker(false);
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        ref={mapRef}
        center={[40.3108, -105.6456]} // Center on Bear Lake area
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          key={currentLayer}
          attribution={mapLayers[currentLayer].attribution}
          url={mapLayers[currentLayer].url}
        />
        
        {trails.map((trail) => (
          <Marker
            key={trail.id}
            position={[trail.latitude, trail.longitude]}
            icon={selectedTrail?.id === trail.id ? selectedTrailIcon : getTrailIcon(trail.difficulty)}
            eventHandlers={{
              click: () => onTrailSelect(trail),
            }}
          >
            <Popup>
              <div className="p-3 min-w-[280px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{trail.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    trail.difficulty === 'Moderate' ? 'bg-blue-100 text-blue-800' :
                    trail.difficulty === 'Difficult' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trail.difficulty}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{trail.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {trail.length}
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {trail.elevationGain}
                  </div>
                  <div className="flex items-center">
                    <Mountain className="w-3 h-3 mr-1" />
                    {trail.trailheadElevation}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {trail.season}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {trail.features.slice(0, 2).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {trail.permitRequired && (
                  <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Permit Required
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapController selectedTrail={selectedTrail} />
      </MapContainer>
      
      {/* Layer Picker Control */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="relative">
          <button
            onClick={toggleLayerPicker}
            className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 ${
              showLayerPicker ? 'bg-emerald-50 border-emerald-300' : ''
            }`}
            aria-label="Map layers"
          >
            <Layers className="w-5 h-5 text-gray-700" />
          </button>
          
          {showLayerPicker && (
            <div className="absolute top-full right-0 mt-2 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 min-w-[160px] overflow-hidden">
              {Object.entries(mapLayers).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => selectLayer(key as keyof typeof mapLayers)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-emerald-50 ${
                    currentLayer === key 
                      ? 'bg-emerald-100 text-emerald-800 font-medium' 
                      : 'text-gray-700 hover:text-emerald-700'
                  }`}
                >
                  {layer.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedTrail && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {selectedTrail.name}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              selectedTrail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              selectedTrail.difficulty === 'Moderate' ? 'bg-blue-100 text-blue-800' :
              selectedTrail.difficulty === 'Difficult' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedTrail.difficulty}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{selectedTrail.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {selectedTrail.length}
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {selectedTrail.elevationGain}
            </div>
            <div className="flex items-center">
              <Mountain className="w-3 h-3 mr-1" />
              {selectedTrail.trailheadElevation}
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {selectedTrail.season}
            </div>
          </div>
          
          {selectedTrail.permitRequired && (
            <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Permit Required
            </div>
          )}
        </div>
      )}
    </div>
  );
};