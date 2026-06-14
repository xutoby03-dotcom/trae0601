import { Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { Inbox } from 'lucide-react';

interface PhotoUploadProps {
  maxCount?: number;
  listType?: 'picture-card' | 'picture' | 'text';
  fileList?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  accept?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
};

export default function PhotoUpload({
  maxCount = 6,
  listType = 'picture-card',
  fileList,
  onChange,
  accept = 'image/*',
}: PhotoUploadProps) {
  const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB!');
      return Upload.LIST_IGNORE;
    }
    try {
      const base64 = await fileToBase64(file as unknown as File);
      (file as any).url = base64;
    } catch {
      message.error('图片读取失败，请重试');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    let list = [...info.fileList];
    list = list.slice(-maxCount);
    list = list.map((f) => {
      if (f.originFileObj && !f.url) {
        return f;
      }
      return f;
    });
    onChange?.(list);
  };

  const uploadButton = (
    <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
      <UploadOutlined style={{ fontSize: 22, marginBottom: 8 }} />
      <div style={{ marginTop: 8, fontSize: 13 }}>上传照片</div>
    </div>
  );

  const draggerUploadButton = (
    <div style={{ padding: '20px 0' }}>
      <p style={{ margin: 0, marginBottom: 8, color: 'rgba(0,0,0,0.65)', fontSize: 16 }}>
        <Inbox size={48} style={{ color: '#bfbfbf', marginBottom: 12 }} />
      </p>
      <p style={{ margin: 0, color: 'rgba(0,0,0,0.65)', fontSize: 14, fontWeight: 500 }}>
        点击或拖拽上传照片
      </p>
      <p style={{ margin: 0, marginTop: 4, color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
        支持 jpg/png 格式，单张不超过 5MB
      </p>
    </div>
  );

  return (
    <Upload.Dragger
      name="files"
      multiple
      listType={listType}
      maxCount={maxCount}
      accept={accept}
      fileList={fileList}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      showUploadList={{
        showPreviewIcon: true,
        showRemoveIcon: true,
      }}
      style={{
        background: '#fafafa',
        borderColor: '#d9d9d9',
      }}
    >
      {listType === 'picture-card' ? uploadButton : draggerUploadButton}
    </Upload.Dragger>
  );
}
