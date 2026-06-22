import { useState } from 'react';
import { Plus, Pencil, Trash2, BookMarked, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { usePracticeStore } from '@/store/practiceStore';
import type { SignWord, ScoreDimension } from '@/types';
import { DIMENSION_LABELS } from '@/types';
import { getScoreLevel } from '@/utils';

interface Props {
  onClose?: () => void;
}

export default function WordManager({ onClose }: Props) {
  const {
    currentCourseId,
    currentSignWordId,
    signWords,
    practiceRecords,
    currentStudentId,
    setCurrentSignWord,
    addSignWord,
    updateSignWord,
    deleteSignWord,
    loadRecord,
    resetCurrentSession,
  } = usePracticeStore();

  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState<SignWord | null>(null);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    handShape: '',
    orientation: '',
    trajectory: '',
    expression: '',
  });

  const courseWords = signWords.filter((w) => w.courseId === currentCourseId);

  const getWordRecords = (wordId: string) => {
    return practiceRecords.filter(
      (r) => r.signWordId === wordId && r.studentId === currentStudentId
    );
  };

  const handleAddClick = () => {
    setEditingWord(null);
    setFormData({
      name: '',
      handShape: '',
      orientation: '',
      trajectory: '',
      expression: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (word: SignWord) => {
    setEditingWord(word);
    setFormData({
      name: word.name,
      handShape: word.standardPoints.handShape,
      orientation: word.standardPoints.orientation,
      trajectory: word.standardPoints.trajectory,
      expression: word.standardPoints.expression,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const standardPoints = {
      handShape: formData.handShape,
      orientation: formData.orientation,
      trajectory: formData.trajectory,
      expression: formData.expression,
    };

    if (editingWord) {
      updateSignWord(editingWord.id, { name: formData.name, standardPoints });
    } else {
      addSignWord(currentCourseId, formData.name, standardPoints);
    }

    setShowForm(false);
    setEditingWord(null);
  };

  const handleSelectWord = (wordId: string) => {
    if (currentSignWordId === wordId) {
      setCurrentSignWord(null);
      resetCurrentSession();
    } else {
      setCurrentSignWord(wordId);
    }
    onClose?.();
  };

  const handleLoadRecord = (recordId: string) => {
    loadRecord(recordId);
    onClose?.();
  };

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <BookMarked className="w-5 h-5 text-primary-600" />
          课程词条
        </h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-1 text-sm text-primary-600 font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-primary-50/60 rounded-xl border border-primary-100 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-primary-700">
              {editingWord ? '编辑词条' : '新增词条'}
            </span>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">词条名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：你好、谢谢"
                className="input-field text-sm py-2"
              />
            </div>

            {(['handShape', 'orientation', 'trajectory', 'expression'] as const).map((dim) => (
              <div key={dim}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {(DIMENSION_LABELS as Record<ScoreDimension, string>)[dim]}要点
                </label>
                <input
                  type="text"
                  value={formData[dim]}
                  onChange={(e) => setFormData({ ...formData, [dim]: e.target.value })}
                  placeholder={`输入${(DIMENSION_LABELS as Record<ScoreDimension, string>)[dim]}标准动作要点`}
                  className="input-field text-sm py-2"
                />
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSubmit}
                className="btn-primary text-sm py-2 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary text-sm py-2"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
        {courseWords.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <BookMarked className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无词条，点击上方新增</p>
          </div>
        ) : (
          courseWords.map((word) => {
            const isSelected = currentSignWordId === word.id;
            const isExpanded = expandedWordId === word.id;
            const records = getWordRecords(word.id);
            const latestRecord = records[records.length - 1];
            const scoreLevel = latestRecord ? getScoreLevel(latestRecord.overallScore) : null;

            return (
              <div
                key={word.id}
                className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-primary-400 bg-primary-50/40'
                    : 'border-gray-100 hover:border-primary-200 bg-white'
                }`}
              >
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => handleSelectWord(word.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {word.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-primary-800">{word.name}</div>
                      {latestRecord && scoreLevel && (
                        <div className={`text-xs ${scoreLevel.color} font-medium`}>
                          最近评分：{latestRecord.overallScore}分 · {scoreLevel.label}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(word);
                      }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除词条「${word.name}」？`)) {
                          deleteSignWord(word.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedWordId(isExpanded ? null : word.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-100 pt-3 animate-fade-in">
                    <div className="space-y-2 mb-3">
                      {(['handShape', 'orientation', 'trajectory', 'expression'] as const).map(
                        (dim) => (
                          <div key={dim} className="text-xs">
                            <span className="font-medium text-primary-600">
                              {(DIMENSION_LABELS as Record<ScoreDimension, string>)[dim]}：
                            </span>
                            <span className="text-gray-600">
                              {word.standardPoints[dim] || '暂无说明'}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {records.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">历史记录：</div>
                        <div className="space-y-1">
                          {records
                            .slice()
                            .reverse()
                            .slice(0, 3)
                            .map((record) => {
                              const level = getScoreLevel(record.overallScore);
                              return (
                                <div
                                  key={record.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadRecord(record.id);
                                  }}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors"
                                >
                                  <span className="text-xs text-gray-600">
                                    {record.practiceDate}
                                  </span>
                                  <span className={`text-xs font-bold ${level.color}`}>
                                    {record.overallScore}分
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
