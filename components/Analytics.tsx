
import React from 'react';
import { EvaluationResult, Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { ArrowLeft, TrendingUp, Users, Target, Calendar } from 'lucide-react';

interface AnalyticsProps {
  results: EvaluationResult[];
  students: Student[];
  onBack: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ results, students, onBack }) => {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 p-6 rounded-3xl text-slate-400 mb-6">
          <Calendar size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Sin datos de evaluación</h2>
        <p className="text-slate-500 max-w-sm mt-2">Realiza algunos exámenes con tus alumnos para ver las estadísticas de progreso aquí.</p>
        <button onClick={onBack} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Volver al Panel</button>
      </div>
    );
  }

  // Prep data for students ranking
  const studentStats = students.map(s => {
    const sResults = results.filter(r => r.studentId === s.id);
    if (sResults.length === 0) return { name: s.firstName, avg: 0, count: 0 };
    const avg = sResults.reduce((acc, r) => acc + (r.score / r.totalQuestions), 0) / sResults.length;
    return { name: s.firstName, avg: Math.round(avg * 100), count: sResults.length };
  }).filter(s => s.count > 0).sort((a, b) => b.avg - a.avg);

  // Prep data for timeline (average score over time)
  const sortedResults = [...results].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const timelineData = sortedResults.map((r, i) => ({
    date: new Date(r.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    score: Math.round((r.score / r.totalQuestions) * 100),
    name: students.find(s => s.id === r.studentId)?.firstName
  }));

  const globalAvg = Math.round(results.reduce((acc, r) => acc + (r.score / r.totalQuestions), 0) / results.length * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-black text-slate-900">Métricas de Rendimiento</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <Target size={24} />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">{globalAvg}%</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Precisión Global</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-2xl text-green-600">
            <Users size={24} />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">{studentStats.length}</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alumnos Activos</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">{results.length}</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tests Totales</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ranking de Alumnos (Precisión %)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentStats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="avg" radius={[0, 8, 8, 0]} barSize={20}>
                  {studentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avg > 80 ? '#10b981' : entry.avg > 50 ? '#6366f1' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tendencia de Evaluaciones</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
