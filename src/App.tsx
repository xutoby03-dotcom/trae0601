import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StoryConfigPanel } from './components/StoryConfigPanel';
import { StoryViewer } from './components/StoryViewer';
import { StoryLibrary } from './components/StoryLibrary';
import { StoryType, Scene, Protagonist, Story, StoryConfig } from './types';
import { generateStory, generateRandomName } from './storyGenerator';
import { loadStories, saveStories, loadCategories, saveCategories } from './storage';
import { exportToPDF, exportToEPUB } from './exportUtils';

function App() {
  const [storyType, setStoryType] = useState<StoryType>('童话');
  const [protagonist, setProtagonist] = useState<Protagonist>({
    gender: '男',
    personality: '勇敢',
    occupation: '学生',
    name: generateRandomName('男')
  });
  const [scene, setScene] = useState<Scene>('古城堡');
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<string[]>(['默认', '收藏']);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    setStories(loadStories());
    setCategories(loadCategories());
  }, []);

  useEffect(() => {
    saveStories(stories);
  }, [stories]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    setProtagonist(prev => ({
      ...prev,
      name: generateRandomName(protagonist.gender)
    }));
  }, [protagonist.gender]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const config: StoryConfig = { type: storyType, protagonist, scene };
      const paragraphs = generateStory(config);
      const newStory: Story = {
        id: uuidv4(),
        title: `${storyType}故事 - ${protagonist.name}的冒险`,
        type: storyType,
        protagonist,
        scene,
        paragraphs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false,
        category: '默认'
      };
      setCurrentStory(newStory);
      setStories(prev => [newStory, ...prev]);
      setIsGenerating(false);
      setIsEditMode(false);
    }, 800);
  };

  const handleUpdateStory = (updatedStory: Story) => {
    setCurrentStory(updatedStory);
    setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
  };

  const handleSelectStory = (story: Story) => {
    setCurrentStory(story);
    setStoryType(story.type);
    setProtagonist(story.protagonist);
    setScene(story.scene);
    setIsEditMode(false);
  };

  const handleDeleteStory = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
    if (currentStory?.id === id) {
      setCurrentStory(null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setStories(prev => prev.map(s =>
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    ));
    if (currentStory?.id === id) {
      setCurrentStory(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleAddCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const handleUpdateStoryCategory = (storyId: string, category: string) => {
    setStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, category } : s
    ));
    if (currentStory?.id === storyId) {
      setCurrentStory(prev => prev ? { ...prev, category } : null);
    }
  };

  const handleExportPDF = async () => {
    if (currentStory) {
      await exportToPDF(currentStory);
    }
  };

  const handleExportEPUB = async () => {
    if (currentStory) {
      await exportToEPUB(currentStory);
    }
  };

  const config: StoryConfig = { type: storyType, protagonist, scene };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            ✨ 魔法故事生成器 ✨
          </h1>
          <p className="text-white/80">几步操作，创造属于你的精彩故事</p>
        </header>

        <div className="flex items-center justify-end gap-3 mb-4">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
          >
            📚 {showLibrary ? '隐藏故事库' : '我的故事库'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${showLibrary ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            <StoryConfigPanel
              storyType={storyType}
              setStoryType={setStoryType}
              protagonist={protagonist}
              setProtagonist={setProtagonist}
              scene={scene}
              setScene={setScene}
              onGenerate={handleGenerate}
            />

            {isGenerating && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4 animate-bounce">✨</div>
                <p className="text-xl text-gray-600">正在为你创作精彩故事...</p>
              </div>
            )}

            {currentStory && !isGenerating && (
              <div className="space-y-4">
                <StoryViewer
                  story={currentStory}
                  onUpdateStory={handleUpdateStory}
                  config={config}
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                />

                <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={handleToggleFavorite.bind(null, currentStory.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      currentStory.isFavorite
                        ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {currentStory.isFavorite ? '⭐ 已收藏' : '☆ 收藏'}
                  </button>

                  <button
                    onClick={handleExportPDF}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all flex items-center gap-2"
                  >
                    📄 导出 PDF
                  </button>

                  <button
                    onClick={handleExportEPUB}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all flex items-center gap-2"
                  >
                    📱 导出 EPUB
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-all flex items-center gap-2"
                  >
                    🎲 重新生成
                  </button>
                </div>
              </div>
            )}
          </div>

          {showLibrary && (
            <div className="lg:col-span-1">
              <StoryLibrary
                stories={stories}
                categories={categories}
                onSelectStory={handleSelectStory}
                onDeleteStory={handleDeleteStory}
                onToggleFavorite={handleToggleFavorite}
                onAddCategory={handleAddCategory}
                onUpdateStoryCategory={handleUpdateStoryCategory}
                selectedStoryId={currentStory?.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
