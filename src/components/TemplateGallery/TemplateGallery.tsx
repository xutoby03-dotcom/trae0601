import { templates } from '../../data/templates';
import { useCanvasStore } from '../../store/useStore';

export const TemplateGallery = () => {
  const { loadGrid } = useCanvasStore();

  const handleLoadTemplate = (grid: string[][]) => {
    if (confirm('加载模板会覆盖当前画布，确定吗？')) {
      loadGrid(grid);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 border border-purple-100">
      <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
        📋 预设模板
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleLoadTemplate(template.grid)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 p-2 hover:shadow-lg hover:scale-105 transition-all border-2 border-transparent hover:border-purple-300"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div 
                className="grid gap-px"
                style={{ 
                  gridTemplateColumns: 'repeat(32, 3px)',
                  gridTemplateRows: 'repeat(32, 3px)',
                }}
              >
                {template.grid.slice(0, 32).map((row, y) =>
                  row.slice(0, 32).map((emoji, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="flex items-center justify-center"
                      style={{ width: 3, height: 3, fontSize: 2.5 }}
                    >
                      {emoji}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
              <span className="text-white text-xs font-medium">{template.name}</span>
            </div>
            <div className="absolute top-2 right-2 text-2xl opacity-80">
              {template.thumbnail}
            </div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500 text-center">
        点击模板一键加载到画布
      </p>
    </div>
  );
};
