'use client';

import { useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import GoalProgressBar from '../../components/GoalProgressBar';
import { Goal } from '../../types';
import { getToday, formatDate } from '../../lib/utils';

export default function GoalsPage() {
  return (
    <ClientLayout>
      <GoalsContent />
    </ClientLayout>
  );
}

const SUGGESTED_GOALS = [
  { name: 'Complete a Sprint Triathlon', description: 'Finish a 750m swim, 20km bike, 5km run', category: 'endurance' as const, discipline: 'general' as const, metric: 'events completed', targetValue: 1, currentValue: 0, unit: 'events' },
  { name: 'Run 5K under 25 minutes', description: 'Improve 5K time to sub-25min', category: 'speed' as const, discipline: 'running' as const, metric: '5K time', targetValue: 25, currentValue: 0, unit: 'min' },
  { name: 'Swim 1km non-stop', description: 'Build swim endurance to 1000m without stopping', category: 'endurance' as const, discipline: 'swimming' as const, metric: 'non-stop distance', targetValue: 1, currentValue: 0, unit: 'km' },
  { name: 'Cycle 100km in a day', description: 'Complete a century ride', category: 'endurance' as const, discipline: 'cycling' as const, metric: 'distance', targetValue: 100, currentValue: 0, unit: 'km' },
  { name: 'Improve FTP to 250W', description: 'Increase functional threshold power for cycling', category: 'strength' as const, discipline: 'cycling' as const, metric: 'FTP', targetValue: 250, currentValue: 0, unit: 'W' },
  { name: 'Train 3x per week for 8 weeks', description: 'Build consistent training habit', category: 'endurance' as const, discipline: 'general' as const, metric: 'consecutive weeks', targetValue: 8, currentValue: 0, unit: 'weeks' },
];

function GoalsContent() {
  const { goals, addGoal, updateGoal, deleteGoal, completeGoal } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [_selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [tab, setTab] = useState<'active' | 'completed' | 'suggestions'>('active');
  const [showUpdateModal, setShowUpdateModal] = useState<Goal | null>(null);
  const [newProgress, setNewProgress] = useState('');

  // Form state
  const [fName, setFName] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fCategory, setFCategory] = useState<Goal['category']>('endurance');
  const [fDiscipline, setFDiscipline] = useState<Goal['discipline']>('running');
  const [fMetric, setFMetric] = useState('');
  const [fTarget, setFTarget] = useState('');
  const [fCurrent, setFCurrent] = useState('0');
  const [fUnit, setFUnit] = useState('');
  const [fDeadline, setFDeadline] = useState('');

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed' || g.status === 'abandoned');

  const resetForm = () => {
    setFName(''); setFDesc(''); setFCategory('endurance'); setFDiscipline('running');
    setFMetric(''); setFTarget(''); setFCurrent('0'); setFUnit(''); setFDeadline('');
  };

  const openNewForm = () => { resetForm(); setEditingGoal(null); setShowForm(true); };

  const openEditForm = (goal: Goal) => {
    setEditingGoal(goal);
    setFName(goal.name); setFDesc(goal.description); setFCategory(goal.category);
    setFDiscipline(goal.discipline); setFMetric(goal.metric); setFTarget(String(goal.targetValue));
    setFCurrent(String(goal.currentValue)); setFUnit(goal.unit); setFDeadline(goal.deadline);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: fName, description: fDesc, category: fCategory, discipline: fDiscipline,
      metric: fMetric, targetValue: Number(fTarget), currentValue: Number(fCurrent),
      unit: fUnit, deadline: fDeadline, status: 'active' as const,
    };
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
    setShowForm(false); setEditingGoal(null);
  };

  const handleUpdateProgress = (goal: Goal) => {
    setShowUpdateModal(goal);
    setNewProgress(String(goal.currentValue));
  };

  const submitProgressUpdate = () => {
    if (!showUpdateModal) return;
    updateGoal(showUpdateModal.id, { currentValue: Number(newProgress) });
    if (Number(newProgress) >= showUpdateModal.targetValue) {
      completeGoal(showUpdateModal.id);
    }
    setShowUpdateModal(null);
  };

  const addSuggestedGoal = (suggestion: typeof SUGGESTED_GOALS[0]) => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    addGoal({ ...suggestion, deadline: deadline.toISOString().split('T')[0], status: 'active' });
  };

  const disciplineEmoji = (d: Goal['discipline']) =>
    d === 'swimming' ? '🏊' : d === 'cycling' ? '🚴' : d === 'running' ? '🏃' : '🏆';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button onClick={openNewForm} className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
          + New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-sky-600">{activeGoals.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">active goals</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{goals.filter(g => g.status === 'completed').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">completed</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-orange-500">
            {activeGoals.filter(g => Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) <= 14 && Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) > 0).length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">due soon</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {([
          { id: 'active', label: `🎯 Active (${activeGoals.length})` },
          { id: 'completed', label: `🏆 History (${completedGoals.length})` },
          { id: 'suggestions', label: '💡 Suggestions' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <div className="space-y-3">
          {activeGoals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-gray-500">No active goals. Set your first goal to get started!</p>
              <button onClick={openNewForm} className="mt-3 text-sky-600 hover:underline text-sm font-medium">Create a goal</button>
            </div>
          ) : (
            activeGoals.map(goal => (
              <div key={goal.id}>
                <GoalProgressBar goal={goal} />
                <div className="flex gap-2 mt-1 px-1">
                  <button onClick={() => handleUpdateProgress(goal)}
                    className="flex-1 bg-sky-50 text-sky-700 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-100 transition-colors">
                    Update Progress
                  </button>
                  <button onClick={() => openEditForm(goal)}
                    className="bg-gray-100 text-gray-600 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => { if (confirm('Mark as complete?')) completeGoal(goal.id); }}
                    className="bg-green-50 text-green-700 py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                    ✓ Done
                  </button>
                  <button onClick={() => { if (confirm('Delete this goal?')) deleteGoal(goal.id); }}
                    className="bg-red-50 text-red-600 py-1.5 px-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'completed' && (
        <div className="space-y-3">
          {completedGoals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <p className="text-gray-500">No completed goals yet. Keep working!</p>
            </div>
          ) : (
            completedGoals.map(goal => (
              <div key={goal.id} className={`bg-white rounded-xl border p-4 shadow-sm ${goal.status === 'completed' ? 'border-green-100' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{disciplineEmoji(goal.discipline)}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{goal.name}</p>
                      <p className="text-xs text-gray-500">{goal.metric} · {goal.targetValue} {goal.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${goal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {goal.status === 'completed' ? '🏆 Completed' : 'Abandoned'}
                    </span>
                    <button onClick={() => deleteGoal(goal.id)} className="text-gray-300 hover:text-red-400 text-sm">🗑️</button>
                  </div>
                </div>
                {goal.completedAt && <p className="text-xs text-green-600 mt-2">Achieved on {formatDate(goal.completedAt)}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'suggestions' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Popular triathlete goals to inspire your journey:</p>
          {SUGGESTED_GOALS.map((sg, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{sg.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sg.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full capitalize">{sg.discipline}</span>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full capitalize">{sg.category}</span>
                </div>
              </div>
              <button
                onClick={() => addSuggestedGoal(sg)}
                disabled={goals.some(g => g.name === sg.name && g.status === 'active')}
                className="shrink-0 bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {goals.some(g => g.name === sg.name && g.status === 'active') ? 'Added ✓' : 'Add Goal'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input value={fName} onChange={e => setFName(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="e.g. Run 5K under 25 minutes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none" placeholder="What does success look like?" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={fCategory} onChange={e => setFCategory(e.target.value as Goal['category'])} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                    <option value="speed">Speed</option>
                    <option value="endurance">Endurance</option>
                    <option value="strength">Strength</option>
                    <option value="technique">Technique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                  <select value={fDiscipline} onChange={e => setFDiscipline(e.target.value as Goal['discipline'])} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                    <option value="running">🏃 Running</option>
                    <option value="cycling">🚴 Cycling</option>
                    <option value="swimming">🏊 Swimming</option>
                    <option value="general">🏆 General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metric being measured</label>
                <input value={fMetric} onChange={e => setFMetric(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="e.g. 5K time, distance, power" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <input type="number" value={fTarget} onChange={e => setFTarget(e.target.value)} required step="any" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current</label>
                  <input type="number" value={fCurrent} onChange={e => setFCurrent(e.target.value)} step="any" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input value={fUnit} onChange={e => setFUnit(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="km, W, min" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" value={fDeadline} onChange={e => setFDeadline(e.target.value)} required min={getToday()} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowUpdateModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Update Progress</h2>
            <p className="text-sm text-gray-500 mb-4">{showUpdateModal.name}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current value ({showUpdateModal.unit}) — Target: {showUpdateModal.targetValue}
              </label>
              <input type="number" value={newProgress} onChange={e => setNewProgress(e.target.value)}
                step="any" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowUpdateModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={submitProgressUpdate} className="flex-1 bg-sky-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-sky-700">Update</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
