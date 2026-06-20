import { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from './Modal';
import { classNames } from '@/utils/helpers';

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const SCANNER_CONTAINER_ID = 'qr-scanner-container';

export default function QrScanner({ open, onClose, onScanSuccess, onScanFailure }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    if (!open) {
      stopScanner();
      setError('');
      setHasScanned(false);
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
    setHasScanned(false);

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
          if (!hasScanned) {
            setHasScanned(true);
            setIsScanning(false);
            onScanSuccess(decodedText);
            setTimeout(() => {
              onClose();
            }, 800);
          }
        },
        (errorMessage) => {
          // 忽略扫描过程中的错误
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '无法启动摄像头';
      setError(errorMsg);
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
            {!isScanning && !hasScanned && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-400">正在启动摄像头...</p>
                </div>
              </div>
            )}

            {hasScanned && (
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
          {isScanning && !hasScanned && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[250px] h-[250px]">
                  {/* 四角装饰 */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-sky-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-sky-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-sky-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-sky-400 rounded-br-lg" />
                  {/* 扫描线动画 */}
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
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  重新尝试
                </button>
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

        {/* 底部操作 */}
        <div className="flex justify-center pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            取消扫描
          </button>
        </div>
      </div>
    </Modal>
  );
}
