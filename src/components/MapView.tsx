import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin } from '../types';
import { AlertTriangle, AlertCircle, CheckCircle, MapPin as MapPinIcon } from 'lucide-react';

interface MapViewProps {
  pins: MapPin[];
}

// Custom marker icons for different criticality levels
const createCustomIcon = (criticality: string) => {
  const colors = {
    high: '#ef4444',
    medium: '#f97316', 
    low: '#22c55e'
  };
  
  const color = colors[criticality as keyof typeof colors] || '#6b7280';
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        <circle cx="12.5" cy="12.5" r="4" fill="${color}"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Component to handle map resizing and invalidation
const MapResizer: React.FC<{ pins: MapPin[] }> = ({ pins }) => {
  const map = useMap();
  
  React.useEffect(() => {
    // Invalidate size when pins change or component mounts
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [map, pins]);
  
  React.useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ pins }) => {
  // Calculate bounds to fit all pins
  const getBounds = () => {
    if (pins.length === 0) {
      // Default center - India coordinates
      return {
        center: [20.5937, 78.9629] as [number, number],
        zoom: 5
      };
    }
    
    if (pins.length === 1) {
      return {
        center: [pins[0].lat, pins[0].lng] as [number, number],
        zoom: 12
      };
    }
    
    // Calculate center of all pins
    const avgLat = pins.reduce((sum, pin) => sum + pin.lat, 0) / pins.length;
    const avgLng = pins.reduce((sum, pin) => sum + pin.lng, 0) / pins.length;
    
    // Calculate appropriate zoom level based on spread of pins
    const latSpread = Math.max(...pins.map(p => p.lat)) - Math.min(...pins.map(p => p.lat));
    const lngSpread = Math.max(...pins.map(p => p.lng)) - Math.min(...pins.map(p => p.lng));
    const maxSpread = Math.max(latSpread, lngSpread);
    
    let zoom = 10;
    if (maxSpread > 10) zoom = 5;
    else if (maxSpread > 5) zoom = 6;
    else if (maxSpread > 2) zoom = 7;
    else if (maxSpread > 1) zoom = 8;
    else if (maxSpread > 0.5) zoom = 9;
    
    return {
      center: [avgLat, avgLng] as [number, number],
      zoom
    };
  };
  
  const { center, zoom } = getBounds();

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCriticalityIcon = (criticality: string) => {
    switch (criticality) {
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low': return CheckCircle;
      default: return MapPinIcon;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Live Complaints Map</h2>
        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
          {pins.length} open complaints
        </div>
      </div>
      
      <div className="relative">
        {pins.length === 0 ? (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No open complaints found</p>
              <p className="text-gray-400 text-sm mt-2">Complaints will appear here when available</p>
            </div>
          </div>
        ) : (
          <div className="h-96 w-full relative">
            <MapContainer
              center={center}
              zoom={zoom}
              className="h-full w-full absolute inset-0"
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <MapResizer pins={pins} />
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              
              {pins.map((pin) => {
                const IconComponent = getCriticalityIcon(pin.criticality);
                
                return (
                  <Marker
                    key={pin.id}
                    position={[pin.lat, pin.lng]}
                    icon={createCustomIcon(pin.criticality)}
                  >
                    <Popup className="custom-popup" maxWidth={300}>
                      <div className="p-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mb-3 ${getCriticalityColor(pin.criticality)} border`}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {pin.criticality.charAt(0).toUpperCase() + pin.criticality.slice(1)} Priority
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">
                          📍 {pin.locationName}
                        </h3>
                        
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Departments: </span>
                          <span className="text-sm text-blue-600">
                            {pin.departments.join(', ')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {pin.description}
                        </p>
                        
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            Coordinates: {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
            <span className="text-sm text-gray-600 font-medium">High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
            <span className="text-sm text-gray-600 font-medium">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
            <span className="text-sm text-gray-600 font-medium">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;