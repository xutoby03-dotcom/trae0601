import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Briefcase, Smile, X, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { rewriteText, getStyleName, getStyleDescription } from '../../utils/rewrite';
import type { RewriteStyle } from '../../types';

const ContextMenu: React.FC = () => {
  const { contextMenu, hideContextMenu, currentArticle, applyRewrite } = useStore();
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<RewriteStyle | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      hideContextMenu();
      setShowPreview(false);
      setSelectedStyle(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [hideContextMenu]);

  if (!contextMenu?.visible) return null;

  const handleRewrite = (style: RewriteStyle) => {
    const rewritten = rewriteText(contextMenu.selectedText, style);
    setRewrittenText(rewritten);
    setSelectedStyle(style);
    setShowPreview(true);
  };

  const handleApplyRewrite = () => {
    if (!currentArticle || !selectedStyle) return;
    
    applyRewrite(selectedStyle, rewrittenText);
    
    hideContextMenu();
    setShowPreview(false);
    setSelectedStyle(null);
  };

  const styleConfig: Array<{
    style: RewriteStyle;
    icon: React.ReactNode;
    color: string;
    hoverColor: string;
  }> = [
    {
      style: 'concise',
      icon: <Zap size={16} />,
      color: 'text-blue-600',
      hoverColor: 'hover:bg-blue-50'
    },
    {
      style: 'formal',
      icon: <Briefcase size={16} />,
      color: 'text-purple-600',
      hoverColor: 'hover:bg-purple-50'
    },
    {
      style: 'lively',
      icon: <Smile size={16} />,
      color: 'text-orange-600',
      hoverColor: 'hover:bg-orange-50'
    }
  ];

  return (
    <>
      <div
        className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
        style={{
          left: `${contextMenu.x}px`,
          top: `${contextMenu.y}px`,
          transformOrigin: 'top left'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={14} className="text-[#f59e0b]" />
            <span>智能改写</span>
          </div>
        </div>
        
        {styleConfig.map(({ style, icon, color, hoverColor }) => (
          <button
            key={style}
            onClick={() => handleRewrite(style)}
            className={`w-full px-3 py-2 flex items-center gap-3 text-left text-sm ${hoverColor} transition-colors`}
          >
            <span className={color}>{icon}</span>
            <div>
              <div className="font-medium text-gray-800">{getStyleName(style)}</div>
              <div className="text-xs text-gray-500">{getStyleDescription(style)}</div>
            </div>
          </button>
        ))}
      </div>

      {showPreview && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-[360px] animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            left: `${contextMenu.x + 220}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#f59e0b]" />
              <span className="font-medium text-gray-800">
                {selectedStyle && getStyleName(selectedStyle)}
              </span>
            </div>
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedStyle(null);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
          
          <div className="p-4 max-h-[200px] overflow-y-auto">
            <div className="text-xs text-gray-500 mb-2">原文：</div>
            <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg line-through opacity-60">
              {contextMenu.selectedText}
            </div>
            <div className="text-xs text-gray-500 mb-2">改写后：</div>
            <div className="text-sm text-gray-800 p-2 bg-green-50 rounded-lg border border-green-200">
              {rewrittenText}
            </div>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedStyle(null);
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApplyRewrite}
              className="px-3 py-1.5 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a73] transition-colors flex items-center gap-1"
            >
              <Check size={14} />
              应用
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContextMenu;
