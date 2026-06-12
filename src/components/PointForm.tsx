import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import type { Point, PointFormValues, DeviceType } from '../types';

interface PointFormProps {
  open: boolean;
  editingPoint?: Point | null;
  onCancel: () => void;
  onSubmit: (values: PointFormValues) => void;
}

const deviceTypes: DeviceType[] = ['灭火器', '应急灯', '安全出口贴纸'];
const areas = ['1楼', '2楼', '3楼', '4楼', '5楼'];

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const PointForm: React.FC<PointFormProps> = ({
  open,
  editingPoint,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<PointFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open && editingPoint) {
      form.setFieldsValue({
        area: editingPoint.area,
        deviceType: editingPoint.deviceType,
        deviceNo: editingPoint.deviceNo,
        personInCharge: editingPoint.personInCharge,
        inspectionCycle: editingPoint.inspectionCycle,
        photo: editingPoint.photo,
        nextInspectionDate: editingPoint.nextInspectionDate,
      });
      if (editingPoint.photo) {
        setFileList([
          {
            uid: '-1',
            name: 'photo',
            status: 'done',
            url: editingPoint.photo,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        inspectionCycle: 30,
      });
      setFileList([]);
    }
  }, [open, editingPoint, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      message.error('请填写完整的表单信息');
    }
  };

  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      const file = newFileList[newFileList.length - 1];
      if (file.originFileObj) {
        try {
          const base64 = await getBase64(file.originFileObj as File);
          const updatedFile = { ...file, status: 'done' as const, url: base64 };
          setFileList([updatedFile]);
          form.setFieldsValue({ photo: base64 });
        } catch {
          message.error('图片读取失败');
        }
      } else if (file.url) {
        setFileList(newFileList);
      }
    } else {
      setFileList([]);
      form.setFieldsValue({ photo: undefined });
    }
  };

  const uploadProps: UploadProps = {
    listType: 'picture-card',
    maxCount: 1,
    showUploadList: true,
    fileList,
    beforeUpload: () => false,
    onChange: handleChange,
  };

  return (
    <Modal
      title={editingPoint ? '编辑点位' : '新增点位'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      okText={editingPoint ? '保存修改' : '创建点位'}
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="area"
            label="所在区域"
            rules={[{ required: true, message: '请选择区域' }]}
          >
            <Select placeholder="请选择楼层/区域">
              {areas.map((area) => (
                <Select.Option key={area} value={area}>
                  {area}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="deviceType"
            label="设备类型"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select placeholder="请选择设备类型">
              {deviceTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="deviceNo"
            label="设备编号"
            rules={[{ required: true, message: '请输入设备编号' }]}
          >
            <Input placeholder="如：FMQ-001" />
          </Form.Item>

          <Form.Item
            name="personInCharge"
            label="责任人"
            rules={[{ required: true, message: '请输入责任人姓名' }]}
          >
            <Input placeholder="请输入责任人姓名" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="inspectionCycle"
            label="检查周期(天)"
            rules={[{ required: true, message: '请输入检查周期' }]}
          >
            <InputNumber
              min={1}
              max={365}
              className="w-full"
              placeholder="请输入检查周期"
            />
          </Form.Item>

          <Form.Item
            name="nextInspectionDate"
            label="下次巡检日期"
            rules={[{ required: true, message: '请选择下次巡检日期' }]}
          >
            <Input type="date" className="w-full" />
          </Form.Item>
        </div>

        <Form.Item
          name="photo"
          label="现场照片"
        >
          <Upload {...uploadProps}>
            {fileList.length < 1 && (
              <div>
                <PlusOutlined />
                <div className="mt-2 text-sm">上传照片</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PointForm;
