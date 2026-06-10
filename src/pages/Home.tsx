import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePetStore } from '@/store/usePetStore';
import { PetCard } from '@/components/PetCard';
import { GroupBadge } from '@/components/StatusBadge';
import type { GroupType } from '@/types';

const groups: GroupType[] = ['recent', 'seen', 'found', 'urgent'];

const emptyStateText: Record<GroupType, { title: string; description: string }> = {
  recent: { title: '最近没有走失的宠物', description: '太好了！社区里的宠物都很安全。' },
  seen: { title: '暂无最新线索', description: '如果您看到走失的宠物，请及时提供线索。' },
  found: { title: '还没有找回记录', description: '希望所有走失的宠物都能早日回家。' },
  urgent: { title: '没有需要重点扩散的协寻', description: '请持续关注，帮助更多宠物回家。' },
};

export function Home() {
  const currentGroup = usePetStore((state) => state.currentGroup);
  const setCurrentGroup = usePetStore((state) => state.setCurrentGroup);
  const getGroupedPets = usePetStore((state) => state.getGroupedPets);
  const petMissing = usePetStore((state) => state.petMissing);

  const groupedPets = getGroupedPets();
  const currentPets = groupedPets[currentGroup];

  const groupCounts = {
    recent: groupedPets.recent.length,
    seen: groupedPets.seen.length,
    found: groupedPets.found.length,
    urgent: groupedPets.urgent.length,
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          🐾 社区宠物协寻平台
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          帮助走失的宠物早日回家。发布协寻、提供线索，让我们一起守护毛孩子。
        </p>
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{petMissing.length}</p>
            <p className="text-sm text-gray-500">协寻总数</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">{groupedPets.found.length}</p>
            <p className="text-sm text-gray-500">已找回</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{groupedPets.urgent.length}</p>
            <p className="text-sm text-gray-500">紧急协寻</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {groups.map((group) => (
          <div key={group} className="relative flex-shrink-0">
            <GroupBadge
              group={group}
              active={currentGroup === group}
              onClick={() => setCurrentGroup(group)}
            />
            {groupCounts[group] > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {groupCounts[group]}
              </span>
            )}
          </div>
        ))}
      </div>

      {currentPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🐾</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyStateText[currentGroup].title}
          </h3>
          <p className="text-gray-500">
            {emptyStateText[currentGroup].description}
          </p>
        </div>
      )}

      <Link
        to="/publish"
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-full shadow-lg shadow-orange-200 flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  );
}
