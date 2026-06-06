import { Clock, Gauge, Radio, Headphones, FileAudio, Activity } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';
import { formatTime, formatFileSize } from '@/utils/audioAnalyzer';

const InfoPanel = () => {
  const { audioInfo, currentTime } = useAudioStore();

  if (!audioInfo) {
    return (
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          音频信息
        </h3>
        <div className="text-center py-8">
          <FileAudio className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">上传音频文件或开始录音</p>
        </div>
      </div>
    );
  }

  const items = [
    { icon: FileAudio, label: '文件名', value: audioInfo.fileName, color: 'text-cyan-400' },
    { icon: Clock, label: '时长', value: formatTime(audioInfo.duration), color: 'text-purple-400' },
    { icon: Activity, label: '当前播放', value: formatTime(currentTime), color: 'text-emerald-400' },
    { icon: Radio, label: '采样率', value: `${audioInfo.sampleRate} Hz`, color: 'text-pink-400' },
    { icon: Headphones, label: '声道', value: audioInfo.numberOfChannels === 1 ? '单声道' : '立体声', color: 'text-amber-400' },
    { icon: Gauge, label: 'BPM', value: audioInfo.bpm ? `${audioInfo.bpm}` : '检测中...', color: 'text-rose-400' },
    { icon: FileAudio, label: '文件大小', value: formatFileSize(audioInfo.fileSize), color: 'text-indigo-400' },
  ];

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" />
        音频信息
      </h3>
      <div className="space-y-3">
        {items.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-400">{label}</span>
            </div>
            <span className="text-sm font-medium text-white truncate max-w-[150px]" title={value}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
