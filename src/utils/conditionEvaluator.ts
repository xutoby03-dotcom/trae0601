import type { Condition, FormAnswers } from '../types/form';

export function evaluateCondition(
  condition: Condition | undefined,
  answers: FormAnswers
): boolean {
  if (!condition) return true;

  const fieldValue = answers[condition.fieldId];
  if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
    return false;
  }

  switch (condition.operator) {
    case 'equals':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      return String(fieldValue) === condition.value;
    case 'not_equals':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(condition.value);
      }
      return String(fieldValue) !== condition.value;
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      return String(fieldValue).includes(condition.value);
    default:
      return true;
  }
}
