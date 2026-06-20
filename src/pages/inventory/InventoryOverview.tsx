import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Tag,
  Progress,
  Drawer,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Space,
  message,
  Popconfirm,
  Divider,
  Modal,
  Typography,
} from 'antd';
import {
  FileText,
  Coffee,
  SprayCan,
  Sparkles,
  Tag as TagIcon,
  Edit3,
  Sliders,
  History,
  Plus,
  Minus,
  Settings2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Archive,
  Calendar,
  Layers,
  Box,
  Clock,
} from 'lucide-react';
import dayjs from 'dayjs';
import clsx from 'clsx';

import { useInventoryStore, useCounterStore } from '@/stores';
import {
  MaterialType,
  MATERIAL_CONFIG,
  InventoryItem,
} from '@/types/index';

const { Text } = Typography;

const MATERIAL_TYPES: MaterialType[] = [
  'scentPaper',
  'coffeeBean',
  'sprayNozzle',
  'cleaningCloth',
  'labelSticker',
];

const MATERIAL_ICON_BG: Record<MaterialType, string> = {
  scentPaper: 'icon-bg-wine',
  coffeeBean: 'icon-bg-coffee',
  sprayNozzle: 'icon-bg-green',
  cleaningCloth: 'icon-bg-blue',
  labelSticker: 'icon-bg-gold',
};

const getMaterialIcon = (type: MaterialType, size = 20) => {
  const IconMap: Record<MaterialType, React.ComponentType<Record<string, unknown>>> = {
    scentPaper: FileText,
    coffeeBean: Coffee,
    sprayNozzle: SprayCan,
    cleaningCloth: Sparkles,
    labelSticker: TagIcon,
  };
  const Comp = IconMap[type];
  const cfg = MATERIAL_CONFIG[type];
  return <Comp size={size} strokeWidth={2} color={cfg.color} />;
};

const calcStatus = (item: InventoryItem): 'normal' | 'warning' | 'shortage' => {
  const ratio = item.threshold > 0 ? item.quantity / item.threshold : 0;
  if (ratio <= 0) return 'shortage';
  if (ratio < 0.5) return 'shortage';
  if (ratio < 0.8) return 'warning';
  return 'normal';
};

const StatusTag: React.FC<{ status: 'normal' | 'warning' | 'shortage' }> = ({ status }) => {
  const map = {
    normal: { className: 'tag-status-normal', text: '正常', Icon: CheckCircle2, color: '#4CAF50' },
    warning: { className: 'tag-status-warning', text: '预警', Icon: AlertTriangle, color: '#FF9800' },
    shortage: { className: 'tag-status-danger', text: '缺货', Icon: XCircle, color: '#E53935' },
  } as const;
  const cfg = map[status];
  return (
    <Tag className={cfg.className} icon={<cfg.Icon size={12} color={cfg.color} />}>
      {cfg.text}
    </Tag>
  );
};

interface MaterialStat {
  type: MaterialType;
  totalQty: number;
  totalThreshold: number;
  itemCount: number;
  warningCount: number;
  shortageCount: number;
}

export default function InventoryOverview() {
  const { inventoryItems, loading, updateInventoryItem, fetchInventory } = useInventoryStore();
  const { counters } = useCounterStore();

  const [activeType, setActiveType] = useState<MaterialType | 'all'>('all');
  const [selectedCounterIds, setSelectedCounterIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'shortage'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();
  const [historyModal, setHistoryModal] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [batchModal, setBatchModal] = useState({ open: false, newThreshold: 100 });

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const counterNameMap = useMemo(() => {
    const m = new Map<string, string>();
    counters.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [counters]);

  const materialStats = useMemo<MaterialStat[]>(() => {
    return MATERIAL_TYPES.map((type) => {
      const items = inventoryItems.filter((i) => i.materialType === type);
      return {
        type,
        totalQty: items.reduce((sum, i) => sum + i.quantity, 0),
        totalThreshold: items.reduce((sum, i) => sum + i.threshold, 0),
        itemCount: items.length,
        warningCount: items.filter((i) => calcStatus(i) === 'warning').length,
        shortageCount: items.filter((i) => calcStatus(i) === 'shortage').length,
      };
    });
  }, [inventoryItems]);

  const grandTotalQty = useMemo(
    () => materialStats.reduce((sum, s) => sum + s.totalQty, 0),
    [materialStats]
  );

  const filteredData = useMemo(() => {
    return inventoryItems.filter((i) => {
      if (activeType !== 'all' && i.materialType !== activeType) return false;
      if (selectedCounterIds.length > 0 && !selectedCounterIds.includes(i.counterId)) return false;
      const st = calcStatus(i);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      return true;
    });
  }, [inventoryItems, activeType, selectedCounterIds, statusFilter]);

  const openEditDrawer = (item: InventoryItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      quantity: item.quantity,
      threshold: item.threshold,
      drawer: item.drawer,
      batchNo: item.batchNo,
      note: '',
    });
    setDrawerOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const values = await form.validateFields();
      await updateInventoryItem(editingItem.id, {
        quantity: values.quantity,
        threshold: values.threshold,
        drawer: values.drawer,
        batchNo: values.batchNo,
      });
      message.success('库存信息已更新');
      setDrawerOpen(false);
    } catch {
      //
    }
  };

  const handleBatchThreshold = () => {
    setBatchModal({ open: true, newThreshold: 100 });
  };

  const confirmBatchThreshold = () => {
    message.info(`已设置批量调整阈值功能（当前筛选 ${filteredData.length} 条记录）`);
    setBatchModal({ open: false, newThreshold: 100 });
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <div className="flex items-center gap-2 px-1">
          <Layers size={16} className="text-wine-500" />
          <span>全部</span>
        </div>
      ),
    },
    ...MATERIAL_TYPES.map((t) => {
      const cfg = MATERIAL_CONFIG[t];
      return {
        key: t,
        label: (
          <div className="flex items-center gap-2 px-1">
            <span style={{ color: cfg.color }}>{getMaterialIcon(t, 16)}</span>
            <span>{cfg.name}</span>
          </div>
        ),
      };
    }),
  ];

  const columns = [
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Archive size={14} className="text-gold-600" />
          品牌区
        </div>
      ),
      dataIndex: 'counterId',
      key: 'counterId',
      width: 130,
      render: (id: string) => (
        <Text strong className="text-wine-700">
          {counterNameMap.get(id) ?? '未知品牌区'}
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Box size={14} className="text-gold-600" />
          耗材类型
        </div>
      ),
      dataIndex: 'materialType',
      key: 'materialType',
      width: 130,
      render: (type: MaterialType) => {
        const cfg = MATERIAL_CONFIG[type];
        return (
          <div className="flex items-center gap-2">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', MATERIAL_ICON_BG[type])}>
              {getMaterialIcon(type, 16)}
            </div>
            <Text>{cfg.name}</Text>
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Package size={14} className="text-gold-600" />
          当前数量
        </div>
      ),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 200,
      render: (qty: number, record: InventoryItem) => {
        const st = calcStatus(record);
        const percent = Math.min(100, record.threshold > 0 ? Math.round((qty / record.threshold) * 100) : 0);
        const colorMap = {
          normal: 'text-status-normal',
          warning: 'text-status-warning',
          shortage: 'text-status-danger',
        } as const;
        const wrapClass = {
          normal: 'progress-wrap-normal',
          warning: 'progress-wrap-warning',
          shortage: 'progress-wrap-shortage',
        } as const;
        return (
          <div className="py-1">
            <div className="flex items-center justify-between mb-1.5">
              <Text strong className={clsx('text-lg', colorMap[st])}>
                {qty.toLocaleString()}
                <Text type="secondary" className="text-xs ml-1 font-normal">
                  {MATERIAL_CONFIG[record.materialType].unit}
                </Text>
              </Text>
              <Text type="secondary" className="text-xs">
                {percent}%
              </Text>
            </div>
            <div className={wrapClass[st]}>
              <Progress percent={percent} showInfo={false} size="small" strokeWidth={6} />
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Sliders size={14} className="text-gold-600" />
          阈值
        </div>
      ),
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100,
      render: (v: number, record: InventoryItem) => (
        <Text>
          {v.toLocaleString()}
          <Text type="secondary" className="text-xs ml-1">
            {MATERIAL_CONFIG[record.materialType].unit}
          </Text>
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-gold-600" />
          状态
        </div>
      ),
      key: 'status',
      width: 100,
      render: (_: unknown, record: InventoryItem) => <StatusTag status={calcStatus(record)} />,
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Archive size={14} className="text-gold-600" />
          存放抽屉
        </div>
      ),
      dataIndex: 'drawer',
      key: 'drawer',
      width: 110,
      render: (v: string) => (
        <Tag className="bg-cream-50 border-cream-300 text-cream-500 rounded-md px-3 py-0.5 text-xs">
          {v}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Layers size={14} className="text-gold-600" />
          批次号
        </div>
      ),
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 170,
      render: (v: string) => (
        <Text code className="!bg-cream-50 !text-wine-700 !text-xs">
          {v}
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gold-600" />
          最后更新
        </div>
      ),
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 160,
      render: (v: string) => (
        <span className="text-cream-500 text-xs">{dayjs(v).format('MM-DD HH:mm')}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5">
          <Edit3 size={14} className="text-gold-600" />
          操作
        </div>
      ),
      key: 'action',
      width: 190,
      fixed: 'right' as const,
      render: (_: unknown, record: InventoryItem) => (
        <Space size={6}>
          <Button
            type="text"
            size="small"
            icon={<Edit3 size={14} />}
            className="!text-wine-600 hover:!text-wine-800 !px-2"
            onClick={() => openEditDrawer(record)}
          >
            编辑数量
          </Button>
          <Button
            type="text"
            size="small"
            icon={<Sliders size={14} />}
            className="!text-gold-600 hover:!text-gold-800 !px-2"
            onClick={() => openEditDrawer(record)}
          >
            调阈值
          </Button>
          <Button
            type="text"
            size="small"
            icon={<History size={14} />}
            className="!text-cream-500 hover:!text-wine-600 !px-2"
            onClick={() => setHistoryModal({ open: true, item: record })}
          >
            历史
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <Card className="card-elegant !p-0 overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="px-6 pt-5 pb-3 border-b border-cream-200 flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[600px]">
            <Tabs
              activeKey={activeType}
              onChange={(k) => setActiveType(k as MaterialType | 'all')}
              items={tabItems}
              size="large"
              className="material-tabs"
              style={{ borderBottom: 'none' }}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Text type="secondary" className="text-xs whitespace-nowrap">
                品牌区：
              </Text>
              <Select
                mode="multiple"
                allowClear
                placeholder="全部品牌区"
                size="middle"
                style={{ minWidth: 220 }}
                value={selectedCounterIds}
                onChange={setSelectedCounterIds}
                options={counters.map((c) => ({ label: c.name, value: c.id }))}
                maxTagCount="responsive"
                className="!rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Text type="secondary" className="text-xs whitespace-nowrap">
                状态：
              </Text>
              <Select
                size="middle"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                style={{ width: 120 }}
                options={[
                  { label: '全部状态', value: 'all' },
                  { label: '正常', value: 'normal' },
                  { label: '预警', value: 'warning' },
                  { label: '缺货', value: 'shortage' },
                ]}
                className="!rounded-lg"
              />
            </div>
            <Button
              type="primary"
              icon={<Settings2 size={16} />}
              onClick={handleBatchThreshold}
              className="btn-primary !h-9"
            >
              批量调整阈值
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 p-5 bg-gradient-to-b from-cream-50/60 to-white">
          {materialStats.map((stat, idx) => {
            const cfg = MATERIAL_CONFIG[stat.type];
            const percent = grandTotalQty > 0 ? Math.round((stat.totalQty / grandTotalQty) * 100) : 0;
            const overallStatus: 'normal' | 'warning' = stat.shortageCount > 0 ? 'warning' : stat.warningCount > 0 ? 'warning' : 'normal';
            return (
              <div
                key={stat.type}
                className={clsx(
                  'stagger-item stagger-' + (idx + 1),
                  'relative bg-white rounded-xl border border-cream-200 p-4 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', MATERIAL_ICON_BG[stat.type])}>
                    {getMaterialIcon(stat.type, 22)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {stat.shortageCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-danger/10 text-status-danger border border-status-danger/20">
                        <XCircle size={10} /> 缺货 {stat.shortageCount}
                      </span>
                    )}
                    {overallStatus === 'normal' && stat.shortageCount === 0 && (
                      <StatusTag status={overallStatus} />
                    )}
                    {overallStatus === 'warning' && stat.shortageCount === 0 && (
                      <StatusTag status="warning" />
                    )}
                  </div>
                </div>
                <div className="mb-1">
                  <Text type="secondary" className="text-xs">
                    {cfg.name} · 总库存
                  </Text>
                </div>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold tracking-tight" style={{ color: '#B08D3D' }}>
                    {stat.totalQty.toLocaleString()}
                  </span>
                  <Text type="secondary" className="text-xs">
                    {cfg.unit}
                  </Text>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-cream-500 mb-1">
                    <span>占比</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-cream-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${percent}%`,
                        background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="card-elegant" styles={{ body: { padding: 0 } }}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-cream-200">
          <div>
            <h3 className="text-base font-semibold text-wine-700 font-serif flex items-center gap-2">
              <Archive size={18} className="text-gold-500" />
              库存明细
            </h3>
            <Text type="secondary" className="text-xs">
              共 {filteredData.length} 条记录
            </Text>
          </div>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1400 }}
          rowClassName={(record) => {
            const st = calcStatus(record);
            return clsx(
              'table-row-hover transition-all duration-200',
              st === 'shortage' && 'breathing-shortage'
            );
          }}
        />
      </Card>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg icon-bg-gold flex items-center justify-center">
              <Edit3 size={16} className="text-gold-600" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-wine-700 m-0">编辑库存信息</h3>
              <Text type="secondary" className="text-xs">
                {editingItem && counterNameMap.get(editingItem.counterId)} ·{' '}
                {editingItem && MATERIAL_CONFIG[editingItem.materialType].name}
              </Text>
            </div>
          </div>
        }
        placement="right"
        width={440}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)} className="btn-secondary">
              取消
            </Button>
            <Button type="primary" onClick={handleSaveEdit} className="btn-primary">
              保存
            </Button>
          </Space>
        }
      >
        {editingItem && (
          <Form form={form} layout="vertical" className="pt-3">
            <Divider orientation="left" className="!text-xs !text-cream-500 !font-normal">
              库存数量
            </Divider>
            <Form.Item
              label={
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Package size={14} className="text-gold-500" />
                  当前数量
                  <Text type="secondary" className="text-xs font-normal ml-1">
                    ({MATERIAL_CONFIG[editingItem.materialType].unit})
                  </Text>
                </span>
              }
              name="quantity"
              rules={[{ required: true, message: '请输入数量' }, { type: 'number', min: 0 }]}
            >
              <div className="flex items-center gap-2">
                <Button
                  shape="circle"
                  size="small"
                  icon={<Minus size={14} />}
                  className="!border-wine-200 !text-wine-600 hover:!bg-wine-50"
                  onClick={() => form.setFieldsValue({ quantity: Math.max(0, (form.getFieldValue('quantity') ?? 0) - 10) })}
                />
                <Button
                  shape="circle"
                  size="small"
                  icon={<Minus size={12} />}
                  className="!border-cream-300 !text-cream-500 hover:!bg-cream-50"
                  onClick={() => form.setFieldsValue({ quantity: Math.max(0, (form.getFieldValue('quantity') ?? 0) - 1) })}
                />
                <InputNumber
                  className="!flex-1"
                  size="large"
                  style={{ width: '100%' }}
                  controls={false}
                />
                <Button
                  shape="circle"
                  size="small"
                  icon={<Plus size={12} />}
                  className="!border-cream-300 !text-cream-500 hover:!bg-cream-50"
                  onClick={() => form.setFieldsValue({ quantity: (form.getFieldValue('quantity') ?? 0) + 1 })}
                />
                <Button
                  shape="circle"
                  size="small"
                  icon={<Plus size={14} />}
                  className="!border-gold-300 !bg-gold-50 !text-gold-700 hover:!bg-gold-100"
                  onClick={() => form.setFieldsValue({ quantity: (form.getFieldValue('quantity') ?? 0) + 10 })}
                />
              </div>
            </Form.Item>

            <Form.Item
              label={
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Sliders size={14} className="text-gold-500" />
                  安全阈值
                </span>
              }
              name="threshold"
              rules={[{ required: true, message: '请输入阈值' }, { type: 'number', min: 1 }]}
            >
              <InputNumber size="large" style={{ width: '100%' }} min={1} />
            </Form.Item>

            <Divider orientation="left" className="!text-xs !text-cream-500 !font-normal">
              存放信息
            </Divider>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <Archive size={14} className="text-gold-500" />
                    存放抽屉
                  </span>
                }
                name="drawer"
                rules={[{ required: true, message: '请填写' }]}
              >
                <Input size="large" placeholder="如 A-01" />
              </Form.Item>
              <Form.Item
                label={
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <Layers size={14} className="text-gold-500" />
                    批次号
                  </span>
                }
                name="batchNo"
                rules={[{ required: true, message: '请填写' }]}
              >
                <Input size="large" placeholder="批次编号" />
              </Form.Item>
            </div>

            <Divider orientation="left" className="!text-xs !text-cream-500 !font-normal">
              变更记录
            </Divider>

            <Form.Item
              label={
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Calendar size={14} className="text-gold-500" />
                  变更备注
                </span>
              }
              name="note"
            >
              <Input.TextArea rows={3} placeholder="选填，记录本次调整原因..." className="!rounded-lg resize-none" />
            </Form.Item>
          </Form>
        )}
      </Drawer>

      <Modal
        open={historyModal.open}
        onCancel={() => setHistoryModal({ open: false, item: null })}
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg icon-bg-gold flex items-center justify-center">
              <History size={16} className="text-gold-600" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-wine-700 m-0">操作历史</h3>
              <Text type="secondary" className="text-xs">
                {historyModal.item && counterNameMap.get(historyModal.item.counterId)} ·{' '}
                {historyModal.item && MATERIAL_CONFIG[historyModal.item.materialType].name}
              </Text>
            </div>
          </div>
        }
      >
        <div className="py-4 space-y-2">
          {[
            { time: historyModal.item?.lastUpdated, action: '最后一次更新', operator: '系统同步', note: '巡查登记自动同步' },
          ].map((log, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-cream-50 border border-cream-200">
              <div className="w-7 h-7 rounded-full bg-white border border-gold-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock size={12} className="text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Text strong className="text-sm text-wine-700">
                    {log.action}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {log.time ? dayjs(log.time).format('YYYY-MM-DD HH:mm') : '-'}
                  </Text>
                </div>
                <Text type="secondary" className="text-xs">
                  操作人：{log.operator}
                </Text>
                {log.note && (
                  <div className="mt-1.5 p-2 rounded-md bg-white text-xs text-cream-500 border border-cream-200">
                    {log.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={batchModal.open}
        onCancel={() => setBatchModal({ open: false, newThreshold: 100 })}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg icon-bg-gold flex items-center justify-center">
              <Settings2 size={16} className="text-gold-600" />
            </div>
            <h3 className="text-base font-serif font-semibold text-wine-700 m-0">批量调整阈值</h3>
          </div>
        }
        footer={
          <Space>
            <Button onClick={() => setBatchModal({ open: false, newThreshold: 100 })} className="btn-secondary">
              取消
            </Button>
            <Popconfirm title="确定批量调整所有筛选结果的阈值？" onConfirm={confirmBatchThreshold}>
              <Button type="primary" className="btn-primary">
                确认调整
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <div className="py-4 space-y-4">
          <div className="p-3 rounded-lg bg-cream-50 border border-cream-200 text-sm text-cream-500">
            将对当前筛选结果中的 <Text strong className="text-wine-600">{filteredData.length}</Text> 条记录设置统一阈值。
          </div>
          <div>
            <label className="text-sm font-medium text-wine-700 mb-2 block">新阈值</label>
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              min={1}
              value={batchModal.newThreshold}
              onChange={(v) => setBatchModal({ open: true, newThreshold: Number(v) || 1 })}
              placeholder="请输入统一阈值"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
