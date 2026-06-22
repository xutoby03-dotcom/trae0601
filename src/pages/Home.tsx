import Header from '@/components/Header';
import WordManager from '@/components/WordManager';
import VideoPlayer from '@/components/VideoPlayer';
import AnnotationToolbar from '@/components/AnnotationToolbar';
import AnnotationList from '@/components/AnnotationList';
import ScoringPanel from '@/components/ScoringPanel';
import ReviewList from '@/components/ReviewList';
import { usePracticeStore } from '@/store/practiceStore';
import { BookMarked, ListOrdered } from 'lucide-react';

export default function Home() {
  const {
    currentSignWordId,
    signWords,
    activeLeftPanel,
    setActiveLeftPanel,
    activeRightPanel,
    setActiveRightPanel,
  } = usePracticeStore();
  const currentWord = signWords.find((w) => w.id === currentSignWordId);

  return (
    <div className="min-h-screen bg-grain gradient-mesh">
      <Header />

      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-5" style={{ height: 'calc(100vh - 140px)' }}>
          <div className="col-span-3 flex flex-col min-h-0">
            <div className="flex gap-1 mb-3 bg-white rounded-xl p-1 shadow-card">
              <button
                onClick={() => setActiveLeftPanel('words')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === 'words'
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                课程词条
              </button>
              <button
                onClick={() => setActiveLeftPanel('review')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === 'review'
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                复练名单
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {activeLeftPanel === 'words' ? <WordManager /> : <ReviewList />}
            </div>
          </div>

          <div className="col-span-6 flex flex-col min-h-0">
            <VideoPlayer />
          </div>

          <div className="col-span-3 flex flex-col min-h-0">
            <div className="flex gap-1 mb-3 bg-white rounded-xl p-1 shadow-card">
              <button
                onClick={() => setActiveRightPanel('score')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeRightPanel === 'score'
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                评分
              </button>
              <button
                onClick={() => setActiveRightPanel('tools')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeRightPanel === 'tools'
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                工具
              </button>
              <button
                onClick={() => setActiveRightPanel('annotations')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeRightPanel === 'annotations'
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                批注
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-1">
              {activeRightPanel === 'score' && (
                <ScoringPanel standardPoints={currentWord?.standardPoints} />
              )}
              {activeRightPanel === 'tools' && <AnnotationToolbar />}
              {activeRightPanel === 'annotations' && <AnnotationList />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
