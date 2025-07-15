import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, useMap, ScaleControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.min.js';
import './Map.css';
import './SchoolMarker.css';
import './LayerControl.css';
import L from 'leaflet';
import { School } from '../types/School';
import SchoolMarker from './SchoolMarker';
import MapLegend from './MapLegend';
import LayerControl from './LayerControl';

// Fix for default markers not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  schools: School[];
  center?: [number, number];
  zoom?: number;
  onSchoolClick?: (school: School) => void;
  selectedSchoolId?: string;
  showLegend?: boolean;
  legendPosition?: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
}

// Component to handle map centering when selectedSchoolId changes
function MapController({ selectedSchoolId, schools }: { selectedSchoolId?: string; schools: School[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedSchoolId) {
      const selectedSchool = schools.find(s => s.id === selectedSchoolId);
      if (selectedSchool && selectedSchool.coordinates) {
        map.setView([selectedSchool.coordinates.lat, selectedSchool.coordinates.lng], 15, {
          animate: true
        });
      }
    }
  }, [selectedSchoolId, schools, map]);

  return null;
}

// Component to add custom map controls
function MapControls() {
  const map = useMap();

  useEffect(() => {
    // Add fullscreen control
    const fullscreenControl = new (L.Control as any).Fullscreen({
      position: 'topleft'
    });
    map.addControl(fullscreenControl);

    // Add custom home control to reset view
    const HomeControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        const button = L.DomUtil.create('a', 'leaflet-control-home', container);
        button.href = '#';
        button.title = 'Reset to default view';
        button.innerHTML = '🏠';
        button.style.fontSize = '18px';
        button.style.lineHeight = '30px';
        button.style.textAlign = 'center';
        button.style.textDecoration = 'none';
        button.style.color = '#333';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.display = 'block';
        
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          // Reset to London center with default zoom
          map.setView([51.5074, -0.1278], 10, { animate: true });
        });
        
        return container;
      }
    });

    const homeControl = new HomeControl({ position: 'topleft' });
    map.addControl(homeControl);

    // Add location control to center on user's location
    const LocationControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        const button = L.DomUtil.create('a', 'leaflet-control-location', container);
        button.href = '#';
        button.title = 'Show my location';
        button.innerHTML = '📍';
        button.style.fontSize = '18px';
        button.style.lineHeight = '30px';
        button.style.textAlign = 'center';
        button.style.textDecoration = 'none';
        button.style.color = '#333';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.display = 'block';
        
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 12, { animate: true });
                
                // Add temporary marker for user location
                const userMarker = L.marker([latitude, longitude])
                  .addTo(map)
                  .bindPopup('Your location')
                  .openPopup();
                
                // Remove marker after 5 seconds
                setTimeout(() => {
                  map.removeLayer(userMarker);
                }, 5000);
              },
              (error) => {
                console.warn('Geolocation error:', error);
                alert('Could not get your location. Please check your browser permissions.');
              }
            );
          } else {
            alert('Geolocation is not supported by your browser.');
          }
        });
        
        return container;
      }
    });

    const locationControl = new LocationControl({ position: 'topleft' });
    map.addControl(locationControl);

    // Add custom zoom control
    const zoomControl = L.control.zoom({
      position: 'topright'
    });
    map.addControl(zoomControl);

    // Cleanup controls on unmount
    return () => {
      map.removeControl(fullscreenControl);
      map.removeControl(homeControl);
      map.removeControl(locationControl);
      map.removeControl(zoomControl);
    };
  }, [map]);

  return null;
}

const Map: React.FC<MapProps> = ({
  schools,
  center = [51.5074, -0.1278], // Default to London center
  zoom = 10,
  onSchoolClick,
  selectedSchoolId,
  showLegend = true,
  legendPosition = 'bottomleft'
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [isLegendVisible, setIsLegendVisible] = useState(true);

  // Map bounds for Greater London and surrounding areas
  const bounds: L.LatLngBoundsExpression = [
    [51.2867, -0.5103], // Southwest corner
    [51.6918, 0.3340]   // Northeast corner
  ];

  return (
    <div className="map-container" style={{ height: '100%', width: '100%' }}>
      {/* Map Legend */}
      {showLegend && (
        <MapLegend
          isVisible={isLegendVisible}
          onToggle={() => setIsLegendVisible(!isLegendVisible)}
          position={legendPosition}
        />
      )}
      
      <MapContainer
        center={center}
        zoom={zoom}
        ref={mapRef}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        minZoom={8}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
        zoomControl={false} // We'll add custom zoom controls
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        dragging={true}
      >
        <LayerControl defaultLayer="openstreetmap" />
        
        <MapController selectedSchoolId={selectedSchoolId} schools={schools} />
        {process.env.NODE_ENV !== 'test' && <MapControls />}
        
        {/* Add scale control */}
        <ScaleControl position="bottomright" imperial={false} />
        
        {/* Cluster markers for better performance */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          spiderfyDistanceMultiplier={2}
          iconCreateFunction={(cluster) => {
            const childCount = cluster.getChildCount();
            const markers = cluster.getAllChildMarkers();
            
            // Count schools by type for cluster color
            const schoolCounts = {
              grammar: 0,
              private: 0,
              primary: 0,
              comprehensive: 0
            };
            
            markers.forEach((marker: any) => {
              const school = marker.options.schoolData;
              if (school) {
                switch (school.schoolType) {
                  case 'Grammar':
                    schoolCounts.grammar++;
                    break;
                  case 'Private':
                    schoolCounts.private++;
                    break;
                  case 'State Primary':
                  case 'State Primary (Faith)':
                    schoolCounts.primary++;
                    break;
                  case 'Comprehensive':
                    schoolCounts.comprehensive++;
                    break;
                }
              }
            });
            
            // Determine cluster color based on majority school type
            let clusterColor = '#666666'; // Default grey
            let maxCount = 0;
            let majorityType = 'Mixed';
            
            Object.entries(schoolCounts).forEach(([type, count]) => {
              if (count > maxCount) {
                maxCount = count;
                majorityType = type;
                switch (type) {
                  case 'grammar':
                    clusterColor = '#228B22'; // Green
                    break;
                  case 'private':
                    clusterColor = '#9370DB'; // Purple
                    break;
                  case 'primary':
                    clusterColor = '#FFD700'; // Yellow
                    break;
                  case 'comprehensive':
                    clusterColor = '#00008B'; // Blue
                    break;
                }
              }
            });
            
            // Create cluster size classes
            let sizeClass = 'marker-cluster-small';
            if (childCount >= 100) {
              sizeClass = 'marker-cluster-large';
            } else if (childCount >= 10) {
              sizeClass = 'marker-cluster-medium';
            }
            
            return L.divIcon({
              html: `
                <div class="cluster-icon" style="background-color: ${clusterColor}">
                  <span class="cluster-count">${childCount}</span>
                  <span class="cluster-type">${majorityType}</span>
                </div>
              `,
              className: `marker-cluster ${sizeClass}`,
              iconSize: [40, 40]
            });
          }}
        >
          {/* Render school markers within cluster group */}
          {schools.map((school) => (
            <SchoolMarker
              key={school.id}
              school={school}
              onClick={onSchoolClick}
              isSelected={selectedSchoolId === school.id}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default Map;