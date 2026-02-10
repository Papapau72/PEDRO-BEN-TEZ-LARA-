
import React from 'react';
import { Student, EvaluationResult } from '../types';
import { ChevronRight, Target, Clock, Trophy } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  results: EvaluationResult[];
  onSelectStudent: (student: Student) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ students, results, onSelectStudent }) => {
  const getLatestResult = (studentId: string) => {
    return results
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getAvgScore = (studentId: string) => {
    const studentResults = results.filter(r => r.studentId === studentId);
    if (studentResults.length === 0) return null;
    const sum = studentResults.reduce((acc, r) => acc + (r.score / r.totalQuestions), 0);
    return Math.round((sum / studentResults.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Listado de Alumnos</h2>
          <p className="text-slate-500 mt-1">Selecciona un alumno para iniciar la evaluación de tablas.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="text-center px-4">
            <span className="block text-xl font-bold text-indigo-600">{students.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Alumnos</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-4">
            <span className="block text-xl font-bold text-green-600">{results.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Exámenes Hechos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
          const latest = getLatestResult(student.id);
          const avg = getAvgScore(student.id);

          return (
            <button
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="group bg-white rounded-3xl border border-slate-200 p-5 text-left hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <img 
                  src={student.avatar} 
                  alt={student.firstName} 
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-100"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {student.firstName}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2 truncate">{student.lastName}</p>
                  
                  {avg !== null ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <Trophy size={12} />
                        {avg}% Precisión
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <Target size={12} />
                        {results.filter(r => r.studentId === student.id).length} Tests
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 italic">Sin evaluaciones todavía</span>
                  )}
                </div>
                <div className="bg-slate-50 rounded-full p-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
              
              {latest && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock size={12} />
                    Último: {new Date(latest.date).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-slate-700">
                    Resultado: {latest.score}/{latest.totalQuestions}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
