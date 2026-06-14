import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Switch,
  Typography,
  message,
  Spin,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import { useRepairStore, useFacilityStore } from '@/store';
import { PhotoUpload } from '@/components';
import {
  PROBLEM_TYPES,
  SEVERITY_CONFIG,
  type Severity,
} from '@/types';
import { dayjs } from '@/utils/date';
import { fileListToUrls } from '@/utils/photos';

const { Title, Text } = Typography;
const { TextArea } = Input;

type FormValues = {
  facility_id: string;
  problem_type: string;
  severity: Severity;
  description: string;
  reporter: string;
  reporter_phone?: string;
  need_closure: boolean;
  expected_fix_date?: Dayjs;
};

const severityOptions: { label: string; value: Severity; color: string }[] = [
  { label: SEVERITY_CONFIG.low.label, value: 'low', color: SEVERITY_CONFIG.low.color },
  { label: SEVERITY_CONFIG.medium.label, value: 'medium', color: SEVERITY_CONFIG.medium.color },
  { label: SEVERITY_CONFIG.high.label, value: 'high', color: SEVERITY_CONFIG.high.color },
  { label: SEVERITY_CONFIG.critical.label, value: 'critical', color: SEVERITY_CONFIG.critical.color },
];

export default function RepairForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const facilityIdParam = searchParams.get('facilityId');

  const { addRepair } = useRepairStore();
  const { facilities } = useFacilityStore();

  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [severityValue, setSeverityValue] = useState<Severity>('medium');
  const [photoFileList, setPhotoFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (facilityIdParam) {
      form.setFieldsValue({ facility_id: facilityIdParam });
    }
    form.setFieldsValue({ need_closure: false });
  }, [facilityIdParam, form]);

  const facilityOptions = useMemo(
    () =>
      facilities.map((f) => ({
        label: `${f.name} — ${f.location}`,
        value: f.id,
      })),
    [facilities]
  );

  const showHighRiskConfirm = (values: FormValues, photos: string[]) => {
    Modal.confirm({
      title: (
        <span style={{ color: '#E63946', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <WarningOutlined /> 高风险报修确认
        </span>
      ),
      icon: <ExclamationCircleOutlined />,
      content: (
        <div style={{ padding: '8px 0' }}>
          <p style={{ marginBottom: 12 }}>
            该问题严重程度为
            <Text strong style={{ color: '#E63946', margin: '0 6px' }}>
              {SEVERITY_CONFIG[values.severity].label}
            </Text>
            ，提交后系统将自动执行以下操作：
          </p>
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="关联设施将被自动标记为「已停用」状态，直至维修完成并通过复检。"
            style={{ borderRadius: 8 }}
          />
        </div>
      ),
      okText: '确认提交',
      okButtonProps: { danger: true },
      cancelText: '返回修改',
      centered: true,
      onOk: () => submitForm(values, photos),
    });
  };

  const submitForm = async (values: FormValues, photos: string[]) => {
    setLoading(true);
    try {
      const photoUrls = photos.length > 0 ? photos : fileListToUrls(photoFileList);
      if (photoUrls.length < 1) {
        message.warning('请至少上传1张现场照片');
        setLoading(false);
        return;
      }
      addRepair({
        facility_id: values.facility_id,
        problem_type: values.problem_type,
        severity: values.severity,
        reporter: values.reporter,
        reporter_phone: values.reporter_phone || '',
        description: values.description,
        need_closure: values.need_closure,
        expected_fix_date: values.expected_fix_date
          ? values.expected_fix_date.toISOString()
          : '',
        assigned_to: null,
        assigned_at: null,
        started_at: null,
        completed_at: null,
        reviewer: null,
        reviewed_at: null,
        review_comment: null,
        _reportPhotos: photoUrls,
      });
      message.success('报修提交成功！');
      setTimeout(() => navigate('/repairs'), 500);
    } catch (err) {
      message.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const urls = fileListToUrls(photoFileList);
      if (urls.length < 1) {
        message.warning('请至少上传1张现场照片');
        return;
      }
      if (values.severity === 'high' || values.severity === 'critical') {
        showHighRiskConfirm(values, urls);
      } else {
        submitForm(values, urls);
      }
    } catch (err) {
      // validation failed, antd handles messages
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          <Breadcrumb
            items={[
              { title: <span onClick={() => navigate('/repairs')} style={{ cursor: 'pointer' }}>报修管理</span> },
              { title: '发起报修' },
            ]}
          />
        </div>

        <Card
          style={{ borderRadius: 12, maxWidth: 900 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginRight: 4 }}
              />
              <Title level={4} style={{ margin: 0 }}>发起报修</Title>
            </div>
          }
          styles={{ body: { padding: 32 } }}
        >
          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
            initialValues={{ severity: 'medium', need_closure: false }}
            onValuesChange={(changed) => {
              if (changed.severity) {
                setSeverityValue(changed.severity);
              }
            }}
          >
            <Form.Item
              label="选择设施"
              name="facility_id"
              rules={[{ required: true, message: '请选择报修设施' }]}
            >
              <Select
                showSearch
                placeholder="搜索并选择需要报修的设施"
                options={facilityOptions}
                optionFilterProp="label"
                size="large"
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Form.Item
                label="问题类型"
                name="problem_type"
                rules={[{ required: true, message: '请选择问题类型' }]}
              >
                <Select
                  placeholder="请选择问题类型"
                  options={PROBLEM_TYPES.map((t) => ({ label: t, value: t }))}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="预计维修时间"
                name="expected_fix_date"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="选择预计完成日期"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="严重程度"
              name="severity"
              rules={[{ required: true, message: '请选择严重程度' }]}
              style={{ marginBottom: 8 }}
            >
              <Radio.Group
                size="large"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 12,
                  width: '100%',
                }}
                onChange={(e) => setSeverityValue(e.target.value)}
              >
                {severityOptions.map((opt) => (
                  <Radio.Button
                    key={opt.value}
                    value={opt.value}
                    style={{
                      height: 52,
                      lineHeight: '48px',
                      textAlign: 'center',
                      borderRadius: 8,
                      border: `2px solid ${severityValue === opt.value ? opt.color : '#d9d9d9'}`,
                      color: severityValue === opt.value ? opt.color : '#333',
                      fontWeight: severityValue === opt.value ? 600 : 400,
                      background: severityValue === opt.value ? `${opt.color}12` : '#fff',
                      boxShadow: severityValue === opt.value ? `0 0 0 2px ${opt.color}22` : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>

            {(severityValue === 'high' || severityValue === 'critical') && (
              <Alert
                type="error"
                showIcon
                icon={<WarningOutlined />}
                message="注意：选择严重/高危将自动停用该设施！"
                description="该设施将被标记为停用状态，所有使用和预约将被暂停，直至维修完成并通过复检。"
                style={{ marginBottom: 24, borderRadius: 8 }}
              />
            )}

            <Form.Item
              label="问题描述"
              name="description"
              rules={[
                { required: true, message: '请详细描述发现的问题' },
                { min: 10, message: '描述不少于10个字符' },
              ]}
              style={{ marginTop: 24 }}
            >
              <TextArea
                rows={4}
                size="large"
                maxLength={500}
                showCount
                placeholder="请详细描述发现的问题、具体部位、现象等（不少于10个字）"
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Form.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                    发现人
                  </span>
                }
                name="reporter"
                rules={[{ required: true, message: '请输入您的称呼' }]}
              >
                <Input size="large" placeholder="您的称呼" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    <PhoneOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                    联系电话
                  </span>
                }
                name="reporter_phone"
              >
                <Input size="large" placeholder="选填，便于联系您" />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Form.Item
                label="是否需要临时封闭"
                name="need_closure"
                valuePropName="checked"
                style={{ marginBottom: 24 }}
              >
                <Switch
                  checkedChildren="需要"
                  unCheckedChildren="不需要"
                  size="default"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span>
                  <ExclamationCircleOutlined style={{ marginRight: 6, color: '#faad14' }} />
                  现场照片（至少1张）
                </span>
              }
              required
              style={{ marginBottom: 24 }}
            >
              <PhotoUpload
                fileList={photoFileList}
                onChange={setPhotoFileList}
                maxCount={9}
                listType="picture-card"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button size="large" onClick={() => navigate(-1)}>
                  取消
                </Button>
                <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
                  提交报修
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
}
