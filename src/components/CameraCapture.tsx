import { useRef, useState } from 'react';
import { Camera, Image, X, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  value?: string;
  onChange: (dataUrl?: string) => void;
  label: string;
}

export default function CameraCapture({ value, onChange, label }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch (e) {
      alert('无法访问摄像头，请使用文件上传');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      onChange(dataUrl);
      stopCamera();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-espresso-700">{label}</label>

      {streaming ? (
        <div className="relative rounded-xl overflow-hidden bg-espresso-900 aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={takePhoto}
              className="px-4 py-2 rounded-full bg-copper-500 text-white text-sm font-medium hover:bg-copper-600 transition-colors"
            >
              📸 拍照
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-full bg-espresso-700 text-white text-sm font-medium hover:bg-espresso-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : value ? (
        <div className="relative rounded-xl overflow-hidden bg-copper-50 aspect-video border-2 border-copper-200">
          <img src={value} alt="预览" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 p-2 rounded-full bg-espresso-800/70 text-white hover:bg-espresso-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-copper-300 bg-copper-50 text-copper-600 font-medium hover:bg-copper-100 hover:border-copper-400 transition-colors"
          >
            <Camera className="w-5 h-5" />
            拍照
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-copper-300 bg-copper-50 text-copper-600 font-medium hover:bg-copper-100 hover:border-copper-400 cursor-pointer transition-colors">
            <Image className="w-5 h-5" />
            上传图片
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      )}
    </div>
  );
}
