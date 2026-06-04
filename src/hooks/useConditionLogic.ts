import { useState, useCallback } from 'react';
import type { FormAnswers, FormField, Condition } from '../types/form';
import { evaluateCondition } from '../utils/conditionEvaluator';

export function useConditionLogic(fields: FormField[]) {
  const [answers, setAnswers] = useState<FormAnswers>({});

  const setAnswer = useCallback((fieldId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const resetAnswers = useCallback(() => {
    setAnswers({});
  }, []);

  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      return evaluateCondition(field.condition, answers);
    },
    [answers]
  );

  const getVisibleFields = useCallback((): FormField[] => {
    return fields.filter((field) => isFieldVisible(field));
  }, [fields, isFieldVisible]);

  const validateRequired = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const visibleFields = getVisibleFields();

    visibleFields.forEach((field) => {
      if (field.required) {
        const value = answers[field.id];
        const isEmpty =
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'number' && isNaN(value));

        if (isEmpty) {
          errors.push(`"${field.title}" 为必填项`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }, [answers, getVisibleFields]);

  return {
    answers,
    setAnswer,
    resetAnswers,
    isFieldVisible,
    getVisibleFields,
    validateRequired,
  };
}

export function useConditionConfig(fields: FormField[], currentFieldId: string | null) {
  const availableFields = fields.filter(
    (f) => f.id !== currentFieldId && ['radio', 'checkbox', 'select'].includes(f.type)
  );

  const setCondition = useCallback(
    (fieldId: string, condition: Condition | undefined) => {
      // This will be implemented via the form store
    },
    []
  );

  return {
    availableFields,
    setCondition,
  };
}
