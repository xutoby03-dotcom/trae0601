import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input,
  Select,
  Button,
  Card,
  Tag,
  Table,
  Image,
  Space,
  Popconfirm,
  Tooltip,
  message,
  Empty,
} from 'antd';
import {
  LayoutGrid,
  List,
  Plus,
  AlertCircle,
  AlertTriangle,
  Edit,
  Trash2,
  User,
  Eye,
} from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import type { Facility, FacilityStatus } from '@/types';
import { FACILITY_STATUS_CONFIG } from '@/types';
import { useFacilityStore } from '@/store';
import { FacilityStatusTag } from '@/components';
import { getInspectionDueInDays, getNextInspectionDate } from '@/utils/statistics';
import { formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';

const { Search } = Input;

type ViewType = 'card' | 'list';
type StatusFilter = 'all' | FacilityStatus;

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '使用中' },
  { value: 'inactive', label: '停用' },
  { value: 'maintenance', label: '维修中' },
];

const ageOptions: { label: string; color: string }[] = [
  { label: '0-3岁', color: '#219EBC' },
  { label: '3-6岁', color: '#FFB703' },
  { label: '6-12岁', color: '#FB8500' },
  { label: '全年龄', color: '#8338EC' },
];

function getAgeColor(ageRange: string): string {
  const found = ageOptions.find((o) => ageRange.includes(o.label.replace('岁', '')));
  return found?.color || '#6B7280';
}

function InspectionCountdownTag({ facility }: { facility: Facility }) {
  const days = getInspectionDueInDays(facility);
  if (days < 0) {
    return (
      <Tag color="#E63946" icon={<AlertTriangle size={12} />} style={{ margin: 0 }}>
        逾期 {Math.abs(days)} 天
      </Tag>
    );
  }
  if (days <= 3) {
    return (
      <Tag color="#FF6B35" icon={<AlertCircle size={12} />} style={{ margin: 0 }}>
        剩余 {days} 天
      </Tag>
    );
  }
  return (
    <Tag color="#2A9D8F" style={{ margin: 0 }}>
      剩余 {days} 天
    </Tag>
  );
}

export default function FacilityList() {
  const navigate = useNavigate();
  const { facilities, deleteFacility } = useFacilityStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewType, setViewType] = useState<ViewType>('card');

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [facilities, searchText, statusFilter]);

  const handleDelete = (id: string) => {
    deleteFacility(id);
    message.success('设施已删除');
  };

  const cardColumns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
  };

  const tableColumns: ColumnsType<Facility> = [
    {
      title: '照片',
      dataIndex: 'photo_url',
      key: 'photo_url',
      width: 80,
      render: (url: string) => (
        <Image
          src={url}
          alt=""
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 8 }}
          preview={false}
        />
      ),
    },
    {
      title: '设施名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a
          onClick={() => navigate(`/facilities/${record.id}`)}
          style={{ color: '#1F2937', fontWeight: 500 }}
        >
          {name}
        </a>
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: '适用年龄',
      dataIndex: 'age_range',
      key: 'age_range',
      render: (age: string) => <Tag color={getAgeColor(age)}>{age}</Tag>,
    },
    {
      title: '责任人',
      dataIndex: 'responsible_person',
      key: 'responsible_person',
    },
    {
      title: '安装日期',
      dataIndex: 'install_date',
      key: 'install_date',
      render: (date: string) => formatDate(date),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: FacilityStatus) => <FacilityStatusTag status={status} />,
    },
    {
      title: '下次巡检',
      key: 'next_inspection',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <span style={{ fontSize: 13 }}>{formatDate(getNextInspectionDate(record).toDate())}</span>
          <InspectionCountdownTag facility={record} />
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<Eye size={16} />}
              onClick={() => navigate(`/facilities/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<Edit size={16} />}
              onClick={() => navigate(`/facilities/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除该设施？"
            description="删除后无法恢复"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" size="small" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              placeholder="搜索设施名称..."
              allowClear
              size="large"
              style={{ width: 280 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
              style={{ width: 160 }}
              options={statusOptions}
            />
          </div>
          <div className="flex items-center gap-3">
            <Space.Compact size="large">
              <Button
                type={viewType === 'card' ? 'primary' : 'default'}
                icon={<LayoutGrid size={18} />}
                onClick={() => setViewType('card')}
              >
                卡片
              </Button>
              <Button
                type={viewType === 'list' ? 'primary' : 'default'}
                icon={<List size={18} />}
                onClick={() => setViewType('list')}
              >
                列表
              </Button>
            </Space.Compact>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              style={{ backgroundColor: '#FF6B35', borderColor: '#FF6B35' }}
              onClick={() => navigate('/facilities/new')}
            >
              新增设施
            </Button>
          </div>
        </div>

        {filteredFacilities.length === 0 ? (
          <div className="rounded-xl bg-white p-20 shadow-sm">
            <Empty description="暂无设施数据" />
          </div>
        ) : viewType === 'card' ? (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {filteredFacilities.map((facility) => (
              <Card
                key={facility.id}
                hoverable
                className="overflow-hidden cursor-pointer border-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate(`/facilities/${facility.id}`)}
              >
                <div className="relative overflow-hidden" style={{ height: 200, borderRadius: 16 }}>
                  <Image
                    src={facility.photo_url}
                    alt={facility.name}
                    preview={false}
                    style={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 16,
                    }}
                  />
                  <div className="absolute right-3 top-3">
                    <FacilityStatusTag status={facility.status} />
                  </div>
                </div>
                <div className="p-5">
                  <h3
                    style={{
                      fontWeight: 600,
                      marginTop: 16,
                      fontSize: 18,
                      marginBottom: 4,
                    }}
                  >
                    {facility.name}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
                    {facility.location}
                  </p>
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <Tag color={getAgeColor(facility.age_range)} style={{ margin: 0 }}>
                      {facility.age_range}
                    </Tag>
                    <Tag color="#0EA5E9" style={{ margin: 0 }}>
                      {facility.inspection_cycle_days}天巡检
                    </Tag>
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: '#E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <User size={14} style={{ color: '#6B7280' }} />
                      </div>
                      <span style={{ fontSize: 13, color: '#4B5563' }}>
                        {facility.responsible_person}
                      </span>
                    </div>
                    <InspectionCountdownTag facility={facility} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <Table<Facility>
              columns={tableColumns}
              dataSource={filteredFacilities}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              scroll={{ x: 1100 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
