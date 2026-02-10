
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Evaluation } from './components/Evaluation';
import { Analytics } from './components/Analytics';
import { Student, EvaluationResult } from './types';
import { STUDENTS_LIST } from './constants';
import { BookOpen, BarChart3, Users, Home } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'evaluation' | 'analytics'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<EvaluationResult[]>([]);

  // Load results from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('multi_results');
    if (saved) {
      setResults(JSON.parse(saved));
    }
  }, []);

  // Save results whenever they change
  useEffect(() => {
    localStorage.setItem('multi_results', JSON.stringify(results));
  }, [results]);

  const handleStartEvaluation = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('evaluation');
  };

  const handleEvaluationComplete = (result: EvaluationResult) => {
    setResults(prev => [...prev, result]);
    setActiveTab('analytics');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">MultiMaster</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tutor Edition • 6º Primaria</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Panel de Alumnos
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Estadísticas Globales
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            students={STUDENTS_LIST} 
            onSelectStudent={handleStartEvaluation} 
            results={results}
          />
        )}
        {activeTab === 'evaluation' && selectedStudent && (
          <Evaluation 
            student={selectedStudent} 
            onComplete={handleEvaluationComplete}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics 
            results={results} 
            students={STUDENTS_LIST}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-3 z-20">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium">Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] font-medium">Métricas</span>
        </button>
      </div>
    </div>
  );
};

export default App;
