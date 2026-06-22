import type { Specimen } from '../types/specimen';

export function exportToCSV(specimens: Specimen[]): string {
  const headers = [
    '编号',
    '植物名称',
    '采集地点',
    '植物部位',
    '压制日期',
    '吸水纸批次',
    '压板重量(kg)',
    '换纸周期(天)',
    '换纸次数',
    '干燥进度(%)',
    '是否发霉',
    '是否卷边',
    '是否褪色',
    '标签是否完整',
    '是否完成',
    '备注',
  ];

  const rows = specimens.map((s, idx) => [
    `SP${String(idx + 1).padStart(4, '0')}`,
    s.plantName,
    s.collectionLocation,
    s.plantPart,
    s.pressingDate.slice(0, 10),
    s.absorbentPaperBatch,
    s.plateWeight.toString(),
    s.paperChangeIntervalDays.toString(),
    s.paperChangeCount.toString(),
    s.currentDryness.toString(),
    s.hasMold ? '是' : '否',
    s.hasEdgeRoll ? '是' : '否',
    s.hasColorFade ? '是' : '否',
    s.hasMissingLabel ? '缺项' : '完整',
    s.isCompleted ? '完成' : '干燥中',
    s.notes || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return '\uFEFF' + csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getExhibitionReadySpecimens(specimens: Specimen[]): Specimen[] {
  return specimens.filter(
    (s) =>
      s.isCompleted &&
      !s.hasMold &&
      !s.hasEdgeRoll &&
      !s.hasColorFade &&
      !s.hasMissingLabel,
  );
}
