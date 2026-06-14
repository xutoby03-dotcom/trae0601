import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import type { UploadFile } from 'antd';
import { ArrowLeft, Save } from 'lucide-react';
import dayjs from 'dayjs';
import type { Facility } from '@/types';
import { useFacilityStore } from '@/store';
import { PhotoUpload } from '@/components';

const ageRangeOptions = [
  { value: '0-3岁', label: '0-3岁' },
  { value: '3-6岁', label: '3-6岁' },
  { value: '6-12岁', label: '6-12岁' },
  { value: '全年龄', label: '全年龄' },
];

interface FormValues {
  name: string;
  location: string;
  age_range: string;
  install_date: dayjs.Dayjs;
  inspection_cycle_days: number;
  responsible_person: string;
  responsible_phone?: string;
}

const fileListToUrls = (fileList: UploadFile[]): string[] => {
  return fileList
    .map((f) => f.url || (f.response as string) || '')
    .filter((url) => url && url.length > 0);
};

export default function FacilityForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { addFacility, updateFacility, getFacilityById } = useFacilityStore();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      const facility = getFacilityById(id);
      if (facility) {
        form.setFieldsValue({
          name: facility.name,
          location: facility.location,
          age_range: facility.age_range,
          install_date: dayjs(facility.install_date),
          inspection_cycle_days: facility.inspection_cycle_days,
          responsible_person: facility.responsible_person,
          responsible_phone: facility.responsible_phone,
        });
        if (facility.photo_url) {
          setPhotos([{
            uid: '-1',
            name: 'cover.jpg',
            status: 'done',
            url: facility.photo_url,
          }]);
        }
      } else {
        message.error('设施不存在');
        navigate('/facilities');
      }
    }
  }, [isEdit, id, getFacilityById, form, navigate]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const photoUrls = fileListToUrls(photos);
      const photo_url = photoUrls[0] || '';
      if (isEdit && id) {
        updateFacility(id, {
          name: values.name,
          location: values.location,
          age_range: values.age_range,
          install_date: values.install_date.toISOString(),
          inspection_cycle_days: values.inspection_cycle_days,
          responsible_person: values.responsible_person,
          responsible_phone: values.responsible_phone || '',
          photo_url,
        });
        message.success('设施更新成功');
      } else {
        addFacility({
          name: values.name,
          location: values.location,
          age_range: values.age_range,
          install_date: values.install_date.toISOString(),
          inspection_cycle_days: values.inspection_cycle_days,
          responsible_person: values.responsible_person,
          responsible_phone: values.responsible_phone || '',
          photo_url,
          status: 'active',
          last_inspection_date: values.install_date.toISOString(),
        });
        message.success('设施创建成功');
      }
      navigate('/facilities');
    } catch {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/facilities')}
            style={{ padding: 8 }}
          >
            返回
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? '编辑设施' : '新增设施'}
          </h1>
        </div>

        <Card className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            requiredMark
            onFinish={handleSubmit}
            initialValues={{
              inspection_cycle_days: 15,
            }}
          >
            <Row gutter={32}>
              <Col xs={24} md={16}>
                <Form.Item
                  label="设施名称"
                  name="name"
                  rules={[{ required: true, message: '设施名称必填' }]}
                >
                  <Input size="large" placeholder="如：儿童组合滑梯" />
                </Form.Item>

                <Form.Item
                  label="位置"
                  name="location"
                  rules={[{ required: true, message: '位置必填' }]}
                >
                  <Input size="large" placeholder="如：1号楼东侧小花园" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="适用年龄"
                      name="age_range"
                      rules={[{ required: true, message: '适用年龄必选' }]}
                    >
                      <Select
                        size="large"
                        placeholder="请选择适用年龄"
                        options={ageRangeOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="安装日期"
                      name="install_date"
                      rules={[{ required: true, message: '安装日期必选' }]}
                    >
                      <DatePicker
                        size="large"
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="巡检周期(天)"
                  name="inspection_cycle_days"
                  rules={[{ required: true, message: '巡检周期必填' }]}
                >
                  <InputNumber
                    size="large"
                    min={1}
                    max={365}
                    style={{ width: '100%' }}
                    placeholder="请输入巡检周期"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="责任人"
                      name="responsible_person"
                      rules={[{ required: true, message: '责任人必填' }]}
                    >
                      <Input size="large" placeholder="请输入责任人姓名" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="责任人电话" name="responsible_phone">
                      <Input size="large" placeholder="联系电话" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  label="设施照片"
                  required
                  tooltip="最多上传3张，取第一张作为封面"
                >
                  <div className="mb-2 text-sm text-gray-500">
                    上传设施照片，建议清晰展示设施全貌
                  </div>
                  <PhotoUpload
                    fileList={photos}
                    onChange={setPhotos}
                    maxCount={3}
                    listType="picture-card"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div
              className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-6"
            >
              <Space size={12}>
                <Button
                  size="large"
                  onClick={() => navigate('/facilities')}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<Save size={18} />}
                  style={{ backgroundColor: '#FF6B35', borderColor: '#FF6B35' }}
                >
                  保存
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
