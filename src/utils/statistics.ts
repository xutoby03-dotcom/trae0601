import type { Player, Rating, Script, Character, GameSession } from '@/types';

export interface PlayerGenreStats {
  genre: string;
  avgScore: number;
  count: number;
}

export interface TriggerStats {
  trigger: string;
  hitCount: number;
}

export interface ScriptRanking {
  scriptId: string;
  title: string;
  avgScore: number;
  ratingCount: number;
}

export interface PlayerCharacterFit {
  playerId: string;
  playerName: string;
  bestGenres: PlayerGenreStats[];
  avgCharacterScore: number;
  totalGames: number;
}

export const calculatePlayerGenreStats = (
  playerId: string,
  ratings: Rating[],
  scripts: Script[],
  sessions: GameSession[]
): PlayerGenreStats[] => {
  const genreScores: Record<string, { total: number; count: number }> = {};

  ratings
    .filter(r => r.playerId === playerId)
    .forEach(rating => {
      const session = sessions.find(s => s.id === rating.sessionId);
      const script = scripts.find(s => s.id === session?.scriptId);
      
      if (script) {
        if (!genreScores[script.genre]) {
          genreScores[script.genre] = { total: 0, count: 0 };
        }
        genreScores[script.genre].total += rating.characterScore;
        genreScores[script.genre].count += 1;
      }
    });

  return Object.entries(genreScores)
    .map(([genre, data]) => ({
      genre,
      avgScore: data.total / data.count,
      count: data.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
};

export const calculateTriggerStats = (
  ratings: Rating[],
  players: Player[],
  characters: Character[],
  sessions: GameSession[]
): TriggerStats[] => {
  const triggerHits: Record<string, number> = {};

  ratings.forEach(rating => {
    if (rating.characterScore <= 2) {
      const player = players.find(p => p.id === rating.playerId);
      const character = characters.find(c => c.id === rating.characterId);
      const session = sessions.find(s => s.id === rating.sessionId);
      
      if (player && character) {
        const matchedTriggers = character.tags.filter(tag => 
          player.triggers.some(trigger => 
            tag.toLowerCase().includes(trigger.toLowerCase()) ||
            trigger.toLowerCase().includes(tag.toLowerCase())
          )
        );
        
        matchedTriggers.forEach(trigger => {
          triggerHits[trigger] = (triggerHits[trigger] || 0) + 1;
        });
      }
    }
  });

  return Object.entries(triggerHits)
    .map(([trigger, hitCount]) => ({ trigger, hitCount }))
    .sort((a, b) => b.hitCount - a.hitCount);
};

export const calculateScriptRanking = (
  ratings: Rating[],
  scripts: Script[],
  sessions: GameSession[]
): ScriptRanking[] => {
  const scriptScores: Record<string, { total: number; count: number; title: string }> = {};

  ratings.forEach(rating => {
    const session = sessions.find(s => s.id === rating.sessionId);
    const script = scripts.find(s => s.id === session?.scriptId);
    
    if (script) {
      if (!scriptScores[script.id]) {
        scriptScores[script.id] = { total: 0, count: 0, title: script.title };
      }
      scriptScores[script.id].total += rating.scriptScore;
      scriptScores[script.id].count += 1;
    }
  });

  return Object.entries(scriptScores)
    .map(([scriptId, data]) => ({
      scriptId,
      title: data.title,
      avgScore: data.total / data.count,
      ratingCount: data.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
};

export const calculatePlayerFit = (
  players: Player[],
  ratings: Rating[],
  scripts: Script[],
  sessions: GameSession[]
): PlayerCharacterFit[] => {
  return players.map(player => {
    const playerRatings = ratings.filter(r => r.playerId === player.id);
    const bestGenres = calculatePlayerGenreStats(player.id, ratings, scripts, sessions);
    const avgCharacterScore = playerRatings.length > 0
      ? playerRatings.reduce((sum, r) => sum + r.characterScore, 0) / playerRatings.length
      : 0;

    return {
      playerId: player.id,
      playerName: player.name,
      bestGenres,
      avgCharacterScore,
      totalGames: playerRatings.length
    };
  }).sort((a, b) => b.avgCharacterScore - a.avgCharacterScore);
};
