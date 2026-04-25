'use client';

import { useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import { WorkoutLog } from '../../types';
import { getToday, formatDate, formatDuration, getDisciplineIcon, getDisciplineBg } from '../../lib/utils';

export default function WorkoutsPage() {
  return (
    <ClientLayout>
      <WorkoutsContent />
    </ClientLayout>
  );
}

function WorkoutsContent() {
  const { workoutLogs, addWorkoutLog, updateWorkoutLog, deleteWorkoutLog } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState<'all' | 'swimming' | 'cycling' | 'running'>('all');
  const [filterDays, setFilterDays] = useState<number>(30);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [fDate, setFDate] = useState(getToday());
  const [fDiscipline, setFDiscipline] = useState<'swimming' | 'cycling' | 'running'>('running');
  const [fDuration, setFDuration] = useState('45');
  const [fDistance, setFDistance] = useState('');
  const [fPace, setFPace] = useState('');
  const [fPower, setFPower] = useState('');
  const [fHr, setFHr] = useState('');
  const [fEffort, setFEffort] = useState('6');
  const [fNotes, setFNotes] = useState('');

  const resetForm = () => {
    setFDate(getToday()); setFDiscipline('running'); setFDuration('45');
    setFDistance(''); setFPace(''); setFPower(''); setFHr(''); setFEffort('6'); setFNotes('');
  };

  const openNewForm = () => { resetForm(); setEditingLog(null); setShowForm(true); };

  const openEditForm = (log: WorkoutLog) => {
    setEditingLog(log);
    setFDate(log.date); setFDiscipline(log.discipline);
    setFDuration(String(log.duration)); setFDistance(log.distance ? String(log.distance) : '');
    setFPace(log.averagePace ? String(log.averagePace) : '');
    setFPower(log.averagePower ? String(log.averagePower) : '');
    setFHr(log.averageHeartRate ? String(log.averageHeartRate) : '');
    setFEffort(String(log.perceivedEffort)); setFNotes(log.notes || '');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      discipline: fDiscipline, date: fDate, duration: Number(fDuration),
      distance: fDistance ? Number(fDistance) : 0,
      averagePace: fPace ? Number(fPace) : undefined,
      averagePower: fPower ? Number(fPower) : undefined,
      averageHeartRate: fHr ? Number(fHr) : undefined,
      perceivedEffort: Number(fEffort), notes: fNotes,
    };
    if (editingLog) {
      updateWorkoutLog(editingLog.id, data);
    } else {
      addWorkoutLog(data);
    }
    setShowForm(false); setEditingLog(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this workout log?')) {
      deleteWorkoutLog(id);
      if (expandedId === id) setExpandedId(null);
    }
  };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - filterDays);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const filtered = workoutLogs
    .filter(l => (filterDiscipline === 'all' || l.discipline === filterDiscipline) && l.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Stats
  const monthStart = getToday().substring(0, 7) + '-01';
  const monthLogs = workoutLogs.filter(l => l.date >= monthStart);
  const totalMin = monthLogs.reduce((s, l) => s + l.duration, 0);
  const totalDist = monthLogs.reduce((s, l) => s + (l.distance || 0), 0);
  const avgEffort = monthLogs.length > 0 ? (monthLogs.reduce((s, l) => s + l.perceivedEffort, 0) / monthLogs.length).toFixed(1) : '—';

  const effortColor = (e: number) => e <= 3 ? 'bg-green-500' : e <= 6 ? 'bg-yellow-400' : e <= 8 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Workout Log</h1>
        <button onClick={openNewForm} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
          + Log Workout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{monthLogs.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">sessions this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{formatDuration(totalMin)}</p>
          <p className="text-xs text-gray-500 mt-0.5">total training time</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{totalDist.toFixed(0)}<span className="text-base font-normal text-gray-500">km</span></p>
          <p className="text-xs text-gray-500 mt-0.5">avg effort: {avgEffort}/10</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['all', 'swimming', 'cycling', 'running'] as const).map(d => (
            <button key={d} onClick={() => setFilterDiscipline(d)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${filterDiscipline === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {d === 'all' ? 'All' : getDisciplineIcon(d) + ' ' + d}
            </button>
          ))}
        </div>
        <select value={filterDays} onChange={e => setFilterDays(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
          <option value={3650}>All time</option>
        </select>
        <span className="text-xs text-gray-500">{filtered.length} workouts</span>
      </div>

      {/* Workout List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">💪</div>
          <p className="text-gray-500">No workouts logged yet.</p>
          <button onClick={openNewForm} className="mt-3 text-sky-600 hover:underline text-sm font-medium">Log your first workout</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <span className="text-2xl shrink-0">{getDisciplineIcon(log.discipline)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${getDisciplineBg(log.discipline)}`}>{log.discipline}</span>
                    <span className="text-sm text-gray-500">{formatDate(log.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{formatDuration(log.duration)}</span>
                    {log.distance > 0 && <span className="text-sm text-gray-600">{log.distance}km</span>}
                    {log.averagePace && <span className="text-xs text-gray-500">{log.averagePace.toFixed(1)} min/km</span>}
                    {log.averagePower && <span className="text-xs text-gray-500">{log.averagePower}W</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-6 rounded-full ${effortColor(log.perceivedEffort)}`} />
                    <span className="text-xs font-bold text-gray-700">{log.perceivedEffort}/10</span>
                  </div>
                  <span className="text-gray-300">{expandedId === log.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedId === log.id && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {log.averageHeartRate && (
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Avg HR</p>
                        <p className="font-semibold text-gray-900">{log.averageHeartRate} bpm</p>
                      </div>
                    )}
                    {log.averagePace && (
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Pace</p>
                        <p className="font-semibold text-gray-900">{log.averagePace.toFixed(1)} min/km</p>
                      </div>
                    )}
                    {log.averagePower && (
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Power</p>
                        <p className="font-semibold text-gray-900">{log.averagePower}W</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">RPE</p>
                      <p className="font-semibold text-gray-900">{log.perceivedEffort}/10</p>
                    </div>
                  </div>
                  {log.notes && <p className="text-sm text-gray-600 mb-3">📝 {log.notes}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(log)} className="flex-1 bg-sky-50 text-sky-700 py-1.5 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(log.id)} className="bg-red-50 text-red-600 py-1.5 px-4 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editingLog ? 'Edit Workout' : 'Log Workout'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                  <select value={fDiscipline} onChange={e => setFDiscipline(e.target.value as typeof fDiscipline)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                    <option value="running">🏃 Running</option>
                    <option value="cycling">🚴 Cycling</option>
                    <option value="swimming">🏊 Swimming</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" value={fDuration} onChange={e => setFDuration(e.target.value)} required min="1" max="600" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input type="number" value={fDistance} onChange={e => setFDistance(e.target.value)} step="0.1" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {fDiscipline !== 'swimming' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fDiscipline === 'cycling' ? 'Avg Power (W)' : 'Avg Pace (min/km)'}
                    </label>
                    <input type="number" value={fDiscipline === 'cycling' ? fPower : fPace}
                      onChange={e => fDiscipline === 'cycling' ? setFPower(e.target.value) : setFPace(e.target.value)}
                      step="0.1" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="Optional" />
                  </div>
                ) : <div />}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Heart Rate (bpm)</label>
                  <input type="number" value={fHr} onChange={e => setFHr(e.target.value)} min="40" max="230" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="Optional" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perceived Effort: {fEffort}/10</label>
                <input type="range" min="1" max="10" value={fEffort} onChange={e => setFEffort(e.target.value)} className="w-full accent-orange-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>1 Very easy</span><span>5 Moderate</span><span>10 Max effort</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={fNotes} onChange={e => setFNotes(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none" placeholder="How did it feel? Any notable observations?" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
