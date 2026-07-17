import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, X, Calendar, Sparkles, Loader2, Target, Info, ArrowRight } from 'lucide-react';

export default function TimelineWorkspace() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/timeline`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to load timeline');
      setTasks(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleAction = async (taskId, action) => {
    try {
      setActionLoading(taskId);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/timeline/${taskId}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Failed to ${action} task`);
      await fetchTimeline();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 p-8 flex justify-center items-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-8 text-center">
        <h3 className="text-red-600 dark:text-red-400 font-semibold mb-2">Error Loading Timeline</h3>
        <p className="text-red-500/80 text-sm mb-4">{error}</p>
        <button onClick={fetchTimeline} className="btn-primary !px-4 !py-2 text-xs">Try Again</button>
      </div>
    );
  }

  const upcomingTasks = tasks.filter(t => t.status === 'PENDING').slice(0, 5);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" /> Operational Timeline
        </h2>
        <span className="text-[10px] font-mono font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-2 py-1 rounded shadow-sm">
          {upcomingTasks.length} Pending
        </span>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {upcomingTasks.length > 0 ? (
          <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/30 ml-3 space-y-8 pb-4">
            {upcomingTasks.map((task, idx) => (
              <div key={task.id} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#0a0a0a] ${task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug flex items-center gap-2">
                        {task.title}
                        {task.last_updated_by_ai && <Sparkles className="w-3.5 h-3.5 text-indigo-500" title="AI Enhanced" />}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">Scheduled: {new Date(task.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {task.why && (
                    <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-lg border border-slate-200 dark:border-slate-800 mb-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-200">Why:</strong> {task.why}</span>
                      </div>
                      {task.impact && (
                        <div className="flex items-start gap-2">
                          <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-200">Impact:</strong> {task.impact}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 mt-3">
                    <button 
                      onClick={() => handleAction(task.id, 'complete')}
                      disabled={actionLoading === task.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {actionLoading === task.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Done
                    </button>
                    <button 
                      onClick={() => handleAction(task.id, 'postpone')}
                      disabled={actionLoading === task.id}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Postpone"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleAction(task.id, 'dismiss')}
                      disabled={actionLoading === task.id}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-[#0a0a0a] hover:bg-rose-50 dark:hover:bg-rose-900/10 text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">All Caught Up!</h3>
            <p className="text-xs text-slate-500">No pending operational tasks for your farm.</p>
          </div>
        )}
      </div>
    </div>
  );
}
