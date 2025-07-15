import React, { useState } from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';
import './LayerControl.css';

export interface MapLayer {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom?: number;
  opacity?: number;
}

interface LayerControlProps {
  defaultLayer?: string;
}

// Available map layers
export const MAP_LAYERS: MapLayer[] = [
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    maxZoom: 19
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17
  },
  {
    id: 'cartodb-positron',
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  },
  {
    id: 'cartodb-dark',
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }
];

const LayerControl: React.FC<LayerControlProps> = ({
  defaultLayer = 'openstreetmap'
}) => {
  const [selectedLayer, setSelectedLayer] = useState(defaultLayer);

  return (
    <LayersControl position="topright" collapsed={true}>
      {MAP_LAYERS.map((layer) => (
        <LayersControl.BaseLayer
          key={layer.id}
          checked={layer.id === selectedLayer}
          name={layer.name}
        >
          <TileLayer
            attribution={layer.attribution}
            url={layer.url}
            maxZoom={layer.maxZoom}
            opacity={layer.opacity || 1}
            className={`map-layer-${layer.id}`}
          />
        </LayersControl.BaseLayer>
      ))}
      
      {/* Optional overlay layers */}
      <LayersControl.Overlay name="Transport Lines" checked={false}>
        <TileLayer
          url="https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          opacity={0.6}
          maxZoom={18}
        />
      </LayersControl.Overlay>
    </LayersControl>
  );
};

export default LayerControl;