import type { Player, Character, Conflict } from '@/types';

export const detectConflicts = (player: Player, character: Character): Conflict[] => {
  const conflicts: Conflict[] = [];

  if (character.isRomanceLead && player.emotionTolerance < 3) {
    conflicts.push({
      type: 'romance',
      severity: 'danger',
      playerId: player.id,
      characterId: character.id,
      message: `${player.name} 情感接受度较低，可能不适合情侣线主角 ${character.name}`
    });
  } else if (character.isRomanceLead && player.emotionTolerance < 6) {
    conflicts.push({
      type: 'romance',
      severity: 'warning',
      playerId: player.id,
      characterId: character.id,
      message: `${player.name} 对情感线接受度一般，请注意 ${character.name} 的情侣线内容`
    });
  }

  if (character.isHorrorFocus && player.horrorTolerance < 3) {
    conflicts.push({
      type: 'horror',
      severity: 'danger',
      playerId: player.id,
      characterId: character.id,
      message: `${player.name} 恐怖接受度较低，不建议分配恐怖核心位 ${character.name}`
    });
  } else if (character.isHorrorFocus && player.horrorTolerance < 6) {
    conflicts.push({
      type: 'horror',
      severity: 'warning',
      playerId: player.id,
      characterId: character.id,
      message: `${player.name} 对恐怖内容接受度一般，${character.name} 包含较多恐怖元素`
    });
  }

  if (character.isEdge) {
    conflicts.push({
      type: 'edge',
      severity: 'warning',
      playerId: player.id,
      characterId: character.id,
      message: `${character.name} 是边缘位角色，体验可能较平淡，请确认 ${player.name} 是否接受`
    });
  }

  const matchedTriggers = character.tags.filter(tag => 
    player.triggers.some(trigger => 
      tag.toLowerCase().includes(trigger.toLowerCase()) ||
      trigger.toLowerCase().includes(tag.toLowerCase())
    )
  );

  if (matchedTriggers.length > 0) {
    conflicts.push({
      type: 'trigger',
      severity: 'danger',
      playerId: player.id,
      characterId: character.id,
      message: `${player.name} 的雷点 [${matchedTriggers.join('、')}] 可能与角色 ${character.name} 冲突`
    });
  }

  if (character.gender !== 'other' && player.gender !== 'other' && character.gender !== player.gender) {
    if (!player.willingToCrossdress) {
      conflicts.push({
        type: 'crossdress',
        severity: 'danger',
        playerId: player.id,
        characterId: character.id,
        message: `${player.name} 不愿意反串，角色 ${character.name} 是${character.gender === 'male' ? '男性' : '女性'}角色`
      });
    } else {
      conflicts.push({
        type: 'gender',
        severity: 'warning',
        playerId: player.id,
        characterId: character.id,
        message: `${player.name} 需要反串 ${character.name}（${character.gender === 'male' ? '男' : '女'}角色）`
      });
    }
  }

  if (character.genre === '历史' || character.genre === '古风') {
    if (!player.historicalOk) {
      conflicts.push({
        type: 'historical',
        severity: 'warning',
        playerId: player.id,
        characterId: character.id,
        message: `${player.name} 对历史/古风题材接受度一般，${character.name} 属于${character.genre}题材`
      });
    }
  }

  return conflicts;
};

export const getAllConflicts = (
  players: Player[],
  characters: Character[],
  assignments: { playerId: string; characterId: string }[]
): Conflict[] => {
  const allConflicts: Conflict[] = [];

  assignments.forEach(assignment => {
    const player = players.find(p => p.id === assignment.playerId);
    const character = characters.find(c => c.id === assignment.characterId);
    
    if (player && character) {
      const conflicts = detectConflicts(player, character);
      allConflicts.push(...conflicts);
    }
  });

  return allConflicts;
};
