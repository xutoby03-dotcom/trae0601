import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Row,
  Col,
  Image,
  Space,
  Tag,
  Table,
  Tabs,
  Dropdown,
  Popconfirm,
  message,
  Empty,
  Alert,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  MoreHorizontal,
  Phone,
  User,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Wrench,
  FileText,
  Eye,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import type { Facility, Repair, Inspection, FacilityStatus } from '@/types';
import { useFacilityStore, useRepairStore, useInspectionStore } from '@/store';
import {
  FacilityStatusTag,
  SeverityTag,
  RepairStatusTag,
} from '@/components';
import { getInspectionDueInDays, getNextInspectionDate } from '@/utils/statistics';
import { formatDate, formatDateTime } from '@/utils/date';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

export default function FacilityDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getFacilityById, setFacilityStatus, deleteFacility } = useFacilityStore();
  const { repairs } = useRepairStore();
  const { getInspectionsByFacilityId } = useInspectionStore();
  const [activeTab, setActiveTab] = useState('repairs');

  const [facility, setFacility] = useState<Facility | null>(null);

  useEffect(() => {
    if (id) {
      const f = getFacilityById(id);
      if (f) {
        setFacility(f);
      } else {
        message.error('设施不存在');
        navigate('/facilities');
      }
    }
  }, [id, getFacilityById, navigate]);

  if (!facility) {
    return null;
  }

  const facilityRepairs = repairs
    .filter((r) => r.facility_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const inspections = getInspectionsByFacilityId(id!);

  const handleStatusChange = (status: FacilityStatus) => {
    setFacilityStatus(id!, status);
    setFacility(getFacilityById(id!) || null);
    message.success('状态已更新');
  };

  const handleDelete = () => {
    deleteFacility(id!);
    message.success('设施已删除');
    navigate('/facilities');
  };

  const statusMenuItems: MenuProps['items'] = [
    {
      key: 'inactive',
      label: '停用设施',
      icon: <ShieldCheck size={14} />,
      disabled: facility.status === 'inactive',
    },
    {
      key: 'maintenance',
      label: '设为维修中',
      icon: <Wrench size={14} />,
      disabled: facility.status === 'maintenance',
    },
    {
      key: 'active',
      label: '恢复使用',
      icon: <CheckCircle size={14} />,
      disabled: facility.status === 'active',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    handleStatusChange(key as FacilityStatus);
  };

  const repairColumns: ColumnsType<Repair> = [
    {
      title: '报修单号',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</span>
      ),
    },
    {
      title: '问题类型',
      dataIndex: 'problem_type',
      key: 'problem_type',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (s) => <SeverityTag severity={s} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <RepairStatusTag status={s} />,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (d) => formatDateTime(d),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/repairs/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const inspectionColumns: ColumnsType<Inspection> = [
    {
      title: '巡检日期',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
      render: (d) => formatDate(d),
    },
    {
      title: '巡检人',
      dataIndex: 'inspector',
      key: 'inspector',
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result) =>
        result === 'normal' ? (
          <Tag color="#2A9D8F" style={{ margin: 0 }}>
            正常
          </Tag>
        ) : (
          <Tag color="#FF6B35" style={{ margin: 0 }}>
            异常
          </Tag>
        ),
    },
    {
      title: '发现问题',
      dataIndex: 'issues',
      key: 'issues',
      render: (issues) => issues || '-',
    },
  ];

  const nextInspectionDate = getNextInspectionDate(facility);
  const daysLeft = getInspectionDueInDays(facility);

  const renderInspectionPlan = () => {
    let alertType: 'success' | 'warning' | 'error' | 'info' = 'success';
    let alertIcon = <ShieldCheck size={18} />;
    let tipContent = '巡检周期内，请按计划进行常规巡检';

    if (daysLeft < 0) {
      alertType = 'error';
      alertIcon = <AlertTriangle size={18} />;
      tipContent = '巡检已逾期，请立即安排巡检并记录结果';
    } else if (daysLeft <= 3) {
      alertType = 'warning';
      alertIcon = <AlertCircle size={18} />;
      tipContent = '巡检即将到期，请尽快安排巡检人员';
    }

    return (
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Alert
          type={alertType}
          showIcon
          icon={alertIcon}
          message={
            <Space>
              <span style={{ fontWeight: 600 }}>
                {daysLeft < 0
                  ? `已逾期 ${Math.abs(daysLeft)} 天`
                  : daysLeft === 0
                  ? '今日到期'
                  : `剩余 ${daysLeft} 天`}
              </span>
            </Space>
          }
          description={tipContent}
        />

        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-sm">
              <Calendar
                size={28}
                style={{ color: '#FF6B35', marginBottom: 8 }}
              />
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                下次巡检日期
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2937' }}>
                {formatDate(nextInspectionDate.toDate())}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-sm">
              <Clock size={28} style={{ color: '#219EBC', marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                巡检周期
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2937' }}>
                {facility.inspection_cycle_days} 天/次
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-sm">
              <FileText size={28} style={{ color: '#2A9D8F', marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                上次巡检
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2937' }}>
                {formatDate(facility.last_inspection_date)}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title={
            <Space>
              <ShieldCheck size={18} style={{ color: '#FF6B35' }} />
              建议巡检内容
            </Space>
          }
          className="shadow-sm"
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: '#4B5563',
              lineHeight: 1.8,
            }}
          >
            <li>检查结构完整性：立柱、横梁、连接件是否有变形、裂纹、锈蚀</li>
            <li>检查紧固件：所有螺栓、螺母是否紧固到位，有无松动脱落</li>
            <li>检查焊接部位：焊缝是否开裂，有无脱焊现象</li>
            <li>检查表面状况：塑料件有无老化脆裂，金属件油漆是否剥落</li>
            <li>检查安全防护：缓冲垫是否完好，防护栏是否牢固</li>
            <li>检查活动部件：滑梯、秋千、转轴等是否运转正常，有无异响</li>
            <li>检查周边环境：场地是否整洁，有无杂物堆积</li>
          </ul>
        </Card>
      </Space>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Space direction="vertical" size={8}>
            <Breadcrumb
              items={[
                { title: <Link to="/facilities">设施管理</Link> },
                { title: facility.name },
              ]}
            />
            <div className="flex items-center gap-3">
              <Button
                type="text"
                icon={<ArrowLeft size={20} />}
                onClick={() => navigate('/facilities')}
                style={{ padding: 8 }}
              >
                返回列表
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {facility.name}
              </h1>
              <FacilityStatusTag status={facility.status} />
            </div>
          </Space>
          <Space size={12}>
            <Button
              type="default"
              icon={<Edit3 size={16} />}
              onClick={() => navigate(`/facilities/${id}/edit`)}
            >
              编辑
            </Button>
            <Dropdown menu={{ items: statusMenuItems, onClick: handleMenuClick }}>
              <Button icon={<MoreHorizontal size={16} />}>切换状态</Button>
            </Dropdown>
            <Popconfirm
              title="确定删除该设施？"
              description="删除后数据无法恢复，关联的报修和巡检记录将保留"
              okText="确定删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={handleDelete}
            >
              <Button danger icon={<Trash2 size={16} />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Card className="mb-6 shadow-sm">
          <Row gutter={32}>
            <Col xs={24} md={10}>
              <div
                className="overflow-hidden"
                style={{ borderRadius: 16 }}
              >
                <Image
                  src={facility.photo_url}
                  alt={facility.name}
                  style={{
                    width: '100%',
                    height: 320,
                    objectFit: 'cover',
                    borderRadius: 16,
                  }}
                />
              </div>
            </Col>
            <Col xs={24} md={14}>
              <Space direction="vertical" size={20} style={{ width: '100%' }}>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#6B7280',
                      marginBottom: 4,
                    }}
                  >
                    设施名称
                  </div>
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: '#1F2937',
                      margin: 0,
                    }}
                  >
                    {facility.name}
                  </h2>
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <InfoItem
                      icon={<MapPin size={16} color="#FF6B35" />}
                      label="位置"
                      value={facility.location}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <InfoItem
                      icon={<ShieldCheck size={16} color="#219EBC" />}
                      label="适用年龄"
                      value={facility.age_range}
                      valueTag
                    />
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <InfoItem
                      icon={<Calendar size={16} color="#2A9D8F" />}
                      label="安装日期"
                      value={formatDate(facility.install_date)}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <InfoItem
                      icon={<Clock size={16} color="#FFB703" />}
                      label="巡检周期"
                      value={`${facility.inspection_cycle_days} 天`}
                    />
                  </Col>
                </Row>

                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: '#F9FAFB' }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: '#6B7280',
                      marginBottom: 8,
                    }}
                  >
                    责任人
                  </div>
                  <div className="flex items-center justify-between">
                    <Space size={12}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#E0F2FE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <User size={20} style={{ color: '#0284C7' }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#1F2937',
                            fontSize: 15,
                          }}
                        >
                          {facility.responsible_person}
                        </div>
                        {facility.responsible_phone && (
                          <a
                            href={`tel:${facility.responsible_phone}`}
                            style={{
                              color: '#FF6B35',
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Phone size={12} />
                            {facility.responsible_phone}
                          </a>
                        )}
                      </div>
                    </Space>
                  </div>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            style={{ padding: '0 24px' }}
            items={[
              {
                key: 'repairs',
                label: (
                  <Space>
                    <Wrench size={16} />
                    报修记录
                    <Tag color={facilityRepairs.length > 0 ? '#FF6B35' : '#868E96'}>
                      {facilityRepairs.length}
                    </Tag>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '0 24px 24px' }}>
                    {facilityRepairs.length === 0 ? (
                      <div className="py-16">
                        <Empty description="暂无报修记录" />
                      </div>
                    ) : (
                      <Table<Repair>
                        columns={repairColumns}
                        dataSource={facilityRepairs}
                        rowKey="id"
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 条`,
                        }}
                        scroll={{ x: 800 }}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: 'inspections',
                label: (
                  <Space>
                    <FileText size={16} />
                    巡检记录
                    <Tag color={inspections.length > 0 ? '#2A9D8F' : '#868E96'}>
                      {inspections.length}
                    </Tag>
                  </Space>
                ),
                children: (
                  <div style={{ padding: '0 24px 24px' }}>
                    {inspections.length === 0 ? (
                      <div className="py-16">
                        <Empty description="暂无巡检记录" />
                      </div>
                    ) : (
                      <Table<Inspection>
                        columns={inspectionColumns}
                        dataSource={inspections}
                        rowKey="id"
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 条`,
                        }}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: 'plan',
                label: (
                  <Space>
                    <Calendar size={16} />
                    巡检计划
                  </Space>
                ),
                children: (
                  <div style={{ padding: '0 24px 24px' }}>
                    {renderInspectionPlan()}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <div className="mt-6 flex justify-end">
          <Button
            type="primary"
            size="large"
            icon={<Wrench size={18} />}
            style={{ backgroundColor: '#FF6B35', borderColor: '#FF6B35' }}
            onClick={() => navigate(`/repairs/new?facilityId=${id}`)}
          >
            为此设施发起报修
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueTag = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueTag?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          color: '#6B7280',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {icon}
        {label}
      </div>
      {valueTag ? (
        <Tag color="#0EA5E9" style={{ margin: 0 }}>
          {value}
        </Tag>
      ) : (
        <div style={{ fontSize: 15, color: '#1F2937', fontWeight: 500 }}>
          {value}
        </div>
      )}
    </div>
  );
}

function CheckCircle({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
