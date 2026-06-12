import { useState, useEffect, useRef } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function QrScanner({ open, onClose, onScan }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    scannedRef.current = false;
    setError(null);
    setScanning(false);

    const scannerId = 'qr-reader-' + Date.now();

    const startScanning = async () => {
      try {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = `<div id="${scannerId}" />`;

        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (scannedRef.current) return;
            scannedRef.current = true;
            onScan(decodedText);
            stopAndClose(scanner);
          },
          () => {}
        );

        setScanning(true);
      } catch (err) {
        setError(
          '无法启动摄像头，请检查浏览器权限设置或改用手动输入'
        );
        setScanning(false);
      }
    };

    const timer = setTimeout(startScanning, 100);

    return () => {
      clearTimeout(timer);
      const s = scannerRef.current;
      if (s) {
        stopAndClose(s);
      }
    };
  }, [open]);

  const stopAndClose = async (scanner: Html5Qrcode) => {
    try {
      const state = scanner.getState();
      if (state === 2) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-slate-900">扫描取货码</h3>
          </div>
          <button
            onClick={() => {
              const s = scannerRef.current;
              if (s) stopAndClose(s);
              onClose();
            }}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div
            ref={containerRef}
            className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4"
          />

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {scanning && !error && (
            <p className="text-center text-sm text-slate-500">
              请将取货码二维码对准摄像头
            </p>
          )}

          {!scanning && !error && (
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-cyan-500 rounded-full animate-spin" />
              <span className="text-sm">正在启动摄像头...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
