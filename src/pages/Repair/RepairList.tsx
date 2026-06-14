import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  ClearOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useRepairStore, useFacilityStore } from '@/store';
import { SeverityTag, RepairStatusTag, EmptyState } from '@/components';
import { SEVERITY_CONFIG, REPAIR_STATUS_CONFIG, type Repair, type Severity, type RepairStatus } from '@/types';
import { formatDate, fromNow, dayjs } from '@/utils/date';

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

const isRepairOverdue = (r: Repair) => {
  if (!r.expected_fix_date) return false;
  if (r.status === 'completed' || r.status === 'cancelled') return false;
  return dayjs(r.expected_fix_date).endOf('day').isBefore(dayjs().startOf('day'));
};

interface ActiveFilterTag {
  key: string;
  label: React.ReactNode;
  onClose: () => void;
  color?: string;
}

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

  const [todoClosure, setTodoClosure] = useState(false);
  const [todoOverdue, setTodoOverdue] = useState(false);
  const [todoAssigned, setTodoAssigned] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [currentRepairIds, setCurrentRepairIds] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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

    if (todoClosure) {
      result = result.filter((r) => r.need_closure);
    }

    if (todoOverdue) {
      result = result.filter(isRepairOverdue);
    }

    if (todoAssigned) {
      result = result.filter((r) => r.assigned_to && r.assigned_to.length > 0);
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [repairs, searchText, severityFilter, statusFilter, facilityFilter, todoClosure, todoOverdue, todoAssigned]);

  const pagedRepairs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRepairs.slice(start, start + pageSize);
  }, [filteredRepairs, page]);

  const resetAll = () => {
    setSearchText('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setFacilityFilter('all');
    setTodoClosure(false);
    setTodoOverdue(false);
    setTodoAssigned(false);
    setPage(1);
  };

  const activeFilterCount =
    (searchText.trim() ? 1 : 0) +
    (severityFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (facilityFilter !== 'all' ? 1 : 0) +
    (todoClosure ? 1 : 0) +
    (todoOverdue ? 1 : 0) +
    (todoAssigned ? 1 : 0);

  const activeTags: ActiveFilterTag[] = [];

  if (searchText.trim()) {
    activeTags.push({
      key: 'search',
      label: (
        <Space size={4}>
          <SearchOutlined />
          <span>关键词：</span>
          <Text strong>{searchText.trim()}</Text>
        </Space>
      ),
      onClose: () => {
        setSearchText('');
        setPage(1);
      },
    });
  }

  if (severityFilter !== 'all') {
    const config = SEVERITY_CONFIG[severityFilter];
    activeTags.push({
      key: 'severity',
      label: (
        <Space size={4}>
          <span
            style={{
              width: 6,
              height: 14,
              background: config.color,
              borderRadius: 3,
              display: 'inline-block',
            }}
          />
          <span>严重程度：</span>
          <Text strong>{config.label}</Text>
        </Space>
      ),
      color: config.color,
      onClose: () => {
        setSeverityFilter('all');
        setPage(1);
      },
    });
  }

  if (statusFilter !== 'all') {
    const config = REPAIR_STATUS_CONFIG[statusFilter];
    activeTags.push({
      key: 'status',
      label: (
        <Space size={4}>
          <span>状态：</span>
          <Text strong>{config.label}</Text>
        </Space>
      ),
      color: config.color,
      onClose: () => {
        setStatusFilter('all');
        setPage(1);
      },
    });
  }

  if (facilityFilter !== 'all') {
    const f = facilityMap.get(facilityFilter);
    activeTags.push({
      key: 'facility',
      label: (
        <Space size={4}>
          <span>设施：</span>
          <Text strong>{f ? `${f.name} (${f.location})` : facilityFilter}</Text>
        </Space>
      ),
      onClose: () => {
        setFacilityFilter('all');
        setPage(1);
      },
    });
  }

  if (todoClosure) {
    activeTags.push({
      key: 'todoClosure',
      label: (
        <Space size={4}>
          <ExclamationCircleOutlined />
          <span>临时封闭</span>
        </Space>
      ),
      color: '#E63946',
      onClose: () => {
        setTodoClosure(false);
        setPage(1);
      },
    });
  }

  if (todoOverdue) {
    activeTags.push({
      key: 'todoOverdue',
      label: (
        <Space size={4}>
          <ExclamationCircleOutlined />
          <span>超预计维修时间</span>
        </Space>
      ),
      color: '#E63946',
      onClose: () => {
        setTodoOverdue(false);
        setPage(1);
      },
    });
  }

  if (todoAssigned) {
    activeTags.push({
      key: 'todoAssigned',
      label: (
        <Space size={4}>
          <UserSwitchOutlined />
          <span>已分派责任人</span>
        </Space>
      ),
      color: '#219EBC',
      onClose: () => {
        setTodoAssigned(false);
        setPage(1);
      },
    });
  }

  const handleAssignClick = (repairId: string) => {
    setCurrentRepairIds([repairId]);
    setAssignModalOpen(true);
    assignForm.resetFields();
  };

  const handleBulkAssignClick = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先勾选待分派的报修单');
      return;
    }
    setCurrentRepairIds(selectedRowKeys.map((k) => String(k)));
    setAssignModalOpen(true);
    assignForm.resetFields();
  };

  const clearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleAssignConfirm = async () => {
    try {
      const values = await assignForm.validateFields();
      setAssignLoading(true);
      if (currentRepairIds.length > 0) {
        currentRepairIds.forEach((rid) => assignRepair(rid, values.assignee));
        if (currentRepairIds.length === 1) {
          message.success(`已分派给 ${values.assignee}`);
        } else {
          message.success(`已将 ${currentRepairIds.length} 条报修分派给 ${values.assignee}`);
        }
      }
      setAssignModalOpen(false);
      setAssignLoading(false);
      setCurrentRepairIds([]);
      clearSelection();
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
      title: '维修责任人',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      width: 140,
      render: (assigned: string | null) =>
        assigned ? (
          <Tooltip title={`分派给 ${assigned}`}>
            <span>
              <UserSwitchOutlined style={{ color: '#219EBC', marginRight: 4 }} />
              <Text strong>{assigned}</Text>
            </span>
          </Tooltip>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            未分派
          </Text>
        ),
    },
    {
      title: '发现人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 120,
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
      width: 140,
      render: (date: string, record: Repair) => {
        const overdue = isRepairOverdue(record);
        const dateStr = formatDate(date);
        if (overdue) {
          return (
            <Tooltip title={`超过预计维修日期，请加快处理`}>
              <span
                style={{
                  color: '#E63946',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ExclamationCircleOutlined />
                {dateStr || '-'}
              </span>
            </Tooltip>
          );
        }
        return dateStr || <Text type="secondary">未设置</Text>;
      },
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
              {activeFilterCount > 0 && (
                <Tag color="orange" icon={<FilterOutlined />}>
                  已选条件 {activeFilterCount}
                </Tag>
              )}
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
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Space wrap size="middle" style={{ width: '100%' }}>
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
                <Space size={12} style={{ paddingLeft: 4, borderLeft: '1px dashed #e0e0e0' }}>
                  <Checkbox
                    checked={todoClosure}
                    onChange={(e) => {
                      setTodoClosure(e.target.checked);
                      setPage(1);
                    }}
                  >
                    <span style={{ color: todoClosure ? '#E63946' : undefined }}>
                      临时封闭
                    </span>
                  </Checkbox>
                  <Checkbox
                    checked={todoOverdue}
                    onChange={(e) => {
                      setTodoOverdue(e.target.checked);
                      setPage(1);
                    }}
                  >
                    <span style={{ color: todoOverdue ? '#E63946' : undefined }}>
                      超预计维修时间
                    </span>
                  </Checkbox>
                  <Checkbox
                    checked={todoAssigned}
                    onChange={(e) => {
                      setTodoAssigned(e.target.checked);
                      setPage(1);
                    }}
                  >
                    <span style={{ color: todoAssigned ? '#219EBC' : undefined }}>
                      已分派责任人
                    </span>
                  </Checkbox>
                </Space>
              </Space>
            </div>
            <Button
              danger={activeFilterCount > 0}
              type={activeFilterCount > 0 ? 'primary' : 'default'}
              icon={<ClearOutlined />}
              onClick={resetAll}
              disabled={activeFilterCount === 0}
            >
              清空筛选
            </Button>
          </div>

          {activeTags.length > 0 && (
            <div
              style={{
                padding: '12px 24px',
                background: '#FFFBF0',
                borderBottom: '1px solid #FFF3D6',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                <FilterOutlined style={{ marginRight: 4 }} />
                当前筛选：
              </Text>
              {activeTags.map((tag) => (
                <Tag
                  key={tag.key}
                  color={tag.color || 'blue'}
                  closable
                  onClose={tag.onClose}
                  style={{
                    margin: 0,
                    padding: '4px 10px',
                    fontSize: 13,
                    borderRadius: 6,
                  }}
                >
                  {tag.label}
                </Tag>
              ))}
            </div>
          )}

          {filteredRepairs.length === 0 ? (
            <div style={{ padding: '60px 0' }}>
              <EmptyState
                title={activeFilterCount > 0 ? '筛选结果为空' : '暂无报修记录'}
                description={
                  activeFilterCount > 0
                    ? '试试减少筛选条件或点击右上角「清空筛选」'
                    : '点击右上角「发起报修」创建新的报修单'
                }
                action={
                  activeFilterCount > 0 ? (
                    <Button type="primary" icon={<ClearOutlined />} onClick={resetAll}>
                      清空筛选条件
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              {selectedRowKeys.length > 0 && (
                <div
                  style={{
                    margin: '8px 16px 0',
                    padding: '12px 20px',
                    background: '#E6F4FF',
                    border: '1px solid #91CAFF',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <Space size={16} wrap>
                    <Space size={8}>
                      <CheckOutlined style={{ color: '#1677ff' }} />
                      <Text strong style={{ color: '#1677ff' }}>
                        已选中 {selectedRowKeys.length} 条待分派报修单
                      </Text>
                    </Space>
                    <Button
                      type="link"
                      size="small"
                      icon={<ClearOutlined />}
                      onClick={clearSelection}
                      style={{ padding: 0 }}
                    >
                      清空选择
                    </Button>
                  </Space>
                  <Button
                    type="primary"
                    icon={<UserSwitchOutlined />}
                    onClick={handleBulkAssignClick}
                  >
                    批量分派给…
                  </Button>
                </div>
              )}
              <Table
                columns={columns}
                dataSource={pagedRepairs}
                rowKey="id"
                pagination={false}
                scroll={{ x: 1600 }}
                size="middle"
                style={{ padding: '8px 0' }}
                rowClassName={(record) =>
                  isRepairOverdue(record) ? 'repair-row-overdue' : ''
                }
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys),
                  getCheckboxProps: (record: Repair) => ({
                    disabled: record.status !== 'pending',
                    name: `select-repair-${record.id}`,
                  }),
                  preserveSelectedRowKeys: true,
                  columnTitle: (
                    <Tooltip title="仅待分派的报修单可选择">
                      <span style={{ fontSize: 12 }}>选择</span>
                    </Tooltip>
                  ),
                  columnWidth: 60,
                }}
              />
              <style>{`
                .repair-row-overdue > td {
                  background-color: #FFF5F5 !important;
                }
                .repair-row-overdue:hover > td {
                  background-color: #FFEBEB !important;
                }
              `}</style>
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
        title={
          <Space size={8}>
            <UserSwitchOutlined />
            <span>
              {currentRepairIds.length <= 1
                ? '分派维修人员'
                : `批量分派（${currentRepairIds.length} 条）`}
            </span>
          </Space>
        }
        open={assignModalOpen}
        onOk={handleAssignConfirm}
        onCancel={() => {
          setAssignModalOpen(false);
          setCurrentRepairIds([]);
        }}
        confirmLoading={assignLoading}
        okText={currentRepairIds.length <= 1 ? '确认分派' : '确认批量分派'}
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
