import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import { useFreezerStore, getExpiryStatus } from '../store';
import { SAMPLE_RECIPES, CATEGORY_LABELS, CATEGORY_TEXT_COLORS, Recipe } from '../types';
import { parseISO, differenceInDays } from 'date-fns';

interface MatchResult {
  recipe: Recipe;
  matched: { name: string; have: number; need: number; unit: string; itemId?: string }[];
  missing: { name: string; need: number; unit: string }[];
  matchPercent: number;
  canCook: boolean;
}

export default function RecipeLookup() {
  const navigate = useNavigate();
  const { items, addToEatList } = useFreezerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [customRecipe, setCustomRecipe] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'canCook' | 'needBuy'>('all');

  const lower = (s: string) => s.toLowerCase().trim();

  const findItemForIngredient = (ingredientName: string) => {
    const name = lower(ingredientName);
    return items
      .map((it) => {
        const itemName = lower(it.name);
        let score = 0;
        if (itemName === name) score = 100;
        else if (itemName.includes(name) || name.includes(itemName)) score = 70;
        else {
          const ingChars = name.split('');
          const matchCount = ingChars.filter((c) => itemName.includes(c)).length;
          score = (matchCount / Math.max(name.length, 1)) * 30;
        }
        return { item: it, score };
      })
      .filter((x) => x.score >= 25)
      .sort((a, b) => b.score - a.score)[0];
  };

  const matchRecipes = (recipes: Recipe[]): MatchResult[] => {
    return recipes
      .map((recipe) => {
        const matched: MatchResult['matched'] = [];
        const missing: MatchResult['missing'] = [];
        let score = 0;

        recipe.ingredients.forEach((ing) => {
          const found = findItemForIngredient(ing.name);
          if (found) {
            matched.push({
              name: ing.name,
              have: found.item.quantity,
              need: ing.amount,
              unit: ing.unit,
              itemId: found.item.id,
            });
            const haveRatio = Math.min(1, found.item.quantity / Math.max(ing.amount, 0.01));
            score += haveRatio;
          } else {
            missing.push({ name: ing.name, need: ing.amount, unit: ing.unit });
          }
        });

        const matchPercent =
          recipe.ingredients.length > 0
            ? Math.round((score / recipe.ingredients.length) * 100)
            : 0;

        return {
          recipe,
          matched,
          missing,
          matchPercent,
          canCook: missing.length === 0 && matched.every((m) => m.have >= m.need),
        };
      })
      .sort((a, b) => b.matchPercent - a.matchPercent);
  };

  const allMatches = useMemo(() => matchRecipes(SAMPLE_RECIPES), [items]);

  const filteredMatches = useMemo(() => {
    let list = allMatches;
    if (searchQuery.trim()) {
      const q = lower(searchQuery);
      list = list.filter((m) => lower(m.recipe.name).includes(q));
    }
    if (filterMode === 'canCook') list = list.filter((m) => m.canCook);
    if (filterMode === 'needBuy') list = list.filter((m) => !m.canCook && m.matchPercent > 30);
    return list;
  }, [allMatches, searchQuery, filterMode]);

  const parseCustomRecipe = (): Recipe | null => {
    const text = customRecipe.trim();
    if (!text) return null;
    const lines = text
      .split(/[\n,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return null;

    const ingredients = lines
      .map((line) => {
        const match = line.match(/^(.+?)\s*(\d*\.?\d+)\s*(.+?)?$/);
        if (match) {
          return {
            name: match[1].trim(),
            amount: Number(match[2]) || 1,
            unit: match[3]?.trim() || '份',
          };
        }
        return { name: line, amount: 1, unit: '份' };
      })
      .filter((i) => i.name);

    if (ingredients.length === 0) return null;
    return { name: '自定义菜谱', ingredients };
  };

  const customMatch = useMemo(() => {
    const r = parseCustomRecipe();
    return r ? matchRecipes([r])[0] : null;
  }, [customRecipe, items]);

  const handleAddAllToEat = (match: MatchResult) => {
    match.matched.forEach((m) => {
      if (m.itemId) addToEatList(m.itemId);
    });
  };

  const RecipeCard = ({ match }: { match: MatchResult }) => {
    const urgentIngs = match.matched.filter(
      (m) => m.itemId && getExpiryStatus(items.find((i) => i.id === m.itemId)?.expiryDate || '') !== 'normal'
    );

    return (
      <div
        className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
          match.canCook
            ? 'border-green-200 hover:shadow-md hover:-translate-y-0.5'
            : 'border-gray-100 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-800">{match.recipe.name}</h3>
              {match.canCook && (
                <span className="flex items-center gap-1 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                  <CheckCircle2 className="w-3 h-3" /> 能做
                </span>
              )}
              {urgentIngs.length > 0 && (
                <span className="text-[10px] bg-expiring-urgent text-white px-2 py-0.5 rounded-full font-bold">
                  ⚡ 消耗快过期
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-32">
                <div
                  className={`h-full rounded-full ${
                    match.canCook
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-orange-400 to-amber-500'
                  }`}
                  style={{ width: `${match.matchPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-600">{match.matchPercent}%</span>
            </div>
          </div>
          <div className="text-3xl">{match.canCook ? '🍳' : match.matchPercent > 50 ? '🥘' : '📝'}</div>
        </div>

        <div className="space-y-3 mb-4">
          {match.matched.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                已有食材
              </div>
              <div className="space-y-1.5">
                {match.matched.map((m, idx) => {
                  const item = items.find((i) => i.id === m.itemId);
                  const enough = m.have >= m.need;
                  const expStatus = item ? getExpiryStatus(item.expiryDate) : 'normal';
                  const daysLeft = item
                    ? differenceInDays(parseISO(item.expiryDate), new Date())
                    : 999;
                  return (
                    <div
                      key={idx}
                      onClick={() => m.itemId && navigate(`/item/${m.itemId}`)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        enough ? 'bg-green-50 hover:bg-green-100' : 'bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            enough ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                          }`}
                        >
                          ✓
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {m.name}
                          </div>
                          {item && (
                            <div
                              className={`text-[10px] ${CATEGORY_TEXT_COLORS[item.category]}`}
                            >
                              {CATEGORY_LABELS[item.category]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-sm font-bold ${
                            enough ? 'text-green-700' : 'text-amber-700'
                          }`}
                        >
                          {m.have}/{m.need}
                          <span className="text-xs font-normal ml-0.5">{m.unit}</span>
                        </div>
                        {expStatus !== 'normal' && daysLeft < 14 && (
                          <div className="text-[10px] text-expiring-urgent font-medium">
                            {daysLeft < 0 ? `过期${-daysLeft}天` : `剩${daysLeft}天`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {match.missing.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                需要购买
              </div>
              <div className="flex flex-wrap gap-1.5">
                {match.missing.map((m, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    🛒 {m.name}
                    <span className="text-gray-400">
                      {m.need}
                      {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {match.matched.some((m) => m.itemId) && (
            <button
              onClick={() => handleAddAllToEat(match)}
              className="flex-1 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              加入待吃清单
            </button>
          )}
          {match.missing.length > 0 && (
            <button className="py-2 px-3 rounded-xl bg-orange-50 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-colors">
              📋 复制购物单
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
          👨‍🍳 今晚吃什么？
        </h1>
        <p className="text-gray-500 mt-1 text-sm">输入菜名反查库存，看看冰箱里能做啥</p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-5 shadow-sm border border-orange-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800">自定义菜谱</div>
            <div className="text-xs text-gray-500">
              输入食材清单，每行一个（如：鸡胸肉300克，土豆2个）
            </div>
          </div>
        </div>
        <textarea
          value={customRecipe}
          onChange={(e) => setCustomRecipe(e.target.value)}
          rows={3}
          placeholder={"例如：\n鸡翅500克\n可乐1罐\n生抽适量"}
          className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/80 focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 outline-none text-sm transition-all resize-none"
        />
        {customMatch && (
          <div className="mt-4">
            <div className="text-xs font-bold text-gray-500 mb-2">库存匹配结果：</div>
            <RecipeCard match={customMatch} />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索菜谱名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
          {(['all', 'canCook', 'needBuy'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterMode === m
                  ? 'bg-freezer-accent text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m === 'all' ? '全部' : m === 'canCook' ? '✓ 能做的' : '🛒 差一点'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMatches.map((match, idx) => (
          <RecipeCard key={`${match.recipe.name}-${idx}`} match={match} />
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <div className="text-xl font-bold text-gray-700 mb-2">没有找到匹配的菜谱</div>
          <div className="text-gray-500 text-sm">试试在上方输入你想做的菜吧</div>
        </div>
      )}

      <div className="pb-4 text-center">
        <button
          onClick={() => navigate('/add')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-freezer-accent text-white font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          食材不够？添加新的
        </button>
      </div>
    </div>
  );
}
