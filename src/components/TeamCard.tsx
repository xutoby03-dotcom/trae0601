import { Link } from 'react-router-dom';
import { Users, Clock, Coins, Star } from 'lucide-react';
import type { Team } from '@/types';
import {
  THEME_TYPE_LABELS,
  DIFFICULTY_LABELS,
  HORROR_LEVEL_LABELS,
  TEAM_STATUS_LABELS,
} from '@/types';

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  const remaining = team.totalPeople - team.members.length;
  const isLocked = team.status === 'locked';
  const isCompleted = team.status === 'completed';

  const statusBadgeClass = isCompleted
    ? 'bg-midnight-600 text-midnight-200 border-midnight-500'
    : isLocked
    ? 'bg-gold-900/50 text-gold-300 border-gold-600 animate-glow-pulse'
    : remaining > 0 && remaining <= 2
    ? 'bg-wine-900/50 text-wine-300 border-wine-600'
    : 'bg-midnight-700/50 text-midnight-200 border-midnight-500';

  return (
    <Link
      to={`/team/${team.id}`}
      className="card-dark p-5 block group hover:shadow-gold-glow animate-fade-in-up"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
          <span className="badge bg-midnight-800 text-gold-300 border border-gold-600/30">
            {THEME_TYPE_LABELS[team.themeType]}
          </span>
          <span className={`badge border ${statusBadgeClass}`}>
            {isCompleted
              ? TEAM_STATUS_LABELS[team.status]
              : isLocked
              ? `🔒 ${TEAM_STATUS_LABELS[team.status]}`
              : `缺 ${remaining} 人`}
          </span>
        </div>
        <h3 className="font-display text-xl text-gold-200 group-hover:text-gold-400 transition-colors duration-300 truncate">
          {team.themeName}
        </h3>
        <p className="text-sm text-midnight-400 font-serif mt-1">{team.shopName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-midnight-400 text-xs font-serif">
        <Users className="w-3.5 h-3.5" />
        <span>
          {team.members.length}/{team.totalPeople} 人
        </span>
        <span className="mx-1">·</span>
        <Clock className="w-3.5 h-3.5" />
        <span>{team.duration} 分钟</span>
        <span className="mx-1">·</span>
        <Coins className="w-3.5 h-3.5" />
        <span>¥{team.price}/人</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-xs font-serif text-midnight-400 bg-midnight-800/70 px-2 py-1 rounded">
          {DIFFICULTY_LABELS[team.difficulty]}
        </span>
        <span className="text-xs font-serif text-midnight-400 bg-midnight-800/70 px-2 py-1 rounded">
          {HORROR_LEVEL_LABELS[team.horrorLevel]}
        </span>
        {team.review && (
          <span className="text-xs font-serif text-gold-400 bg-gold-900/30 px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-gold-400" />
            {team.review.rating}
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gold-600/10">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((member) => (
              <div
                key={member.id}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-wine-700 to-wine-900 border-2 border-midnight-900 flex items-center justify-center text-xs font-serif text-gold-200"
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {team.members.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-midnight-700 border-2 border-midnight-900 flex items-center justify-center text-xs font-serif text-midnight-300">
                +{team.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-midnight-500 font-serif">
            {team.availableTimes[0] || '时间待定'}
          </span>
        </div>
      </div>
    </Link>
  );
}
