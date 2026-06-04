import { useState } from 'react';
import type { FormData, FormAnswers } from '../../types/form';
import { renderPreviewField } from '../fields';
import { useConditionLogic } from '../../hooks/useConditionLogic';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '@/lib/utils';

interface FormRendererProps {
  formData: FormData;
  onSubmit?: (answers: FormAnswers) => void;
}

export function FormRenderer({ formData, onSubmit }: FormRendererProps) {
  const { showToast } = useUIStore();
  const { answers, setAnswer, resetAnswers, isFieldVisible, getVisibleFields, validateRequired } =
    useConditionLogic(formData.fields);
  const [submitted, setSubmitted] = useState(false);

  const visibleFields = getVisibleFields();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, errors } = validateRequired();
    if (!valid) {
      showToast(errors[0]);
      return;
    }
    setSubmitted(true);
    onSubmit?.(answers);
  };

  const handleReset = () => {
    resetAnswers();
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">提交成功！</h2>
            <p className="text-gray-500 mb-8">感谢您的填写，您的回答已成功提交</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              重新填写
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
            {formData.description && (
              <p className="text-blue-100">{formData.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {visibleFields.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                暂无题目，请先添加字段
              </div>
            ) : (
              visibleFields.map((field, index) => (
                <div
                  key={field.id}
                  className={cn(
                    'space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500',
                    { 'opacity-50': field.condition }
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-400 pt-1 w-6">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{field.title}</span>
                        {field.required && <span className="text-red-500 font-bold">*</span>}
                      </div>
                    </div>
                  </div>
                  <div className="pl-8">
                    {renderPreviewField(
                      field,
                      answers[field.id],
                      (value: any) => setAnswer(field.id, value),
                      false
                    )}
                  </div>
                </div>
              ))
            )}

            {visibleFields.length > 0 && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  提交
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  重置
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
