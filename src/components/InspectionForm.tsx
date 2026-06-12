import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Upload, Radio, message, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { Point, InspectionFormValues, InspectionStatus, LightingStatus, DeviceType } from '../types';
import { getDeviceTypeIcon } from '../utils/helpers';

interface InspectionFormProps {
  open: boolean;
  points: Point[];
  selectedPointId?: string;
  onCancel: () => void;
  onSubmit: (values: InspectionFormValues) => void;
}

const InspectionForm: React.FC<InspectionFormProps> = ({
  open,
  points,
  selectedPointId,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<InspectionFormValues>();
  const [status, setStatus] = useState<InspectionStatus>('normal');
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (selectedPointId) {
        form.setFieldsValue({ pointId: selectedPointId, inspector: '巡检员' });
        const point = points.find((p) => p.id === selectedPointId);
        setSelectedPoint(point || null);
      } else {
        form.setFieldsValue({ inspector: '巡检员' });
        setSelectedPoint(null);
      }
      setStatus('normal');
    }
  }, [open, selectedPointId, points, form]);

  const handlePointChange = (pointId: string) => {
    const point = points.find((p) => p.id === pointId);
    setSelectedPoint(point || null);
  };

  const handleStatusChange = (e: any) => {
    setStatus(e.target.value as InspectionStatus);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.status === 'anomaly' && !values.anomalyDescription) {
        message.error('异常情况请填写异常说明');
        return;
      }
      onSubmit(values);
    } catch {
      message.error('请填写完整的巡检信息');
    }
  };

  const uploadProps: UploadProps = {
    listType: 'picture-card',
    maxCount: 1,
    showUploadList: true,
    beforeUpload: () => {
      message.info('演示模式，使用默认图片');
      return Upload.LIST_IGNORE;
    },
  };

  const deviceType = selectedPoint?.deviceType as DeviceType;
  const showPressure = deviceType === '灭火器';
  const showLighting = deviceType === '应急灯';

  return (
    <Modal
      title="新增巡检记录"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={650}
      okText="提交巡检"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="pointId"
          label="选择巡检点位"
          rules={[{ required: true, message: '请选择巡检点位' }]}
        >
          <Select
            placeholder="请选择要巡检的点位"
            onChange={handlePointChange}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              const label = option?.label as string;
              return label?.toLowerCase().includes(input.toLowerCase());
            }}
            options={points.map((p) => ({
              value: p.id,
              label: `${getDeviceTypeIcon(p.deviceType)} ${p.area} - ${p.deviceType} - ${p.deviceNo}`,
            }))}
          />
        </Form.Item>

        {selectedPoint && (
          <Card
            size="small"
            className="mb-4 bg-gray-50 border-gray-200"
          >
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">区域：</span>
                <span className="font-medium">{selectedPoint.area}</span>
              </div>
              <div>
                <span className="text-gray-500">类型：</span>
                <span className="font-medium">{selectedPoint.deviceType}</span>
              </div>
              <div>
                <span className="text-gray-500">编号：</span>
                <span className="font-medium">{selectedPoint.deviceNo}</span>
              </div>
              <div className="col-span-3">
                <span className="text-gray-500">责任人：</span>
                <span className="font-medium">{selectedPoint.personInCharge}</span>
              </div>
            </div>
          </Card>
        )}

        <Form.Item
          name="inspector"
          label="巡检人"
          rules={[{ required: true, message: '请输入巡检人姓名' }]}
        >
          <Input placeholder="请输入巡检人姓名" />
        </Form.Item>

        <Form.Item
          name="status"
          label="设备状态"
          rules={[{ required: true, message: '请选择设备状态' }]}
        >
          <Radio.Group onChange={handleStatusChange} className="w-full">
            <Radio.Button value="normal" className="flex-1 text-center py-2">
              <span className="text-green-600 font-medium">✓ 正常</span>
            </Radio.Button>
            <Radio.Button value="anomaly" className="flex-1 text-center py-2">
              <span className="text-red-600 font-medium">✗ 异常</span>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {showPressure && (
          <Form.Item
            name="pressure"
            label={
              <span>
                压力值 <span className="text-gray-400 text-xs">(MPa，正常范围 1.0-1.5)</span>
              </span>
            }
          >
            <InputNumber
              min={0}
              max={3}
              step={0.1}
              className="w-full"
              placeholder="请输入压力值"
            />
          </Form.Item>
        )}

        {showLighting && (
          <Form.Item
            name="lightingStatus"
            label="亮灯情况"
          >
            <Select placeholder="请选择亮灯情况">
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="不亮">不亮</Select.Option>
              <Select.Option value="闪烁">闪烁</Select.Option>
            </Select>
          </Form.Item>
        )}

        {status === 'anomaly' && (
          <Form.Item
            name="anomalyDescription"
            label="异常说明"
            rules={[{ required: true, message: '请描述异常情况' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请详细描述异常情况，系统将自动创建异常工单"
              showCount
              maxLength={500}
            />
          </Form.Item>
        )}

        <Form.Item
          name="photo"
          label="现场照片"
        >
          <Upload {...uploadProps}>
            <div>
              <PlusOutlined />
              <div className="mt-2 text-sm">上传照片</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InspectionForm;
