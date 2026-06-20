import { useState, useMemo } from 'react';
import {
  Avatar,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button as AntButton,
  Timeline,
  Empty,
  Tooltip,
  Popconfirm,
  message,
  Image,
} from 'antd';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Table,
  FlaskConical,
  Calendar,
  Phone,
  UserPlus,
  UserMinus,
  Sunrise,
  Sun,
  Moon,
  FileText,
  Coffee,
  SprayCan,
  Sparkles,
  Tag as TagIcon,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCounterStore } from '@/stores/counterStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useInspectionStore } from '@/stores/inspectionStore';
import { MATERIAL_CONFIG, PERIOD_CONFIG } from '@/types/index';
import type { MaterialType, PeriodType, UserRole } from '@/types/index';
import { getInventoryStatus } from '@/utils/calculations';

const MATERIAL_ICONS: Record<MaterialType, typeof FileText> = {
  scentPaper: FileText,
  coffeeBean: Coffee,
  sprayNozzle: SprayCan,
  cleaningCloth: Sparkles,
  labelSticker: TagIcon,
};

const PERIOD_ICONS: Record<PeriodType, typeof Sunrise> = {
  morning: Sunrise,
  noon: Sun,
  closing: Moon,
};

export default function CounterDetail() {
  const { id: counterId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getCounterById, updateCounter, deleteCounter, loading } = useCounterStore();
  const { getInventoryByCounter } = useInventoryStore();
  const inspectionStore = useInspectionStore();

  const counter = counterId ? getCounterById(counterId) : undefined;
  const inventoryItems = counterId ? getInventoryByCounter(counterId) : [];

  const recentRecords = useMemo(() => {
    if (!counterId) return [];
    return inspectionStore
      .getRecordsByCounter(counterId)
      .sort((a, b) => dayjs(b.inspectedAt).valueOf() - dayjs(a.inspectedAt).valueOf())
      .slice(0, 10);
  }, [counterId, inspectionStore]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddGuideModalOpen, setIsAddGuideModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [guideForm] = Form.useForm();

  const activePhoto = counter?.photoUrls[activePhotoIndex];

  if (!counter) {
    return (
      <div className="animate-fade-in-up">
        <button
          onClick={() => navigate('/counters')}
          className="flex items-center gap-2 text-wine-600 hover:text-wine-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回品牌区列表
        </button>
        <div className="card-elegant py-20 text-center">
          <Empty description="未找到该品牌区信息" />
        </div>
      </div>
    );
  }

  const handleUpdateCounter = async (values: {
    name: string;
    brandColor: string;
    tastingTableCount: number;
    displayBottleCount: number;
    photoUrls: string;
    description?: string;
  }) => {
    try {
      const photos = values.photoUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      await updateCounter(counter.id, {
        name: values.name,
        brandColor: values.brandColor || counter.brandColor,
        tastingTableCount: values.tastingTableCount || counter.tastingTableCount,
        displayBottleCount: values.displayBottleCount || counter.displayBottleCount,
        photoUrls: photos.length ? photos : counter.photoUrls,
        description: values.description,
      });

      message.success('更新成功');
      setIsEditModalOpen(false);
      editForm.resetFields();
    } catch {
      message.error('更新失败，请重试');
    }
  };

  const handleDeleteCounter = async () => {
    try {
      await deleteCounter(counter.id);
      message.success('删除成功');
      navigate('/counters');
    } catch {
      message.error('删除失败，请重试');
    }
  };

  const handleRemoveGuide = (guideId: string) => {
    const newGuides = counter.guides.filter((g) => g.id !== guideId);
    void updateCounter(counter.id, {
      name: counter.name,
      brandColor: counter.brandColor,
      tastingTableCount: counter.tastingTableCount,
      displayBottleCount: counter.displayBottleCount,
      photoUrls: counter.photoUrls,
      description: counter.description,
    });
    counter.guides = newGuides;
    message.success('已移除导购');
  };

  const handleAddGuide = async (values: {
    name: string;
    phone: string;
    avatar: string;
    role: UserRole;
  }) => {
    try {
      const newGuide = {
        id: `guide-${Date.now()}`,
        name: values.name,
        phone: values.phone,
        avatar: values.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
        role: values.role || 'guide',
        counterId: counter.id,
      };

      await updateCounter(counter.id, {
        name: counter.name,
        brandColor: counter.brandColor,
        tastingTableCount: counter.tastingTableCount,
        displayBottleCount: counter.displayBottleCount,
        photoUrls: counter.photoUrls,
        description: counter.description,
      });
      counter.guides.push(newGuide);
      message.success('导购添加成功');
      setIsAddGuideModalOpen(false);
      guideForm.resetFields();
    } catch {
      message.error('添加失败，请重试');
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="card-elegant p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/counters')}
              className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center text-wine-600 hover:bg-wine-50 hover:text-wine-800 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-inner"
                  style={{ backgroundColor: counter.brandColor }}
                />
                <h1 className="font-serif text-2xl font-semibold text-wine-800">
                  {counter.name}
                </h1>
              </div>
              <p className="text-sm text-cream-500 mt-1 ml-7">
                创建于 {dayjs(counter.createdAt).format('YYYY年MM月DD日')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                editForm.setFieldsValue({
                  name: counter.name,
                  brandColor: counter.brandColor,
                  tastingTableCount: counter.tastingTableCount,
                  displayBottleCount: counter.displayBottleCount,
                  photoUrls: counter.photoUrls.join('\n'),
                  description: counter.description,
                });
                setIsEditModalOpen(true);
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              编辑
            </button>
            <Popconfirm
              title="确定删除该品牌区？"
              description="删除后数据无法恢复"
              onConfirm={handleDeleteCounter}
              okText="确认删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <button className="px-5 py-2.5 rounded-lg bg-white text-status-danger font-medium border border-status-danger/30 transition-all duration-300 hover:bg-status-danger/5">
                <Trash2 className="w-4 h-4 inline mr-2" />
                删除
              </button>
            </Popconfirm>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="card-elegant p-6">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-cream-100 shadow-elegant">
                {activePhoto ? (
                  <Image
                    src={activePhoto}
                    alt={counter.name}
                    className="w-full h-full object-cover transition-all duration-500"
                    style={{ borderRadius: 0 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cream-400">
                    <FileText className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                  {activePhotoIndex + 1} / {counter.photoUrls.length}
                </div>
              </div>

              {counter.photoUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {counter.photoUrls.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                        activePhotoIndex === idx
                          ? 'ring-2 ring-wine-500 ring-offset-2 scale-105 shadow-elegant'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`${counter.name}-${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card-elegant p-6">
            <h2 className="font-serif text-lg font-semibold text-wine-700 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-500" />
              基本信息
            </h2>

            <div className="flex gap-4 mb-6">
              <div
                className="w-2 rounded-full shadow-inner flex-shrink-0"
                style={{ backgroundColor: counter.brandColor }}
              />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-cream-500 font-medium uppercase tracking-wider">品牌区名称</p>
                  <p className="text-lg font-serif font-semibold text-wine-800">{counter.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-cream-500 font-medium uppercase tracking-wider">品牌色</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full shadow-inner"
                      style={{ backgroundColor: counter.brandColor }}
                    />
                    <span className="text-sm font-mono text-wine-700">{counter.brandColor}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-cream-500 font-medium uppercase tracking-wider">试香台数量</p>
                  <div className="flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-wine-400" />
                    <span className="text-lg font-semibold text-wine-700">{counter.tastingTableCount}</span>
                    <span className="text-sm text-cream-500">台</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-cream-500 font-medium uppercase tracking-wider">展示瓶数量</p>
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-gold-500" />
                    <span className="text-lg font-semibold text-wine-700">{counter.displayBottleCount}</span>
                    <span className="text-sm text-cream-500">瓶</span>
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-cream-500 font-medium uppercase tracking-wider">创建时间</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-wine-400" />
                    <span className="text-sm text-wine-700">
                      {dayjs(counter.createdAt).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {counter.description && (
              <>
                <div className="divider-gold my-4" />
                <div className="space-y-2">
                  <p className="text-xs text-cream-500 font-medium uppercase tracking-wider">品牌区简介</p>
                  <p className="text-wine-700 leading-relaxed">{counter.description}</p>
                </div>
              </>
            )}
          </div>

          <div className="card-elegant p-6">
            <h2 className="font-serif text-lg font-semibold text-wine-700 mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-500" />
              库存概览
            </h2>

            <div className="space-y-5">
              {(Object.keys(MATERIAL_CONFIG) as MaterialType[]).map((materialType) => {
                const item = inventoryItems.find((i) => i.materialType === materialType);
                const config = MATERIAL_CONFIG[materialType];
                const IconComp = MATERIAL_ICONS[materialType];
                const { status, percentage } = item
                  ? getInventoryStatus(item.quantity, item.threshold)
                  : { status: 'normal' as const, percentage: 0 };

                const statusLabel = status === 'normal' ? '充足' : status === 'warning' ? '预警' : '缺货';
                const statusClass =
                  status === 'normal'
                    ? 'tag-status-normal'
                    : status === 'warning'
                    ? 'tag-status-warning'
                    : 'tag-status-danger';

                const progressColor =
                  status === 'normal' ? '#4CAF50' : status === 'warning' ? '#FF9800' : '#E53935';

                return (
                  <div key={materialType} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: `${config.color}15` }}
                        >
                          <IconComp className="w-4.5 h-4.5" style={{ color: config.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-wine-800 text-sm">{config.name}</p>
                          <p className="text-xs text-cream-500">抽屉：{item?.drawer || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className={statusClass}>{statusLabel}</Tag>
                        <span className="text-sm font-semibold text-wine-700">
                          {item?.quantity ?? 0}
                          <span className="text-xs text-cream-500 font-normal">
                            {' '}/ {item?.threshold ?? 0} {config.unit}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Progress
                      percent={Math.min(percentage, 150)}
                      showInfo={false}
                      strokeColor={progressColor}
                      trailColor="#F5E6E7"
                      size="small"
                      className="[&_.ant-progress-bg]:!h-2 [&_.ant-progress-outer]:!h-2"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="card-elegant p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg font-semibold text-wine-700 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-500" />
                导购管理
              </h2>
              <button
                onClick={() => setIsAddGuideModalOpen(true)}
                className="btn-primary !px-3 !py-1.5 text-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                添加导购
              </button>
            </div>

            {counter.guides.length === 0 ? (
              <Empty description="暂无导购分配" className="py-8" />
            ) : (
              <div className="space-y-3">
                {counter.guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-cream-50/50 hover:bg-cream-100 transition-all duration-300 group"
                  >
                    <Avatar
                      src={guide.avatar}
                      size={44}
                      className="ring-2 ring-white shadow-elegant flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-wine-800 truncate">{guide.name}</p>
                        {guide.role === 'manager' ? (
                          <Tag className="tag-gold !px-2">店长</Tag>
                        ) : (
                          <Tag className="tag-status-normal !px-2">导购</Tag>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-cream-500 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{guide.phone}</span>
                      </div>
                    </div>
                    <Tooltip title="移除导购">
                      <Popconfirm
                        title={`确定移除 ${guide.name}？`}
                        onConfirm={() => handleRemoveGuide(guide.id)}
                        okText="确认"
                        cancelText="取消"
                      >
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-cream-400 hover:text-status-danger hover:bg-status-danger/10 transition-all duration-300 opacity-0 group-hover:opacity-100">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </Popconfirm>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-elegant p-6">
            <h2 className="font-serif text-lg font-semibold text-wine-700 mb-5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-500" />
              最近巡查记录
            </h2>

            {recentRecords.length === 0 ? (
              <Empty description="暂无巡查记录" className="py-8" />
            ) : (
              <Timeline
                items={recentRecords.map((record, idx) => {
                  const periodConfig = PERIOD_CONFIG[record.period];
                  const PeriodIcon = PERIOD_ICONS[record.period];
                  const shortageCount = record.items.filter((i) => i.isShortage).length;

                  return {
                    key: record.id,
                    color: idx === 0 ? '#722F37' : '#D4949A',
                    dot: (
                      <div className="w-8 h-8 -ml-1 rounded-full bg-white shadow-elegant flex items-center justify-center border border-wine-100">
                        <PeriodIcon className="w-3.5 h-3.5 text-wine-600" />
                      </div>
                    ),
                    children: (
                      <div className="pb-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Tag className="tag-gold !text-xs !py-0">{periodConfig.name}</Tag>
                            <span className="text-xs text-cream-500">{periodConfig.time}</span>
                          </div>
                          {shortageCount > 0 ? (
                            <Tag className="tag-status-danger !text-xs !py-0">
                              缺货 {shortageCount} 项
                            </Tag>
                          ) : (
                            <Tag className="tag-status-normal !text-xs !py-0">正常</Tag>
                          )}
                        </div>
                        <p className="text-sm text-wine-700 font-medium">
                          {dayjs(record.inspectedAt).format('MM月DD日 HH:mm')}
                        </p>
                        <p className="text-xs text-cream-500 mt-0.5">
                          由 {counter.guides.find((g) => g.id === record.guideId)?.name || '未知导购'} 完成巡查
                          {record.isActivityDay && <Tag className="ml-2 !text-xs tag-gold">活动日</Tag>}
                        </p>
                      </div>
                    ),
                  };
                })}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="text-lg font-serif font-semibold text-wine-700">
            编辑品牌区
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
        styles={{
          mask: { backdropFilter: 'blur(4px)' },
        }}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateCounter}
          requiredMark="optional"
          className="pt-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="品牌区名称"
              name="name"
              rules={[{ required: true, message: '请输入品牌区名称' }]}
              className="col-span-2"
            >
              <Input className="input-elegant" />
            </Form.Item>

            <Form.Item
              label="品牌色"
              name="brandColor"
            >
              <Input
                type="color"
                className="h-11 w-full cursor-pointer rounded-lg border border-wine-100 p-1"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="试香台数"
                name="tastingTableCount"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={1} max={20} className="w-full" />
              </Form.Item>

              <Form.Item
                label="展示瓶数"
                name="displayBottleCount"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={1} max={100} className="w-full" />
              </Form.Item>
            </div>

            <Form.Item
              label="照片URL（每行一个）"
              name="photoUrls"
              className="col-span-2"
            >
              <Input.TextArea rows={3} className="resize-none" />
            </Form.Item>

            <Form.Item
              label="描述"
              name="description"
              className="col-span-2"
            >
              <Input.TextArea rows={2} className="resize-none" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <AntButton onClick={() => setIsEditModalOpen(false)}>取消</AntButton>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '保存中...' : '保存修改'}
            </button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="text-lg font-serif font-semibold text-wine-700">
            添加导购
          </div>
        }
        open={isAddGuideModalOpen}
        onCancel={() => setIsAddGuideModalOpen(false)}
        footer={null}
        width={480}
        destroyOnClose
        styles={{
          mask: { backdropFilter: 'blur(4px)' },
        }}
      >
        <Form
          form={guideForm}
          layout="vertical"
          onFinish={handleAddGuide}
          requiredMark="optional"
          className="pt-2"
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input className="input-elegant" placeholder="导购姓名" />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]}
          >
            <Input className="input-elegant" placeholder="138xxxxxxxx" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            initialValue="guide"
          >
            <Select
              options={[
                { value: 'guide', label: '导购' },
                { value: 'manager', label: '店长' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="头像URL"
            name="avatar"
          >
            <Input className="input-elegant" placeholder="留空使用默认头像" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <AntButton onClick={() => setIsAddGuideModalOpen(false)}>取消</AntButton>
            <button type="submit" className="btn-primary">
              确认添加
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
