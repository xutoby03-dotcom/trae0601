import { useEffect, useState } from 'react';
import { Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Artwork, getArtworks, deleteArtwork } from '../utils/db';
import { useCanvasStore } from '../store/useStore';

export const Gallery = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { loadGrid } = useCanvasStore();

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const works = await getArtworks();
      setArtworks(works);
    } catch (err) {
      console.error('Failed to load artworks:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个作品吗？')) {
      await deleteArtwork(id);
      fetchArtworks();
    }
  };

  const handleLoad = (artwork: Artwork) => {
    if (artwork.grid) {
      loadGrid(artwork.grid);
      setSelectedArtwork(artwork);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2">
              <ArrowLeft className="w-4 h-4" />
              返回创作
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">🖼️ 我的画廊</h1>
            <p className="text-gray-500 mt-1">你创作的所有 emoji 艺术作品</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              {artworks.length}
            </span>
            <p className="text-sm text-gray-500">个作品</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-500"></div>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">画廊空空如也</h3>
            <p className="text-gray-500 mb-6">快去创作你的第一个 emoji 艺术作品吧！</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              开始创作
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-purple-100"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                  {artwork.thumbnail ? (
                    <img
                      src={artwork.thumbnail}
                      alt={artwork.title}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🖼️
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{artwork.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(artwork.createdAt || Date.now())}</p>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleLoad(artwork)}
                    className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    title="加载到画布"
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(artwork.id!, e)}
                    className="p-3 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedArtwork && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedArtwork(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-white">
              <h3 className="text-xl font-bold">{selectedArtwork.title}</h3>
              <p className="text-white/80 text-sm mt-1">{formatDate(selectedArtwork.createdAt || Date.now())}</p>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 flex justify-center">
                <div 
                  className="grid gap-px bg-white p-2 rounded-lg"
                  style={{ 
                    gridTemplateColumns: 'repeat(32, 10px)',
                    gridTemplateRows: 'repeat(32, 10px)',
                  }}
                >
                  {selectedArtwork.grid?.map((row, y) =>
                    row.map((emoji, x) => (
                      <div
                        key={`${x}-${y}`}
                        className="flex items-center justify-center"
                        style={{ width: 10, height: 10, fontSize: 9 }}
                      >
                        {emoji}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Link
                  to="/"
                  onClick={() => loadGrid(selectedArtwork.grid!)}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-center font-medium hover:shadow-lg transition-all"
                >
                  🎨 在编辑器中打开
                </Link>
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
