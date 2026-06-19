import type { Member, Table, Plan } from '../../shared/types.js';

export function generateSeating(
  members: Member[],
  plan: Plan
): Table[] {
  const { totalTables, seatsPerTable } = plan;
  
  const highRiskMembers = members.filter(m => 
    m.allergies.length > 0 || 
    m.religiousDiet === 'halal' || 
    m.religiousDiet === 'hindu' ||
    m.religiousDiet === 'jewish'
  );
  
  const vegetarianMembers = members.filter(m => 
    (m.religiousDiet === 'vegetarian' || m.religiousDiet === 'vegan') &&
    !highRiskMembers.includes(m)
  );
  
  const regularMembers = members.filter(m => 
    !highRiskMembers.includes(m) && !vegetarianMembers.includes(m)
  );

  const tables: Table[] = Array.from({ length: totalTables }, (_, i) => ({
    id: i + 1,
    name: `第${i + 1}桌`,
    memberIds: [],
  }));

  highRiskMembers.forEach((member, index) => {
    const tableIndex = index % totalTables;
    tables[tableIndex].memberIds.push(member.id);
  });

  const shuffledVegetarians = [...vegetarianMembers].sort(() => Math.random() - 0.5);
  shuffledVegetarians.forEach((member, index) => {
    const tableIndex = index % totalTables;
    tables[tableIndex].memberIds.push(member.id);
  });

  const shuffledRegular = [...regularMembers].sort(() => Math.random() - 0.5);
  let tableIndex = 0;
  for (const member of shuffledRegular) {
    while (tables[tableIndex].memberIds.length >= seatsPerTable) {
      tableIndex = (tableIndex + 1) % totalTables;
    }
    tables[tableIndex].memberIds.push(member.id);
    tableIndex = (tableIndex + 1) % totalTables;
  }

  return tables;
}

export function moveMember(
  tables: Table[],
  memberId: string,
  fromTableId: number,
  toTableId: number
): Table[] {
  return tables.map(table => {
    if (table.id === fromTableId) {
      return {
        ...table,
        memberIds: table.memberIds.filter(id => id !== memberId),
      };
    }
    if (table.id === toTableId) {
      return {
        ...table,
        memberIds: [...table.memberIds, memberId],
      };
    }
    return table;
  });
}
