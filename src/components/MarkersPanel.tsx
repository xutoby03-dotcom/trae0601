import { Flag, Trash2, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useAudioStore } from '@/store/audioStore';
import { formatTime } from '@/utils/audioAnalyzer';
import { useAudioEngine } from '@/hooks/useAudioEngine';

const MarkersPanel = () => {
  const { markers, removeMarker, updateMarker } = useAudioStore();
  const { seekTo } = useAudioEngine();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleEdit = (id: string, currentLabel: string) => {
    setEditingId(id);
    setEditLabel(currentLabel);
  };

  const handleSaveEdit = (id: string) => {
    if (editLabel.trim()) {
      updateMarker(id, { label: editLabel.trim() });
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleJumpToMarker = (time: number) => {
    seekTo(time);
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <Flag className="w-5 h-5 text-amber-400" />
        标记点
        <span className="text-xs text-gray-500 font-normal">({markers.length})</span>
      </h3>

      {markers.length === 0 ? (
        <div className="text-center py-8">
          <Flag className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">暂无标记</p>
          <p className="text-gray-600 text-xs mt-1">播放时点击 ⚑ 按钮添加标记</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {markers.map((marker) => (
            <div
              key={marker.id}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: marker.color }}
              />
              
              {editingId === marker.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white/10 rounded text-sm text-white border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(marker.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(marker.id)}
                    className="p-1 text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleJumpToMarker(marker.time)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm text-white">{marker.label}</div>
                    <div className="text-xs text-gray-500 font-mono">{formatTime(marker.time)}</div>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(marker.id, marker.label)}
                      className="p-1.5 text-gray-500 hover:text-cyan-400 rounded-lg hover:bg-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeMarker(marker.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarkersPanel;
