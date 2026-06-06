import type { Answer, TestResult, Dimension, MBIType } from '@/types';
import { questions } from '@/data/questions';

export function calculateResult(answers: Answer[]): TestResult {
  const scores: Record<Dimension, number> = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
  };

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question) {
      const option = question.options[answer.selectedOption];
      const dimension = option.dimension;
      const weight = option.weight;
      const intensity = answer.intensity;
      scores[dimension] += weight * intensity;
    }
  });

  const eiTotal = scores.E + scores.I;
  const snTotal = scores.S + scores.N;
  const tfTotal = scores.T + scores.F;
  const jpTotal = scores.J + scores.P;

  const EI = eiTotal > 0 ? Math.round((scores.E / eiTotal) * 100) : 50;
  const SN = snTotal > 0 ? Math.round((scores.S / snTotal) * 100) : 50;
  const TF = tfTotal > 0 ? Math.round((scores.T / tfTotal) * 100) : 50;
  const JP = jpTotal > 0 ? Math.round((scores.J / jpTotal) * 100) : 50;

  const eOrI = EI >= 50 ? 'E' : 'I';
  const sOrN = SN >= 50 ? 'S' : 'N';
  const tOrF = TF >= 50 ? 'T' : 'F';
  const jOrP = JP >= 50 ? 'J' : 'P';

  const type = (eOrI + sOrN + tOrF + jOrP) as MBIType;

  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    type,
    scores: { ...scores },
    percentages: { EI, SN, TF, JP },
  };
}
