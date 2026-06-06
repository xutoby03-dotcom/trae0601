import { forwardRef } from 'react';
import type { TestResult } from '@/types';
import { typeDetails } from '@/data/typeDetails';
import RadarChart from './RadarChart';

interface ShareCardProps {
  result: TestResult;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ result }, ref) => {
  const detail = typeDetails[result.type];

  return (
    <div
      ref={ref}
      className="w-[375px] bg-gradient-to-br from-mbti-purple via-mbti-blue to-mbti-deep p-8 rounded-3xl relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-40 h-40 bg-neon-pink rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-neon-cyan rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="text-white/60 text-sm mb-2">✨ MBTI 性格测试结果 ✨</div>
          <div
            className="text-6xl font-display font-bold mb-2"
            style={{ color: detail.color, textShadow: `0 0 30px ${detail.color}60` }}
          >
            {result.type}
          </div>
          <div className="text-white text-xl font-semibold">{detail.name}</div>
          <div className="text-white/60 text-sm mt-1">「{detail.nickname}」</div>
        </div>

        <div className="glass-card p-4 mb-6">
          <p className="text-white/80 text-sm leading-relaxed">
            {detail.description}
          </p>
        </div>

        <div className="mb-6">
          <RadarChart result={result} color={detail.color} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card p-3 text-center">
            <div className="text-neon-pink text-lg font-bold">
              {result.percentages.EI}%
            </div>
            <div className="text-white/50 text-xs">E 外向</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-neon-cyan text-lg font-bold">
              {result.percentages.SN}%
            </div>
            <div className="text-white/50 text-xs">S 感觉</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-neon-purple text-lg font-bold">
              {result.percentages.TF}%
            </div>
            <div className="text-white/50 text-xs">T 思考</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-neon-green text-lg font-bold">
              {result.percentages.JP}%
            </div>
            <div className="text-white/50 text-xs">J 判断</div>
          </div>
        </div>

        <div className="text-center text-white/40 text-xs">
          长按保存图片 · 分享给朋友
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
