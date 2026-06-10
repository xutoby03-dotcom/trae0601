import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PetMissing, Clue } from '@/types';
import { getMarkerOpacity, formatDateTime } from '@/utils/time';

interface MapViewProps {
  pet: PetMissing;
  clues: Clue[];
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #FF7A45; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
      onSelect(lat, lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map, onSelect]);

  return null;
}

export function MapView({ pet, clues, interactive = false, onLocationSelect }: MapViewProps) {
  const createCustomIcon = (color: string, opacity: number) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; opacity: ${opacity}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const bounds: [number, number][] = [[pet.lat, pet.lng]];
  clues.forEach(c => bounds.push([c.lat, c.lng]));

  const petOpacity = getMarkerOpacity(pet.lostTime);

  return (
    <div className="h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <MapContainer
        center={[pet.lat, pet.lng]}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <MapController center={[pet.lat, pet.lng]} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {!interactive && (
          <>
            <Marker
              position={[pet.lat, pet.lng]}
              icon={createCustomIcon('#FF7A45', petOpacity)}
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
          <LocationPicker onSelect={onLocationSelect} />
        )}
      </MapContainer>
    </div>
  );
}
