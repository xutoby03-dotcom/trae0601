import { Link } from 'react-router-dom';
import { PlusCircle, Users, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';
import SafetyBanner from '@/components/SafetyBanner';
import TeamCard from '@/components/TeamCard';
import type { Team } from '@/types';

export default function Home() {
  const { teams } = useTeamStore();

  const recruitingTeams = teams.filter((t) => t.status === 'recruiting');
  const lockedTeams = teams.filter((t) => t.status === 'locked');
  const completedTeams = teams.filter((t) => t.status === 'completed');

  const soonStartingTeams = recruitingTeams
    .filter((t) => t.totalPeople - t.members.length <= 2)
    .sort((a, b) => (b.totalPeople - b.members.length) - (a.totalPeople - a.members.length));

  const needMorePeopleTeams = recruitingTeams
    .filter((t) => t.totalPeople - t.members.length > 2)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const renderTeamGroup = (title: string, icon: typeof Users, teams: Team[], emptyText: string, accentColor: string) => {
    const Icon = icon;
    return (
      <section className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${accentColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="font-display text-xl text-gold-300">{title}</h2>
          <span className="text-midnight-500 text-sm font-serif">({teams.length})</span>
        </div>

        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team, idx) => (
              <div key={team.id} style={{ animationDelay: `${idx * 0.08}s` }} className="animate-fade-in-up">
                <TeamCard team={team} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-dark p-8 text-center">
            <p className="text-midnight-400 font-serif">{emptyText}</p>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wine-900/30 border border-gold-600/20 mb-5">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span className="text-gold-300 font-serif text-sm">找对队友，密室更精彩</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-gold-400 mb-4 tracking-wide">
          密境集结
        </h1>
        <p className="text-midnight-300 font-serif text-lg max-w-xl mx-auto">
          恐怖本？推理本？机关本？先说清楚，再组队出发。
        </p>
        <Link
          to="/create"
          className="btn-gold inline-flex items-center gap-2 mt-6 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <PlusCircle className="w-5 h-5" />
          发起新组队
        </Link>
      </div>

      <SafetyBanner />

      {renderTeamGroup(
        '快开场了',
        Clock,
        soonStartingTeams,
        '暂无即将成团的队伍',
        'bg-wine-900/40 border-wine-600/40 text-wine-300'
      )}

      {renderTeamGroup(
        '还缺人',
        Users,
        needMorePeopleTeams,
        '暂无招募中的队伍，快来发起第一个吧！',
        'bg-midnight-700/40 border-midnight-500/40 text-midnight-200'
      )}

      {renderTeamGroup(
        '已成团',
        CheckCircle2,
        [...lockedTeams, ...completedTeams],
        '暂无已锁团的队伍',
        'bg-gold-900/30 border-gold-600/40 text-gold-300'
      )}
    </div>
  );
}
