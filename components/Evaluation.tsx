
import React, { useState, useEffect, useRef } from 'react';
import { Student, EvaluationResult } from '../types';
import { X, Play, RotateCcw, CheckCircle2, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';
import { generateStudentFeedback } from '../services/geminiService';

interface EvaluationProps {
  student: Student;
  onComplete: (result: EvaluationResult) => void;
  onCancel: () => void;
}

interface Question {
  a: number;
  b: number;
  answer: number;
}

export const Evaluation: React.FC<EvaluationProps> = ({ student, onComplete, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'quiz' | 'result'>('setup');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<Array<{ q: Question; user: number; correct: boolean }>>([]);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startQuiz = () => {
    if (selectedTables.length === 0) return;
    
    const qs: Question[] = [];
    selectedTables.forEach(t => {
      // 5 questions per table selected, or custom logic
      const availableNums = Array.from({ length: 11 }, (_, i) => i);
      const shuffled = availableNums.sort(() => 0.5 - Math.random()).slice(0, 5);
      shuffled.forEach(num => {
        qs.push({ a: t, b: num, answer: t * num });
      });
    });

    setQuestions(qs.sort(() => 0.5 - Math.random()));
    setStep('quiz');
    setCurrentIdx(0);
    setAnswers([]);
    setUserAnswer('');
  };

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(userAnswer);
    if (isNaN(val)) return;

    const q = questions[currentIdx];
    const isCorrect = val === q.answer;
    setAnswers(prev => [...prev, { q, user: val, correct: isCorrect }]);
    setUserAnswer('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz([...answers, { q, user: val, correct: isCorrect }]);
    }
  };

  const finishQuiz = async (finalAnswers: typeof answers) => {
    const score = finalAnswers.filter(a => a.correct).length;
    const result: EvaluationResult = {
      studentId: student.id,
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      missedQuestions: finalAnswers
        .filter(a => !a.correct)
        .map(a => ({
          question: `${a.q.a} x ${a.q.b}`,
          correctAnswer: a.q.answer,
          userAnswer: a.user
        }))
    };

    setStep('result');
    setIsLoadingFeedback(true);
    const feedback = await generateStudentFeedback(
      student.firstName,
      score,
      questions.length,
      result.missedQuestions
    );
    setAiFeedback(feedback);
    setIsLoadingFeedback(false);
  };

  useEffect(() => {
    if (step === 'quiz' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, currentIdx]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Setup Step */}
      {step === 'setup' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img src={student.avatar} className="w-12 h-12 rounded-2xl" alt="" />
              <div>
                <h2 className="text-xl font-bold">Evaluación de {student.firstName}</h2>
                <p className="text-sm text-slate-500">Configura el examen</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                Tablas a evaluar:
              </label>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedTables(prev => 
                        prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
                      );
                    }}
                    className={`h-12 rounded-xl font-bold transition-all ${
                      selectedTables.includes(num)
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={selectedTables.length === 0}
              onClick={startQuiz}
              className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play size={20} />
              Empezar Examen
            </button>
          </div>
        </div>
      )}

      {/* Quiz Step */}
      {step === 'quiz' && questions.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-xl shadow-indigo-200/20 text-center">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Pregunta {currentIdx + 1} de {questions.length}
            </span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300" 
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="py-12">
            <div className="flex items-center justify-center gap-6 text-6xl md:text-8xl font-black text-slate-900">
              <span>{questions[currentIdx].a}</span>
              <span className="text-indigo-600 text-4xl md:text-6xl">×</span>
              <span>{questions[currentIdx].b}</span>
            </div>
          </div>

          <form onSubmit={handleNext} className="max-w-xs mx-auto">
            <input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="?"
              className="w-full text-center text-4xl font-bold p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:border-indigo-500 focus:ring-0 outline-none transition-all mb-6"
            />
            <button
              type="submit"
              disabled={userAnswer === ''}
              className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
            >
              Siguiente
            </button>
          </form>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl shadow-indigo-200/20">
          <div className="p-10 text-center bg-indigo-600 text-white">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <TrophyIcon className="text-white" />
            </div>
            <h2 className="text-3xl font-black mb-1">¡Completado!</h2>
            <p className="text-indigo-100 font-medium">Resultados para {student.firstName}</p>
            
            <div className="mt-8 flex justify-center gap-8">
              <div className="text-center">
                <span className="block text-4xl font-black">{answers.filter(a => a.correct).length}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-200">Aciertos</span>
              </div>
              <div className="w-px h-10 bg-indigo-400 mt-2"></div>
              <div className="text-center">
                <span className="block text-4xl font-black">{answers.filter(a => !a.correct).length}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-200">Fallos</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* AI Feedback */}
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm mb-1 uppercase tracking-wider">Comentario del Tutor (IA)</h4>
                  {isLoadingFeedback ? (
                    <div className="flex items-center gap-2 text-indigo-400 py-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                  ) : (
                    <p className="text-indigo-700 font-medium italic">"{aiFeedback}"</p>
                  )}
                </div>
              </div>
              <BrainCircuit className="absolute -right-4 -bottom-4 text-indigo-100 w-24 h-24" />
            </div>

            {/* Mistakes List if any */}
            {answers.some(a => !a.correct) && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Revisar Errores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {answers.filter(a => !a.correct).map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={16} />
                        <span className="font-bold text-slate-700">{a.q.a} × {a.q.b}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 line-through">{a.user}</span>
                        <span className="font-bold text-red-600">{a.q.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => {
                  setStep('setup');
                  setSelectedTables([]);
                }}
                className="flex-1 h-12 border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <RotateCcw size={18} />
                Volver a Evaluar
              </button>
              <button
                onClick={() => onComplete({
                  studentId: student.id,
                  date: new Date().toISOString(),
                  score: answers.filter(a => a.correct).length,
                  totalQuestions: questions.length,
                  missedQuestions: answers
                    .filter(a => !a.correct)
                    .map(a => ({
                      question: `${a.q.a} x ${a.q.b}`,
                      correctAnswer: a.q.answer,
                      userAnswer: a.user
                    }))
                })}
                className="flex-1 h-12 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                Guardar y Salir
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
