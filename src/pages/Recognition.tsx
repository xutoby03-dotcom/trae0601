import React from 'react';
import { ChordRecognition } from '../components/ChordRecognition';
import { Mic, Music } from 'lucide-react';

export const RecognitionPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
          <Mic className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          和弦识别
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          上传一段吉他录音，AI 将自动识别其中的和弦进行。
          <br />
          <span className="text-sm text-gray-500">(当前为模拟识别功能)</span>
        </p>
      </div>

      <ChordRecognition />

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <Music className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">支持格式</h3>
          <p className="text-sm text-gray-500">MP3, WAV, M4A, OGG</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <Mic className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">最长时长</h3>
          <p className="text-sm text-gray-500">5 分钟</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <Music className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">识别精度</h3>
          <p className="text-sm text-gray-500">和弦级别的标记</p>
        </div>
      </div>

      <div className="mt-8 bg-amber-50 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-900 mb-3">使用提示</h3>
        <ul className="text-sm text-amber-800 space-y-2">
          <li>• 上传清晰的吉他独奏录音，避免背景噪音</li>
          <li>• 建议每个和弦持续 2-3 秒，节奏稳定</li>
          <li>• 识别结果可以直接保存到你的收藏夹</li>
          <li>• 专业版支持实时录音识别和更复杂的和弦</li>
        </ul>
      </div>
    </div>
  );
};
