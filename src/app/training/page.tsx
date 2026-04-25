'use client';

import { useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import { Workout } from '../../types';
import { generateWeeklyPlan } from '../../lib/planGenerator';
import {
  getToday, getWeekStart, getWeekDates, toISODate, addDays,
  formatDuration, getDisciplineIcon, getDisciplineBg, getIntensityColor, getWeekLabel,
} from '../../lib/utils';

export default function TrainingPage() {
  return (
    <ClientLayout>
      <TrainingContent />
    </ClientLayout>
  );
}

function TrainingContent() {
  const { profile, trainingPreferences, workouts, updateWorkout, deleteWorkout, addWorkout, replaceWeekWorkouts } = useApp();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showAddForm, setShowAddForm] = useState<string | null>(null); // date string
  const [showModal, setShowModal] = useState(false);

  // Add/edit form state
  const [formName, setFormName] = useState('');
  const [formDiscipline, setFormDiscipline] = useState<'swimming' | 'cycling' | 'running'>('running');
  const [formDuration, setFormDuration] = useState('45');
  const [formIntensity, setFormIntensity] = useState<'easy' | 'moderate' | 'hard' | 'race'>('easy');
  const [formDistance, setFormDistance] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const today = getToday();
  const weekDates = getWeekDates(currentWeekStart);
  const weekStartStr = toISODate(currentWeekStart);
  const weekEndStr = toISODate(weekDates[6]);

  const weekWorkouts = workouts.filter(w => w.scheduledDate >= weekStartStr && w.scheduledDate <= weekEndStr);
  const totalHours = weekWorkouts.reduce((s, w) => s + w.duration, 0) / 60;
  const completedCount = weekWorkouts.filter(w => w.status === 'completed').length;

  const prevWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const nextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
  const goToCurrentWeek = () => setCurrentWeekStart(getWeekStart(new Date()));

  const handleGeneratePlan = () => {
    if (!profile || !trainingPreferences) {
      alert('Please complete your profile and training preferences first.');
      return;
    }
    if (weekWorkouts.length > 0 && !confirm('This will replace existing workouts for this week. Continue?')) return;
    const newWorkouts = generateWeeklyPlan(currentWeekStart, profile, trainingPreferences);
    replaceWeekWorkouts(weekStartStr, newWorkouts);
  };

  const openAddForm = (date: string) => {
    setShowAddForm(date);
    setFormName(''); setFormDiscipline('running'); setFormDuration('45');
    setFormIntensity('easy'); setFormDistance(''); setFormNotes(''); setFormDesc('');
    setShowModal(true);
  };

  const openEditForm = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowAddForm(workout.scheduledDate);
    setFormName(workout.name); setFormDiscipline(workout.discipline);
    setFormDuration(String(workout.duration)); setFormIntensity(workout.intensity);
    setFormDistance(workout.targetDistance ? String(workout.targetDistance) : '');
    setFormNotes(workout.notes); setFormDesc(workout.description);
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formName, discipline: formDiscipline, duration: Number(formDuration),
      intensity: formIntensity, targetDistance: formDistance ? Number(formDistance) : undefined,
      notes: formNotes, description: formDesc,
      scheduledDate: showAddForm || today, status: 'scheduled' as const,
    };
    if (selectedWorkout) {
      updateWorkout(selectedWorkout.id, data);
    } else {
      addWorkout(data);
    }
    setShowModal(false); setSelectedWorkout(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this workout?')) deleteWorkout(id);
    setShowModal(false); setSelectedWorkout(null);
  };

  const handleComplete = (id: string) => {
    updateWorkout(id, { status: 'completed' });
    setShowModal(false); setSelectedWorkout(null);
  };

  const handleSkip = (id: string) => {
    updateWorkout(id, { status: 'skipped' });
    setShowModal(false); setSelectedWorkout(null);
  };

  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Plan</h1>
          <p className="text-gray-500 text-sm mt-0.5">{getWeekLabel(currentWeekStart)}</p>
        </div>
        <button
          onClick={handleGeneratePlan}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors flex items-center gap-2"
        >
          ⚡ Generate Week Plan
        </button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3 mb-4 shadow-sm">
        <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">← Prev</button>
        <div className="text-center">
          <button onClick={goToCurrentWeek} className="text-sm text-sky-600 hover:underline font-medium">
            {weekStartStr === toISODate(getWeekStart(new Date())) ? 'Current Week' : 'Go to this week'}
          </button>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDuration(weekWorkouts.reduce((s, w) => s + w.duration, 0))} total · {completedCount}/{weekWorkouts.length} done
          </p>
        </div>
        <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">Next →</button>
      </div>

      {/* Week Grid */}
      {!profile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          💡 Create your profile to enable automatic plan generation.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDates.map((date, i) => {
          const dateStr = toISODate(date);
          const dayWorkouts = weekWorkouts.filter(w => w.scheduledDate === dateStr);
          const isToday = dateStr === today;
          const isPast = dateStr < today;

          return (
            <div key={dateStr} className={`bg-white rounded-xl border shadow-sm p-3 min-h-28 ${isToday ? 'ring-2 ring-sky-400 border-sky-200' : 'border-gray-100'} ${isPast && !isToday ? 'opacity-75' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`text-xs font-bold ${isToday ? 'text-sky-700' : 'text-gray-500'}`}>{DAY_NAMES[i]}</p>
                  <p className={`text-lg font-bold leading-tight ${isToday ? 'text-sky-600' : 'text-gray-800'}`}>{date.getDate()}</p>
                </div>
                <button
                  onClick={() => openAddForm(dateStr)}
                  className="text-gray-300 hover:text-sky-500 text-lg leading-none transition-colors"
                  title="Add workout"
                >+</button>
              </div>

              <div className="space-y-1">
                {dayWorkouts.map(workout => (
                  <button
                    key={workout.id}
                    onClick={() => { setSelectedWorkout(workout); openEditForm(workout); }}
                    className={`w-full text-left p-1.5 rounded-lg text-xs border transition-colors hover:opacity-80 ${getDisciplineBg(workout.discipline)} ${workout.status === 'completed' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{getDisciplineIcon(workout.discipline)}</span>
                      <span className="font-medium truncate flex-1">{workout.name}</span>
                      {workout.status === 'completed' && <span className="text-green-600">✓</span>}
                      {workout.status === 'skipped' && <span className="text-gray-400">✕</span>}
                    </div>
                    <p className="text-gray-500 mt-0.5">{formatDuration(workout.duration)}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="font-medium">Discipline:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" /> Swimming</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" /> Cycling</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-200 inline-block" /> Running</span>
      </div>

      {/* Weekly Summary */}
      {weekWorkouts.length > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Week Summary</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {(['swimming', 'cycling', 'running'] as const).map(disc => {
              const dws = weekWorkouts.filter(w => w.discipline === disc);
              const mins = dws.reduce((s, w) => s + w.duration, 0);
              return (
                <div key={disc}>
                  <p className="text-xl">{getDisciplineIcon(disc)}</p>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{disc}</p>
                  <p className="text-xs text-gray-500">{dws.length} sessions · {formatDuration(mins)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-600">Total volume: <strong>{totalHours.toFixed(1)}h</strong></span>
            <span className="text-gray-600">Completed: <strong className="text-green-600">{completedCount}/{weekWorkouts.length}</strong></span>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{selectedWorkout ? 'Edit Workout' : 'Add Workout'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="e.g. Easy Run" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                  <select value={formDiscipline} onChange={e => setFormDiscipline(e.target.value as typeof formDiscipline)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                    <option value="running">🏃 Running</option>
                    <option value="cycling">🚴 Cycling</option>
                    <option value="swimming">🏊 Swimming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
                  <select value={formIntensity} onChange={e => setFormIntensity(e.target.value as typeof formIntensity)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="race">Race</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} required min="5" max="600" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km, opt.)</label>
                  <input type="number" value={formDistance} onChange={e => setFormDistance(e.target.value)} step="0.1" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="Optional" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none" placeholder="What's the session about?" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="Personal notes..." />
              </div>

              {selectedWorkout && (
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => handleComplete(selectedWorkout.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedWorkout.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                    ✓ {selectedWorkout.status === 'completed' ? 'Completed' : 'Mark Done'}
                  </button>
                  <button type="button" onClick={() => handleSkip(selectedWorkout.id)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Skip
                  </button>
                  <button type="button" onClick={() => handleDelete(selectedWorkout.id)}
                    className="bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                    🗑️
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">Save</button>
              </div>
            </form>

            {selectedWorkout && (
              <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${getIntensityColor(selectedWorkout.intensity)}`}>
                Intensity: <span className="font-medium capitalize">{selectedWorkout.intensity}</span>
                {selectedWorkout.targetDistance && ` · Target: ${selectedWorkout.targetDistance}km`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
