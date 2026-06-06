import React, { useState } from 'react';
import { Story, StoryParagraph, StoryConfig } from '../types';
import { regenerateParagraph } from '../storyGenerator';

interface Props {
  story: Story;
  onUpdateStory: (story: Story) => void;
  config: StoryConfig;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
}

export const StoryViewer: React.FC<Props> = ({
  story,
  onUpdateStory,
  config,
  isEditMode,
  setIsEditMode
}) => {
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleEditParagraph = (paragraph: StoryParagraph) => {
    setEditingParagraphId(paragraph.id);
    setEditContent(paragraph.content);
  };

  const handleSaveEdit = (paragraphId: string) => {
    const updatedParagraphs = story.paragraphs.map(p =>
      p.id === paragraphId ? { ...p, content: editContent } : p
    );
    onUpdateStory({
      ...story,
      paragraphs: updatedParagraphs,
      updatedAt: Date.now()
    });
    setEditingParagraphId(null);
    setEditContent('');
  };

  const handleRegenerate = (paragraph: StoryParagraph) => {
    const newParagraph = regenerateParagraph(paragraph, config);
    const updatedParagraphs = story.paragraphs.map(p =>
      p.id === paragraph.id ? newParagraph : p
    );
    onUpdateStory({
      ...story,
      paragraphs: updatedParagraphs,
      updatedAt: Date.now()
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateStory({
      ...story,
      title: e.target.value,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          {isEditMode ? (
            <input
              type="text"
              value={story.title}
              onChange={handleTitleChange}
              className="text-3xl font-bold text-gray-800 w-full border-b-2 border-indigo-300 focus:border-indigo-500 outline-none pb-1"
            />
          ) : (
            <h2 className="text-3xl font-bold text-gray-800">{story.title}</h2>
          )}
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{story.type}</span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{story.scene}</span>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">主角：{story.protagonist.name}</span>
          </div>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isEditMode
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isEditMode ? '✓ 完成编辑' : '✏️ 编辑模式'}
        </button>
      </div>

      <div className="space-y-6">
        {story.paragraphs.map((paragraph, index) => (
          <div key={paragraph.id} className="group relative">
            {isEditMode && (
              <div className="absolute -left-16 top-0 flex flex-col gap-1">
                <button
                  onClick={() => handleEditParagraph(paragraph)}
                  className="w-12 h-12 bg-blue-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 flex items-center justify-center"
                  title="编辑文字"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleRegenerate(paragraph)}
                  className="w-12 h-12 bg-purple-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600 flex items-center justify-center"
                  title="单段重写"
                >
                  🔄
                </button>
              </div>
            )}

            {editingParagraphId === paragraph.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 outline-none resize-none min-h-[100px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(paragraph.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingParagraphId(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : paragraph.type === 'dialogue' ? (
              <div className="flex items-start gap-3">
                {isEditMode && (
                  <div className="w-16 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                      {paragraph.speaker?.charAt(0) || '?'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{paragraph.speaker}</div>
                  </div>
                )}
                <div
                  className={`flex-1 p-4 rounded-2xl ${
                    isEditMode
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  {isEditMode && paragraph.speaker && (
                    <div className="text-sm font-semibold text-indigo-600 mb-1">
                      {paragraph.speaker}
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed">{paragraph.content}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed text-lg">
                {isEditMode && <span className="text-gray-400 mr-2">{index + 1}.</span>}
                {paragraph.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
