
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface EvaluationResult {
  studentId: string;
  date: string;
  score: number;
  totalQuestions: number;
  missedQuestions: Array<{
    question: string;
    correctAnswer: number;
    userAnswer: number;
  }>;
}

export interface TableStats {
  table: number;
  accuracy: number;
  attempts: number;
}
