import { useState } from 'react';
import { Hammer, Music, Speaker, PawPrint, Copy, Check, Volume2 } from 'lucide-react';
import type { NoiseType } from '@/types';

const SCRIPTS: Record<NoiseType, { title: string; content: string }[]> = {
  renovation: [
    { title: '友善提醒', content: '您好，我是楼下/隔壁的邻居，最近注意到您家在装修，理解装修的必要性，不过电钻声确实比较大，能否在休息时间暂停施工呢？感谢理解！' },
    { title: '委婉建议', content: '邻居您好！装修辛苦了，想跟您商量一下，能否把噪音大的工序安排在工作日的上午9点到12点、下午2点到6点呢？这样大家都能安心休息，谢谢！' },
    { title: '正式沟通', content: '您好，关于装修噪音的问题，小区规定施工时间为工作日8:00-12:00和14:00-18:00，周末及节假日禁止产生噪音的装修作业。希望您能遵守，感谢配合！' },
  ],
  singing: [
    { title: '友善提醒', content: '您好，不好意思打扰了，您唱歌真好听！不过现在有点晚了，声音可能会传到隔壁，能否稍微小声一点呢？谢谢您！' },
    { title: '委婉建议', content: '邻居您好，晚上在家唱歌可能不太方便，声音会通过楼板传到楼下和隔壁。建议使用耳机或者白天唱，感谢理解！' },
    { title: '正式沟通', content: '您好，根据《环境噪声污染防治法》，夜间（22:00-次日6:00）产生噪音干扰他人正常生活的，属于违法行为。希望您能控制夜间活动音量，谢谢配合。' },
  ],
  speaker: [
    { title: '友善提醒', content: '阿姨/叔叔您好，广场舞跳得真棒！不过音响声音稍微有点大，附近有住户需要休息，能否调低一点音量呢？大家互相体谅，谢谢！' },
    { title: '委婉建议', content: '您好！理解大家锻炼的需求，不过大功率音响确实会影响周围居民。建议使用蓝牙音箱近距离收听，或者调到适中音量，这样既能锻炼又不影响邻居。' },
    { title: '正式沟通', content: '各位居民，根据小区管理规定，公共区域使用音响设备需控制在合理音量范围内（日间55分贝以下），夜间禁止使用。请大家自觉遵守，共同维护良好的居住环境。' },
  ],
  pet: [
    { title: '友善提醒', content: '您好，我是隔壁/楼下的邻居，您家的宠物可能有点不安，叫声偶尔会传过来。不知道有没有什么我们可以帮忙的？希望宠物也安好！' },
    { title: '委婉建议', content: '邻居您好，宠物叫声可能会影响到周围住户的休息。建议可以尝试一些方法：比如增加陪伴时间、使用安抚玩具、或者咨询宠物行为专家，希望能有所帮助。' },
    { title: '正式沟通', content: '您好，根据《治安管理处罚法》，饲养动物干扰他人正常生活的，处警告或罚款。希望您能妥善管理宠物，避免噪音扰民，感谢配合。' },
  ],
  other: [
    { title: '友善提醒', content: '您好，我是您的邻居，最近注意到一些噪音，可能您不太注意，能否稍微注意一下音量呢？互相体谅，谢谢！' },
    { title: '委婉建议', content: '邻居您好，想跟您沟通一下噪音的事情，建议在晚间和清晨注意控制活动声响，这样大家都能有个安静的环境，感谢理解！' },
    { title: '正式沟通', content: '您好，关于噪音问题已经多次影响到正常生活，希望您能重视并改善。如果问题持续，可能需要物业或相关部门介入协调，希望能友好解决。' },
  ],
};

const TAB_CONFIG: { key: NoiseType; icon: React.ReactNode }[] = [
  { key: 'renovation', icon: <Hammer size={18} /> },
  { key: 'singing', icon: <Music size={18} /> },
  { key: 'speaker', icon: <Speaker size={18} /> },
  { key: 'pet', icon: <PawPrint size={18} /> },
  { key: 'other', icon: <Volume2 size={18} /> },
];

export default function Scripts() {
  const [activeTab, setActiveTab] = useState<NoiseType>('renovation');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex border-b border-gray-200">
        {TAB_CONFIG.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm border-b-2 transition-colors ${
              activeTab === key
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {SCRIPTS[activeTab].map((script, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{script.title}</h3>
              <button
                onClick={() => handleCopy(script.content, index)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-teal-600 transition-colors"
              >
                {copiedIndex === index ? (
                  <Check size={16} className="text-teal-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{script.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
