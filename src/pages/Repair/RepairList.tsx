import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useRepairStore, useFacilityStore } from '@/store';
import { SeverityTag, RepairStatusTag, EmptyState } from '@/components';
import { SEVERITY_CONFIG, REPAIR_STATUS_CONFIG, type Repair, type Severity, type RepairStatus } from '@/types';
import { formatDate, fromNow } from '@/utils/date';

const { Text } = Typography;

const severityOptions: { label: string; value: Severity | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '轻微', value: 'low' },
  { label: '一般', value: 'medium' },
  { label: '严重', value: 'high' },
  { label: '高危', value: 'critical' },
];

const statusOptions: { label: string; value: RepairStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待分派', value: 'pending' },
  { label: '已分派', value: 'assigned' },
  { label: '维修中', value: 'in_progress' },
  { label: '待复检', value: 'review' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

const severityBarColors: Record<Severity, string> = {
  low: SEVERITY_CONFIG.low.color,
  medium: SEVERITY_CONFIG.medium.color,
  high: SEVERITY_CONFIG.high.color,
  critical: SEVERITY_CONFIG.critical.color,
};

const formatRepairNo = (id: string) => {
  const suffix = id.slice(-6).toUpperCase().replace(/[^0-9A-Z]/g, '').slice(-6).padStart(6, '0');
  return `RP-${suffix}`;
};

const ASSIGNEES = [
  '王师傅', '李师傅', '张师傅', '赵师傅',
  '专业电气维修周工', '专业焊接队', '工程部钱经理',
];

export default function RepairList() {
  const navigate = useNavigate();
  const { repairs, assignRepair, startRepair } = useRepairStore();
  const { facilities } = useFacilityStore();

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [currentRepairId, setCurrentRepairId] = useState<string | null>(null);
  const [assignForm] = Form.useForm();
  const [assignLoading, setAssignLoading] = useState(false);

  const facilityMap = useMemo(() => {
    const map = new Map<string, typeof facilities[0]>();
    facilities.forEach((f) => map.set(f.id, f));
    return map;
  }, [facilities]);

  const filteredRepairs = useMemo(() => {
    let result = [...repairs];

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter((r) => {
        const repairNo = formatRepairNo(r.id).toLowerCase();
        const desc = r.description.toLowerCase();
        const reporter = r.reporter.toLowerCase();
        return (
          repairNo.includes(keyword) ||
          desc.includes(keyword) ||
          reporter.includes(keyword)
        );
      });
    }

    if (severityFilter !== 'all') {
      result = result.filter((r) => r.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (facilityFilter !== 'all') {
      result = result.filter((r) => r.facility_id === facilityFilter);
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [repairs, searchText, severityFilter, statusFilter, facilityFilter]);

  const pagedRepairs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRepairs.slice(start, start + pageSize);
  }, [filteredRepairs, page]);

  const handleAssignClick = (repairId: string) => {
    setCurrentRepairId(repairId);
    setAssignModalOpen(true);
    assignForm.resetFields();
  };

  const handleAssignConfirm = async () => {
    try {
      const values = await assignForm.validateFields();
      setAssignLoading(true);
      if (currentRepairId) {
        assignRepair(currentRepairId, values.assignee);
        message.success('分派成功');
      }
      setAssignModalOpen(false);
      setAssignLoading(false);
      setCurrentRepairId(null);
    } catch (err) {
      setAssignLoading(false);
    }
  };

  const handleStartRepair = (repairId: string) => {
    Modal.confirm({
      title: '确认开始维修',
      content: '确认开始进行维修作业吗？开始后设施状态将变更为维修中。',
      okText: '确认开始',
      cancelText: '取消',
      onOk: () => {
        startRepair(repairId);
        message.success('已标记维修开始');
      },
    });
  };

  const facilityOptions = [
    { label: '全部设施', value: 'all' },
    ...facilities.map((f) => ({
      label: `${f.name} (${f.location})`,
      value: f.id,
    })),
  ];

  const columns: ColumnsType<Repair> = [
    {
      title: '',
      dataIndex: 'severity',
      key: 'severity_bar',
      width: 6,
      render: (severity: Severity) => (
        <div
          style={{
            width: 6,
            height: '100%',
            minHeight: 56,
            background: severityBarColors[severity],
            borderRadius: 3,
            margin: '0 auto',
          }}
        />
      ),
    },
    {
      title: '报修单号',
      dataIndex: 'id',
      key: 'repair_no',
      width: 130,
      render: (id: string) => (
        <Text
          strong
          style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'none' }}
          onClick={() => navigate(`/repairs/${id}`)}
        >
          {formatRepairNo(id)}
        </Text>
      ),
    },
    {
      title: '设施信息',
      dataIndex: 'facility_id',
      key: 'facility',
      width: 200,
      render: (facilityId: string) => {
        const facility = facilityMap.get(facilityId);
        if (!facility) return <Text type="secondary">-</Text>;
        return (
          <div style={{ lineHeight: 1.4 }}>
            <div style={{ fontWeight: 500 }}>{facility.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
              {facility.location}
            </div>
          </div>
        );
      },
    },
    {
      title: '问题类型',
      dataIndex: 'problem_type',
      key: 'problem_type',
      width: 110,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity_tag',
      width: 100,
      render: (s: Severity) => <SeverityTag severity={s} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status_tag',
      width: 100,
      render: (s: RepairStatus) => <RepairStatusTag status={s} />,
    },
    {
      title: '发现人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 140,
      render: (reporter: string) => (
        <span>
          <UserOutlined style={{ color: '#8c8c8c', marginRight: 4 }} />
          {reporter}
        </span>
      ),
    },
    {
      title: '临时封闭',
      dataIndex: 'need_closure',
      key: 'closure',
      width: 90,
      render: (need: boolean) =>
        need ? (
          <Tag color="red" style={{ margin: 0 }}>
            是
          </Tag>
        ) : (
          <Tag color="green" style={{ margin: 0 }}>
            否
          </Tag>
        ),
    },
    {
      title: '预计维修日期',
      dataIndex: 'expected_fix_date',
      key: 'expected_date',
      width: 130,
      render: (date: string) => formatDate(date),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date: string) => (
        <div title={formatDate(date, 'YYYY-MM-DD HH:mm')}>
          {fromNow(date)}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      fixed: 'right',
      render: (_: unknown, record: Repair) => {
        const btnStyle = { padding: 0, height: 'auto' };
        switch (record.status) {
          case 'pending':
            return (
              <Button
                size="small"
                onClick={() => handleAssignClick(record.id)}
                style={btnStyle}
              >
                分派
              </Button>
            );
          case 'assigned':
            return (
              <Button
                size="small"
                onClick={() => handleStartRepair(record.id)}
                style={btnStyle}
              >
                开始维修
              </Button>
            );
          case 'in_progress':
            return (
              <Button
                size="small"
                onClick={() => navigate(`/repairs/${record.id}?tab=execution`)}
                style={btnStyle}
              >
                上传维修记录
              </Button>
            );
          case 'review':
            return (
              <Button
                size="small"
                onClick={() => navigate(`/repairs/${record.id}?tab=review`)}
                style={btnStyle}
              >
                复检确认
              </Button>
            );
          case 'completed':
          case 'cancelled':
          default:
            return (
              <Button
                size="small"
                onClick={() => navigate(`/repairs/${record.id}`)}
                style={btnStyle}
              >
                查看详情
              </Button>
            );
        }
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Spin spinning={loading}>
        <Card
          title={
            <Space>
              <span style={{ fontSize: 18, fontWeight: 600 }}>报修管理</span>
              <Tag color="blue">共 {filteredRepairs.length} 条</Tag>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/repairs/new')}
            >
              发起报修
            </Button>
          }
          style={{ borderRadius: 12 }}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
            <Space wrap size="middle">
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="搜索报修单号/问题描述/发现人"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
                style={{ width: 280 }}
                allowClear
              />
              <Select
                value={severityFilter}
                onChange={(v) => {
                  setSeverityFilter(v);
                  setPage(1);
                }}
                options={severityOptions}
                style={{ width: 130 }}
              />
              <Select
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
                options={statusOptions}
                style={{ width: 130 }}
              />
              <Select
                showSearch
                value={facilityFilter}
                onChange={(v) => {
                  setFacilityFilter(v);
                  setPage(1);
                }}
                options={facilityOptions}
                style={{ width: 260 }}
                placeholder="选择设施"
                optionFilterProp="label"
              />
            </Space>
          </div>

          {filteredRepairs.length === 0 ? (
            <div style={{ padding: '60px 0' }}>
              <EmptyState title="暂无报修记录" description="点击右上角「发起报修」创建新的报修单" />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={pagedRepairs}
                rowKey="id"
                pagination={false}
                scroll={{ x: 1400 }}
                size="middle"
                style={{ padding: '8px 0' }}
              />
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={filteredRepairs.length}
                  onChange={setPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条`}
                />
              </div>
            </>
          )}
        </Card>
      </Spin>

      <Modal
        title="分派维修人员"
        open={assignModalOpen}
        onOk={handleAssignConfirm}
        onCancel={() => {
          setAssignModalOpen(false);
          setCurrentRepairId(null);
        }}
        confirmLoading={assignLoading}
        okText="确认分派"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="选择维修人员"
            name="assignee"
            rules={[{ required: true, message: '请选择维修人员' }]}
          >
            <Select
              showSearch
              placeholder="请选择维修人员或输入姓名"
              optionFilterProp="label"
              options={ASSIGNEES.map((name) => ({ label: name, value: name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
