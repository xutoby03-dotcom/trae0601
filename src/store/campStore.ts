import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Camp,
  RiskAssessment,
  Experience,
  RiskLevel,
  RiskItemKey,
  PrepItem,
} from '@/types';
import { RISK_SCORE, RISK_ITEM_KEYS } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function calculateOverallRisk(assessment: RiskAssessment): number {
  const scores = RISK_ITEM_KEYS.map((key) => RISK_SCORE[assessment[key]]);
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

interface CampStore {
  camps: Camp[];
  riskAssessments: RiskAssessment[];
  experiences: Experience[];
  addCamp: (camp: Omit<Camp, 'id' | 'overallRiskLevel' | 'createdAt' | 'updatedAt'>, assessment: Omit<RiskAssessment, 'id' | 'campId' | 'createdAt'>) => string;
  updateCamp: (id: string, camp: Partial<Omit<Camp, 'id' | 'createdAt' | 'updatedAt'>>, assessment?: Partial<Omit<RiskAssessment, 'id' | 'campId' | 'createdAt'>>) => void;
  deleteCamp: (id: string) => void;
  addExperience: (exp: Omit<Experience, 'id' | 'createdAt'>) => void;
  deleteExperience: (id: string) => void;
  getCampById: (id: string) => Camp | undefined;
  getAssessmentByCampId: (campId: string) => RiskAssessment | undefined;
  getExperiencesByCampId: (campId: string) => Experience[];
  getPrepItems: (campId: string) => PrepItem[];
  getHighRiskReasons: (campId: string) => string[];
  getSortedCamps: () => Camp[];
}

export const useCampStore = create<CampStore>()(
  persist(
    (set, get) => ({
      camps: [],
      riskAssessments: [],
      experiences: [],

      addCamp: (campData, assessmentData) => {
        const campId = generateId();
        const now = Date.now();

        const assessment: RiskAssessment = {
          id: generateId(),
          campId,
          ...assessmentData,
          createdAt: now,
        };

        const overallRiskLevel = calculateOverallRisk(assessment);

        const camp: Camp = {
          id: campId,
          ...campData,
          overallRiskLevel,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          camps: [...state.camps, camp],
          riskAssessments: [...state.riskAssessments, assessment],
        }));

        return campId;
      },

      updateCamp: (id, campData, assessmentData) => {
        const now = Date.now();
        let overallRiskLevel: number | undefined;

        if (assessmentData) {
          const existing = get().riskAssessments.find((a) => a.campId === id);
          if (existing) {
            const updated: RiskAssessment = {
              ...existing,
              ...assessmentData,
            };
            overallRiskLevel = calculateOverallRisk(updated);
            set((state) => ({
              riskAssessments: state.riskAssessments.map((a) =>
                a.campId === id ? updated : a
              ),
            }));
          }
        }

        set((state) => ({
          camps: state.camps.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...campData,
                  ...(overallRiskLevel !== undefined ? { overallRiskLevel } : {}),
                  updatedAt: now,
                }
              : c
          ),
        }));
      },

      deleteCamp: (id) => {
        set((state) => ({
          camps: state.camps.filter((c) => c.id !== id),
          riskAssessments: state.riskAssessments.filter((a) => a.campId !== id),
          experiences: state.experiences.filter((e) => e.campId !== id),
        }));
      },

      addExperience: (expData) => {
        const exp: Experience = {
          id: generateId(),
          ...expData,
          createdAt: Date.now(),
        };
        set((state) => ({
          experiences: [...state.experiences, exp],
        }));
      },

      deleteExperience: (id) => {
        set((state) => ({
          experiences: state.experiences.filter((e) => e.id !== id),
        }));
      },

      getCampById: (id) => get().camps.find((c) => c.id === id),

      getAssessmentByCampId: (campId) =>
        get().riskAssessments.find((a) => a.campId === campId),

      getExperiencesByCampId: (campId) =>
        get().experiences.filter((e) => e.campId === campId),

      getHighRiskReasons: (campId) => {
        const assessment = get().riskAssessments.find((a) => a.campId === campId);
        if (!assessment) return [];
        const reasons: string[] = [];
        const camp = get().camps.find((c) => c.id === campId);
        const labels: Record<RiskItemKey, string> = {
          weatherRisk: '天气多变',
          windRisk: '强风',
          rockfallRisk: '落石风险',
          floodRisk: '涨水风险',
          insectRisk: '蚊虫多',
          wildDogRisk: '野狗出没',
          lightingRisk: '夜间照明不足',
          escapeRisk: '逃生路线不清',
        };
        RISK_ITEM_KEYS.forEach((key) => {
          if (assessment[key] === 'high') {
            reasons.push(labels[key]);
          }
        });
        if (camp) {
          if (camp.phoneSignal === 'none') reasons.push('无手机信号');
          if (camp.toilet === 'none') reasons.push('无厕所');
          if (camp.waterSource === 'none') reasons.push('无水源');
          if (!camp.fireAllowed) reasons.push('禁火');
        }
        return reasons;
      },

      getPrepItems: (campId) => {
        const assessment = get().riskAssessments.find((a) => a.campId === campId);
        const camp = get().camps.find((c) => c.id === campId);
        if (!assessment || !camp) return [];

        const items: PrepItem[] = [];
        const add = (icon: string, title: string, description: string, category: PrepItem['category']) => {
          items.push({ icon, title, description, category });
        };

        if (assessment.windRisk === 'high') {
          add('wind', '带地钉加固帐篷', '准备防风绳、加固地钉，检查帐篷抗风性能', 'safety');
        }
        if (assessment.windRisk === 'medium') {
          add('wind', '备用地钉', '检查帐篷防风性能，准备备用地钉', 'safety');
        }
        if (camp.toilet === 'none') {
          add('bath', '带便携厕所袋', '无厕所设施，携带便携厕所袋和手部消毒液', 'essential');
        }
        if (camp.waterSource === 'none') {
          add('droplets', '带足饮用水', '无水源，携带充足饮用水和储水袋', 'essential');
        }
        if (camp.phoneSignal === 'none') {
          add('radio', '带对讲机', '无手机信号，携带对讲机、下载离线地图、告知他人行程', 'safety');
        }
        if (camp.phoneSignal === 'weak') {
          add('map', '下载离线地图', '信号弱，提前下载离线地图，充满充电宝', 'safety');
        }
        if (assessment.insectRisk === 'high') {
          add('bug', '带驱蚊喷雾', '蚊虫较多，携带驱蚊喷雾、蚊香、穿长袖长裤', 'comfort');
        }
        if (assessment.insectRisk === 'medium') {
          add('bug', '带驱蚊液', '有一定蚊虫，携带驱蚊液和蚊香', 'comfort');
        }
        if (assessment.floodRisk === 'high') {
          add('waves', '远离河道扎营', '涨水风险高，远离河道、带防水袋、关注天气预报', 'safety');
        }
        if (assessment.rockfallRisk === 'high') {
          add('mountain', '远离崖壁', '落石风险高，远离崖壁和陡坡，考虑戴头盔', 'safety');
        }
        if (assessment.wildDogRisk === 'high') {
          add('dog', '带防狗喷雾', '野狗出没，携带防狗喷雾、不单独行动、收好食物', 'safety');
        }
        if (assessment.lightingRisk === 'high') {
          add('flashlight', '带头灯和营地灯', '夜间照明不足，携带头灯、营地灯、备用电池', 'essential');
        }
        if (assessment.escapeRisk === 'high') {
          add('route', '提前规划撤离路线', '逃生路线不清，提前规划撤离路线、标记紧急出口', 'safety');
        }
        if (assessment.weatherRisk === 'high') {
          add('cloud-rain', '带雨衣雨布', '天气多变，携带雨衣雨布、防水帐篷、关注天气预警', 'safety');
        }
        if (assessment.weatherRisk === 'medium') {
          add('cloud', '关注天气预报', '天气可能变化，携带轻便雨具', 'comfort');
        }
        if (!camp.fireAllowed) {
          add('flame', '带气炉代替明火', '禁火区域，携带气炉代替，不携带明火设备', 'essential');
        }
        if (camp.altitude > 3000) {
          add('mountain-snow', '防高反药物', '高海拔地区，携带防高反药物、注意保暖、避免剧烈运动', 'safety');
        }
        if (camp.parkingDistance > 500) {
          add('car', '带手推车', '停车距离远，携带手推车、减少重物搬运', 'comfort');
        }

        return items;
      },

      getSortedCamps: () => {
        return [...get().camps].sort((a, b) => b.overallRiskLevel - a.overallRiskLevel);
      },
    }),
    {
      name: 'camp-risk-storage',
    }
  )
);

export function getRiskLevelLabel(score: number): RiskLevel {
  if (score < 1.5) return 'low';
  if (score < 2.5) return 'medium';
  return 'high';
}
