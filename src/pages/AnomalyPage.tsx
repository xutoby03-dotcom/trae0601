import React, { useState, useMemo } from 'react';
import {
  Button,
  Table,
  Select,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Space,
  Image,
  Alert,
  Empty,
} from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  WarningOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import InspectionForm from '../components/InspectionForm';
import type { AnomalyTicket, InspectionFormValues, AnomalyStatus } from '../types';
import {
  formatDateTime,
  isOverdue,
  getDaysUntilDue,
  getDeviceTypeIcon,
  getAnomalyStatusText,
} from '../utils/helpers';
import type { ColumnsType } from 'antd/es/table';

const AnomalyPage: React.FC = () => {
  const navigate = useNavigate();
  const { points, anomalyTickets, inspectionRecords, updateAnomalyStatus, currentUser, addInspectionRecord } =
    useStore();
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | null>(null);
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<AnomalyTicket | null>(null);
  const [inspectionFormOpen, setInspectionFormOpen] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  const overduePoints = useMemo(() => points.filter(isOverdue), [points]);

  const filteredTickets = useMemo(() => {
    let tickets = [...anomalyTickets].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (statusFilter) {
      tickets = tickets.filter((t) => t.status === statusFilter);
    }

    return tickets;
  }, [anomalyTickets, statusFilter]);

  const handleRepair = (ticket: AnomalyTicket) => {
    setCurrentTicket(ticket);
    form.resetFields();
    setRepairModalOpen(true);
  };

  const handleReview = (ticket: AnomalyTicket) => {
    setCurrentTicket(ticket);
    setReviewModalOpen(true);
  };

  const handleRepairSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentTicket) {
        updateAnomalyStatus(currentTicket.id, 'reported', currentUser, values.repairer);
        message.success('已标记为已报修');
        setRepairModalOpen(false);
        setCurrentTicket(null);
      }
    } catch {
      message.error('请填写维修人信息');
    }
  };

  const handleReviewConfirm = () => {
    if (currentTicket) {
      updateAnomalyStatus(currentTicket.id, 'reviewed', currentUser);
      message.success('已标记为已复查，工单闭环');
      setReviewModalOpen(false);
      setCurrentTicket(null);
    }
  };

  const handleQuickInspect = (pointId: string) => {
    setSelectedPointId(pointId);
    setInspectionFormOpen(true);
  };

  const handleInspectionSubmit = (values: InspectionFormValues) => {
    addInspectionRecord(values);
    message.success('巡检记录已提交');
    setInspectionFormOpen(false);
    setSelectedPointId(undefined);
  };

  const columns: ColumnsType<AnomalyTicket> = [
    {
      title: '工单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AnomalyStatus) => <StatusBadge type="anomaly" status={status} />,
      filters: [
        { text: '待维修', value: 'pending' },
        { text: '已报修', value: 'reported' },
        { text: '已复查', value: 'reviewed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '点位信息',
      key: 'point',
      width: 250,
      render: (_, record) => {
        const point = points.find((p) => p.id === record.pointId);
        if (!point) return <span className="text-gray-400">点位已删除</span>;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xl">{getDeviceTypeIcon(point.deviceType)}</span>
            <div>
              <div className="font-medium text-gray-800">
                {point.area} - {point.deviceType}
              </div>
              <div className="text-xs text-gray-500 font-mono">{point.deviceNo}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: '异常描述',
      dataIndex: 'description',
      key: 'description',
      width: 280,
      ellipsis: true,
      render: (desc: string) => (
        <span className="text-gray-700" title={desc}>
          {desc}
        </span>
      ),
    },
    {
      title: '上报人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 100,
    },
    {
      title: '上报时间',
      dataIndex: 'reportTime',
      key: 'reportTime',
      width: 160,
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '维修人',
      dataIndex: 'repairer',
      key: 'repairer',
      width: 120,
      render: (repairer?: string) => repairer || '-',
    },
    {
      title: '复查人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 100,
      render: (reviewer?: string) => reviewer || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<ToolOutlined />}
              onClick={() => handleRepair(record)}
            >
              安排维修
            </Button>
          )}
          {record.status === 'reported' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleReview(record)}
            >
              复查
            </Button>
          )}
          {record.status === 'reviewed' && (
            <Tag color="success">已闭环</Tag>
          )}
        </Space>
      ),
    },
  ];

  const stats = useMemo(() => {
    const total = anomalyTickets.length;
    const pending = anomalyTickets.filter((t) => t.status === 'pending').length;
    const reported = anomalyTickets.filter((t) => t.status === 'reported').length;
    const reviewed = anomalyTickets.filter((t) => t.status === 'reviewed').length;
    const closeRate = total > 0 ? Math.round((reviewed / total) * 100) : 0;
    return { total, pending, reported, reviewed, closeRate };
  }, [anomalyTickets]);

  return (
    <div className="space-y-6">
      {overduePoints.length > 0 && (
        <Card
          className="border-0 shadow-md bg-gradient-to-r from-red-500 to-red-600 text-white overflow-hidden"
          bodyStyle={{ padding: '20px 24px' }}
        >
          <Alert
            type="error"
            showIcon
            icon={<WarningOutlined className="animate-pulse text-white" />}
            message={
              <span className="text-white font-bold text-lg">
                有 {overduePoints.length} 个点位逾期未巡检！
              </span>
            }
            description={
              <span className="text-red-100">
                请立即安排巡检，避免安全隐患。逾期点位已列入红色预警列表。
              </span>
            }
            className="bg-transparent border-0 p-0"
          />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overduePoints.map((point) => {
              const days = Math.abs(getDaysUntilDue(point));
              return (
                <div
                  key={point.id}
                  className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDeviceTypeIcon(point.deviceType)}</span>
                      <div>
                        <div className="font-bold">
                          {point.area} - {point.deviceType}
                        </div>
                        <div className="text-xs text-red-100 font-mono">
                          {point.deviceNo}
                        </div>
                      </div>
                    </div>
                    <Tag color="red" className="animate-pulse">
                      逾期 {days} 天
                    </Tag>
                  </div>
                  <div className="mt-2 text-sm text-red-100">
                    <div>责任人: {point.personInCharge}</div>
                    <div>应巡检日期: {point.nextInspectionDate}</div>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<FormOutlined />}
                    onClick={() => handleQuickInspect(point.id)}
                    className="mt-3 w-full bg-white text-red-600 hover:bg-red-50 border-0 font-medium"
                  >
                    立即巡检
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">工单总数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">待维修</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <ClockCircleOutlined size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已报修</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.reported}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ToolOutlined style={{ fontSize: 24, color: '#2563eb' }} />
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已复查</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.reviewed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleOutlined size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">闭环率</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.closeRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              placeholder="筛选状态"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              className="w-36"
            >
              <Select.Option value="pending">待维修</Select.Option>
              <Select.Option value="reported">已报修</Select.Option>
              <Select.Option value="reviewed">已复查</Select.Option>
            </Select>
          </div>

          <Space>
            <Button onClick={() => navigate('/inspection')} icon={<SearchOutlined />}>
              查看巡检记录
            </Button>
            <Button type="primary" onClick={() => navigate('/')} icon={<SearchOutlined />}>
              点位档案
            </Button>
          </Space>
        </div>

        {filteredTickets.length === 0 ? (
          <Empty
            description="暂无异常工单"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-12"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTickets}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条工单`,
            }}
            expandable={{
              expandedRowRender: (record) => {
                const point = points.find((p) => p.id === record.pointId);
                const inspectionRecord = inspectionRecords.find(
                  (r) => r.id === record.inspectionRecordId
                );
                return (
                  <div className="py-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card size="small" className="bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">上报信息</p>
                        <p className="text-sm">
                          <span className="text-gray-600">上报人：</span>
                          {record.reporter}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">时间：</span>
                          {formatDateTime(record.reportTime)}
                        </p>
                      </Card>
                      {record.repairTime && (
                        <Card size="small" className="bg-blue-50">
                          <p className="text-xs text-gray-500 mb-1">维修信息</p>
                          <p className="text-sm">
                            <span className="text-gray-600">维修人：</span>
                            {record.repairer}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">时间：</span>
                            {formatDateTime(record.repairTime)}
                          </p>
                        </Card>
                      )}
                      {record.reviewTime && (
                        <Card size="small" className="bg-green-50">
                          <p className="text-xs text-gray-500 mb-1">复查信息</p>
                          <p className="text-sm">
                            <span className="text-gray-600">复查人：</span>
                            {record.reviewer}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">时间：</span>
                            {formatDateTime(record.reviewTime)}
                          </p>
                        </Card>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-6">
                      {inspectionRecord?.photo && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">巡检现场照片：</p>
                          <Image
                            src={inspectionRecord.photo}
                            width={200}
                            height={150}
                            className="rounded-lg border border-gray-200 object-cover"
                            preview
                          />
                        </div>
                      )}
                      {point?.photo && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">点位档案照片：</p>
                          <Image
                            src={point.photo}
                            width={200}
                            height={150}
                            className="rounded-lg border border-gray-200 object-cover"
                            preview
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              },
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      <Modal
        title="安排维修"
        open={repairModalOpen}
        onOk={handleRepairSubmit}
        onCancel={() => {
          setRepairModalOpen(false);
          setCurrentTicket(null);
        }}
        okText="确认安排"
        cancelText="取消"
      >
        {currentTicket && (
          <div className="space-y-4">
            <Alert
              message="工单信息"
              description={
                <div className="text-sm">
                  <p>
                    <span className="text-gray-600">状态：</span>
                    <StatusBadge type="anomaly" status={currentTicket.status} />
                  </p>
                  <p>
                    <span className="text-gray-600">异常描述：</span>
                    {currentTicket.description}
                  </p>
                  <p>
                    <span className="text-gray-600">上报人：</span>
                    {currentTicket.reporter}
                  </p>
                </div>
              }
              type="info"
              showIcon
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="repairer"
                label="维修负责人"
                rules={[{ required: true, message: '请输入维修负责人姓名' }]}
              >
                <Input placeholder="请输入维修负责人姓名或部门" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        title="复查确认"
        open={reviewModalOpen}
        onOk={handleReviewConfirm}
        onCancel={() => {
          setReviewModalOpen(false);
          setCurrentTicket(null);
        }}
        okText="确认复查完成"
        okButtonProps={{ className: 'bg-green-600 hover:bg-green-700' }}
        cancelText="取消"
      >
        {currentTicket && (
          <div className="space-y-4">
            <Alert
              message="请确认异常已修复"
              description={
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-600">当前状态：</span>
                    <Tag color="processing">{getAnomalyStatusText(currentTicket.status)}</Tag>
                  </p>
                  <p>
                    <span className="text-gray-600">异常描述：</span>
                    {currentTicket.description}
                  </p>
                  <p>
                    <span className="text-gray-600">维修人：</span>
                    {currentTicket.repairer}
                  </p>
                  <p className="text-orange-600">
                    确认后工单状态将变为"已复查"并闭环，操作人：{currentUser}
                  </p>
                </div>
              }
              type="warning"
              showIcon
            />
          </div>
        )}
      </Modal>

      <InspectionForm
        open={inspectionFormOpen}
        points={points}
        selectedPointId={selectedPointId}
        onCancel={() => {
          setInspectionFormOpen(false);
          setSelectedPointId(undefined);
        }}
        onSubmit={handleInspectionSubmit}
      />
    </div>
  );
};

export default AnomalyPage;
