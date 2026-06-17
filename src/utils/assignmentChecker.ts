import type { Member, Equipment, AssignmentWarning, EquipmentType } from '@/types';

const CRITICAL_GEAR_TYPES: EquipmentType[] = ['snowboard', 'shoes', 'helmet', 'goggles'];

export function getIdealBoardLength(member: Member): number {
  const baseLength = member.height - 15;
  const levelAdjustment: Record<string, number> = {
    beginner: 5,
    intermediate: 0,
    advanced: -3,
    expert: -5,
  };
  return baseLength + (levelAdjustment[member.skiLevel] || 0);
}

export function checkBoardLength(member: Member, equipment: Equipment): boolean {
  const boardLength = parseFloat(equipment.size);
  if (isNaN(boardLength)) return true;

  const ideal = getIdealBoardLength(member);
  return Math.abs(boardLength - ideal) <= 8;
}

export function checkShoeSize(member: Member, equipment: Equipment): boolean {
  const shoeSize = parseFloat(equipment.size);
  if (isNaN(shoeSize)) return true;
  return Math.abs(shoeSize - member.shoeSize) <= 0.5;
}

export function checkMyopiaGoggles(member: Member, equipment: Equipment): boolean {
  if (!member.hasMyopia) return true;
  if (equipment.type !== 'goggles') return true;
  return equipment.hasMyopiaLens === true;
}

export function getEquipmentByType(equipment: Equipment[], type: EquipmentType): Equipment[] {
  return equipment.filter((e) => e.type === type);
}

export function getAssignedEquipmentForMember(
  equipment: Equipment[],
  memberId: string
): Equipment[] {
  return equipment.filter((e) => e.assignedTo === memberId);
}

export function checkAllAssignments(
  members: Member[],
  equipment: Equipment[]
): AssignmentWarning[] {
  const warnings: AssignmentWarning[] = [];

  for (const member of members) {
    const assigned = getAssignedEquipmentForMember(equipment, member.id);
    const assignedByType = new Map<EquipmentType, Equipment[]>();

    for (const e of assigned) {
      if (!assignedByType.has(e.type)) {
        assignedByType.set(e.type, []);
      }
      assignedByType.get(e.type)!.push(e);
    }

    for (const gearType of CRITICAL_GEAR_TYPES) {
      if (!assignedByType.has(gearType) || assignedByType.get(gearType)!.length === 0) {
        warnings.push({
          type: 'critical_gear_missing',
          memberId: member.id,
          message: `${member.name} 缺少关键装备：${getGearTypeName(gearType)}`,
          severity: 'error',
        });
      }
    }

    const shoes = assignedByType.get('shoes') || [];
    for (const shoe of shoes) {
      if (!checkShoeSize(member, shoe)) {
        warnings.push({
          type: 'shoe_size_mismatch',
          memberId: member.id,
          equipmentId: shoe.id,
          message: `${member.name} 的雪鞋尺码 ${shoe.size} 与鞋码 ${member.shoeSize} 不匹配`,
          severity: 'error',
        });
      }
    }

    const boards = assignedByType.get('snowboard') || [];
    for (const board of boards) {
      if (!checkBoardLength(member, board)) {
        const ideal = getIdealBoardLength(member);
        warnings.push({
          type: 'board_length_unsuitable',
          memberId: member.id,
          equipmentId: board.id,
          message: `${member.name} 的雪板 ${board.size}cm 不太合适，建议约 ${ideal}cm`,
          severity: 'warning',
        });
      }
    }

    const goggles = assignedByType.get('goggles') || [];
    for (const goggle of goggles) {
      if (!checkMyopiaGoggles(member, goggle)) {
        warnings.push({
          type: 'myopia_without_lens',
          memberId: member.id,
          equipmentId: goggle.id,
          message: `${member.name} 近视，但护目镜未配近视镜片`,
          severity: 'error',
        });
      }
    }
  }

  return warnings;
}

function getGearTypeName(type: EquipmentType): string {
  const names: Record<EquipmentType, string> = {
    snowboard: '雪板',
    shoes: '雪鞋',
    helmet: '头盔',
    goggles: '护目镜',
    gloves: '手套',
    protector: '护具',
  };
  return names[type] || type;
}
