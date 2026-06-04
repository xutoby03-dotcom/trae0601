
import { ModelInfo as ModelInfoType } from '../../types';
import { formatFileSize } from '../../utils/modelUtils';

interface ModelInfoProps {
  info: ModelInfoType | null;
}

export function ModelInfo({ info }: ModelInfoProps) {
  if (!info) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-sm">请上传3D模型文件</p>
          <p className="text-xs mt-1">支持 STL / OBJ / GLB 格式</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white text-sm font-semibold mb-2 flex items-center">
          <span className="mr-2">📄</span>
          文件信息
        </h3>
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">文件名</span>
            <span className="text-white text-xs font-mono truncate max-w-32" title={info.fileName}>
              {info.fileName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">文件大小</span>
            <span className="text-cyan-400 text-xs font-mono">
              {formatFileSize(info.fileSize)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-white text-sm font-semibold mb-2 flex items-center">
          <span className="mr-2">📊</span>
          模型统计
        </h3>
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">顶点数</span>
            <span className="text-white text-xs font-mono">
              {info.vertexCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">面数</span>
            <span className="text-white text-xs font-mono">
              {info.faceCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-white text-sm font-semibold mb-2 flex items-center">
          <span className="mr-2">📐</span>
          包围盒尺寸
        </h3>
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs flex items-center">
              <span className="inline-block w-3 h-1 bg-red-500 mr-2 rounded"></span>
              X轴
            </span>
            <span className="text-white text-xs font-mono">
              {info.boundingBox.size.x.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs flex items-center">
              <span className="inline-block w-3 h-1 bg-green-500 mr-2 rounded"></span>
              Y轴
            </span>
            <span className="text-white text-xs font-mono">
              {info.boundingBox.size.y.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs flex items-center">
              <span className="inline-block w-3 h-1 bg-blue-500 mr-2 rounded"></span>
              Z轴
            </span>
            <span className="text-white text-xs font-mono">
              {info.boundingBox.size.z.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-gray-500 text-xs text-center">
          💡 点击模型可查看坐标点
        </p>
      </div>
    </div>
  );
}
