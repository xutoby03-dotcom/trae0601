import { useRef, useState } from "react";
import { Camera, X, Upload } from "lucide-react";
import { uploadApi } from "@/services/api";
import { useAppStore } from "@/store/app";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = "点击或拖拽上传照片",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useAppStore();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast("error", "请上传图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "图片大小不能超过5MB");
      return;
    }
    try {
      setUploading(true);
      const url = await uploadApi.image(file);
      onChange(url);
      addToast("success", "上传成功");
    } catch (err) {
      console.error(err);
      addToast("error", "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 w-full h-48 group">
          <img
            src={value}
            alt="预览"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
            >
              <Camera size={20} />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 bg-white rounded-full text-danger-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all ${
            uploading ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <Upload size={32} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">{placeholder}</p>
          <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG，最大 5MB</p>
        </div>
      )}
    </div>
  );
}
