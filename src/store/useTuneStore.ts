import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Snowboard, TuneRecord, RideFeedback, SnowCondition, WaxType, Recommendation } from '@/types';
import { MOCK_BOARDS, MOCK_TUNE_RECORDS, MOCK_FEEDBACKS } from '@/data/mockData';
import { generateId } from '@/lib/utils';

function calcEffectiveScore(f: RideFeedback): number {
  const speedPositive = 11 - f.speedLossScore;
  return (f.gripScore + f.edgeChangeScore + f.chatterScore + speedPositive) / 4;
}

function calcOverallScore(f: Omit<RideFeedback, 'id' | 'overallScore'>): number {
  const speedPositive = 11 - f.speedLossScore;
  return Math.round((f.gripScore + f.edgeChangeScore + f.chatterScore + speedPositive) / 4);
}

interface TuneStore {
  boards: Snowboard[];
  tuneRecords: TuneRecord[];
  feedbacks: RideFeedback[];

  addBoard: (board: Omit<Snowboard, 'id' | 'createdAt'>) => void;
  updateBoard: (id: string, board: Partial<Snowboard>) => void;
  deleteBoard: (id: string) => void;

  addTuneRecord: (record: Omit<TuneRecord, 'id'>) => void;
  updateTuneRecord: (id: string, record: Partial<TuneRecord>) => void;
  deleteTuneRecord: (id: string) => void;

  addFeedback: (feedback: Omit<RideFeedback, 'id'>) => void;
  updateFeedback: (id: string, feedback: Partial<RideFeedback>) => void;
  deleteFeedback: (id: string) => void;

  getBoardTuneRecords: (boardId: string) => TuneRecord[];
  getBoardFeedbacks: (boardId: string) => RideFeedback[];
  getTuneFeedbacks: (tuneId: string) => RideFeedback[];

  getRecommendation: (snowCondition: SnowCondition, snowTemp: number, boardId?: string) => Recommendation | null;
  getBestTuneForCondition: (snowCondition: SnowCondition, snowTemp: number, boardId?: string) => TuneRecord | null;
}

export const useTuneStore = create<TuneStore>()(
  persist(
    (set, get) => ({
      boards: MOCK_BOARDS,
      tuneRecords: MOCK_TUNE_RECORDS,
      feedbacks: MOCK_FEEDBACKS,

      addBoard: (board) =>
        set((state) => ({
          boards: [...state.boards, { ...board, id: generateId(), createdAt: new Date().toISOString().split('T')[0] }],
        })),

      updateBoard: (id, board) =>
        set((state) => ({
          boards: state.boards.map((b) => (b.id === id ? { ...b, ...board } : b)),
        })),

      deleteBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
          tuneRecords: state.tuneRecords.filter((r) => r.boardId !== id),
          feedbacks: state.feedbacks.filter((f) => f.boardId !== id),
        })),

      addTuneRecord: (record) =>
        set((state) => ({
          tuneRecords: [...state.tuneRecords, { ...record, id: generateId() }],
        })),

      updateTuneRecord: (id, record) =>
        set((state) => ({
          tuneRecords: state.tuneRecords.map((r) => (r.id === id ? { ...r, ...record } : r)),
        })),

      deleteTuneRecord: (id) =>
        set((state) => ({
          tuneRecords: state.tuneRecords.filter((r) => r.id !== id),
          feedbacks: state.feedbacks.filter((f) => f.tuneRecordId !== id),
        })),

      addFeedback: (feedback) =>
        set((state) => ({
          feedbacks: [
            ...state.feedbacks,
            { ...feedback, id: generateId(), overallScore: calcOverallScore(feedback) },
          ],
        })),

      updateFeedback: (id, feedback) =>
        set((state) => ({
          feedbacks: state.feedbacks.map((f) => {
            if (f.id !== id) return f;
            const merged = { ...f, ...feedback };
            return { ...merged, overallScore: calcOverallScore(merged) };
          }),
        })),

      deleteFeedback: (id) =>
        set((state) => ({
          feedbacks: state.feedbacks.filter((f) => f.id !== id),
        })),

      getBoardTuneRecords: (boardId) => {
        return get().tuneRecords
          .filter((r) => r.boardId === boardId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getBoardFeedbacks: (boardId) => {
        return get().feedbacks
          .filter((f) => f.boardId === boardId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTuneFeedbacks: (tuneId) => {
        return get().feedbacks.filter((f) => f.tuneRecordId === tuneId);
      },

      getBestTuneForCondition: (snowCondition, snowTemp, boardId) => {
        const { tuneRecords, feedbacks } = get();
        let filteredRecords = tuneRecords.filter((r) => r.snowCondition === snowCondition);

        if (boardId) {
          filteredRecords = filteredRecords.filter((r) => r.boardId === boardId);
        }

        if (filteredRecords.length === 0) return null;

        const recordsWithScores = filteredRecords.map((record) => {
          const recordFeedbacks = feedbacks.filter((f) => f.tuneRecordId === record.id);
          const avgOverall = recordFeedbacks.length > 0
            ? recordFeedbacks.reduce((sum, f) => sum + calcEffectiveScore(f), 0) / recordFeedbacks.length
            : 0;

          const tempDiff = Math.abs(record.snowTemp - snowTemp);
          const tempMatchScore = Math.max(0, 10 - tempDiff * 0.5);
          const combinedScore = avgOverall * 0.7 + tempMatchScore * 0.3;

          return { record, score: combinedScore, avgOverall, feedbackCount: recordFeedbacks.length };
        });

        recordsWithScores.sort((a, b) => b.score - a.score);
        return recordsWithScores[0]?.record || null;
      },

      getRecommendation: (snowCondition, snowTemp, boardId) => {
        const { getBestTuneForCondition, tuneRecords, feedbacks } = get();

        const bestTune = getBestTuneForCondition(snowCondition, snowTemp, boardId);

        const allRecordsForCondition = tuneRecords.filter((r) =>
          r.snowCondition === snowCondition && (!boardId || r.boardId === boardId)
        );

        const feedbacksForCondition = feedbacks.filter((f) => {
          const record = tuneRecords.find((r) => r.id === f.tuneRecordId);
          return record && record.snowCondition === snowCondition && (!boardId || record.boardId === boardId);
        });

        let baseEdgeAngle = 1;
        let sideEdgeAngle = 89;
        let waxTemp = -8;
        let waxType: WaxType = 'universal';
        let confidence = 0.5;
        let reasoning = '';

        if (bestTune) {
          baseEdgeAngle = bestTune.baseEdgeAngle;
          sideEdgeAngle = bestTune.sideEdgeAngle;
          waxTemp = bestTune.waxTemp;
          waxType = bestTune.waxType;
          confidence = Math.min(0.9, 0.3 + feedbacksForCondition.length * 0.1);

          const bestFeedbacks = feedbacks.filter((f) => f.tuneRecordId === bestTune.id);
          if (bestFeedbacks.length > 0) {
            const avgGrip = bestFeedbacks.reduce((s, f) => s + f.gripScore, 0) / bestFeedbacks.length;
            const avgEdgeChange = bestFeedbacks.reduce((s, f) => s + f.edgeChangeScore, 0) / bestFeedbacks.length;
            reasoning = `基于 ${allRecordsForCondition.length} 次调校记录和 ${feedbacksForCondition.length} 次试滑反馈。${snowCondition}时${sideEdgeAngle}°侧刃抓雪评分${avgGrip.toFixed(1)}，换刃评分${avgEdgeChange.toFixed(1)}。`;
          }
        } else {
          const defaults: Record<SnowCondition, { base: number; side: number; wax: WaxType; waxTemp: number; reason: string }> = {
            ice: { base: 0.5, side: 87, wax: 'cold', waxTemp: -12, reason: '冰面需要锋利的刃增加抓雪力，推荐更锐的角度配合冷蜡。' },
            hardpack: { base: 1, side: 88, wax: 'cold', waxTemp: -8, reason: '硬雪道适合中等偏锐的角度，冷蜡提供更好的滑行速度。' },
            groomed: { base: 1, side: 89, wax: 'universal', waxTemp: -5, reason: '机压雪道推荐通用角度，平衡抓雪和换刃顺畅度。' },
            powder: { base: 2, side: 90, wax: 'warm', waxTemp: -2, reason: '粉雪需要钝角减少切雪，增加浮力，温蜡在粉雪中滑动更好。' },
            slush: { base: 1.5, side: 90, wax: 'warm', waxTemp: 2, reason: '雪泥天钝角不粘雪，温蜡减少雪粘底的速度损失。' },
            crud: { base: 1, side: 88.5, wax: 'universal', waxTemp: -4, reason: '烂雪需要平衡抓雪和容错，中等角度比较稳妥。' },
          };

          const def = defaults[snowCondition];
          baseEdgeAngle = def.base;
          sideEdgeAngle = def.side;
          waxType = def.wax;
          waxTemp = def.waxTemp;
          confidence = 0.3;
          reasoning = `暂无${snowCondition}的历史记录。基于经验推荐：${def.reason}`;
        }

        if (snowTemp < -10) {
          waxTemp = Math.min(waxTemp, -10);
          waxType = 'cold';
        } else if (snowTemp > 2) {
          waxTemp = Math.max(waxTemp, 2);
          waxType = 'warm';
        }

        return {
          snowCondition,
          snowTempRange: [snowTemp - 3, snowTemp + 3] as [number, number],
          baseEdgeAngle,
          sideEdgeAngle,
          waxTemp,
          waxType,
          confidence,
          reasoning,
        };
      },
    }),
    {
      name: 'snowboard-tune-storage',
    }
  )
);
