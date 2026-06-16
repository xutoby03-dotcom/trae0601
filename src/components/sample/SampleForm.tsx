import { useState } from 'react';
import { Save, X, Link2 } from 'lucide-react';
import type { Sample, SizeCode, ProductionStatus } from '@/types';
import Button from '@/components/common/Button';
import PhotoUploader from '@/components/common/PhotoUploader';
import { useStore } from '@/store';

interface SampleFormProps {
  initialData?: Sample;
  onSubmit: (data: Omit<Sample, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const SIZE_OPTIONS: SizeCode[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function parseVersion(version: string): number {
  const match = version.match(/V(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function formatVersion(num: number): string {
  return `V${num}`;
}

export default function SampleFormInner({ initialData, onSubmit, onCancel }: SampleFormProps) {
  const { samples } = useStore();

  const [styleNo, setStyleNo] = useState(initialData?.styleNo ?? '');
  const [versionNum, setVersionNum] = useState(
    initialData?.version ? parseVersion(initialData.version) : 1
  );
  const [fabric, setFabric] = useState(initialData?.fabric ?? '');
  const [sizes, setSizes] = useState<SizeCode[]>(initialData?.sizes ?? []);
  const [targetGroup, setTargetGroup] = useState(initialData?.targetGroup ?? '');
  const [sampleDate, setSampleDate] = useState(initialData?.sampleDate ?? '');
  const [photos, setPhotos] = useState<string[]>(initialData?.photos ?? []);
  const [previousVersionId, setPreviousVersionId] = useState(initialData?.previousVersionId ?? '');
  const [productionStatus] = useState<ProductionStatus>(
    initialData?.productionStatus ?? 'pending'
  );

  const handleSizeToggle = (size: SizeCode) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!styleNo.trim()) return;

    onSubmit({
      styleNo: styleNo.trim(),
      version: formatVersion(versionNum),
      fabric,
      sizes,
      targetGroup,
      sampleDate,
      photos,
      previousVersionId: previousVersionId || undefined,
      productionStatus,
    });
  };

  const otherSamples = samples.filter((s) => s.id !== initialData?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          款号 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={styleNo}
          onChange={(e) => setStyleNo(e.target.value)}
          placeholder="请输入款号"
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
            版次
          </label>
          <input
            type="number"
            min={1}
            value={versionNum}
            onChange={(e) => setVersionNum(Math.max(1, parseInt(e.target.value) || 1))}
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
            面料
          </label>
          <input
            type="text"
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            placeholder="例如：羊毛混纺"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          尺码
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleSizeToggle(size)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                sizes.includes(size)
                  ? 'border-moss-500 bg-moss-100 text-moss-700'
                  : 'border-charcoal-200 bg-white text-charcoal-500 hover:border-charcoal-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          目标人群
        </label>
        <input
          type="text"
          value={targetGroup}
          onChange={(e) => setTargetGroup(e.target.value)}
          placeholder="例如：25-35岁都市女性"
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          打样日期
        </label>
        <input
          type="date"
          value={sampleDate}
          onChange={(e) => setSampleDate(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          照片
        </label>
        <PhotoUploader photos={photos} onChange={setPhotos} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
          <span className="mr-1.5 inline-flex items-center">
            <Link2 className="mr-1 h-4 w-4" />
            关联旧版
          </span>
        </label>
        <select
          value={previousVersionId}
          onChange={(e) => setPreviousVersionId(e.target.value)}
          className="input-field"
        >
          <option value="">无</option>
          {otherSamples.map((s) => (
            <option key={s.id} value={s.id}>
              {s.styleNo} - {s.version}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} icon={<X className="h-4 w-4" />}>
          取消
        </Button>
        <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />}>
          {initialData ? '保存修改' : '创建样衣'}
        </Button>
      </div>
    </form>
  );
}
