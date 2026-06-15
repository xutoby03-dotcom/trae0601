import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrepItem, MealType, PrepStatus, AllergyType } from '@/types';
import { generatePrepItems } from '@/utils/mockData';
import { todayStr, formatDateTime } from '@/utils/dateUtils';

interface PrepStore {
  prepItems: PrepItem[];
  generateTodayPrep: (students: { id: string; name: string; className: string; allergies: { type: AllergyType }[] }[]) => void;
  getTodayPrepItems: () => PrepItem[];
  getPrepByDate: (date: string) => PrepItem[];
  getPrepByMealType: (date: string, mealType: MealType) => PrepItem[];
  updatePrepStatus: (id: string, status: PrepStatus) => void;
  getPrepById: (id: string) => PrepItem | undefined;
  getGroupedByClass: (items: PrepItem[]) => Record<string, PrepItem[]>;
  getGroupedByAllergy: (items: PrepItem[]) => Record<string, PrepItem[]>;
  printLabels: (items: PrepItem[]) => void;
}

export const usePrepStore = create<PrepStore>()(
  persist(
    (set, get) => ({
      prepItems: [
        ...generatePrepItems(todayStr(), 'breakfast'),
        ...generatePrepItems(todayStr(), 'lunch'),
        ...generatePrepItems(todayStr(), 'dinner'),
      ],

      generateTodayPrep: (students) => {
        const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
        const replacements = [
          { original: '宫保鸡丁', replacement: '清炒鸡丁(无花生)' },
          { original: '红烧鱼', replacement: '红烧肉' },
          { original: '番茄炒蛋', replacement: '番茄豆腐' },
          { original: '麻婆豆腐', replacement: '红烧茄子' },
          { original: '牛奶', replacement: '豆浆' },
        ];
        const items: PrepItem[] = [];
        mealTypes.forEach((mealType) => {
          students.forEach((student, idx) => {
            const repl = replacements[idx % replacements.length];
            items.push({
              id: `prep-${todayStr()}-${mealType}-${student.id}`,
              date: todayStr(),
              mealType,
              studentId: student.id,
              studentName: student.name,
              className: student.className,
              originalDish: repl.original,
              replacementDish: repl.replacement,
              allergies: student.allergies.map((a) => a.type),
              qrCode: `ALLERGY-MEAL:prep-${todayStr()}-${mealType}-${student.id}:${student.id}:${Date.now()}`,
              status: 'pending',
            });
          });
        });
        set({ prepItems: items });
      },

      getTodayPrepItems: () => get().getPrepByDate(todayStr()),

      getPrepByDate: (date) => get().prepItems.filter((p) => p.date === date),

      getPrepByMealType: (date, mealType) =>
        get().prepItems.filter((p) => p.date === date && p.mealType === mealType),

      updatePrepStatus: (id, status) =>
        set((state) => ({
          prepItems: state.prepItems.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),

      getPrepById: (id) => get().prepItems.find((p) => p.id === id),

      getGroupedByClass: (items) => {
        const groups: Record<string, PrepItem[]> = {};
        items.forEach((item) => {
          if (!groups[item.className]) groups[item.className] = [];
          groups[item.className].push(item);
        });
        return groups;
      },

      getGroupedByAllergy: (items) => {
        const groups: Record<string, PrepItem[]> = {};
        items.forEach((item) => {
          item.allergies.forEach((allergy) => {
            if (!groups[allergy]) groups[allergy] = [];
            groups[allergy].push(item);
          });
        });
        return groups;
      },

      printLabels: (items) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        let html = `
          <html>
            <head>
              <title>过敏餐标签打印 - ${formatDateTime(new Date())}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Microsoft YaHei', sans-serif; padding: 20px; }
                .label {
                  width: 300px;
                  border: 2px solid #dc2626;
                  border-radius: 8px;
                  margin: 10px;
                  display: inline-block;
                  page-break-inside: avoid;
                }
                .warning-bar {
                  background: #dc2626;
                  color: white;
                  padding: 8px 12px;
                  text-align: center;
                  font-weight: bold;
                  font-size: 14px;
                }
                .allergy-icons {
                  font-size: 32px;
                  text-align: center;
                  padding: 10px;
                  background: #fef2f2;
                }
                .info { padding: 10px 12px; font-size: 13px; }
                .info-row { margin-bottom: 6px; }
                .info-label { color: #6b7280; font-size: 11px; }
                .info-value { font-weight: 600; color: #111827; }
                .meal-type { color: #059669; font-weight: bold; }
                .student-name { font-size: 18px; font-weight: 700; color: #111827; }
                .dish-replace { background: #f0fdf4; padding: 6px 10px; margin: 6px 0; border-radius: 4px; }
                .qr-code { text-align: center; padding: 8px; border-top: 1px dashed #e5e7eb; }
                .qr-code svg { width: 80px; height: 80px; }
                @media print {
                  body { padding: 0; }
                  .label { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
        `;
        items.forEach((item) => {
          const allergyIcons = item.allergies.map(a => {
            const meta: Record<string, string> = { nuts: '🌰', dairy: '🥛', seafood: '🦐', eggs: '🥚', wheat: '🌾', soy: '🫘', other: '⚠️' };
            return meta[a] || '⚠️';
          }).join(' ');
          const mealMeta: Record<string, string> = { breakfast: '🌅 早餐', lunch: '☀️ 午餐', dinner: '🌙 晚餐' };
          html += `
            <div class="label">
              <div class="warning-bar">⚠️ 过敏餐 · 请仔细核对</div>
              <div class="allergy-icons">${allergyIcons}</div>
              <div class="info">
                <div class="info-row">
                  <div class="info-label">餐次</div>
                  <div class="meal-type">${mealMeta[item.mealType] || item.mealType}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">学生姓名</div>
                  <div class="student-name">${item.studentName}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">班级</div>
                  <div class="info-value">${item.className}</div>
                </div>
                <div class="dish-replace">
                  <div style="font-size: 11px; color: #6b7280;">原菜品 → 替换为</div>
                  <div style="font-size: 13px; margin-top: 4px;">
                    <span style="text-decoration: line-through; color: #9ca3af;">${item.originalDish}</span>
                    <span style="margin: 0 6px;">→</span>
                    <span style="color: #059669; font-weight: 600;">${item.replacementDish}</span>
                  </div>
                </div>
              </div>
              <div class="qr-code">
                <svg viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white"/>
                  ${Array.from({length: 100}).map((_, i) => {
                    const x = (i % 10) * 10;
                    const y = Math.floor(i / 10) * 10;
                    return (item.id.charCodeAt(i % item.id.length) + i) % 3 === 0 
                      ? `<rect x="${x}" y="${y}" width="10" height="10" fill="black"/>` 
                      : '';
                  }).join('')}
                </svg>
                <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">${item.qrCode.slice(-16)}</div>
              </div>
            </div>
          `;
        });
        html += `
            </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
      },
    }),
    {
      name: 'allergy-prep-store',
    }
  )
);
