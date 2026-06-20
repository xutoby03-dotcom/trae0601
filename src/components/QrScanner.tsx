import { useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from './Modal';
import { classNames } from '@/utils/helpers';

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  onCameraError?: (error: string) => void;
}

const SCANNER_CONTAINER_ID = 'qr-scanner-container';

const translateCameraError = (raw: string): string => {
  const r = raw.toLowerCase();
  if (r.includes('notallowederror') || r.includes('permission') || r.includes('denied') || r.includes('not allowed')) {
    return '浏览器已拒绝摄像头权限，请在地址栏设置中允许访问摄像头';
  }
  if (r.includes('notfounderror') || r.includes('no device') || r.includes('not found')) {
    return '未检测到摄像头设备，请检查设备是否连接正常';
  }
  if (r.includes('notreadableerror') || r.includes('track')) {
    return '摄像头被其他应用占用，请关闭占用摄像头的程序后重试';
  }
  if (r.includes('overconstrainederror') || r.includes('constraint')) {
    return '摄像头参数不匹配，请尝试更换设备';
  }
  if (r.includes('securityerror') || r.includes('secure')) {
    return '当前页面非 HTTPS 环境，浏览器禁止调用摄像头';
  }
  return raw || '无法启动摄像头';
};

export default function QrScanner({ open, onClose, onScanSuccess, onScanFailure, onCameraError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const hasScannedRef = useRef(false);
  const lastCameraErrorRef = useRef<string>('');

  useEffect(() => {
    if (!open) {
      // 关闭弹窗时：
      // 1) 如果之前保存了摄像头错误，通过回调带回父页面
      if (lastCameraErrorRef.current && onCameraError) {
        onCameraError(lastCameraErrorRef.current);
      }
      stopScanner();
      setError('');
      hasScannedRef.current = false;
      lastCameraErrorRef.current = '';
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startScanner = async () => {
    setError('');
    setIsScanning(true);
    hasScannedRef.current = false;
    lastCameraErrorRef.current = '';

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(SCANNER_CONTAINER_ID);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // useRef 保证只触发一次，即便闭包中取到旧值也能拦住
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          setIsScanning(false);

          // 先停掉扫描器，防止后续帧继续触发
          stopScanner();

          onScanSuccess(decodedText);
          setTimeout(() => {
            onClose();
          }, 800);
        },
        (errorMessage) => {
          // 扫描过程中的错误（未识别到二维码等），仅选择性回调
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : '无法启动摄像头';
      const friendlyMsg = translateCameraError(rawMsg);
      setError(friendlyMsg);
      lastCameraErrorRef.current = friendlyMsg;
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    lastCameraErrorRef.current = '';
    startScanner();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="扫码取货"
      size="md"
    >
      <div className="space-y-4">
        {/* 扫描区域 */}
        <div className="relative">
          <div
            id={SCANNER_CONTAINER_ID}
            className={classNames(
              'w-full aspect-square rounded-2xl bg-slate-950 overflow-hidden relative',
              error && 'hidden'
            )}
          >
            {!isScanning && !hasScannedRef.current && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-400">正在启动摄像头...</p>
                </div>
              </div>
            )}

            {hasScannedRef.current && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">识别成功</p>
                </div>
              </div>
            )}
          </div>

          {/* 扫描框装饰 - 只在扫描中显示 */}
          {isScanning && !hasScannedRef.current && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[250px] h-[250px]">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-sky-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-sky-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-sky-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-sky-400 rounded-br-lg" />
                  <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
              </div>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="w-full aspect-square rounded-2xl bg-slate-900 flex items-center justify-center border border-red-500/30">
              <div className="text-center px-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-white font-medium mb-1">摄像头启动失败</p>
                <p className="text-sm text-slate-400 mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    重新尝试
                  </button>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    关闭并返回
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 提示文字 */}
        <div className="text-center">
          <p className="text-sm text-slate-400">
            将订单二维码对准扫描框，识别成功后自动确认
          </p>
          <p className="text-xs text-slate-500 mt-1">
            请确保浏览器已授权摄像头权限
          </p>
        </div>

        {/* 底部操作 - 仅在无错误时显示（错误状态下已提供关闭按钮） */}
        {!error && (
          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              取消扫描
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
