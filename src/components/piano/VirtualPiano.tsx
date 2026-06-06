import { useState, useCallback } from 'react';
import { playNote, midiToNoteName, resumeAudioContext } from '@/utils/audio';
import { cn } from '@/lib/utils';

interface PianoKeyProps {
  midi: number;
  isBlack: boolean;
  isPressed: boolean;
  isHighlighted?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  onPress: (midi: number) => void;
}

const PianoKey = ({
  midi,
  isBlack,
  isPressed,
  isHighlighted,
  isCorrect,
  isWrong,
  onPress,
}: PianoKeyProps) => {
  const baseClasses = isBlack
    ? 'absolute z-10 -mx-[18px] w-9 h-28 rounded-b-md transition-all duration-75'
    : 'relative w-14 h-44 rounded-b-lg border border-slate-300 transition-all duration-75';

  const colorClasses = isBlack
    ? isCorrect
      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
      : isWrong
      ? 'bg-red-500 shadow-lg shadow-red-500/50'
      : isPressed || isHighlighted
      ? 'bg-violet-500 shadow-lg shadow-violet-500/50'
      : 'bg-slate-800 hover:bg-slate-700'
    : isCorrect
    ? 'bg-emerald-400 shadow-inner'
    : isWrong
    ? 'bg-red-400 shadow-inner'
    : isPressed || isHighlighted
    ? 'bg-violet-300 shadow-inner'
    : 'bg-white hover:bg-slate-100';

  return (
    <button
      className={cn(baseClasses, colorClasses, 'focus:outline-none active:scale-[0.98]')}
      onClick={async () => {
        await resumeAudioContext();
        onPress(midi);
      }}
      title={midiToNoteName(midi)}
    />
  );
};

interface VirtualPianoProps {
  startMidi?: number;
  endMidi?: number;
  highlightedNotes?: number[];
  correctNotes?: number[];
  wrongNotes?: number[];
  onKeyPress?: (midi: number) => void;
  disabled?: boolean;
}

export const VirtualPiano = ({
  startMidi = 48,
  endMidi = 72,
  highlightedNotes = [],
  correctNotes = [],
  wrongNotes = [],
  onKeyPress,
  disabled = false,
}: VirtualPianoProps) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  const whiteKeys: number[] = [];
  const blackKeys: number[] = [];

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const note = midi % 12;
    if ([1, 3, 6, 8, 10].includes(note)) {
      blackKeys.push(midi);
    } else {
      whiteKeys.push(midi);
    }
  }

  const handlePress = useCallback(
    (midi: number) => {
      if (disabled) return;

      playNote(midi, 0.5, 0.5);

      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(midi);
        return next;
      });

      setTimeout(() => {
        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.delete(midi);
          return next;
        });
      }, 150);

      onKeyPress?.(midi);
    },
    [disabled, onKeyPress]
  );

  return (
    <div className="relative inline-flex select-none">
      <div className="flex">
        {whiteKeys.map((midi) => (
          <PianoKey
            key={midi}
            midi={midi}
            isBlack={false}
            isPressed={pressedKeys.has(midi)}
            isHighlighted={highlightedNotes.includes(midi)}
            isCorrect={correctNotes.includes(midi)}
            isWrong={wrongNotes.includes(midi)}
            onPress={handlePress}
          />
        ))}
      </div>
      <div className="absolute top-0 left-0 flex">
        {whiteKeys.map((whiteMidi, index) => {
          const nextBlack = blackKeys.find(
            (b) => b > whiteMidi && b < (whiteKeys[index + 1] || Infinity)
          );
          if (!nextBlack) return <div key={`spacer-${whiteMidi}`} className="w-14" />;

          return (
            <div key={`group-${whiteMidi}`} className="w-14 relative">
              <div className="absolute left-full -translate-x-1/2 top-0">
                <PianoKey
                  midi={nextBlack}
                  isBlack={true}
                  isPressed={pressedKeys.has(nextBlack)}
                  isHighlighted={highlightedNotes.includes(nextBlack)}
                  isCorrect={correctNotes.includes(nextBlack)}
                  isWrong={wrongNotes.includes(nextBlack)}
                  onPress={handlePress}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
