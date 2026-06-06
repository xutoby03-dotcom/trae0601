import React from 'react';
import { Chord, STRING_NAMES } from '../types';
import { getNoteName } from '../utils/audio';

interface FretboardProps {
  chord: Chord | null;
  numFrets?: number;
  onPlay?: () => void;
}

export const Fretboard: React.FC<FretboardProps> = ({ chord, numFrets = 12, onPlay }) => {
  const width = 600;
  const height = 300;
  const padding = 60;
  const fretWidth = (width - padding * 2) / numFrets;
  const stringSpacing = (height - padding * 2) / 5;

  const getDisplayFret = (fret: number): number => {
    if (!chord) return fret;
    const baseFret = chord.baseFret || 1;
    if (baseFret > 1 && fret > 0) {
      return fret - baseFret + 1;
    }
    return fret;
  };

  const renderFrets = () => {
    const frets = [];
    for (let i = 0; i <= numFrets; i++) {
      const x = padding + i * fretWidth;
      const isNut = i === 0;
      frets.push(
        <line
          key={`fret-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
          stroke={isNut ? '#2D1810' : '#8B7355'}
          strokeWidth={isNut ? 6 : 2}
        />
      );
      
      if (i > 0 && i < numFrets) {
        const displayFret = getDisplayFret(i);
        frets.push(
          <text
            key={`fret-num-${i}`}
            x={x + fretWidth / 2}
            y={height - 20}
            textAnchor="middle"
            fill="#8B7355"
            fontSize="12"
            fontFamily="Inter"
          >
            {displayFret}
          </text>
        );
      }
    }
    return frets;
  };

  const renderStrings = () => {
    const strings = [];
    for (let i = 0; i < 6; i++) {
      const y = padding + i * stringSpacing;
      const thickness = 1 + (5 - i) * 0.5;
      strings.push(
        <line
          key={`string-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke="#C0C0C0"
          strokeWidth={thickness}
          style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}
        />
      );
      
      strings.push(
        <text
          key={`string-name-${i}`}
          x={padding - 25}
          y={y + 5}
          textAnchor="middle"
          fill="#2D1810"
          fontSize="14"
          fontFamily="Inter"
          fontWeight="600"
        >
          {STRING_NAMES[i]}
        </text>
      );
    }
    return strings;
  };

  const renderFretMarkers = () => {
    const markers = [];
    const markerFrets = [3, 5, 7, 9, 12];
    const doubleMarkerFrets = [12];
    
    markerFrets.forEach(fret => {
      const displayFret = getDisplayFret(fret);
      if (displayFret < 1 || displayFret > numFrets) return;
      
      const x = padding + (displayFret - 0.5) * fretWidth;
      
      if (doubleMarkerFrets.includes(fret)) {
        markers.push(
          <circle
            key={`marker-${fret}-1`}
            cx={x}
            cy={padding + stringSpacing * 1.5}
            r={6}
            fill="#8B7355"
            opacity={0.6}
          />
        );
        markers.push(
          <circle
            key={`marker-${fret}-2`}
            cx={x}
            cy={padding + stringSpacing * 3.5}
            r={6}
            fill="#8B7355"
            opacity={0.6}
          />
        );
      } else {
        markers.push(
          <circle
            key={`marker-${fret}`}
            cx={x}
            cy={height / 2}
            r={6}
            fill="#8B7355"
            opacity={0.6}
          />
        );
      }
    });
    return markers;
  };

  const renderChordNotes = () => {
    if (!chord) return null;

    const notes = [];
    const baseFret = chord.baseFret || 1;

    for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
      const fret = chord.frets[stringIdx];
      const finger = chord.fingers[stringIdx];
      const y = padding + stringIdx * stringSpacing;

      if (fret === -1) {
        notes.push(
          <g key={`note-${stringIdx}`}>
            <text
              x={padding - 50}
              y={y + 5}
              textAnchor="middle"
              fill="#D32F2F"
              fontSize="20"
              fontFamily="Inter"
              fontWeight="bold"
            >
              ✕
            </text>
          </g>
        );
      } else if (fret === 0) {
        notes.push(
          <g key={`note-${stringIdx}`}>
            <circle
              cx={padding - 50}
              cy={y}
              r={10}
              fill="none"
              stroke="#4CAF50"
              strokeWidth={3}
            />
            <text
              x={padding - 50}
              y={y + 4}
              textAnchor="middle"
              fill="#4CAF50"
              fontSize="12"
              fontFamily="Inter"
              fontWeight="bold"
            >
              O
            </text>
          </g>
        );
      } else {
        let displayFret = fret;
        if (baseFret > 1) {
          displayFret = fret - baseFret + 1;
        }
        
        const x = padding + (displayFret - 0.5) * fretWidth;
        const isBarre = chord.barres?.some(
          b => b.fret === fret && stringIdx >= b.fromString - 1 && stringIdx <= b.toString - 1
        );
        const isBarreStart = chord.barres?.some(
          b => b.fret === fret && stringIdx === b.fromString - 1
        );
        const isBarreEnd = chord.barres?.some(
          b => b.fret === fret && stringIdx === b.toString - 1
        );

        if (isBarre && isBarreStart) {
          const endString = chord.barres!.find(b => b.fret === fret)!.toString - 1;
          const endY = padding + endString * stringSpacing;
          notes.push(
            <rect
              key={`barre-${fret}`}
              x={x - 12}
              y={y - 12}
              width={24}
              height={endY - y + 24}
              rx={12}
              fill="#E53935"
              opacity={0.9}
            />
          );
          if (finger > 0) {
            notes.push(
              <text
                key={`barre-finger-${fret}`}
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontFamily="Inter"
                fontWeight="bold"
              >
                {finger}
              </text>
            );
          }
        } else if (!isBarre) {
          notes.push(
            <g key={`note-${stringIdx}`}>
              <circle
                cx={x}
                cy={y}
                r={14}
                fill="#E53935"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
              />
              {finger > 0 && (
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontFamily="Inter"
                  fontWeight="bold"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        }
      }
    }

    if (baseFret > 1) {
      notes.push(
        <text
          key="base-fret"
          x={padding - 10}
          y={padding - 15}
          textAnchor="end"
          fill="#2D1810"
          fontSize="14"
          fontFamily="Inter"
          fontWeight="600"
        >
          {baseFret}fr
        </text>
      );
    }

    return notes;
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer transition-transform hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(180deg, #DEB887 0%, #D2691E 50%, #8B4513 100%)',
        }}
        onClick={onPlay}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 50px,
                rgba(139, 69, 19, 0.3) 50px,
                rgba(139, 69, 19, 0.3) 51px
              )
            `,
          }}
        />
        
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          <rect
            x={padding - 20}
            y={padding - 20}
            width={width - padding * 2 + 40}
            height={height - padding * 2 + 40}
            rx={10}
            fill="#F5DEB3"
            opacity={0.3}
          />
          
          {renderFretMarkers()}
          {renderFrets()}
          {renderStrings()}
          {renderChordNotes()}
        </svg>
      </div>
      
      {chord && (
        <div className="mt-4 text-center">
          <h2 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {chord.name}
          </h2>
          <p className="text-amber-700 mt-1">
            {chord.rootNote} {chord.type === 'major' ? '大三和弦' : 
             chord.type === 'minor' ? '小三和弦' :
             chord.type === '7' ? '属七和弦' :
             chord.type === 'maj7' ? '大七和弦' :
             chord.type === 'm7' ? '小七和弦' :
             chord.type === 'dim' ? '减和弦' :
             chord.type === 'aug' ? '增和弦' :
             chord.type === 'sus2' ? '挂二和弦' :
             chord.type === 'sus4' ? '挂四和弦' : chord.type}
          </p>
        </div>
      )}
    </div>
  );
};
