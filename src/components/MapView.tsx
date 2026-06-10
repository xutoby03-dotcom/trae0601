import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PetMissing, Clue } from '@/types';
import { getMarkerOpacity, formatDateTime } from '@/utils/time';

interface MapViewProps {
  pet?: PetMissing;
  clues?: Clue[];
  interactive?: boolean;
  center?: [number, number];
  selectedLat?: number;
  selectedLng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  markerColor?: string;
  height?: string;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

function LocationPicker({ 
  onSelect, 
  selectedLat, 
  selectedLng,
  color 
}: { 
  onSelect: (lat: number, lng: number) => void;
  selectedLat?: number;
  selectedLng?: number;
  color: string;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (selectedLat !== undefined && selectedLng !== undefined && markerRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLng]);
    }
  }, [selectedLat, selectedLng]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
      }
      onSelect(lat, lng);
    };

    map.on('click', handleClick);

    if (selectedLat !== undefined && selectedLng !== undefined && !markerRef.current) {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      markerRef.current = L.marker([selectedLat, selectedLng], { icon }).addTo(map);
    }

    return () => {
      map.off('click', handleClick);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map, onSelect, color, selectedLat, selectedLng]);

  return null;
}

export function MapView({ 
  pet, 
  clues = [], 
  interactive = false, 
  center,
  selectedLat,
  selectedLng,
  onLocationSelect,
  markerColor = '#FF7A45',
  height = 'h-[400px]'
}: MapViewProps) {
  const createCustomIcon = (color: string, opacity: number, size: number = 24) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; opacity: ${opacity}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const defaultCenter: [number, number] = center ?? (pet ? [pet.lat, pet.lng] : [39.9042, 116.4074]);

  return (
    <div className={`${height} rounded-2xl overflow-hidden shadow-sm border border-gray-200`}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="w-full h-full cursor-crosshair"
        zoomControl={false}
        attributionControl={false}
      >
        <MapController center={defaultCenter} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {!interactive && pet && (
          <>
            <Marker
              position={[pet.lat, pet.lng]}
              icon={createCustomIcon('#FF7A45', getMarkerOpacity(pet.lostTime))}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-orange-600">📍 {pet.petName} 走失点</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDateTime(pet.lostTime)}</p>
                </div>
              </Popup>
            </Marker>

            {clues.map((clue) => {
              const clueOpacity = getMarkerOpacity(clue.seenTime);
              return (
                <Marker
                  key={clue.id}
                  position={[clue.lat, clue.lng]}
                  icon={createCustomIcon('#3B82F6', clueOpacity)}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-blue-600">👀 线索点</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(clue.seenTime)}</p>
                      <p className="text-xs text-gray-400 mt-1">可信度：{'⭐'.repeat(clue.confidence)}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}

        {interactive && onLocationSelect && (
          <LocationPicker 
            onSelect={onLocationSelect} 
            selectedLat={selectedLat}
            selectedLng={selectedLng}
            color={markerColor}
          />
        )}
      </MapContainer>
    </div>
  );
}
