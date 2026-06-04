import { Eye, Edit3, Copy, Save, Share2, QrCode } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useFormStore } from '../../store/useFormStore';
import { useUIStore } from '../../store/useUIStore';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { Modal } from '../common/Modal';
import { cn } from '@/lib/utils';

export function Toolbar() {
  const { toJSON, publish, formData } = useFormStore();
  const { isPreviewMode, setPreviewMode, showToast, setShowPublishModal, showPublishModal } = useUIStore();
  const [publishId, setPublishId] = useState<string>('');

  const handleCopy = async () => {
    const json = toJSON();
    const success = await copyToClipboard(json);
    if (success) {
      showToast('JSON已复制到剪贴板');
    } else {
      showToast('复制失败，请手动复制');
    }
  };

  const handleSave = () => {
    const json = toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title || 'form'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('表单已保存');
  };

  const handlePublish = () => {
    const id = publish();
    setPublishId(id);
    setShowPublishModal(true);
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}#/preview/${publishId}`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      showToast('链接已复制到剪贴板');
    }
  };

  return (
    <>
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Edit3 size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-800">表单生成器</span>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                !isPreviewMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Edit3 size={16} />
              编辑
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                isPreviewMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Eye size={16} />
              预览
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Copy size={16} />
            复制JSON
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Save size={16} />
            保存
          </button>
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Share2 size={16} />
            发布
          </button>
        </div>
      </div>

      <Modal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="发布表单"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <QRCodeSVG
              value={shareUrl}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1e40af"
            />
          </div>

          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-gray-700">分享链接</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Copy size={16} />
                复制
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <QrCode size={16} />
            <span>扫码或点击链接即可预览表单</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
