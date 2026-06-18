import { Guest, Table, ConflictAlert, SpecialMealSummary, KitchenOrder, WaiterNote } from '../types';

const ALLERGEN_CONFLICT_THRESHOLD = 2;

export function detectConflicts(table: Table, guests: Guest[]): ConflictAlert[] {
  const tableGuests = guests.filter(g => table.guestIds.includes(g.id));
  const conflicts: ConflictAlert[] = [];

  const allergenMap = new Map<string, Guest[]>();
  tableGuests.forEach(guest => {
    guest.allergens.forEach(allergen => {
      if (!allergenMap.has(allergen)) {
        allergenMap.set(allergen, []);
      }
      allergenMap.get(allergen)!.push(guest);
    });
  });

  allergenMap.forEach((allergyGuests, allergen) => {
    if (allergyGuests.length >= ALLERGEN_CONFLICT_THRESHOLD) {
      conflicts.push({
        type: 'allergen',
        severity: allergyGuests.length >= 3 ? 'high' : 'medium',
        message: `本桌有 ${allergyGuests.length} 人对${allergen}过敏，请注意备餐`,
        guestIds: allergyGuests.map(g => g.id),
      });
    }
  });

  const brideCount = tableGuests.filter(g => g.group === 'bride').length;
  const groomCount = tableGuests.filter(g => g.group === 'groom').length;
  if (brideCount > 0 && groomCount > 0 && Math.abs(brideCount - groomCount) > 3) {
    conflicts.push({
      type: 'relation',
      severity: 'low',
      message: '男女方亲友人数差距较大，建议平衡',
      guestIds: tableGuests.map(g => g.id),
    });
  }

  const childCount = tableGuests.filter(g => g.isChild).length;
  const elderlyCount = tableGuests.filter(g => g.isElderly).length;
  if (childCount > 0 && elderlyCount > 0) {
    conflicts.push({
      type: 'custom',
      severity: 'low',
      message: '本桌同时有老人和小孩，需要特殊照顾',
      guestIds: tableGuests.filter(g => g.isChild || g.isElderly).map(g => g.id),
    });
  }

  return conflicts;
}

export function calculateSpecialMeals(guests: Guest[]): SpecialMealSummary {
  const summary: SpecialMealSummary = {
    vegetarian: 0,
    vegan: 0,
    glutenFree: 0,
    noSeafood: 0,
    noPork: 0,
    noBeef: 0,
    childMeal: 0,
    softFood: 0,
    other: 0,
  };

  guests.forEach(guest => {
    const headCount = guest.headCount;
    guest.dietaryRestrictions.forEach(restriction => {
      switch (restriction) {
        case '素食':
          summary.vegetarian += headCount;
          break;
        case '纯素':
          summary.vegan += headCount;
          break;
        case '无麸质':
          summary.glutenFree += headCount;
          break;
        case '不吃海鲜':
        case '无海鲜':
          summary.noSeafood += headCount;
          break;
        case '不食猪肉':
        case '不吃猪肉':
          summary.noPork += headCount;
          break;
        case '不吃牛肉':
          summary.noBeef += headCount;
          break;
        case '儿童餐':
          summary.childMeal += headCount;
          break;
        case '软食':
          summary.softFood += headCount;
          break;
        default:
          summary.other += headCount;
      }
    });

    if (guest.allergens.includes('海鲜') || guest.allergens.includes('虾') || guest.allergens.includes('蟹')) {
      summary.noSeafood += headCount;
    }
  });

  return summary;
}

export function generateKitchenOrders(tables: Table[], guests: Guest[]): KitchenOrder[] {
  return tables.map(table => {
    const tableGuests = guests.filter(g => table.guestIds.includes(g.id));
    const totalGuests = tableGuests.reduce((sum, g) => sum + g.headCount, 0);

    const mealMap = new Map<string, { count: number; names: string[] }>();
    const allergenMap = new Map<string, { count: number; names: string[] }>();

    tableGuests.forEach(guest => {
      guest.dietaryRestrictions.forEach(restriction => {
        if (!mealMap.has(restriction)) {
          mealMap.set(restriction, { count: 0, names: [] });
        }
        const entry = mealMap.get(restriction)!;
        entry.count += guest.headCount;
        entry.names.push(guest.name);
      });

      guest.allergens.forEach(allergen => {
        if (!allergenMap.has(allergen)) {
          allergenMap.set(allergen, { count: 0, names: [] });
        }
        const entry = allergenMap.get(allergen)!;
        entry.count += guest.headCount;
        entry.names.push(guest.name);
      });
    });

    return {
      tableId: table.id,
      tableNumber: table.tableNumber,
      totalGuests,
      specialMeals: Array.from(mealMap.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        guestNames: data.names,
      })),
      allergens: Array.from(allergenMap.entries()).map(([allergen, data]) => ({
        allergen,
        count: data.count,
        guestNames: data.names,
      })),
    };
  });
}

export function generateWaiterNotes(tables: Table[], guests: Guest[]): WaiterNote[] {
  return tables
    .filter(table => table.guestIds.length > 0)
    .map(table => {
      const tableGuests = guests.filter(g => table.guestIds.includes(g.id));
      const childCount = tableGuests.filter(g => g.isChild).length;
      const elderlyCount = tableGuests.filter(g => g.isElderly).length;

      const specialAssistance: string[] = [];
      if (childCount > 0) specialAssistance.push('需要儿童椅');
      if (elderlyCount > 0) specialAssistance.push('需要协助入座');

      const allergenGuests = tableGuests.filter(g => g.allergens.length > 0);
      if (allergenGuests.length > 0) {
        specialAssistance.push(`过敏宾客: ${allergenGuests.map(g => g.name).join('、')}`);
      }

      return {
        tableId: table.id,
        tableNumber: table.tableNumber,
        elderlyCount,
        childCount,
        specialAssistance,
      };
    })
    .filter(note => note.childCount > 0 || note.elderlyCount > 0 || note.specialAssistance.length > 0);
}

export function getHighRiskTables(tables: Table[], guests: Guest[]): Table[] {
  return tables.filter(table => {
    const tableGuests = guests.filter(g => table.guestIds.includes(g.id));
    const severeAllergyCount = tableGuests.filter(g => g.allergens.length > 1).length;
    const totalAllergens = tableGuests.reduce((sum, g) => sum + g.allergens.length, 0);
    return severeAllergyCount >= 2 || totalAllergens >= 4;
  });
}

export function getUnconfirmedGuests(guests: Guest[]): Guest[] {
  return guests.filter(g => !g.confirmed);
}

export function getUnprintedTables(tables: Table[]): Table[] {
  return tables.filter(t => !t.printed && t.guestIds.length > 0);
}

export function getUnseatedGuests(guests: Guest[]): Guest[] {
  return guests.filter(g => !g.tableId);
}

export function getTableGuests(table: Table, guests: Guest[]): Guest[] {
  return guests.filter(g => table.guestIds.includes(g.id));
}

export function getTableHeadCount(table: Table, guests: Guest[]): number {
  return getTableGuests(table, guests).reduce((sum, g) => sum + g.headCount, 0);
}
