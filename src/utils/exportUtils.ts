import { FlagPole, PoleStats, RiskMark, HourlyWindData, RISK_TYPE_LABELS, POLE_MATERIAL_LABELS, FLAG_MATERIAL_LABELS } from '../types';
import { getRiskLevel } from './riskAssessment';
import { getWindDirectionLabel, getTanglingLevel } from './windCalculator';

export const exportToCSV = (
  poles: FlagPole[],
  stats: PoleStats[],
  marks: RiskMark[],
  windData: HourlyWindData[]
): string => {
  const headers = [
    '旗杆ID',
    '位置X',
    '位置Y',
    '高度(米)',
    '旗杆材质',
    '旗面材质',
    '平均风速(m/s)',
    '最大阵风(m/s)',
    '缠绕小时数',
    '平均缠绕指数',
    '风险评分',
    '风险等级',
    '风险标记类型',
    '备注',
  ];

  const rows = poles.map(pole => {
    const poleStats = stats.find(s => s.poleId === pole.id);
    const mark = marks.find(m => m.poleId === pole.id);
    const riskLevel = poleStats ? getRiskLevel(poleStats.riskScore).label : '-';

    return [
      pole.id,
      pole.x,
      pole.y,
      pole.height,
      POLE_MATERIAL_LABELS[pole.poleMaterial],
      FLAG_MATERIAL_LABELS[pole.flagMaterial],
      poleStats?.avgWindSpeed.toFixed(1) || '-',
      poleStats?.maxGustSpeed.toFixed(1) || '-',
      poleStats?.tanglingHours || '-',
      poleStats?.avgTanglingIndex.toFixed(1) || '-',
      poleStats?.riskScore || '-',
      riskLevel,
      mark ? RISK_TYPE_LABELS[mark.type] : '-',
      mark?.note || '-',
    ].join(',');
  });

  let csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
  
  csv += '\n\n小时风场数据\n';
  csv += ['小时', '风向(度)', '风向', '风速(m/s)', '阵风(m/s)', '噪声(dB)', '缠绕指数', '缠绕等级'].join(',') + '\n';
  
  windData.forEach(h => {
    const tangling = getTanglingLevel(h.tanglingIndex);
    csv += [
      h.hour,
      h.windDirection.toFixed(1),
      getWindDirectionLabel(h.windDirection),
      h.windSpeed.toFixed(1),
      h.gustSpeed.toFixed(1),
      h.noiseLevel.toFixed(1),
      h.tanglingIndex.toFixed(1),
      tangling.level,
    ].join(',') + '\n';
  });

  return csv;
};

export const exportToJSON = (
  poles: FlagPole[],
  stats: PoleStats[],
  marks: RiskMark[],
  windData: HourlyWindData[],
  rooftopName: string
): string => {
  const data = {
    project: '屋顶旗阵风险评估报告',
    rooftop: rooftopName,
    exportDate: new Date().toISOString(),
    summary: {
      totalPoles: poles.length,
      highRisk: stats.filter(s => s.riskScore > 60).length,
      mediumRisk: stats.filter(s => s.riskScore > 30 && s.riskScore <= 60).length,
      lowRisk: stats.filter(s => s.riskScore <= 30).length,
      markedForAction: marks.length,
    },
    poles: poles.map(pole => {
      const poleStats = stats.find(s => s.poleId === pole.id);
      const mark = marks.find(m => m.poleId === pole.id);
      return {
        id: pole.id,
        position: { x: pole.x, y: pole.y },
        height: pole.height,
        materials: {
          pole: POLE_MATERIAL_LABELS[pole.poleMaterial],
          flag: FLAG_MATERIAL_LABELS[pole.flagMaterial],
        },
        statistics: poleStats ? {
          avgWindSpeed: poleStats.avgWindSpeed,
          maxGustSpeed: poleStats.maxGustSpeed,
          tanglingHours: poleStats.tanglingHours,
          avgTanglingIndex: poleStats.avgTanglingIndex,
          riskScore: poleStats.riskScore,
          riskLevel: getRiskLevel(poleStats.riskScore).label,
        } : null,
        riskMark: mark ? {
          type: RISK_TYPE_LABELS[mark.type],
          note: mark.note,
          createdAt: mark.createdAt,
        } : null,
      };
    }),
    windData24h: windData.map(h => ({
      hour: h.hour,
      windDirection: {
        degrees: h.windDirection,
        label: getWindDirectionLabel(h.windDirection),
      },
      windSpeed: h.windSpeed,
      gustSpeed: h.gustSpeed,
      noiseLevel: h.noiseLevel,
      tanglingIndex: h.tanglingIndex,
      tanglingLevel: getTanglingLevel(h.tanglingIndex).level,
    })),
  };

  return JSON.stringify(data, null, 2);
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportRiskList = (
  poles: FlagPole[],
  stats: PoleStats[],
  marks: RiskMark[]
): string => {
  const highRiskPoles = poles.filter(pole => {
    const s = stats.find(st => st.poleId === pole.id);
    return s && s.riskScore > 30;
  });

  if (highRiskPoles.length === 0) {
    return '暂无需要处理的风险旗杆。\n所有旗杆风险评估均为低风险，可正常安装。';
  }

  let report = '【安装前风险清单】\n';
  report += `生成时间: ${new Date().toLocaleString()}\n`;
  report += `需要处理的旗杆数量: ${highRiskPoles.length}\n\n`;

  highRiskPoles.forEach((pole, index) => {
    const s = stats.find(st => st.poleId === pole.id);
    const mark = marks.find(m => m.poleId === pole.id);
    
    if (!s) return;

    const risk = getRiskLevel(s.riskScore);
    
    report += `${index + 1}. 旗杆 ${pole.id}\n`;
    report += `   位置: (${pole.x}, ${pole.y})\n`;
    report += `   规格: ${pole.height}米 ${POLE_MATERIAL_LABELS[pole.poleMaterial]} / ${FLAG_MATERIAL_LABELS[pole.flagMaterial]}\n`;
    report += `   风险评分: ${s.riskScore}分 (${risk.label})\n`;
    report += `   平均风速: ${s.avgWindSpeed}m/s, 最大阵风: ${s.maxGustSpeed}m/s\n`;
    report += `   高缠绕小时数: ${s.tanglingHours}小时/天\n`;
    
    if (mark) {
      report += `   标记类型: ${RISK_TYPE_LABELS[mark.type]}\n`;
      report += `   备注: ${mark.note}\n`;
    }
    
    report += '\n';
  });

  return report;
};
