import type { Member, Plan, Table, Conflict, Dish } from '../../shared/types.js';

export function detectConflicts(
  plan: Plan,
  tables: Table[],
  members: Member[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const table of tables) {
    const tableMembers = table.memberIds
      .map(id => members.find(m => m.id === id))
      .filter((m): m is Member => m !== undefined);

    conflicts.push(...checkAllergyConflicts(table, tableMembers, plan.dishes));
    conflicts.push(...checkVegetarianConflicts(table, tableMembers, plan.dishes));
    conflicts.push(...checkReligiousConflicts(table, tableMembers, plan.dishes));
    conflicts.push(...checkSpicinessConflicts(table, tableMembers, plan.dishes));
    conflicts.push(...checkAlcoholConflicts(table, tableMembers, plan.drinks));
    conflicts.push(...checkSeatingCapacity(table, plan.seatsPerTable));
  }

  return conflicts;
}

function checkAllergyConflicts(
  table: Table,
  tableMembers: Member[],
  dishes: Dish[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const member of tableMembers) {
    for (const allergy of member.allergies) {
      const offendingDishes = dishes.filter(dish => {
        if (allergy === 'seafood' && dish.hasSeafood) return true;
        if (allergy === 'nuts' && dish.hasNuts) return true;
        if (allergy === 'spicy' && dish.spiciness !== 'none') return true;
        return false;
      });

      if (offendingDishes.length > 0) {
        conflicts.push({
          type: 'allergy',
          severity: 'high',
          message: `${member.name} 对${allergy === 'seafood' ? '海鲜' : allergy === 'nuts' ? '坚果' : '辣'}过敏，但本桌有 ${offendingDishes.map(d => d.name).join('、')}`,
          tableId: table.id,
          memberIds: [member.id],
          dishId: offendingDishes[0].id,
          suggestion: `建议将 ${member.name} 调整到其他桌，或移除/替换菜品 ${offendingDishes.map(d => d.name).join('、')}`,
        });
      }
    }
  }

  return conflicts;
}

function checkVegetarianConflicts(
  table: Table,
  tableMembers: Member[],
  dishes: Dish[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  const vegetarians = tableMembers.filter(m => 
    m.religiousDiet === 'vegetarian' || m.religiousDiet === 'vegan'
  );
  const vegetarianDishes = dishes.filter(d => d.isVegetarian);

  if (vegetarians.length > 0 && vegetarianDishes.length === 0) {
    conflicts.push({
      type: 'vegetarian',
      severity: 'high',
      message: `第${table.id}桌有 ${vegetarians.length} 位素食者，但没有素食菜品`,
      tableId: table.id,
      memberIds: vegetarians.map(m => m.id),
      suggestion: '请添加至少 2-3 道素食菜品',
    });
  } else if (vegetarians.length > 0 && vegetarianDishes.length < Math.ceil(vegetarians.length / 2)) {
    conflicts.push({
      type: 'vegetarian',
      severity: 'medium',
      message: `第${table.id}桌有 ${vegetarians.length} 位素食者，但只有 ${vegetarianDishes.length} 道素食菜品，可能不够`,
      tableId: table.id,
      memberIds: vegetarians.map(m => m.id),
      suggestion: '建议增加素食菜品数量，确保每位素食者有足够选择',
    });
  }

  return conflicts;
}

function checkReligiousConflicts(
  table: Table,
  tableMembers: Member[],
  dishes: Dish[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const member of tableMembers) {
    if (member.religiousDiet === 'halal') {
      const nonHalalDishes = dishes.filter(d => 
        !d.isVegetarian && d.name.includes('猪')
      );
      if (nonHalalDishes.length > 0) {
        conflicts.push({
          type: 'religious',
          severity: 'high',
          message: `${member.name} 需清真饮食，但本桌有 ${nonHalalDishes.map(d => d.name).join('、')}`,
          tableId: table.id,
          memberIds: [member.id],
          suggestion: `建议将 ${member.name} 调整到其他桌，或替换含猪肉的菜品`,
        });
      }
    }

    if (member.religiousDiet === 'hindu') {
      const beefDishes = dishes.filter(d => 
        d.name.includes('牛')
      );
      if (beefDishes.length > 0) {
        conflicts.push({
          type: 'religious',
          severity: 'high',
          message: `${member.name} 不食牛肉，但本桌有 ${beefDishes.map(d => d.name).join('、')}`,
          tableId: table.id,
          memberIds: [member.id],
          suggestion: `建议替换含牛肉的菜品`,
        });
      }
    }
  }

  return conflicts;
}

function checkSpicinessConflicts(
  table: Table,
  tableMembers: Member[],
  dishes: Dish[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  const nonSpicyMembers = tableMembers.filter(m => m.allergies.includes('spicy'));
  
  if (nonSpicyMembers.length > 0) {
    const spicyDishes = dishes.filter(d => d.spiciness !== 'none');
    const nonSpicyDishes = dishes.filter(d => d.spiciness === 'none');
    
    if (nonSpicyDishes.length === 0) {
      conflicts.push({
        type: 'spiciness',
        severity: 'high',
        message: `第${table.id}桌有 ${nonSpicyMembers.length} 人不能吃辣，但所有菜品都含辣`,
        tableId: table.id,
        memberIds: nonSpicyMembers.map(m => m.id),
        suggestion: '请添加不辣的菜品',
      });
    } else if (spicyDishes.length > nonSpicyDishes.length * 2) {
      conflicts.push({
        type: 'spiciness',
        severity: 'medium',
        message: `第${table.id}桌有 ${nonSpicyMembers.length} 人不能吃辣，辣味菜品过多`,
        tableId: table.id,
        memberIds: nonSpicyMembers.map(m => m.id),
        suggestion: '建议增加不辣菜品的比例',
      });
    }
  }

  return conflicts;
}

function checkAlcoholConflicts(
  table: Table,
  tableMembers: Member[],
  drinks: Plan['drinks']
): Conflict[] {
  const conflicts: Conflict[] = [];
  const nonDrinkers = tableMembers.filter(m => !m.drinksAlcohol);
  
  if (nonDrinkers.length > 0 && drinks.nonAlcoholic.length === 0) {
    conflicts.push({
      type: 'alcohol',
      severity: 'medium',
      message: `第${table.id}桌有 ${nonDrinkers.length} 人不喝酒，但没有准备无酒精饮品`,
      tableId: table.id,
      memberIds: nonDrinkers.map(m => m.id),
      suggestion: '请添加无酒精饮品，如果汁、汽水、茶水等',
    });
  }

  return conflicts;
}

function checkSeatingCapacity(
  table: Table,
  seatsPerTable: number
): Conflict[] {
  const conflicts: Conflict[] = [];

  if (table.memberIds.length > seatsPerTable) {
    conflicts.push({
      type: 'seating',
      severity: 'high',
      message: `第${table.id}桌人数 (${table.memberIds.length}) 超过座位数 (${seatsPerTable})`,
      tableId: table.id,
      suggestion: '请减少本桌人数或增加座位数',
    });
  } else if (table.memberIds.length < seatsPerTable - 2) {
    conflicts.push({
      type: 'seating',
      severity: 'low',
      message: `第${table.id}桌只有 ${table.memberIds.length} 人，座位有空余`,
      tableId: table.id,
      suggestion: '可以考虑增加人员或合并桌位',
    });
  }

  return conflicts;
}

export function getHighRiskDishes(dishes: Dish[], members: Member[]): Dish[] {
  return dishes.filter(dish => {
    const hasSeafoodAllergy = members.some(m => m.allergies.includes('seafood'));
    const hasNutsAllergy = members.some(m => m.allergies.includes('nuts'));
    const hasSpicyAllergy = members.some(m => m.allergies.includes('spicy'));
    
    return (dish.hasSeafood && hasSeafoodAllergy) ||
           (dish.hasNuts && hasNutsAllergy) ||
           (dish.spiciness !== 'none' && hasSpicyAllergy);
  });
}
