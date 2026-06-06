import { useEffect, useState } from 'react';
import { Trash2, Eye, ArrowLeft, Home, AlertTriangle, Palette } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Artwork, getArtworks, getArtwork, deleteArtwork } from '../utils/db';
import { useCanvasStore } from '../store/useStore';

export const Gallery = () => {
  const { id } = useParams<{ id: string }>();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [singleArtwork, setSingleArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworkNotFound, setArtworkNotFound] = useState(false);
  const { loadGrid } = useCanvasStore();

  const fetchArtworks = async () => {
    setLoading(true);
    setSingleArtwork(null);
    setArtworkNotFound(false);
    try {
      if (id) {
        const artwork = await getArtwork(id);
        if (artwork) {
          setSingleArtwork(artwork);
        } else {
          setArtworkNotFound(true);
        }
      } else {
        const works = await getArtworks();
        setArtworks(works);
      }
    } catch (err) {
      console.error('Failed to load artworks:', err);
      if (id) {
        setArtworkNotFound(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArtworks();
  }, [id]);

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

  const renderArtworkDetail = (artwork: Artwork) => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{artwork.title}</h2>
              <p className="text-white/90 mt-2 flex items-center gap-2">
                <span>👤</span>
                {artwork.author || '匿名艺术家'}
              </p>
              <p className="text-white/70 mt-1 flex items-center gap-2 text-sm">
                <span>🕐</span>
                {formatDate(artwork.createdAt || Date.now())}
              </p>
            </div>
            <div className="text-5xl">🎨</div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 flex justify-center">
            <div 
              className="grid gap-px bg-white p-3 rounded-xl shadow-inner"
              style={{ 
                gridTemplateColumns: 'repeat(32, 14px)',
                gridTemplateRows: 'repeat(32, 14px)',
              }}
            >
              {artwork.grid?.map((row, y) =>
                row.map((emoji, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="flex items-center justify-center"
                    style={{ width: 14, height: 14, fontSize: 12 }}
                  >
                    {emoji}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="flex gap-4 mt-8">
            <Link
              to="/"
              onClick={() => loadGrid(artwork.grid!)}
              className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-center font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Palette className="w-5 h-5" />
              🎨 在编辑器中打开
            </Link>
            <Link
              to="/gallery"
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              浏览画廊
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2">
              <ArrowLeft className="w-4 h-4" />
              返回创作
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {id ? '🖼️ 查看作品' : '🖼️ 我的画廊'}
            </h1>
            <p className="text-gray-500 mt-1">
              {id ? '分享的 emoji 艺术作品' : '你创作的所有 emoji 艺术作品'}
            </p>
          </div>
          {!id && (
            <div className="text-right">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {artworks.length}
              </span>
              <p className="text-sm text-gray-500">个作品</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-500"></div>
          </div>
        ) : artworkNotFound ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-700">作品不存在</h3>
            </div>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              抱歉，找不到这个作品。它可能已经被删除了，或者链接有误。
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                <Home className="w-4 h-4" />
                浏览画廊
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                开始创作
              </Link>
            </div>
          </div>
        ) : singleArtwork ? (
          renderArtworkDetail(singleArtwork)
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
              <p className="text-white/90 text-sm mt-1 flex items-center gap-1">
                <span>👤</span>
                {selectedArtwork.author || '匿名艺术家'}
              </p>
              <p className="text-white/70 text-xs mt-1">{formatDate(selectedArtwork.createdAt || Date.now())}</p>
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
