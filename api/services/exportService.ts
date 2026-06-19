import type { Member, Plan, Table } from '../../shared/types.js';
import { getAllMembers } from './memberService.js';

export async function generateRestaurantList(plan: Plan, tables: Table[]): Promise<string> {
  const members = await getAllMembers();
  const memberMap = new Map(members.map(m => [m.id, m]));

  const allTableMembers = tables.flatMap(t => t.memberIds)
    .map(id => memberMap.get(id))
    .filter((m): m is Member => m !== undefined);

  const allergies = new Map<string, Member[]>();
  const religiousDiets = new Map<string, Member[]>();
  const nonDrinkers: Member[] = [];

  allTableMembers.forEach(member => {
    member.allergies.forEach(allergy => {
      if (!allergies.has(allergy)) allergies.set(allergy, []);
      allergies.get(allergy)!.push(member);
    });
    if (member.religiousDiet) {
      if (!religiousDiets.has(member.religiousDiet)) religiousDiets.set(member.religiousDiet, []);
      religiousDiets.get(member.religiousDiet)!.push(member);
    }
    if (!member.drinksAlcohol) {
      nonDrinkers.push(member);
    }
  });

  const allergyLabels: Record<string, string> = {
    seafood: '海鲜',
    nuts: '坚果',
    spicy: '辣',
    dairy: '乳制品',
    gluten: '麸质',
    soy: '大豆',
    eggs: '鸡蛋',
  };

  const religiousLabels: Record<string, string> = {
    halal: '清真',
    vegetarian: '素食',
    vegan: '纯素',
    hindu: '印度教（不食牛肉）',
    jewish: '犹太洁食',
  };

  let content = `========================================\n`;
  content += `        餐厅忌口清单\n`;
  content += `========================================\n\n`;
  content += `活动名称：${plan.name}\n`;
  content += `餐厅：${plan.restaurant}\n`;
  content += `日期：${plan.date}\n`;
  content += `总人数：${allTableMembers.length}人\n`;
  content += `总桌数：${plan.totalTables}桌\n\n`;
  content += `----------------------------------------\n`;
  content += `             菜品清单\n`;
  content += `----------------------------------------\n\n`;

  plan.dishes.forEach((dish, index) => {
    const tags = [];
    if (dish.spiciness !== 'none') tags.push(['none', 'mild', 'medium', 'hot'].includes(dish.spiciness) ? 
      dish.spiciness === 'mild' ? '微辣' : dish.spiciness === 'medium' ? '中辣' : '特辣' : '');
    if (dish.hasSeafood) tags.push('海鲜');
    if (dish.hasNuts) tags.push('坚果');
    if (dish.isVegetarian) tags.push('素食');
    
    content += `${index + 1}. ${dish.name} - ¥${dish.price}`;
    if (tags.length > 0) content += ` [${tags.join('、')}]`;
    if (dish.notes) content += ` (${dish.notes})`;
    content += '\n';
  });

  const totalDishPrice = plan.dishes.reduce((sum, d) => sum + d.price, 0);
  content += `\n菜品总价：¥${totalDishPrice}\n`;
  content += `预算：¥${plan.budget}\n\n`;

  content += `----------------------------------------\n`;
  content += `             酒水配置\n`;
  content += `----------------------------------------\n\n`;
  content += `含酒精：${plan.drinks.alcoholic.join('、') || '无'}\n`;
  content += `无酒精：${plan.drinks.nonAlcoholic.join('、') || '无'}\n\n`;

  content += `----------------------------------------\n`;
  content += `             忌口汇总\n`;
  content += `----------------------------------------\n\n`;

  if (allergies.size > 0) {
    content += `【过敏源】\n`;
    allergies.forEach((members, allergy) => {
      content += `  ${allergyLabels[allergy] || allergy}：${members.map(m => m.name).join('、')} (${members.length}人)\n`;
    });
    content += '\n';
  }

  if (religiousDiets.size > 0) {
    content += `【宗教/饮食禁忌】\n`;
    religiousDiets.forEach((members, diet) => {
      content += `  ${religiousLabels[diet] || diet}：${members.map(m => m.name).join('、')} (${members.length}人)\n`;
    });
    content += '\n';
  }

  if (nonDrinkers.length > 0) {
    content += `【不饮酒】\n`;
    content += `  ${nonDrinkers.map(m => m.name).join('、')} (${nonDrinkers.length}人)\n\n`;
  }

  content += `----------------------------------------\n`;
  content += `             每桌详情\n`;
  content += `----------------------------------------\n\n`;

  tables.forEach(table => {
    const tableMembers = table.memberIds
      .map(id => memberMap.get(id))
      .filter((m): m is Member => m !== undefined);

    content += `${table.name} (${tableMembers.length}人)\n`;
    content += `  成员：${tableMembers.map(m => m.name).join('、')}\n`;

    const tableAllergies = new Set<string>();
    const tableReligious = new Set<string>();
    tableMembers.forEach(m => {
      m.allergies.forEach(a => tableAllergies.add(a));
      if (m.religiousDiet) tableReligious.add(m.religiousDiet);
    });

    if (tableAllergies.size > 0) {
      content += `  注意：${Array.from(tableAllergies).map(a => allergyLabels[a] || a).join('、')}过敏`;
    }
    if (tableReligious.size > 0) {
      content += `${tableAllergies.size > 0 ? '，' : '  注意：'}${Array.from(tableReligious).map(r => religiousLabels[r] || r).join('、')}`;
    }
    content += '\n\n';
  });

  content += `========================================\n`;
  content += `        请餐厅务必注意以上忌口事项\n`;
  content += `========================================\n`;

  return content;
}

export async function generateTableCards(plan: Plan, tables: Table[]): Promise<string> {
  const members = await getAllMembers();
  const memberMap = new Map(members.map(m => [m.id, m]));

  const allergyLabels: Record<string, string> = {
    seafood: '海鲜',
    nuts: '坚果',
    spicy: '辣',
    dairy: '乳制品',
    gluten: '麸质',
    soy: '大豆',
    eggs: '鸡蛋',
  };

  const religiousLabels: Record<string, string> = {
    halal: '清真',
    vegetarian: '素食',
    vegan: '纯素',
    hindu: '印度教（不食牛肉）',
    jewish: '犹太洁食',
  };

  let content = '';

  tables.forEach(table => {
    const tableMembers = table.memberIds
      .map(id => memberMap.get(id))
      .filter((m): m is Member => m !== undefined);

    if (tableMembers.length === 0) {
      return;
    }

    const allergyCounts = new Map<string, number>();
    const religiousCounts = new Map<string, number>();
    const nonDrinkerNames: string[] = [];
    let vegetarianCount = 0;
    const importantNotes: string[] = [];

    tableMembers.forEach(m => {
      m.allergies.forEach(a => {
        allergyCounts.set(a, (allergyCounts.get(a) || 0) + 1);
      });
      if (m.religiousDiet) {
        religiousCounts.set(m.religiousDiet, (religiousCounts.get(m.religiousDiet) || 0) + 1);
        if (m.religiousDiet === 'vegetarian' || m.religiousDiet === 'vegan') {
          vegetarianCount++;
        }
      }
      if (!m.drinksAlcohol) {
        nonDrinkerNames.push(m.name);
      }
      if (m.notes && m.notes.trim()) {
        importantNotes.push(`${m.name}：${m.notes.trim()}`);
      }
    });

    const hasWarnings = allergyCounts.size > 0 || religiousCounts.size > 0 || nonDrinkerNames.length > 0 || importantNotes.length > 0;

    content += `╔════════════════════════════════════════════╗\n`;
    content += `║              ${table.name}               ║\n`;
    content += `╠════════════════════════════════════════════╣\n`;
    content += `║ ${plan.name}                    ║\n`;
    content += `║ ${plan.restaurant} · ${plan.date}              ║\n`;
    content += `╠════════════════════════════════════════════╣\n`;
    content += `║  成员名单（${tableMembers.length}人）：                      ║\n`;
    
    for (let i = 0; i < tableMembers.length; i += 2) {
      const names = tableMembers.slice(i, i + 2).map(m => m.name);
      content += `║    ${names.join(' · ').padEnd(38)}║\n`;
    }

    if (hasWarnings) {
      content += `╠════════════════════════════════════════════╣\n`;
      content += `║  【忌口摘要】                              ║\n`;
      
      if (allergyCounts.size > 0) {
        const parts: string[] = [];
        allergyCounts.forEach((count, allergy) => {
          parts.push(`${allergyLabels[allergy] || allergy}${count}人`);
        });
        const line = `⚠️  过敏：${parts.join('、')}`;
        content += `║  ${line.padEnd(40)}║\n`;
      }
      if (religiousCounts.size > 0) {
        const parts: string[] = [];
        religiousCounts.forEach((count, religion) => {
          parts.push(`${religiousLabels[religion] || religion}${count}人`);
        });
        const line = `🕊️  禁忌：${parts.join('、')}`;
        content += `║  ${line.padEnd(40)}║\n`;
      }
      if (nonDrinkerNames.length > 0) {
        const namesStr = nonDrinkerNames.join('、');
        const displayStr = namesStr.length > 18 ? namesStr.slice(0, 18) + '...' : namesStr;
        const line = `🚫  不饮酒：${nonDrinkerNames.length}人（${displayStr}）`;
        content += `║  ${line.padEnd(40)}║\n`;
      }
      if (vegetarianCount > 0) {
        const line = `🌿  素食：${vegetarianCount}人`;
        content += `║  ${line.padEnd(40)}║\n`;
      }
    }

    if (importantNotes.length > 0) {
      content += `╠════════════════════════════════════════════╣\n`;
      content += `║  【重点提醒】                              ║\n`;
      importantNotes.forEach(note => {
        const maxLen = 36;
        if (note.length <= maxLen) {
          content += `║  • ${note.padEnd(maxLen)}║\n`;
        } else {
          const lines: string[] = [];
          for (let i = 0; i < note.length; i += maxLen) {
            lines.push(note.slice(i, i + maxLen));
          }
          lines.forEach((line, idx) => {
            const prefix = idx === 0 ? '• ' : '  ';
            content += `║  ${prefix}${line.padEnd(maxLen)}║\n`;
          });
        }
      });
    }

    content += `╚════════════════════════════════════════════╝\n\n\n`;
  });

  return content;
}
