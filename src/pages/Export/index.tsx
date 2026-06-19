import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Table2,
  Printer,
  CheckCircle,
  AlertTriangle,
  Users,
  Utensils,
  Wine,
  Leaf,
  Flame,
  Fish,
  TreePine,
  Moon,
  Copy,
  Check,
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import { useMemberStore } from '@/store/useMemberStore';
import { cn } from '@/lib/utils';
import { ALLERGY_OPTIONS, RELIGIOUS_DIET_OPTIONS, SPICINESS_OPTIONS } from '../../../shared/types';

export default function ExportCenter() {
  const { id } = useParams<{ id: string }>();
  const {
    currentPlan,
    seating,
    conflicts,
    fetchPlanById,
    getSeating,
    getConflicts,
    exportRestaurantList,
    exportTableCards,
    loading,
  } = usePlanStore();
  const { members, fetchMembers } = useMemberStore();

  const [activeTab, setActiveTab] = useState<'restaurant' | 'tablecards'>('restaurant');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPlanById(id);
      fetchMembers();
      getSeating(id);
    }
  }, [id, fetchPlanById, fetchMembers, getSeating]);

  useEffect(() => {
    if (id && seating?.tables) {
      getConflicts(id);
    }
  }, [id, seating, getConflicts]);

  const getMemberById = (memberId: string) => members.find((m) => m.id === memberId);

  const handleCopyToClipboard = async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generateRestaurantListText = () => {
    if (!currentPlan || !seating?.tables) return '';

    const allAssignedMembers = seating.tables.flatMap((t) =>
      t.memberIds.map(getMemberById).filter(Boolean) as Member[]
    );

    let text = `══════════════════════════════════════════\n`;
    text += `           餐厅忌口清单\n`;
    text += `══════════════════════════════════════════\n\n`;
    text += `活动名称：${currentPlan.name}\n`;
    text += `餐厅名称：${currentPlan.restaurant}\n`;
    text += `活动日期：${currentPlan.date}\n`;
    text += `总 桌 数：${currentPlan.totalTables}桌\n`;
    text += `总 人 数：${allAssignedMembers.length}人\n\n`;

    text += `──────────────────────────────────────────\n`;
    text += `一、全员饮食禁忌汇总\n`;
    text += `──────────────────────────────────────────\n\n`;

    const allergyCounts: Record<string, number> = {};
    const religiousCounts: Record<string, number> = {};
    let nonAlcoholCount = 0;

    allAssignedMembers.forEach((member) => {
      member.allergies.forEach((allergy) => {
        allergyCounts[allergy] = (allergyCounts[allergy] || 0) + 1;
      });
      if (member.religiousDiet) {
        religiousCounts[member.religiousDiet] = (religiousCounts[member.religiousDiet] || 0) + 1;
      }
      if (!member.drinksAlcohol) {
        nonAlcoholCount++;
      }
    });

    text += `【过敏源统计】\n`;
    Object.entries(allergyCounts).forEach(([key, count]) => {
      const option = ALLERGY_OPTIONS.find((o) => o.value === key);
      if (option) {
        text += `  • ${option.label}：${count}人\n`;
      }
    });
    if (Object.keys(allergyCounts).length === 0) {
      text += `  • 无\n`;
    }

    text += `\n【宗教/饮食禁忌统计】\n`;
    Object.entries(religiousCounts).forEach(([key, count]) => {
      const option = RELIGIOUS_DIET_OPTIONS.find((o) => o.value === key);
      if (option) {
        text += `  • ${option.label}：${count}人\n`;
      }
    });
    if (Object.keys(religiousCounts).length === 0) {
      text += `  • 无特殊要求\n`;
    }

    text += `\n【饮酒情况统计】\n`;
    text += `  • 不饮酒：${nonAlcoholCount}人\n`;
    text += `  • 可饮酒：${allAssignedMembers.length - nonAlcoholCount}人\n\n`;

    text += `──────────────────────────────────────────\n`;
    text += `二、菜品注意事项\n`;
    text += `──────────────────────────────────────────\n\n`;

    currentPlan.dishes.forEach((dish, index) => {
      const spicyOption = SPICINESS_OPTIONS.find((o) => o.value === dish.spiciness);
      text += `${index + 1}. ${dish.name} (¥${dish.price})\n`;
      text += `   辣度：${spicyOption?.label || '不辣'}\n`;
      const attributes = [];
      if (dish.hasSeafood) attributes.push('含海鲜');
      if (dish.hasNuts) attributes.push('含坚果');
      if (dish.isVegetarian) attributes.push('素食');
      if (attributes.length > 0) {
        text += `   属性：${attributes.join('、')}\n`;
      }
      if (dish.notes) {
        text += `   备注：${dish.notes}\n`;
      }
      text += `\n`;
    });

    text += `──────────────────────────────────────────\n`;
    text += `三、酒水配置\n`;
    text += `──────────────────────────────────────────\n\n`;
    text += `【含酒精饮品】\n`;
    if (currentPlan.drinks.alcoholic.length > 0) {
      currentPlan.drinks.alcoholic.forEach((d) => {
        text += `  • ${d}\n`;
      });
    } else {
      text += `  • 无\n`;
    }
    text += `\n【无酒精饮品】\n`;
    if (currentPlan.drinks.nonAlcoholic.length > 0) {
      currentPlan.drinks.nonAlcoholic.forEach((d) => {
        text += `  • ${d}\n`;
      });
    } else {
      text += `  • 无\n`;
    }

    text += `\n──────────────────────────────────────────\n`;
    text += `四、分桌禁忌详情\n`;
    text += `──────────────────────────────────────────\n\n`;

    seating.tables.forEach((table) => {
      const tableMembers = table.memberIds
        .map(getMemberById)
        .filter(Boolean) as Member[];

      text += `【${table.name}】(${tableMembers.length}人)\n`;

      const tableAllergies: Record<string, string[]> = {};
      const tableReligious: Record<string, string[]> = {};
      const tableNonAlcohol: string[] = [];

      tableMembers.forEach((member) => {
        member.allergies.forEach((allergy) => {
          if (!tableAllergies[allergy]) tableAllergies[allergy] = [];
          tableAllergies[allergy].push(member.name);
        });
        if (member.religiousDiet) {
          if (!tableReligious[member.religiousDiet]) tableReligious[member.religiousDiet] = [];
          tableReligious[member.religiousDiet].push(member.name);
        }
        if (!member.drinksAlcohol) {
          tableNonAlcohol.push(member.name);
        }
      });

      if (Object.keys(tableAllergies).length > 0) {
        text += `  过敏源：\n`;
        Object.entries(tableAllergies).forEach(([key, names]) => {
          const option = ALLERGY_OPTIONS.find((o) => o.value === key);
          if (option) {
            text += `    • ${option.label}：${names.join('、')}\n`;
          }
        });
      }

      if (Object.keys(tableReligious).length > 0) {
        text += `  宗教禁忌：\n`;
        Object.entries(tableReligious).forEach(([key, names]) => {
          const option = RELIGIOUS_DIET_OPTIONS.find((o) => o.value === key);
          if (option) {
            text += `    • ${option.label}：${names.join('、')}\n`;
          }
        });
      }

      if (tableNonAlcohol.length > 0) {
        text += `  不饮酒：${tableNonAlcohol.join('、')}\n`;
      }

      text += `\n`;
    });

    if (conflicts.length > 0) {
      text += `──────────────────────────────────────────\n`;
      text += `五、特别注意（存在冲突风险）\n`;
      text += `──────────────────────────────────────────\n\n`;

      conflicts.forEach((conflict, index) => {
        text += `${index + 1}. [${conflict.severity === 'high' ? '高风险' : conflict.severity === 'medium' ? '中风险' : '低风险'}] ${conflict.message}\n`;
        text += `   建议：${conflict.suggestion}\n\n`;
      });
    }

    text += `══════════════════════════════════════════\n`;
    text += `                 清单结束\n`;
    text += `══════════════════════════════════════════\n`;

    return text;
  };

  const generateTableCardsText = () => {
    if (!currentPlan || !seating?.tables) return '';

    let text = `══════════════════════════════════════════\n`;
    text += `           每桌桌签打印\n`;
    text += `══════════════════════════════════════════\n\n`;

    seating.tables.forEach((table, tableIndex) => {
      const tableMembers = table.memberIds
        .map(getMemberById)
        .filter(Boolean) as Member[];

      text += `┌────────────────────────────────────────┐\n`;
      text += `│           ${table.name}              │\n`;
      text += `├────────────────────────────────────────┤\n`;
      text += `│  本桌用餐注意事项：                    │\n`;

      const tableAllergies = new Set<string>();
      const tableReligious = new Set<string>();
      const tableNonAlcohol: string[] = [];

      tableMembers.forEach((member) => {
        member.allergies.forEach((a) => tableAllergies.add(a));
        if (member.religiousDiet) tableReligious.add(member.religiousDiet);
        if (!member.drinksAlcohol) tableNonAlcohol.push(member.name);
      });

      if (tableAllergies.size > 0) {
        const allergyLabels = Array.from(tableAllergies)
          .map((a) => ALLERGY_OPTIONS.find((o) => o.value === a)?.label)
          .filter(Boolean);
        text += `│  ⚠️  过敏源：${allergyLabels.join('、')}                  │\n`;
      }

      if (tableReligious.size > 0) {
        const religiousLabels = Array.from(tableReligious)
          .map((r) => RELIGIOUS_DIET_OPTIONS.find((o) => o.value === r)?.label)
          .filter(Boolean);
        text += `│  ✡️  宗教禁忌：${religiousLabels.join('、')}                │\n`;
      }

      if (tableNonAlcohol.length > 0) {
        text += `│  🍵  不饮酒：${tableNonAlcohol.length}人                    │\n`;
      }

      if (tableAllergies.size === 0 && tableReligious.size === 0 && tableNonAlcohol.length === 0) {
        text += `│  ✅  无特殊饮食禁忌                    │\n`;
      }

      text += `├────────────────────────────────────────┤\n`;
      text += `│  成员名单：                            │\n`;

      tableMembers.forEach((member) => {
        const tags = [];
        if (member.allergies.length > 0) tags.push('⚠️');
        if (member.religiousDiet) tags.push('✡️');
        if (!member.drinksAlcohol) tags.push('🍵');
        const tagStr = tags.length > 0 ? ` ${tags.join('')}` : '';
        text += `│    ${member.name}${tagStr}\n`;
      });

      text += `└────────────────────────────────────────┘\n`;

      if (tableIndex < seating.tables.length - 1) {
        text += `\n  ---  切  割  线  ---\n\n`;
      }
    });

    return text;
  };

  if (!currentPlan && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">方案不存在</p>
        <Link to="/plans" className="btn-primary mt-4">
          返回方案列表
        </Link>
      </div>
    );
  }

  const restaurantContent = generateRestaurantListText();
  const tableCardsContent = generateTableCardsText();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Link
            to={`/plans/${id}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            返回方案详情
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            导出中心
          </h1>
          <p className="text-slate-500">
            {currentPlan?.name} · {currentPlan?.restaurant}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="btn-secondary"
          >
            <Printer size={16} />
            打印
          </button>
          <button
            onClick={() => activeTab === 'restaurant' ? exportRestaurantList(id!) : exportTableCards(id!)}
            className="btn-primary"
            disabled={loading}
          >
            <Download size={16} />
            下载文件
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning-800 mb-1">
                存在冲突风险 ({conflicts.length}项)
              </h3>
              <p className="text-sm text-warning-700">
                导出的清单中已包含冲突提示，建议在导出前前往智能分桌页面调整。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('restaurant')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
            activeTab === 'restaurant'
              ? 'border-primary-400 bg-primary-50 text-primary-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          <FileText size={20} />
          <div className="text-left">
            <p className="font-semibold">餐厅忌口清单</p>
            <p className="text-xs opacity-75">全员饮食禁忌 + 菜品 + 分桌详情</p>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tablecards')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
            activeTab === 'tablecards'
              ? 'border-primary-400 bg-primary-50 text-primary-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          <Table2 size={20} />
          <div className="text-left">
            <p className="font-semibold">每桌桌签</p>
            <p className="text-xs opacity-75">可裁剪的每桌用餐注意事项</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {activeTab === 'restaurant' ? '餐厅忌口清单预览' : '每桌桌签预览'}
              </h3>
              <button
                onClick={() => {
                  const content = activeTab === 'restaurant' ? restaurantContent : tableCardsContent;
                  handleCopyToClipboard(content, activeTab);
                }}
                className="btn-secondary text-sm"
              >
                {copiedSection === activeTab ? (
                  <>
                    <Check size={14} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    复制内容
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 overflow-auto max-h-[70vh]">
              <pre className="text-slate-100 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {activeTab === 'restaurant' ? restaurantContent : tableCardsContent}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-primary-50 to-teal-50">
            <h3 className="font-display text-lg font-bold text-primary-700 mb-4">
              导出说明
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  餐厅清单包含全员饮食禁忌汇总、菜品注意事项、酒水配置、分桌禁忌详情
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  桌签可打印后裁剪，放置在每桌桌面上供服务员查看
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  所有内容可复制，方便粘贴到微信或邮件发送
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
              快速统计
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Users size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {seating?.tables.flatMap((t) => t.memberIds).length || 0}
                  </p>
                  <p className="text-xs text-slate-500">已分配人数</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
                  <Utensils size={18} className="text-danger-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {currentPlan?.dishes.length || 0}
                  </p>
                  <p className="text-xs text-slate-500">菜品数量</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-warning-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {conflicts.length}
                  </p>
                  <p className="text-xs text-slate-500">冲突项</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
              图例说明
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-red-500" />
                <span className="text-slate-600">辣度</span>
              </div>
              <div className="flex items-center gap-2">
                <Fish size={14} className="text-blue-500" />
                <span className="text-slate-600">海鲜</span>
              </div>
              <div className="flex items-center gap-2">
                <TreePine size={14} className="text-amber-500" />
                <span className="text-slate-600">坚果</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf size={14} className="text-emerald-500" />
                <span className="text-slate-600">素食</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon size={14} className="text-purple-500" />
                <span className="text-slate-600">宗教禁忌</span>
              </div>
              <div className="flex items-center gap-2">
                <Wine size={14} className="text-amber-600" />
                <span className="text-slate-600">酒精</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
