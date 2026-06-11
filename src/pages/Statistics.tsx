import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, XCircle, Pill, PawPrint, Calendar } from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import { addDays, getTodayStr, diffDays } from '@/utils/date';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#96CEB4'];

export default function Statistics() {
  const pets = useAppStore(state => state.pets);
  const medicines = useAppStore(state => state.medicines);
  const feedingRecords = useAppStore(state => state.feedingRecords);
  const getPetById = useAppStore(state => state.getPetById);

  const stats = useMemo(() => {
    const totalFed = feedingRecords.filter(r => r.status === 'fed').length;
    const totalMissed = feedingRecords.filter(r => r.status === 'missed').length;
    const totalSkipped = feedingRecords.filter(r => r.status === 'skipped').length;
    const totalPending = feedingRecords.filter(r => r.status === 'pending').length;
    const total = totalFed + totalMissed + totalSkipped;
    const completionRate = total > 0 ? ((totalFed / (totalFed + totalMissed)) * 100).toFixed(1) : '0';

    const petStats = pets.map(pet => {
      const petMedicines = medicines.filter(m => m.petId === pet.id);
      const petMedicineIds = petMedicines.map(m => m.id);
      const petRecords = feedingRecords.filter(r => petMedicineIds.includes(r.medicineId));
      const fed = petRecords.filter(r => r.status === 'fed').length;
      const missed = petRecords.filter(r => r.status === 'missed').length;
      
      return {
        name: pet.name,
        用药种类: petMedicines.length,
        已喂次数: fed,
        漏喂次数: missed,
        photo: pet.photo,
      };
    }).sort((a, b) => b.用药种类 - a.用药种类);

    const medicineProgress = medicines.map(med => {
      const totalDoses = med.frequency * med.durationDays;
      const fedDoses = feedingRecords.filter(
        r => r.medicineId === med.id && r.status === 'fed'
      ).length;
      const pet = getPetById(med.petId);
      const progress = totalDoses > 0 ? Math.min(100, (fedDoses / totalDoses) * 100) : 0;
      
      return {
        name: med.name,
        pet: pet?.name || '',
        progress: Math.round(progress),
        完成率: Math.round(progress),
      };
    });

    const today = getTodayStr();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayRecords = feedingRecords.filter(r => r.date === date);
      const fed = dayRecords.filter(r => r.status === 'fed').length;
      const missed = dayRecords.filter(r => r.status === 'missed').length;
      last7Days.push({
        date: date.slice(5),
        已喂: fed,
        漏喂: missed,
      });
    }

    const reactionStats = [
      { name: '正常', value: feedingRecords.filter(r => r.status === 'fed' && r.reaction === 'normal').length },
      { name: '食欲好', value: feedingRecords.filter(r => r.status === 'fed' && r.reaction === 'good-appetite').length },
      { name: '精神差', value: feedingRecords.filter(r => r.status === 'fed' && r.reaction === 'low-spirit').length },
      { name: '呕吐', value: feedingRecords.filter(r => r.status === 'fed' && r.reaction === 'vomiting').length },
      { name: '其他', value: feedingRecords.filter(r => r.status === 'fed' && r.reaction === 'other').length },
    ].filter(r => r.value > 0);

    return {
      totalFed,
      totalMissed,
      totalSkipped,
      totalPending,
      completionRate,
      petStats,
      medicineProgress,
      last7Days,
      reactionStats,
    };
  }, [pets, medicines, feedingRecords, getPetById]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          数据统计 📊
        </h1>
        <p className="text-gray-500 mt-1">
          看看喂药情况如何~
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">{stats.completionRate}%</div>
          <div className="text-sm text-white/80 mt-1">完成率</div>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <Pill className="w-5 h-5" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">{stats.totalFed}</div>
          <div className="text-sm text-white/80 mt-1">累计喂药</div>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-400 text-white shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">{stats.totalMissed}</div>
          <div className="text-sm text-white/80 mt-1">累计漏喂</div>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-400 text-white shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <PawPrint className="w-5 h-5" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">{pets.length}</div>
          <div className="text-sm text-white/80 mt-1">宠物数量</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-orange-50">
        <h2 className="text-lg font-bold text-gray-800 mb-4">近7天喂药情况</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="已喂" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="漏喂" fill="#F87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-orange-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">疗程完成率</h2>
          <div className="space-y-4">
            {stats.medicineProgress.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无数据</p>
            ) : (
              stats.medicineProgress.map((med, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">
                      {med.name}
                      <span className="text-gray-400 ml-2">({med.pet})</span>
                    </span>
                    <span className="text-orange-500 font-bold">{med.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all duration-500"
                      style={{ width: `${med.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-orange-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">用药排行</h2>
          {stats.petStats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {stats.petStats.map((pet, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl font-bold text-white flex items-center justify-center"
                    style={{
                      background: index === 0
                        ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                        : index === 1
                        ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'
                        : 'linear-gradient(135deg, #CD7F32, #B8860B)'
                    }}
                  >
                    {index + 1}
                  </div>
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{pet.name}</h4>
                    <p className="text-xs text-gray-500">
                      {pet.用药种类} 种药 · 已喂 {pet.已喂次数} 次
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-500">{pet.用药种类}</div>
                    <div className="text-xs text-gray-400">种</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats.reactionStats.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-orange-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">喂药反应分布</h2>
          <div className="flex items-center">
            <div className="w-1/2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.reactionStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.reactionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {stats.reactionStats.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-bold text-gray-800 ml-auto">{item.value}次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-orange-50">
        <h2 className="text-lg font-bold text-gray-800 mb-4">漏喂统计</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-rose-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <span className="font-medium text-rose-700">总漏喂次数</span>
            </div>
            <div className="text-3xl font-bold text-rose-500">{stats.totalMissed}</div>
            <p className="text-xs text-rose-400 mt-1">记得及时补喂哦~</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-emerald-700">总喂药次数</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500">{stats.totalFed}</div>
            <p className="text-xs text-emerald-400 mt-1">继续加油！</p>
          </div>
        </div>
      </div>
    </div>
  );
}
