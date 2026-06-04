import type { QueryResult } from '@/types';
import { getProblemById } from '@/data/problems';
import { addCompletedProblem } from '@/utils/indexedDB';

export interface CheckProblemMatchOptions {
  currentProblemId: number | null;
  result: QueryResult;
  executeQuery: (sql: string) => Promise<QueryResult>;
  onMatchChange: (match: boolean | null) => void;
}

export async function checkProblemMatch({
  currentProblemId,
  result,
  executeQuery,
  onMatchChange,
}: CheckProblemMatchOptions): Promise<boolean | null> {
  if (!currentProblemId || result.columns.length === 0 || result.error) {
    onMatchChange(null);
    return null;
  }

  const problem = getProblemById(currentProblemId);
  if (!problem) {
    onMatchChange(null);
    return null;
  }

  const expectedResult = await executeQuery(problem.expectedQuery);
  const isMatch =
    result.columns.length === expectedResult.columns.length &&
    result.rows.length === expectedResult.rows.length &&
    result.columns.every((col, i) => col === expectedResult.columns[i]) &&
    result.rows.every((row, i) =>
      row.every((cell, j) => JSON.stringify(cell) === JSON.stringify(expectedResult.rows[i]?.[j]))
    );

  onMatchChange(isMatch);

  if (isMatch) {
    await addCompletedProblem(currentProblemId);
  }

  return isMatch;
}
