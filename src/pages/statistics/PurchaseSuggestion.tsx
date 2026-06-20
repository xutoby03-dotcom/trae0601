import { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Collapse,
  Slider,
  Button,
  Table,
  Tag,
  Row,
  Col,
  InputNumber,
  Tooltip,
  Empty,
  message,
  Modal,
  Divider,
} from 'antd';
import {
  Settings,
  Calculator,
  Wallet,
  Layers,
  Clock,
  ShoppingCart,
  Plus,
  Minus,
  FileText,
  Printer,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Shield,
  Calendar as CalendarIcon,
} from 'lucide-react';
import dayjs from 'dayjs';
import { mockConsumptionData, mockInventory, mockActivities } from '@/mock/data';
import { useInventoryStore, useActivityStore } from '@/stores';
import type { MaterialType } from '@/types/index';
import { MATERIAL_CONFIG } from '@/types/index';
import { calculatePurchaseSuggestion } from '@/utils/calculations';

const { Panel } = Collapse;

const MATERIAL_TYPES: MaterialType[] = ['scentPaper', 'coffeeBean', 'sprayNozzle', 'cleaningCloth', 'labelSticker'];

const VIRTUAL_PRICES: Record<MaterialType, number> = {
  scentPaper: 0.5,
  coffeeBean: 0.8,
  sprayNozzle: 2,
  cleaningCloth: 5,
  labelSticker: 0.2,
};

interface PurchaseOrderItem {
  materialType: MaterialType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  addedAt: string;
}

interface SuggestionRowData {
  key: string;
  materialType: MaterialType;
  currentStock: number;
  avgDailyConsumption: number;
  availableDays: number;
  suggestedQuantity: number;
  adjustedQuantity: number;
  suggestedDate: string;
  reason: string;
  unitPrice: number;
  totalPrice: number;
  calculationDetail: {
    label: string;
    value: string;
  }[];
}

const getAvailableDaysStatus = (days: number) => {
  if (days < 7) return { color: '#E53935', bg: '#FEECEB', text: '紧急' };
  if (days < 14) return { color: '#FF9800', bg: '#FFF7E6', text: '警告' };
  return { color: '#4CAF50', bg: '#E8F5E9', text: '正常' };
};

export default function PurchaseSuggestion() {
  const { inventoryItems } = useInventoryStore();
  const { activities } = useActivityStore();
  const inventoryList = inventoryItems.length > 0 ? inventoryItems : mockInventory;
  const activityList = activities.length > 0 ? activities : mockActivities;

  const [statDays, setStatDays] = useState(30);
  const [safetyDays, setSafetyDays] = useState(7);
  const [activityMultiplier, setActivityMultiplier] = useState(1.3);
  const [calcKey, setCalcKey] = useState(0);

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderItem[]>([]);
  const [ignoredItems, setIgnoredItems] = useState<Set<MaterialType>>(new Set());
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const suggestions = useMemo<SuggestionRowData[]>(() => {
    void calcKey;
    const today = dayjs();
    const startDate = today.subtract(statDays - 1, 'day');

    return MATERIAL_TYPES.map(m => {
      const consData = mockConsumptionData.filter(d => {
        const dDate = dayjs(d.date);
        return d.materialType === m &&
          dDate.isAfter(startDate.subtract(1, 'day')) &&
          dDate.isBefore(today.add(1, 'day'));
      });

      const totalStock = inventoryList
        .filter(i => i.materialType === m)
        .reduce((s, i) => s + i.quantity, 0);

      const totalThreshold = inventoryList
        .filter(i => i.materialType === m)
        .reduce((s, i) => s + i.threshold, 0);

      const hasUpcomingActivity = activityList.some(a => {
        const start = dayjs(a.startDate);
        const end = dayjs(a.endDate);
        const now = today;
        const checkStart = now.subtract(1, 'day');
        const checkEnd = now.add(safetyDays + 15, 'day');
        return start.isBefore(checkEnd) && end.isAfter(checkStart);
      });

      const baseSuggestion = calculatePurchaseSuggestion(
        consData,
        totalStock,
        totalThreshold,
        statDays,
        safetyDays
      );

      if (!baseSuggestion) {
        const avgDaily = 0;
        const available = totalStock > 0 && avgDaily > 0 ? Math.floor(totalStock / avgDaily) : 999;
        return {
          key: m,
          materialType: m,
          currentStock: totalStock,
          avgDailyConsumption: avgDaily,
          availableDays: available,
          suggestedQuantity: 0,
          adjustedQuantity: 0,
          suggestedDate: '-',
          reason: '消耗数据不足，暂无法建议',
          unitPrice: VIRTUAL_PRICES[m],
          totalPrice: 0,
          calculationDetail: [],
        } as SuggestionRowData;
      }

      let suggestedQty = baseSuggestion.suggestedQuantity;
      if (hasUpcomingActivity) {
        suggestedQty = Math.round(suggestedQty * activityMultiplier);
      }

      const totalPrice = Math.round(suggestedQty * VIRTUAL_PRICES[m] * 100) / 100;

      const detail = [
        { label: '统计周期', value: `${statDays} 天` },
        { label: '期间总消耗', value: `${consData.reduce((s, i) => s + i.consumed, 0).toLocaleString()} ${MATERIAL_CONFIG[m].unit}` },
        { label: `日均消耗 (÷${statDays})`, value: `${baseSuggestion.avgDailyConsumption.toFixed(2)} ${MATERIAL_CONFIG[m].unit}/天` },
        { label: '当前库存', value: `${totalStock.toLocaleString()} ${MATERIAL_CONFIG[m].unit}` },
        { label: `库存可支撑 (÷日均)`, value: `${baseSuggestion.availableDays} 天` },
        { label: `安全库存天数`, value: `${safetyDays} 天` },
        { label: `阈值总和`, value: `${totalThreshold.toLocaleString()}` },
        { label: `基础建议量 = max(阈值, 日均×${statDays / 2})`, value: `${baseSuggestion.suggestedQuantity.toLocaleString()}` },
      ];

      if (hasUpcomingActivity) {
        detail.push({
          label: `活动上浮系数 ×${activityMultiplier}`,
          value: `→ ${suggestedQty.toLocaleString()}`,
        });
      }

      let finalReason = baseSuggestion.reason;
      if (hasUpcomingActivity) {
        finalReason = `${finalReason}；近期有活动，建议加量 ${Math.round((activityMultiplier - 1) * 100)}%`;
      }

      return {
        key: m,
        materialType: m,
        currentStock: totalStock,
        avgDailyConsumption: baseSuggestion.avgDailyConsumption,
        availableDays: baseSuggestion.availableDays,
        suggestedQuantity: suggestedQty,
        adjustedQuantity: suggestedQty,
        suggestedDate: baseSuggestion.suggestedDate,
        reason: finalReason,
        unitPrice: VIRTUAL_PRICES[m],
        totalPrice,
        calculationDetail: detail,
      } as SuggestionRowData;
    });
  }, [statDays, safetyDays, activityMultiplier, inventoryList, activityList, calcKey]);

  const validSuggestions = useMemo(() => {
    return suggestions.filter(s => !ignoredItems.has(s.materialType));
  }, [suggestions, ignoredItems]);

  const summary = useMemo(() => {
    const totalAmount = validSuggestions.reduce((s, i) => s + i.adjustedQuantity * i.unitPrice, 0);
    const categoryCount = validSuggestions.filter(s => s.suggestedQuantity > 0).length;
    const totalQuantity = validSuggestions.reduce((s, i) => s + i.adjustedQuantity, 0);
    const totalAvgDaily = validSuggestions.reduce((s, i) => s + i.avgDailyConsumption, 0);
    const estimatedDays = totalAvgDaily > 0 ? Math.round(totalQuantity / totalAvgDaily) : 0;

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      categoryCount,
      estimatedDays,
    };
  }, [validSuggestions]);

  const orderSummary = useMemo(() => {
    const totalQty = purchaseOrder.reduce((s, i) => s + i.quantity, 0);
    const totalAmt = purchaseOrder.reduce((s, i) => s + i.subtotal, 0);
    return { totalQty, totalAmt: Math.round(totalAmt * 100) / 100 };
  }, [purchaseOrder]);

  const handleAdjustQty = (materialType: MaterialType, newQty: number | null) => {
    if (newQty === null || newQty < 0) return;
    const qty = Math.round(newQty);
    setSuggestionsTableData(prev => {
      const idx = prev.findIndex(s => s.materialType === materialType);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        adjustedQuantity: qty,
        totalPrice: Math.round(qty * updated[idx].unitPrice * 100) / 100,
      };
      return updated;
    });
  };

  const [, setTableData] = useState<SuggestionRowData[]>([]);

  const setSuggestionsTableData = useCallback((updater: (prev: SuggestionRowData[]) => SuggestionRowData[]) => {
    setTableData(prev => {
      const source = prev.length > 0 ? prev : validSuggestions;
      return updater(source);
    });
  }, [validSuggestions]);

  const handleAddToOrder = (row: SuggestionRowData) => {
    if (row.adjustedQuantity <= 0) {
      message.warning('建议采购数量为0，无法加入采购单');
      return;
    }
    setPurchaseOrder(prev => {
      const existIdx = prev.findIndex(i => i.materialType === row.materialType);
      if (existIdx >= 0) {
        const updated = [...prev];
        updated[existIdx] = {
          ...updated[existIdx],
          quantity: row.adjustedQuantity,
          subtotal: Math.round(row.adjustedQuantity * row.unitPrice * 100) / 100,
        };
        message.success(`已更新采购单：${MATERIAL_CONFIG[row.materialType].name}`);
        return updated;
      }
      message.success(`已加入采购单：${MATERIAL_CONFIG[row.materialType].name}`);
      return [...prev, {
        materialType: row.materialType,
        quantity: row.adjustedQuantity,
        unitPrice: row.unitPrice,
        subtotal: Math.round(row.adjustedQuantity * row.unitPrice * 100) / 100,
        addedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }];
    });
  };

  const handleIgnore = (materialType: MaterialType) => {
    setIgnoredItems(prev => {
      const next = new Set(prev);
      if (next.has(materialType)) {
        next.delete(materialType);
        message.info(`已取消忽略：${MATERIAL_CONFIG[materialType].name}`);
      } else {
        next.add(materialType);
        message.info(`已忽略：${MATERIAL_CONFIG[materialType].name}`);
      }
      return next;
    });
  };

  const handleUpdateOrderQty = (materialType: MaterialType, qty: number | null) => {
    if (qty === null || qty < 0) return;
    setPurchaseOrder(prev => prev.map(item => {
      if (item.materialType === materialType) {
        return {
          ...item,
          quantity: Math.round(qty),
          subtotal: Math.round(Math.round(qty) * item.unitPrice * 100) / 100,
        };
      }
      return item;
    }));
  };

  const handleRemoveFromOrder = (materialType: MaterialType) => {
    setPurchaseOrder(prev => prev.filter(i => i.materialType !== materialType));
    message.info(`已从采购单移除：${MATERIAL_CONFIG[materialType].name}`);
  };

  const handleClearOrder = () => {
    Modal.confirm({
      title: '确认清空采购单？',
      content: '采购单中所有项目将被移除，无法恢复。',
      okText: '确认清空',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setPurchaseOrder([]);
        message.success('采购单已清空');
      },
    });
  };

  const handleExportCSV = () => {
    if (purchaseOrder.length === 0) {
      message.warning('采购单为空，无法导出');
      return;
    }
    const header = ['耗材类型', '单位', '数量', '单价(元)', '小计(元)'];
    const rows = purchaseOrder.map(i => [
      MATERIAL_CONFIG[i.materialType].name,
      MATERIAL_CONFIG[i.materialType].unit,
      i.quantity,
      i.unitPrice.toFixed(2),
      i.subtotal.toFixed(2),
    ]);
    rows.push(['', '', orderSummary.totalQty, '', orderSummary.totalAmt.toFixed(2)]);

    const csvContent = [
      header.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `采购单_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    message.success('CSV 导出成功');
  };

  const handlePrint = () => {
    if (purchaseOrder.length === 0) {
      message.warning('采购单为空，无法打印');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('无法打开打印窗口');
      return;
    }
    const rowsHtml = purchaseOrder.map(i => `
      <tr>
        <td>${MATERIAL_CONFIG[i.materialType].name}</td>
        <td>${MATERIAL_CONFIG[i.materialType].unit}</td>
        <td style="text-align:right">${i.quantity.toLocaleString()}</td>
        <td style="text-align:right">¥${i.unitPrice.toFixed(2)}</td>
        <td style="text-align:right">¥${i.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>采购单 - ${dayjs().format('YYYY-MM-DD')}</title>
          <style>
            body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; }
            h1 { text-align: center; color: #722F37; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #E8C5C8; padding: 12px 16px; }
            th { background: #FBF5F5; color: #722F37; text-align: left; }
            .total-row td { font-weight: bold; background: #FDFAF3; }
            .meta { color: #666; font-size: 14px; margin-top: 8px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; color: #666; }
          </style>
        </head>
        <body>
          <h1>采 购 单</h1>
          <div class="meta">
            <div>生成日期：${dayjs().format('YYYY年MM月DD日 HH:mm:ss')}</div>
            <div>采购项目：${purchaseOrder.length} 项</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>耗材类型</th>
                <th>单位</th>
                <th>数量</th>
                <th>单价</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="2">合计</td>
                <td style="text-align:right">${orderSummary.totalQty.toLocaleString()}</td>
                <td></td>
                <td style="text-align:right">¥${orderSummary.totalAmt.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <div>制单人：____________</div>
            <div>审批人：____________</div>
            <div>日期：____________</div>
          </div>
          <script>window.onload = () => { setTimeout(() => window.print(), 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRecalculate = () => {
    setTableData([]);
    setCalcKey(k => k + 1);
    message.success('已重新计算采购建议');
  };

  const columns = [
    {
      title: '耗材类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 140,
      fixed: 'left' as const,
      render: (v: MaterialType) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: MATERIAL_CONFIG[v].color }}
          >
            {MATERIAL_CONFIG[v].name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-wine-700">{MATERIAL_CONFIG[v].name}</div>
            <div className="text-xs text-cream-500">{MATERIAL_CONFIG[v].unit}</div>
          </div>
        </div>
      ),
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 110,
      align: 'right' as const,
      render: (v: number) => (
        <span className="font-medium text-wine-700">{v.toLocaleString()}</span>
      ),
    },
    {
      title: '日均消耗',
      dataIndex: 'avgDailyConsumption',
      key: 'avgDailyConsumption',
      width: 110,
      align: 'right' as const,
      render: (v: number) => (
        <span className="text-cream-700">{v.toFixed(2)}</span>
      ),
    },
    {
      title: '可用天数',
      dataIndex: 'availableDays',
      key: 'availableDays',
      width: 120,
      render: (v: number) => {
        const status = getAvailableDaysStatus(v);
        return (
          <Tag
            style={{
              backgroundColor: status.bg,
              color: status.color,
              border: `1px solid ${status.color}40`,
              fontWeight: 600,
            }}
          >
            {v >= 999 ? '∞' : v} 天 · {status.text}
          </Tag>
        );
      },
    },
    {
      title: '建议采购量',
      dataIndex: 'adjustedQuantity',
      key: 'adjustedQuantity',
      width: 180,
      render: (_: number, record: SuggestionRowData) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            type="text"
            icon={<Minus className="w-3.5 h-3.5" />}
            onClick={() => handleAdjustQty(record.materialType, Math.max(0, record.adjustedQuantity - 1))}
          />
          <InputNumber
            size="small"
            min={0}
            value={record.adjustedQuantity}
            onChange={(v) => handleAdjustQty(record.materialType, v)}
            className="!w-24"
          />
          <Button
            size="small"
            type="text"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => handleAdjustQty(record.materialType, record.adjustedQuantity + 1)}
          />
        </div>
      ),
    },
    {
      title: '建议采购日期',
      dataIndex: 'suggestedDate',
      key: 'suggestedDate',
      width: 140,
      render: (v: string) => (
        <div className="flex items-center gap-1.5 text-sm">
          <CalendarIcon className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-wine-700">{v}</span>
        </div>
      ),
    },
    {
      title: '理由说明',
      dataIndex: 'reason',
      key: 'reason',
      width: 280,
      render: (v: string) => (
        <Tooltip title={v}>
          <div className="text-sm text-cream-600 leading-relaxed line-clamp-2">{v}</div>
        </Tooltip>
      ),
    },
    {
      title: '预估金额',
      key: 'totalPrice',
      width: 110,
      align: 'right' as const,
      render: (_: unknown, record: SuggestionRowData) => (
        <span className="font-bold text-gold-600">¥{record.totalPrice.toFixed(2)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: SuggestionRowData) => {
        const inOrder = purchaseOrder.some(i => i.materialType === record.materialType);
        return (
          <div className="flex items-center gap-1">
            <Button
              size="small"
              type={inOrder ? 'default' : 'primary'}
              icon={<ShoppingCart className="w-3.5 h-3.5" />}
              onClick={() => handleAddToOrder(record)}
              className={!inOrder ? '!bg-gradient-to-r !from-wine-600 !to-wine-700' : ''}
            >
              {inOrder ? '已加入' : '加入'}
            </Button>
            <Button
              size="small"
              danger={ignoredItems.has(record.materialType)}
              type={ignoredItems.has(record.materialType) ? 'primary' : 'text'}
              icon={ignoredItems.has(record.materialType) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              onClick={() => handleIgnore(record.materialType)}
            >
              {ignoredItems.has(record.materialType) ? '恢复' : '忽略'}
            </Button>
          </div>
        );
      },
    },
  ];

  const expandedRowRender = (record: SuggestionRowData) => {
    if (record.calculationDetail.length === 0) {
      return <Empty description="无计算详情" />;
    }
    return (
      <div className="py-2">
        <div className="flex items-center gap-2 mb-3 text-sm text-wine-700 font-medium">
          <Calculator className="w-4 h-4 text-gold-500" />
          采购建议计算过程
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {record.calculationDetail.map((d, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-cream-50 border border-cream-200"
            >
              <div className="text-xs text-cream-500 mb-1">{d.label}</div>
              <div className="text-sm font-medium text-wine-700">{d.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSummaryCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    sub: string,
    color: string
  ) => (
    <Card className="card-elegant !rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-cream-500 mb-2">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          <p className="text-xs text-cream-400 mt-1">{sub}</p>
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      <Card className="card-elegant">
        <Collapse
          defaultActiveKey={['params']}
          ghost
          expandIcon={({ isActive }) => (
            isActive ? <ChevronDown className="w-4 h-4 text-gold-500" /> : <ChevronRight className="w-4 h-4 text-gold-500" />
          )}
        >
          <Panel
            header={
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gold-500" />
                <span className="font-medium text-wine-700">参数设置</span>
                <span className="text-xs text-cream-400 ml-2">
                  统计 {statDays} 天 · 安全库存 {safetyDays} 天 · 活动系数 ×{activityMultiplier}
                </span>
              </div>
            }
            key="params"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-wine-700 font-medium">
                    <CalendarIcon className="w-4 h-4 text-gold-500" />
                    统计天数
                  </div>
                  <Tag color="gold">{statDays} 天</Tag>
                </div>
                <Slider
                  min={15}
                  max={90}
                  value={statDays}
                  onChange={setStatDays}
                  marks={{ 15: '15', 30: '30', 60: '60', 90: '90' }}
                  tooltip={{ formatter: (v) => `${v} 天` }}
                />
                <div className="mt-2 text-xs text-cream-400">取此期间的消耗数据计算日均消耗</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-wine-700 font-medium">
                    <Shield className="w-4 h-4 text-gold-500" />
                    安全库存天数
                  </div>
                  <Tag color="gold">{safetyDays} 天</Tag>
                </div>
                <Slider
                  min={3}
                  max={30}
                  value={safetyDays}
                  onChange={setSafetyDays}
                  marks={{ 3: '3', 7: '7', 14: '14', 30: '30' }}
                  tooltip={{ formatter: (v) => `${v} 天` }}
                />
                <div className="mt-2 text-xs text-cream-400">低于此时长即触发采购建议</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-wine-700 font-medium">
                    <Zap className="w-4 h-4 text-gold-500" />
                    活动期间上浮系数
                  </div>
                  <Tag color="gold">×{activityMultiplier.toFixed(1)}</Tag>
                </div>
                <Slider
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={activityMultiplier}
                  onChange={setActivityMultiplier}
                  marks={{ 1.0: '1.0', 1.5: '1.5', 2.0: '2.0', 3.0: '3.0' }}
                  tooltip={{ formatter: (v) => `×${Number(v).toFixed(1)}` }}
                />
                <div className="mt-2 text-xs text-cream-400">临近活动时建议采购量的放大倍数</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="primary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={handleRecalculate}
                className="btn-primary"
              >
                重新计算
              </Button>
            </div>
          </Panel>
        </Collapse>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          {renderSummaryCard(
            <Wallet className="w-6 h-6" />,
            '建议采购总金额',
            `¥${summary.totalAmount.toLocaleString()}`,
            `${validSuggestions.filter(s => s.suggestedQuantity > 0).length} 类耗材预估`,
            '#722F37'
          )}
        </Col>
        <Col xs={24} md={8}>
          {renderSummaryCard(
            <Layers className="w-6 h-6" />,
            '建议采购品类数',
            summary.categoryCount,
            `共 ${MATERIAL_TYPES.length} 类耗材`,
            '#C9A962'
          )}
        </Col>
        <Col xs={24} md={8}>
          {renderSummaryCard(
            <Clock className="w-6 h-6" />,
            '预计可用天数',
            `${summary.estimatedDays} 天`,
            '按当前日均消耗估算',
            '#4CAF50'
          )}
        </Col>
      </Row>

      <Card
        className="card-elegant"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gold-500" />
              <span className="text-wine-700 font-medium">采购建议</span>
              <Tag className="!ml-2">{validSuggestions.length} 项</Tag>
              {ignoredItems.size > 0 && (
                <Tag color="default">已忽略 {ignoredItems.size}</Tag>
              )}
            </div>
          </div>
        }
      >
        {validSuggestions.length > 0 ? (
          <Table
            dataSource={validSuggestions}
            columns={columns}
            scroll={{ x: 1200 }}
            pagination={false}
            size="middle"
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
              expandIcon: ({ expanded, onExpand, record }) => (
                <span
                  className="expand-icon"
                  onClick={(e) => onExpand(record, e)}
                >
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-gold-500 inline-block" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gold-500 inline-block" />
                  )}
                </span>
              ),
            }}
            rowClassName={(record) => {
              if (record.availableDays < 7) return '!bg-status-danger/5';
              if (record.availableDays < 14) return '!bg-status-warning/5';
              return '';
            }}
          />
        ) : (
          <Empty
            description={
              <div className="text-cream-500">
                {ignoredItems.size === MATERIAL_TYPES.length
                  ? '所有耗材已被忽略'
                  : '暂无采购建议数据'}
              </div>
            }
          />
        )}
      </Card>

      <Card
        className="card-elegant"
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gold-500" />
              <span className="text-wine-700 font-medium">模拟采购单</span>
              <Tag color="gold">{purchaseOrder.length} 项</Tag>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm mr-4">
                <span className="text-cream-500 mr-1">合计：</span>
                <span className="text-gold-600 font-bold">
                  {orderSummary.totalQty.toLocaleString()} 件 / ¥{orderSummary.totalAmt.toLocaleString()}
                </span>
              </div>
              <Button
                size="small"
                icon={<FileText className="w-4 h-4" />}
                onClick={handleExportCSV}
                disabled={purchaseOrder.length === 0}
                className="btn-secondary"
              >
                导出CSV
              </Button>
              <Button
                size="small"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
                disabled={purchaseOrder.length === 0}
                className="btn-secondary"
              >
                打印采购单
              </Button>
              <Button
                size="small"
                danger
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleClearOrder}
                disabled={purchaseOrder.length === 0}
              >
                清空
              </Button>
            </div>
          </div>
        }
      >
        {purchaseOrder.length > 0 ? (
          <div className="space-y-3">
            {purchaseOrder.map(item => {
              const config = MATERIAL_CONFIG[item.materialType];
              return (
                <div
                  key={item.materialType}
                  className="flex items-center gap-4 p-4 rounded-xl bg-cream-50 border border-cream-200 transition-all hover:shadow-elegant"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-wine-700">{config.name}</div>
                    <div className="text-xs text-cream-500">
                      单价 ¥{item.unitPrice.toFixed(2)} / {config.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="small"
                      type="text"
                      icon={<Minus className="w-3.5 h-3.5" />}
                      onClick={() => handleUpdateOrderQty(item.materialType, Math.max(1, item.quantity - 1))}
                    />
                    <InputNumber
                      size="small"
                      min={1}
                      value={item.quantity}
                      onChange={(v) => handleUpdateOrderQty(item.materialType, v)}
                      className="!w-24"
                    />
                    <Button
                      size="small"
                      type="text"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => handleUpdateOrderQty(item.materialType, item.quantity + 1)}
                    />
                  </div>
                  <Divider type="vertical" className="!h-8" />
                  <div className="text-right shrink-0 w-28">
                    <div className="text-lg font-bold text-gold-600">¥{item.subtotal.toFixed(2)}</div>
                    <div className="text-xs text-cream-400">{item.quantity.toLocaleString()} {config.unit}</div>
                  </div>
                  <Button
                    size="small"
                    danger
                    type="text"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleRemoveFromOrder(item.materialType)}
                  />
                </div>
              );
            })}
            <div className="flex justify-end pt-4 border-t border-cream-200">
              <div className="text-right space-y-1">
                <div className="text-sm text-cream-500">
                  {purchaseOrder.length} 项 · 共 {orderSummary.totalQty.toLocaleString()} 件
                </div>
                <div className="text-2xl font-bold text-wine-700">
                  总计 ¥{orderSummary.totalAmt.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <div className="text-wine-700 font-medium mb-1">采购单为空</div>
                <div className="text-sm text-cream-500">在上方建议表中点击「加入采购单」开始添加</div>
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
}
