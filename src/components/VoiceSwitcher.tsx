import React from 'react';
import { VoiceType, VOICE_COLORS } from '../types/score';

interface VoiceSwitcherProps {
  activeVoice: VoiceType;
  onVoiceChange: (voice: VoiceType) => void;
}

export const VoiceSwitcher: React.FC<VoiceSwitcherProps> = ({
  activeVoice,
  onVoiceChange,
}) => {
  const voices: { type: VoiceType; label: string; color: string }[] = [
    { type: 'melody', label: '主旋律', color: VOICE_COLORS.melody },
    { type: 'harmony', label: '和声', color: VOICE_COLORS.harmony },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">声部：</span>
      <div className="flex gap-1">
        {voices.map((voice) => (
          <button
            key={voice.type}
            onClick={() => onVoiceChange(voice.type)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all border-2 ${
              activeVoice === voice.type
                ? 'text-white shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: activeVoice === voice.type ? voice.color : undefined,
              borderColor: activeVoice === voice.type ? voice.color : undefined,
            }}
          >
            {voice.label}
          </button>
        ))}
      </div>
    </div>
  );
};
