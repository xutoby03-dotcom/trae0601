import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronRight, ChevronDown, Lock, Lightbulb, Star, BookOpen } from 'lucide-react';
import { problems } from '@/data/problems';
import { useEditorStore } from '@/stores/useEditorStore';
import { useSqlStore } from '@/stores/useSqlStore';
import { getProgress, addCompletedProblem } from '@/utils/indexedDB';
import { cn } from '@/lib/utils';

interface ProblemPanelProps {
  onClose?: () => void;
}

export function ProblemPanel({ onClose }: ProblemPanelProps) {
  const { currentProblemId, setCurrentProblemId, setProblemResultMatch, problemResultMatch, setSql } = useEditorStore();
  const { switchDatabase, currentDatabaseId } = useSqlStore();
  const [completedProblems, setCompletedProblems] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['单表查询']));

  useEffect(() => {
    getProgress().then((progress) => {
      setCompletedProblems(progress.completedProblems);
    });
  }, []);

  const categories = Array.from(new Set(problems.map((p) => p.category)));

  const getCategoryProblems = (category: string) => {
    return problems.filter((p) => p.category === category);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSelectProblem = (problem: typeof problems[0]) => {
    setCurrentProblemId(problem.id);
    setShowHint(false);
    setProblemResultMatch(null);

    if (currentDatabaseId !== problem.databaseId) {
      switchDatabase(problem.databaseId);
    }

    setSql(`-- ${problem.title}\n-- ${problem.description}\n\n`, true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return difficulty;
    }
  };

  const currentProblem = problems.find((p) => p.id === currentProblemId);
  const completedCount = completedProblems.length;
  const totalCount = problems.length;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            练习题
          </h2>
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {currentProblem ? (
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              {currentProblem.id}. {currentProblem.title}
            </h3>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded', getDifficultyColor(currentProblem.difficulty))}>
              {getDifficultyText(currentProblem.difficulty)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {currentProblem.description}
          </p>

          {currentProblem.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mb-2"
            >
              <Lightbulb className="w-3 h-3" />
              {showHint ? '隐藏提示' : '显示提示'}
            </button>
          )}

          {showHint && currentProblem.hint && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              💡 {currentProblem.hint}
            </div>
          )}

          {problemResultMatch !== null && (
            <div
              className={cn(
                'mt-3 p-2 rounded text-sm flex items-center gap-2',
                problemResultMatch
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              )}
            >
              {problemResultMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>恭喜！答案正确！</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>结果不匹配，请再试一次</span>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setCurrentProblemId(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← 返回题目列表
          </button>
        </div>
      ) : null}

      <div className="flex-1 overflow-auto p-2">
        {categories.map((category) => {
          const categoryProblems = getCategoryProblems(category);
          const categoryCompleted = categoryProblems.filter((p) => completedProblems.includes(p.id)).length;
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="mb-1">
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm flex-1">
                  {category}
                </span>
                <span className="text-xs text-gray-500">
                  {categoryCompleted}/{categoryProblems.length}
                </span>
              </div>

              {isExpanded && (
                <div className="ml-5 mt-1 space-y-0.5">
                  {categoryProblems.map((problem) => {
                    const isCompleted = completedProblems.includes(problem.id);
                    const isSelected = currentProblemId === problem.id;
                    const isLocked = problem.id > 1 && !isCompleted && !completedProblems.includes(problem.id - 1);

                    return (
                      <div
                        key={problem.id}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : isLocked
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        )}
                        onClick={() => !isLocked && handleSelectProblem(problem)}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                        <span className="flex-1 truncate">
                          {problem.id}. {problem.title}
                        </span>
                        <span className={cn('text-xs', getDifficultyColor(problem.difficulty))}>
                          {getDifficultyText(problem.difficulty)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
