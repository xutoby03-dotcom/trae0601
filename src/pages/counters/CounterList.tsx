import { useState, useMemo } from 'react';
import {
  Input,
  Select,
  Tag,
  Avatar,
  Modal,
  Form,
  InputNumber,
  Button as AntButton,
  Image,
  message,
} from 'antd';
import {
  Search,
  Table,
  FlaskConical,
  Users,
  Plus,
  ArrowRight,
  Package,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCounterStore } from '@/stores/counterStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { CounterWithGuides, Guide, MaterialType } from '@/types/index';
import { getInventoryStatus } from '@/utils/calculations';

type FilterType = 'all' | 'normal' | 'warning' | 'shortage';
type SortType = 'name' | 'tastingTable' | 'guides';

interface CounterStatusInfo {
  status: 'normal' | 'warning' | 'shortage';
  label: string;
  className: string;
}

const getCounterStatus = (counterId: string, inventoryItems: ReturnType<typeof useInventoryStore.getState>['inventoryItems']): CounterStatusInfo => {
  const counterInventory = inventoryItems.filter((item) => item.counterId === counterId);
  if (counterInventory.length === 0) {
    return { status: 'normal', label: '正常', className: 'tag-status-normal' };
  }

  let hasWarning = false;
  let hasShortage = false;

  counterInventory.forEach((item) => {
    const { status } = getInventoryStatus(item.quantity, item.threshold);
    if (status === 'danger') hasShortage = true;
    else if (status === 'warning') hasWarning = true;
  });

  if (hasShortage) return { status: 'shortage', label: '缺货', className: 'tag-status-danger' };
  if (hasWarning) return { status: 'warning', label: '预警', className: 'tag-status-warning' };
  return { status: 'normal', label: '正常', className: 'tag-status-normal' };
};

export default function CounterList() {
  const navigate = useNavigate();
  const { counters, addCounter, loading } = useCounterStore();
  const { inventoryItems, addInventoryItem } = useInventoryStore();

  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [form] = Form.useForm();

  const allGuides = useMemo(() => {
    const guides: Guide[] = [];
    counters.forEach((c) => guides.push(...c.guides));
    return guides;
  }, [counters]);

  const filteredCounters = useMemo(() => {
    let result = [...counters];

    if (searchText.trim()) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchText.trim().toLowerCase())
      );
    }

    if (filterType !== 'all') {
      result = result.filter((c) => {
        const statusInfo = getCounterStatus(c.id, inventoryItems);
        if (filterType === 'normal') return statusInfo.status === 'normal';
        if (filterType === 'warning') return statusInfo.status === 'warning';
        if (filterType === 'shortage') return statusInfo.status === 'shortage';
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortType === 'name') return a.name.localeCompare(b.name);
      if (sortType === 'tastingTable') return b.tastingTableCount - a.tastingTableCount;
      if (sortType === 'guides') return b.guides.length - a.guides.length;
      return 0;
    });

    return result;
  }, [counters, searchText, filterType, sortType, inventoryItems]);

  const handleAddCounter = async (values: {
    name: string;
    brandColor: string;
    tastingTableCount: number;
    displayBottleCount: number;
    photoUrls: string;
    guideIds?: string[];
    description?: string;
  }) => {
    try {
      const photos = values.photoUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const selectedGuides = values.guideIds?.length
        ? allGuides
            .filter((g) => values.guideIds?.includes(g.id))
            .map((g) => ({
              name: g.name,
              avatar: g.avatar,
              phone: g.phone,
              role: g.role,
              counterId: '',
            }))
        : [];

      await addCounter(
        {
          name: values.name,
          brandColor: values.brandColor || '#C9A962',
          tastingTableCount: values.tastingTableCount || 3,
          displayBottleCount: values.displayBottleCount || 10,
          photoUrls: photos.length ? photos : ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=400&fit=crop'],
          description: values.description,
        },
        selectedGuides
      );

      const newCounterId = counters.length > 0
        ? `counter-${parseInt(counters[counters.length - 1].id.split('-')[1]) + 1}`
        : 'counter-1';

      const materialTypes: MaterialType[] = ['scentPaper', 'coffeeBean', 'sprayNozzle', 'cleaningCloth', 'labelSticker'];
      const thresholds: Record<MaterialType, number> = {
        scentPaper: 200,
        coffeeBean: 500,
        sprayNozzle: 50,
        cleaningCloth: 30,
        labelSticker: 100,
      };

      for (const mt of materialTypes) {
        await addInventoryItem({
          counterId: newCounterId,
          materialType: mt,
          quantity: thresholds[mt] * 2,
          batchNo: `${mt.slice(0, 2).toUpperCase()}-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 9000 + 1000)}`,
          drawer: `A-0${materialTypes.indexOf(mt) + 1}`,
          threshold: thresholds[mt],
        });
      }

      message.success('品牌区创建成功');
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error('创建失败，请重试');
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="card-elegant p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="按品牌区名称搜索..."
                className="input-elegant pl-10"
                allowClear
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '全部' },
                { key: 'normal', label: '正常库存' },
                { key: 'warning', label: '有预警' },
                { key: 'shortage', label: '缺货中' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilterType(item.key as FilterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filterType === item.key
                      ? 'bg-wine-600 text-white shadow-elegant'
                      : 'bg-cream-50 text-cream-500 hover:bg-wine-50 hover:text-wine-600 border border-wine-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={sortType}
              onChange={(v) => setSortType(v)}
              className="w-40"
              options={[
                { value: 'name', label: '按名称排序' },
                { value: 'tastingTable', label: '按试香台数' },
                { value: 'guides', label: '按导购数' },
              ]}
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              新增品牌区
            </button>
          </div>
        </div>
      </div>

      {filteredCounters.length === 0 ? (
        <div className="card-elegant py-20 text-center">
          <Package className="w-16 h-16 mx-auto text-cream-300 mb-4" />
          <p className="text-cream-500 text-lg">暂无符合条件的品牌区</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCounters.map((counter, index) => (
            <CounterCard
              key={counter.id}
              counter={counter}
              statusInfo={getCounterStatus(counter.id, inventoryItems)}
              index={index}
              onPreviewImage={setPreviewImage}
              onViewDetail={() => navigate(`/counters/${counter.id}`)}
              onViewInventory={() => navigate('/inventory')}
            />
          ))}
        </div>
      )}

      <Modal
        title={
          <div className="text-lg font-serif font-semibold text-wine-700">
            新增品牌区
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
        styles={{
          mask: { backdropFilter: 'blur(4px)' },
        }}
        transitionName="ant-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCounter}
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
              <Input placeholder="如：香奈儿区" className="input-elegant" />
            </Form.Item>

            <Form.Item
              label="品牌色"
              name="brandColor"
              initialValue="#C9A962"
            >
              <Input
                type="color"
                className="h-11 w-full cursor-pointer rounded-lg border border-wine-100 p-1"
              />
            </Form.Item>

            <Form.Item
              label="试香台数量"
              name="tastingTableCount"
              initialValue={3}
              rules={[{ required: true, message: '请输入试香台数量' }]}
            >
              <InputNumber min={1} max={20} className="w-full" />
            </Form.Item>

            <Form.Item
              label="展示瓶数量"
              name="displayBottleCount"
              initialValue={10}
              rules={[{ required: true, message: '请输入展示瓶数量' }]}
            >
              <InputNumber min={1} max={100} className="w-full" />
            </Form.Item>

            <Form.Item
              label="导购分配"
              name="guideIds"
              className="col-span-2"
            >
              <Select
                mode="multiple"
                placeholder="选择分配的导购（可选）"
                options={allGuides.map((g) => ({
                  value: g.id,
                  label: `${g.name} - ${g.role === 'manager' ? '店长' : '导购'}`,
                }))}
                maxTagCount="responsive"
              />
            </Form.Item>

            <Form.Item
              label="照片URL"
              name="photoUrls"
              className="col-span-2"
              tooltip="每行一个图片URL"
            >
              <Input.TextArea
                rows={3}
                placeholder="每行一个图片URL，如：&#10;https://images.unsplash.com/photo-xxx&#10;https://images.unsplash.com/photo-yyy"
                className="resize-none"
              />
            </Form.Item>

            <Form.Item
              label="描述"
              name="description"
              className="col-span-2"
            >
              <Input.TextArea
                rows={2}
                placeholder="品牌区简介..."
                className="resize-none"
              />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <AntButton onClick={() => setIsModalOpen(false)}>取消</AntButton>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '创建中...' : '确认创建'}
            </button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width="auto"
        centered
        styles={{
          mask: { backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' },
          content: { background: 'transparent', boxShadow: 'none' },
          body: { padding: 0 },
        }}
        closeIcon={
          <button className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-elegant hover:bg-white">
            <X className="w-4 h-4 text-wine-700" />
          </button>
        }
      >
        {previewImage && (
          <Image
            src={previewImage}
            alt="品牌区预览"
            style={{ maxHeight: '80vh', borderRadius: 12 }}
            preview={false}
          />
        )}
      </Modal>
    </div>
  );
}

interface CounterCardProps {
  counter: CounterWithGuides;
  statusInfo: CounterStatusInfo;
  index: number;
  onPreviewImage: (url: string) => void;
  onViewDetail: () => void;
  onViewInventory: () => void;
}

function CounterCard({
  counter,
  statusInfo,
  index,
  onPreviewImage,
  onViewDetail,
  onViewInventory,
}: CounterCardProps) {
  const mainPhoto = counter.photoUrls[0];
  const extraPhotos = counter.photoUrls.slice(1, 4);

  return (
    <div
      className={`card-elegant overflow-hidden group cursor-pointer animation-delay-${(index % 5 + 1) * 100} relative`}
      onClick={onViewDetail}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: counter.brandColor }}
      />

      <div className="p-5 pl-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-serif text-xl font-semibold text-wine-800 group-hover:text-wine-600 transition-colors">
            {counter.name}
          </h3>
          <Tag className={statusInfo.className}>{statusInfo.label}</Tag>
        </div>

        <div
          className="relative mb-4 rounded-xl overflow-hidden aspect-[16/10] bg-cream-100 shadow-inner"
          onClick={(e) => {
            e.stopPropagation();
            if (mainPhoto) onPreviewImage(mainPhoto);
          }}
        >
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={counter.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cream-400">
              <Package className="w-12 h-12" />
            </div>
          )}

          {extraPhotos.length > 0 && (
            <div className="absolute right-2 bottom-2 flex flex-col gap-1">
              {extraPhotos.map((photo, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white/80 shadow-elegant hover:scale-110 transition-transform"
                  style={{
                    marginRight: i * 6,
                    opacity: 1 - i * 0.2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewImage(photo);
                  }}
                >
                  <img
                    src={photo}
                    alt={`${counter.name}-${i + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-cream-500">
            <Table className="w-4 h-4 text-wine-400" />
            <span>
              <span className="font-semibold text-wine-700">{counter.tastingTableCount}</span>
              {' '}台
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-cream-500">
            <FlaskConical className="w-4 h-4 text-gold-500" />
            <span>
              <span className="font-semibold text-wine-700">{counter.displayBottleCount}</span>
              {' '}瓶
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-cream-500">
            <Users className="w-4 h-4 text-wine-400" />
            <span>
              <span className="font-semibold text-wine-700">{counter.guides.length}</span>
              {' '}人
            </span>
          </div>
        </div>

        {counter.guides.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Avatar.Group
              maxCount={3}
              maxStyle={{
                backgroundColor: counter.brandColor,
                color: '#fff',
                fontSize: 12,
              }}
              size={28}
            >
              {counter.guides.map((g) => (
                <Avatar key={g.id} src={g.avatar} />
              ))}
            </Avatar.Group>
            <span className="text-xs text-cream-500">
              {counter.guides[0]?.name}
              {counter.guides.length > 1 && ` 等${counter.guides.length}人`}
            </span>
          </div>
        )}

        <div className="divider-gold my-3" />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="flex items-center gap-1 text-sm font-medium text-wine-600 hover:text-wine-800 transition-colors group/link"
          >
            查看详情
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewInventory();
            }}
            className="flex items-center gap-1 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            库存概览
          </button>
        </div>
      </div>
    </div>
  );
}
