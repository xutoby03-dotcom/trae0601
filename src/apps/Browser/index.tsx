import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, ExternalLink } from 'lucide-react';

const Browser: React.FC = () => {
  const [url, setUrl] = useState('https://www.bing.com');
  const [inputUrl, setInputUrl] = useState('https://www.bing.com');
  const [history, setHistory] = useState<string[]>(['https://www.bing.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (newUrl: string) => {
    let processedUrl = newUrl;
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    setIsLoading(true);
    setUrl(processedUrl);
    setInputUrl(processedUrl);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(processedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputUrl);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
    }
  };

  const refresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const goHome = () => {
    navigate('https://www.bing.com');
  };

  const quickSites = [
    { name: '百度', url: 'https://www.baidu.com' },
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Bing', url: 'https://www.bing.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: '知乎', url: 'https://www.zhihu.com' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-window-background)' }}>
      <div 
        className="flex items-center gap-1 px-2 py-2 border-b"
        style={{ borderColor: 'var(--color-taskbar-border)' }}
      >
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10 disabled:opacity-50"
          onClick={goBack}
          disabled={historyIndex <= 0}
        >
          <ArrowLeft size={16} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10 disabled:opacity-50"
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
        >
          <ArrowRight size={16} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10"
          onClick={refresh}
        >
          <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10"
          onClick={goHome}
        >
          <Home size={16} style={{ color: 'var(--color-text-primary)' }} />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 ml-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded"
            style={{
              background: 'var(--color-input-background)',
              border: '1px solid var(--color-input-border)',
            }}
          >
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
              placeholder="输入网址或搜索..."
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              background: 'var(--color-accent)',
              color: 'white',
            }}
          >
            访问
          </button>
        </form>
      </div>

      <div 
        className="flex items-center gap-2 px-3 py-2 border-b overflow-x-auto"
        style={{ borderColor: 'var(--color-taskbar-border)' }}
      >
        {quickSites.map(site => (
          <button
            key={site.name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors"
            style={{
              background: 'var(--color-button-background)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-input-border)',
            }}
            onClick={() => navigate(site.url)}
          >
            <ExternalLink size={12} />
            {site.name}
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 z-10">
            <div 
              className="h-full animate-pulse"
              style={{ background: 'var(--color-accent)' }}
            />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="browser"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default Browser;
