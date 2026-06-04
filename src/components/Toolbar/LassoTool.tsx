import { useEditorStore } from '../../store/editorStore';

export const LassoTool = () => {
  const { activeTool, isDrawingLasso, lassoPoints, finishLasso, setActiveTool } = useEditorStore();
  
  if (activeTool !== 'lasso') return null;

  return (
    <div className="w-56 bg-[#2d2d2d] border border-gray-700 rounded-lg p-4 shadow-xl">
      <h3 className="text-sm font-medium text-gray-200 mb-3">套索抠图</h3>
      
      <div className="space-y-3">
        <div className="text-xs text-gray-400">
          {!isDrawingLasso ? (
            <>
              <p className="mb-2">点击图片开始绘制选区</p>
              <p className="mb-2">沿着主体轮廓移动鼠标</p>
              <p>系统会自动吸附到边缘</p>
            </>
          ) : (
            <>
              <p className="mb-2">已绘制 {lassoPoints.length} 个点</p>
              <p>双击闭合路径完成抠图</p>
            </>
          )}
        </div>

        {isDrawingLasso && lassoPoints.length > 2 && (
          <button
            onClick={finishLasso}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-all text-sm"
          >
            完成抠图
          </button>
        )}

        {isDrawingLasso && (
          <button
            onClick={() => {
              setActiveTool('select');
            }}
            className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-all text-sm"
          >
            取消
          </button>
        )}

        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            提示: 磁性套索会自动寻找物体边缘，使抠图更精确
          </p>
        </div>
      </div>
    </div>
  );
};
