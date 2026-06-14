import type { UploadFile } from 'antd';

export const fileListToUrls = (fileList: UploadFile[]): string[] => {
  return fileList
    .map((f) => f.url || '')
    .filter((url) => url && url.length > 0);
};

export const urlsToFileList = (urls: string[], prefix = 'photo'): UploadFile[] => {
  return urls.map((url, idx) => ({
    uid: `${prefix}-${idx}-${Date.now()}`,
    name: `${prefix}-${idx + 1}.jpg`,
    status: 'done',
    url,
  }));
};
