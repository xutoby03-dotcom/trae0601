import { useMemo } from 'react';
import { usePaperMatchingStore } from '@/store/usePaperMatchingStore';
import BookInfo from '@/components/BookInfo';
import PaperParamsForm from '@/components/PaperParamsForm';
import TrialParamsForm from '@/components/TrialParamsForm';
import EvaluationPanel from '@/components/EvaluationPanel';
import PhotoCompare from '@/components/PhotoCompare';
import TrialVersionList from '@/components/TrialVersionList';
import SchemeSelector from '@/components/SchemeSelector';
import type { Trial, Photo, Evaluation } from '@/types';
import { cn } from '@/lib/utils';

export default function PaperMatchingPage() {
  const {
    currentBook,
    trials,
    currentTrialId,
    setCurrentTrial,
    createNewTrial,
    updateTrial,
    updateEvaluation,
    updatePhoto,
    selectTrial,
    archiveTrial,
  } = usePaperMatchingStore();

  const currentTrial = useMemo(() => {
    return trials.find((t) => t.id === currentTrialId) || trials[0];
  }, [trials, currentTrialId]);

  const handleTrialChange = (updates: Partial<Trial>) => {
    if (currentTrial) {
      updateTrial(currentTrial.id, updates);
    }
  };

  const handleEvaluationChange = (updates: Partial<Evaluation>) => {
    if (currentTrial) {
      updateEvaluation(currentTrial.id, updates);
    }
  };

  const handlePhotoUpdate = (trialId: string, photo: Photo) => {
    updatePhoto(trialId, photo);
  };

  const handleTrialSelect = (trialId: string) => {
    setCurrentTrial(trialId);
  };

  const handleCreateNewTrial = () => {
    createNewTrial();
  };

  const handleSelectScheme = (trialId: string) => {
    selectTrial(trialId);
  };

  const handleArchiveScheme = (trialId: string) => {
    archiveTrial(trialId);
  };

  if (!currentTrial) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
        <p className="text-ink-700 font-hei">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100">
      <div className="max-w-7xl mx-auto pb-32">
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <BookInfo book={currentBook} className="mt-6 mx-6" />
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div
              className="lg:w-2/5 flex flex-col gap-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="bg-parchment-50 rounded-xl p-6 shadow-card border border-parchment-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4 font-song">
                  纸张参数
                </h3>
                <PaperParamsForm
                  trial={currentTrial}
                  onChange={handleTrialChange}
                />
              </div>

              <div className="bg-parchment-50 rounded-xl p-6 shadow-card border border-parchment-200">
                <h3 className="text-lg font-semibold text-ink-900 mb-4 font-song">
                  试配参数
                </h3>
                <TrialParamsForm
                  trial={currentTrial}
                  onChange={handleTrialChange}
                />
              </div>

              <div className="bg-parchment-50 rounded-xl p-6 shadow-card border border-parchment-200">
                <EvaluationPanel
                  trial={currentTrial}
                  onChange={handleEvaluationChange}
                />
              </div>
            </div>

            <div
              className="lg:w-3/5 flex flex-col gap-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="bg-parchment-50 rounded-xl p-6 shadow-card border border-parchment-200">
                <PhotoCompare
                  trial={currentTrial}
                  onPhotoUpdate={handlePhotoUpdate}
                />
              </div>

              <div className="bg-parchment-50 rounded-xl p-6 shadow-card border border-parchment-200">
                <TrialVersionList
                  trials={trials}
                  currentTrialId={currentTrialId}
                  onSelect={handleTrialSelect}
                  onCreateNew={handleCreateNewTrial}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'opacity-0 animate-fade-in-up'
        )}
        style={{ animationDelay: '400ms' }}
      >
        <SchemeSelector
          trial={currentTrial}
          onSelect={handleSelectScheme}
          onArchive={handleArchiveScheme}
        />
      </div>
    </div>
  );
}
