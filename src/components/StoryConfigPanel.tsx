import React from 'react';
import { StoryType, Gender, Personality, Occupation, Scene, Protagonist } from '../types';

interface Props {
  storyType: StoryType;
  setStoryType: (type: StoryType) => void;
  protagonist: Protagonist;
  setProtagonist: (p: Protagonist) => void;
  scene: Scene;
  setScene: (scene: Scene) => void;
  onGenerate: () => void;
}

const storyTypes: StoryType[] = ['童话', '科幻', '奇幻', '推理', '言情'];
const genders: Gender[] = ['男', '女', '中性'];
const personalities: Personality[] = ['勇敢', '聪明', '温柔', '调皮', '冷静'];
const occupations: Occupation[] = ['学生', '侦探', '魔法师', '宇航员', '医生'];
const scenes: Scene[] = ['古城堡', '太空船', '校园', '街市', '火山'];

const typeColors: Record<StoryType, string> = {
  '童话': 'from-pink-400 to-rose-500',
  '科幻': 'from-blue-400 to-cyan-500',
  '奇幻': 'from-purple-400 to-violet-500',
  '推理': 'from-amber-400 to-orange-500',
  '言情': 'from-red-400 to-pink-500'
};

const sceneIcons: Record<Scene, string> = {
  '古城堡': '🏰',
  '太空船': '🚀',
  '校园': '🏫',
  '街市': '🏪',
  '火山': '🌋'
};

export const StoryConfigPanel: React.FC<Props> = ({
  storyType,
  setStoryType,
  protagonist,
  setProtagonist,
  scene,
  setScene,
  onGenerate
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">✨ 创建你的故事 ✨</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">📚 选择故事类型</h3>
        <div className="grid grid-cols-5 gap-3">
          {storyTypes.map(type => (
            <button
              key={type}
              onClick={() => setStoryType(type)}
              className={`py-4 px-4 rounded-xl font-medium transition-all transform hover:scale-105 ${
                storyType === type
                  ? `bg-gradient-to-r ${typeColors[type]} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">👤 主人公属性</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">性别</label>
            <div className="flex gap-2">
              {genders.map(g => (
                <button
                  key={g}
                  onClick={() => setProtagonist({ ...protagonist, gender: g })}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                    protagonist.gender === g
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">性格</label>
            <select
              value={protagonist.personality}
              onChange={(e) => setProtagonist({ ...protagonist, personality: e.target.value as Personality })}
              className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              {personalities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">职业</label>
            <select
              value={protagonist.occupation}
              onChange={(e) => setProtagonist({ ...protagonist, occupation: e.target.value as Occupation })}
              className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              {occupations.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">主角名字</label>
          <input
            type="text"
            value={protagonist.name}
            onChange={(e) => setProtagonist({ ...protagonist, name: e.target.value })}
            placeholder="给你的主角起个名字吧"
            className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">🌍 选择场景</h3>
        <div className="grid grid-cols-5 gap-3">
          {scenes.map(s => (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={`py-4 px-4 rounded-xl font-medium transition-all transform hover:scale-105 ${
                scene === s
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl block mb-1">{sceneIcons[s]}</span>
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
      >
        🎬 生成故事
      </button>
    </div>
  );
};
