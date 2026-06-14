import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Steps,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
  Spin,
} from 'antd';
import type { UploadFile } from 'antd';
import type { TimelineItemProps } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  StopOutlined,
  SyncOutlined,
  UserOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRepairStore, useFacilityStore } from '@/store';
import { SeverityTag, RepairStatusTag, PhotoCompare, PhotoUpload, EmptyState } from '@/components';
import {
  FACILITY_STATUS_CONFIG,
  REPAIR_STATUS_CONFIG,
  SEVERITY_CONFIG,
  type MaintenanceLog,
  type Repair,
  type RepairStatus,
  type Severity,
} from '@/types';
import { formatDate, formatDateTime, fromNow } from '@/utils/date';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type TabKey = 'records' | 'photos' | 'execution' | 'review';

const formatRepairNo = (id: string) => {
  const suffix = id.slice(-6).toUpperCase().replace(/[^0-9A-Z]/g, '').slice(-6).padStart(6, '0');
  return `RP-${suffix}`;
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <ExclamationCircleOutlined />,
  assign: <UserSwitchOutlined />,
  start: <PlayCircleOutlined />,
  complete: <SyncOutlined />,
  review: <CheckCircleOutlined />,
  reject: <CloseCircleOutlined />,
  auto_disable: <StopOutlined />,
  cancel: <CloseCircleOutlined />,
};

const ACTION_COLORS: Record<string, string> = {
  create: '#1677ff',
  assign: '#219EBC',
  start: '#FF6B35',
  complete: '#FFB703',
  review: '#2A9D8F',
  reject: '#E63946',
  auto_disable: '#ADB5BD',
  cancel: '#868E96',
};

const ACTION_LABELS: Record<string, string> = {
  create: '提交报修',
  assign: '分派维修人员',
  start: '开始维修',
  complete: '完成维修',
  review: '复检通过',
  reject: '复检退回',
  auto_disable: '系统自动停用设施',
  cancel: '取消报修单',
};

const STEP_STATUSES: RepairStatus[] = ['pending', 'assigned', 'in_progress', 'review', 'completed'];

const ASSIGNEES = [
  '王师傅', '李师傅', '张师傅', '赵师傅',
  '专业电气维修周工', '专业焊接队', '工程部钱经理', '物业主管卫经理',
];

const fileListToUrls = (fileList: UploadFile[]): string[] => {
  return fileList
    .map((f) => f.url || (f.response as string) || '')
    .filter((url) => url && url.length > 0);
};

export default function RepairDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'records';

  const {
    repairs,
    repairPhotos,
    maintenanceLogs,
    getRepairById,
    getPhotosByRepairId,
    getLogsByRepairId,
    assignRepair,
    startRepair,
    completeRepair,
    reviewRepair,
  } = useRepairStore();
  const { facilities, getFacilityById } = useFacilityStore();

  const [loading, setLoading] = useState(false);
  const [tabKey, setTabKey] = useState<TabKey>(initialTab);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm] = Form.useForm();
  const [assignLoading, setAssignLoading] = useState(false);
  const [executionForm] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [executing, setExecuting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [beforePhotoList, setBeforePhotoList] = useState<UploadFile[]>([]);
  const [afterPhotoList, setAfterPhotoList] = useState<UploadFile[]>([]);

  const repair = useMemo<Repair | undefined>(() => {
    return getRepairById(id || '');
  }, [id, repairs]);

  const facility = useMemo(() => {
    return repair ? getFacilityById(repair.facility_id) : undefined;
  }, [repair, facilities]);

  const photos = useMemo(() => {
    return repair ? getPhotosByRepairId(repair.id) : { before: [], after: [] };
  }, [repair, repairPhotos]);

  const logs = useMemo<MaintenanceLog[]>(() => {
    return repair ? getLogsByRepairId(repair.id) : [];
  }, [repair, maintenanceLogs]);

  useEffect(() => {
    if (!repair && repairs.length === 0) {
      setLoading(true);
      setTimeout(() => setLoading(false), 300);
    }
  }, [repair, repairs.length]);

  const currentStep = useMemo(() => {
    if (!repair) return 0;
    const config = REPAIR_STATUS_CONFIG[repair.status];
    if (repair.status === 'cancelled') return 0;
    return config.step;
  }, [repair]);

  const stepItems = useMemo(() => {
    return STEP_STATUSES.map((s) => {
      const config = REPAIR_STATUS_CONFIG[s];
      const logForStep = logs.find((l) => {
        if (s === 'pending') return l.action === 'create';
        if (s === 'assigned') return l.action === 'assign';
        if (s === 'in_progress') return l.action === 'start';
        if (s === 'review') return l.action === 'complete';
        if (s === 'completed') return l.action === 'review';
        return false;
      });
      const description = logForStep
        ? (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              <div>{logForStep.operator}</div>
              <div>{formatDateTime(logForStep.created_at)}</div>
            </div>
          )
        : undefined;
      return {
        title: config.label,
        description,
      };
    });
  }, [logs]);

  const timelineItems: TimelineItemProps[] = useMemo(() => {
    return logs.map((log) => ({
      color: ACTION_COLORS[log.action] || '#8c8c8c',
      dot: (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: ACTION_COLORS[log.action] || '#8c8c8c',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
        }}>
          {ACTION_ICONS[log.action] || <ClockCircleOutlined />}
        </div>
      ),
      children: (
        <div style={{ padding: '8px 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <Text strong style={{ fontSize: 15 }}>
              {ACTION_LABELS[log.action] || log.action}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatDateTime(log.created_at)}
            </Text>
          </div>
          <div style={{ marginTop: 4 }}>
            <UserOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
            <Text type="secondary">{log.operator}</Text>
          </div>
          {log.remark && (
            <Paragraph
              type="secondary"
              style={{ marginTop: 8, marginBottom: 0, fontSize: 13 }}
            >
              {log.remark}
            </Paragraph>
          )}
        </div>
      ),
    }));
  }, [logs]);

  const beforePhotos = photos.before.map((p) => p.photo_url);
  const afterPhotos = photos.after.map((p) => p.photo_url);

  const handleAssignClick = () => {
    setAssignModalOpen(true);
    assignForm.resetFields();
  };

  const handleAssignConfirm = async () => {
    try {
      const values = await assignForm.validateFields();
      setAssignLoading(true);
      if (id) {
        assignRepair(id, values.assignee);
        message.success('分派成功');
        setAssignModalOpen(false);
      }
      setAssignLoading(false);
    } catch (err) {
      setAssignLoading(false);
    }
  };

  const handleStartRepair = () => {
    Modal.confirm({
      title: '确认开始维修',
      content: '确认开始进行维修作业吗？设施状态将变更为维修中。',
      okText: '确认开始',
      cancelText: '取消',
      onOk: () => {
        if (id) {
          startRepair(id);
          message.success('已标记维修开始');
          setTabKey('execution');
        }
      },
    });
  };

  const handleCompleteRepair = async () => {
    try {
      const values = await executionForm.validateFields();
      const beforeUrls = fileListToUrls(beforePhotoList);
      const afterUrls = fileListToUrls(afterPhotoList);
      if (beforeUrls.length < 1) {
        message.warning('请至少上传1张维修前照片');
        return;
      }
      if (afterUrls.length < 1) {
        message.warning('请至少上传1张维修后照片');
        return;
      }
      Modal.confirm({
        title: '确认提交复检',
        content: '确认维修已完成，提交复检申请？',
        okText: '确认提交',
        cancelText: '取消',
        onOk: async () => {
          setExecuting(true);
          if (id) {
            completeRepair(
              id,
              beforeUrls,
              afterUrls,
              values.remark || ''
            );
            message.success('已提交复检');
            setTabKey('review');
          }
          setExecuting(false);
        },
      });
    } catch (err) {
      // form validation
    }
  };

  const handleReview = async (passed: boolean) => {
    try {
      const values = await reviewForm.validateFields();
      Modal.confirm({
        title: passed ? '确认复检通过' : '确认退回维修',
        content: passed
          ? '确认维修质量合格，复检通过？'
          : '确认维修不合格，退回维修人员？',
        okText: passed ? '确认通过' : '确认退回',
        cancelText: '取消',
        onOk: async () => {
          setReviewing(true);
          if (id) {
            reviewRepair(
              id,
              passed,
              values.reviewer,
              values.comment || ''
            );
            message.success(passed ? '复检通过' : '已退回维修');
            setTabKey('records');
          }
          setReviewing(false);
        },
      });
    } catch (err) {
      // form validation
    }
  };

  const renderActionButtons = () => {
    if (!repair) return null;
    const buttons = [];

    switch (repair.status) {
      case 'pending':
        buttons.push(
          <Button key="assign" type="primary" onClick={handleAssignClick}>
            <UserSwitchOutlined /> 分派维修人员
          </Button>
        );
        break;
      case 'assigned':
        buttons.push(
          <Button key="start" type="primary" onClick={handleStartRepair}>
            <PlayCircleOutlined /> 标记开始维修
          </Button>
        );
        break;
      case 'in_progress':
        buttons.push(
          <Button key="exec" type="primary" onClick={() => setTabKey('execution')}>
            <SettingOutlined /> 上传维修记录
          </Button>
        );
        break;
      case 'review':
        buttons.push(
          <Button key="review" type="primary" onClick={() => setTabKey('review')}>
            <CheckCircleOutlined /> 复检确认
          </Button>
        );
        break;
      case 'completed':
      case 'cancelled':
      default:
        break;
    }

    return buttons;
  };

  const renderTabContent = (key: TabKey) => {
    switch (key) {
      case 'records':
        return (
          <Card style={{ borderRadius: 10 }} styles={{ body: { padding: '16px 24px' } }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              <ClockCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />
              操作日志
            </Title>
            {logs.length === 0 ? (
              <EmptyState title="暂无操作记录" />
            ) : (
              <Timeline items={timelineItems} style={{ marginLeft: 8 }} />
            )}
          </Card>
        );

      case 'photos':
        return (
          <Card style={{ borderRadius: 10 }} styles={{ body: { padding: 24 } }}>
            <Title level={5} style={{ marginBottom: 20 }}>
              <ExclamationCircleOutlined style={{ color: '#FFB703', marginRight: 8 }} />
              照片对比
            </Title>
            <PhotoCompare
              beforePhotos={beforePhotos}
              afterPhotos={afterPhotos}
            />
          </Card>
        );

      case 'execution':
        const canEdit = repair?.status === 'in_progress' || repair?.status === 'assigned';
        return (
          <Card style={{ borderRadius: 10 }} styles={{ body: { padding: 24 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Title level={5} style={{ margin: 0 }}>
                <SettingOutlined style={{ color: '#FF6B35', marginRight: 8 }} />
                维修执行记录
              </Title>
              {!canEdit && (
                <Tag color="default">当前状态下不可编辑</Tag>
              )}
            </div>
            <Form
              form={executionForm}
              layout="vertical"
              disabled={!canEdit}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <Form.Item
                  label="维修前照片 *"
                  required
                >
                  <PhotoUpload
                    fileList={beforePhotoList}
                    onChange={setBeforePhotoList}
                    maxCount={6}
                    listType="picture-card"
                  />
                </Form.Item>
                <Form.Item
                  label="维修后照片 *"
                  required
                >
                  <PhotoUpload
                    fileList={afterPhotoList}
                    onChange={setAfterPhotoList}
                    maxCount={6}
                    listType="picture-card"
                  />
                </Form.Item>
              </div>
              <Form.Item label="维修说明" name="remark">
                <TextArea
                  rows={4}
                  placeholder="请描述维修过程、更换部件、注意事项等"
                  disabled={!canEdit}
                />
              </Form.Item>
              {canEdit && (
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleCompleteRepair}
                    loading={executing}
                    icon={<CheckCircleOutlined />}
                  >
                    标记维修完成，提交复检
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Card>
        );

      case 'review':
        const isReviewState = repair?.status === 'review' || repair?.status === 'completed';
        const showReviewForm = repair?.status === 'review';
        return (
          <Card style={{ borderRadius: 10 }} styles={{ body: { padding: 24 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Title level={5} style={{ margin: 0 }}>
                <CheckCircleOutlined style={{ color: '#2A9D8F', marginRight: 8 }} />
                复检确认
              </Title>
              {repair?.status === 'completed' && (
                <Tag color="success">已完成复检</Tag>
              )}
              {repair?.status !== 'review' && repair?.status !== 'completed' && (
                <Tag color="default">当前状态无需复检</Tag>
              )}
            </div>

            {isReviewState && (
              <>
                {repair?.status === 'review' && (
                  <Alert
                    type="warning"
                    showIcon
                    message="请仔细核查维修前后对比照片，确认维修质量合格后再通过复检"
                    style={{ marginBottom: 24, borderRadius: 8 }}
                  />
                )}

                {repair?.status === 'completed' && (
                  <Card
                    type="inner"
                    title="复检信息"
                    style={{ marginBottom: 24, borderRadius: 8 }}
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="复检人">
                        {repair.reviewer || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="复检时间">
                        {formatDateTime(repair.reviewed_at)}
                      </Descriptions.Item>
                      <Descriptions.Item label="复检意见">
                        {repair.review_comment || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}

                <div style={{ marginBottom: 24 }}>
                  <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>维修前后对比</Title>
                  <PhotoCompare beforePhotos={beforePhotos} afterPhotos={afterPhotos} />
                </div>

                {showReviewForm && (
                  <Form
                    form={reviewForm}
                    layout="vertical"
                    initialValues={{ reviewer: '当前用户' }}
                  >
                    <Form.Item
                      label="复检人"
                      name="reviewer"
                      rules={[{ required: true, message: '请输入复检人姓名' }]}
                    >
                      <Input size="large" placeholder="请输入复检人姓名" />
                    </Form.Item>
                    <Form.Item
                      label="复检意见"
                      name="comment"
                      rules={[{ required: true, message: '请填写复检意见' }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder={repair?.status === 'review' ? '请描述复检情况...' : '复检意见'}
                      />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Space size="middle">
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => handleReview(true)}
                          loading={reviewing}
                          icon={<CheckCircleOutlined />}
                          style={{ background: '#2A9D8F', borderColor: '#2A9D8F' }}
                        >
                          复检通过
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          danger
                          onClick={() => handleReview(false)}
                          loading={reviewing}
                          icon={<ReloadOutlined />}
                          style={{ background: '#FFB703', borderColor: '#FFB703' }}
                        >
                          不通过退回
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                )}
              </>
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!repair) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Breadcrumb
            items={[
              { title: <span onClick={() => navigate('/repairs')} style={{ cursor: 'pointer' }}>报修管理</span> },
              { title: '报修详情' },
            ]}
          />
        </div>
        <EmptyState title="未找到该报修记录" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: <span onClick={() => navigate('/repairs')} style={{ cursor: 'pointer' }}>报修管理</span> },
            { title: formatRepairNo(repair.id) },
          ]}
        />
      </div>

      <Card
        style={{ borderRadius: 12, marginBottom: 20 }}
        styles={{ body: { padding: 0 } }}
        title={
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/repairs')} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Title level={3} style={{ margin: 0, fontSize: 22 }}>
                  {formatRepairNo(repair.id)}
                </Title>
                <SeverityTag severity={repair.severity} />
                <RepairStatusTag status={repair.status} />
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13, marginTop: 4 }}>
                创建于 {fromNow(repair.created_at)}（{formatDateTime(repair.created_at)}）
              </div>
            </div>
            <Space>{renderActionButtons()}</Space>
          </div>
        }
      >
        <div style={{ padding: '0 24px 16px' }}>
          <Steps
            current={repair.status === 'cancelled' ? -1 : currentStep - 1}
            items={stepItems}
            size="default"
            status={repair.status === 'cancelled' ? 'error' : 'process'}
          />
          {repair.status === 'cancelled' && (
            <Alert
              type="error"
              showIcon
              message="该报修单已取消"
              style={{ marginTop: 16, borderRadius: 8 }}
            />
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card title="报修信息" style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
          <Descriptions column={2} size="middle" labelStyle={{ width: 100, color: '#8c8c8c' }}>
            <Descriptions.Item label="问题类型">
              <Tag color="blue">{repair.problem_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="严重程度">
              <SeverityTag severity={repair.severity} />
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <RepairStatusTag status={repair.status} />
            </Descriptions.Item>
            <Descriptions.Item label="问题描述" span={2}>
              <div
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 8,
                  lineHeight: 1.7,
                  marginTop: -6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {repair.description}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="发现人">
              <UserOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
              {repair.reporter}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              <PhoneOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
              {repair.reporter_phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">{formatDateTime(repair.created_at)}</Descriptions.Item>
            <Descriptions.Item label="预计维修">
              {formatDate(repair.expected_fix_date)}
            </Descriptions.Item>
            <Descriptions.Item label="临时封闭">
              {repair.need_closure ? (
                <Tag color="red">已封闭</Tag>
              ) : (
                <Tag color="green">未封闭</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="维修人员">
              {repair.assigned_to ? (
                <span>
                  <UserSwitchOutlined style={{ marginRight: 4, color: '#219EBC' }} />
                  {repair.assigned_to}
                </span>
              ) : (
                <Text type="secondary">未分派</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <EnvironmentOutlined style={{ color: '#1677ff' }} />
              关联设施
            </span>
          }
          style={{ borderRadius: 12 }}
          styles={{ body: { padding: 0 } }}
        >
          {facility ? (
            <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/facilities/${facility.id}`)}>
              <div
                style={{
                  height: 160,
                  backgroundImage: `url(${facility.photo_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              />
              <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Title level={5} style={{ margin: 0 }}>{facility.name}</Title>
                  <Tag color={FACILITY_STATUS_CONFIG[facility.status].color}>
                    {FACILITY_STATUS_CONFIG[facility.status].label}
                  </Tag>
                </div>
                <div style={{ color: '#8c8c8c', marginTop: 8, fontSize: 13 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {facility.location}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0' }}>
                  <Descriptions column={1} size="small" labelStyle={{ width: 80, color: '#8c8c8c' }}>
                    <Descriptions.Item label="责任人">{facility.responsible_person}</Descriptions.Item>
                    <Descriptions.Item label="联系电话">{facility.responsible_phone}</Descriptions.Item>
                    <Descriptions.Item label="投用日期">{formatDate(facility.install_date)}</Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 0' }}>
              <EmptyState title="设施信息已删除" />
            </div>
          )}
        </Card>
      </div>

      <Card
        style={{ borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
        tabBarExtraContent={
          repair?.assigned_to && (
            <Tag color="blue" style={{ marginRight: 16 }}>
              <UserSwitchOutlined /> 当前负责人：{repair.assigned_to}
            </Tag>
          )
        }
      >
        <Tabs
          activeKey={tabKey}
          onChange={(key) => setTabKey(key as TabKey)}
          items={[
            {
              key: 'records',
              label: (
                <span>
                  <ClockCircleOutlined /> 维修记录
                </span>
              ),
              children: renderTabContent('records'),
            },
            {
              key: 'photos',
              label: (
                <span>
                  <ExclamationCircleOutlined /> 照片对比
                </span>
              ),
              children: renderTabContent('photos'),
            },
            {
              key: 'execution',
              label: (
                <span>
                  <SettingOutlined /> 维修执行
                </span>
              ),
              children: renderTabContent('execution'),
            },
            {
              key: 'review',
              label: (
                <span>
                  <CheckCircleOutlined /> 复检确认
                </span>
              ),
              children: renderTabContent('review'),
            },
          ]}
          size="large"
          style={{ marginLeft: 8 }}
        />
      </Card>

      <Modal
        title="分派维修人员"
        open={assignModalOpen}
        onOk={handleAssignConfirm}
        onCancel={() => setAssignModalOpen(false)}
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
