'use client';

import { useState, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import { AthleteProfile, CurrentMetrics, TrainingPreferences } from '../../types';
import { generateId, getToday, formatFiveK } from '../../lib/utils';

export default function ProfilePage() {
  return (
    <ClientLayout>
      <ProfileContent />
    </ClientLayout>
  );
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ProfileContent() {
  const { profile, currentMetrics, trainingPreferences, saveProfile, saveMetrics, savePreferences, exportData, importData, clearAllData } = useApp();

  const [tab, setTab] = useState<'profile' | 'metrics' | 'training' | 'data'>('profile');
  const [saved, setSaved] = useState(false);

  // Profile form
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Metrics form
  const [rhr, setRhr] = useState('');
  const [mhr, setMhr] = useState('');
  const [ftp, setFtp] = useState('');
  const [fiveK, setFiveK] = useState('');
  const [swimPace, setSwimPace] = useState('');

  // Training prefs
  const [hours, setHours] = useState('8');
  const [swimPct, setSwimPct] = useState('30');
  const [bikePct, setBikePct] = useState('40');
  const [runPct, setRunPct] = useState('30');
  const [trainingDays, setTrainingDays] = useState<string[]>(['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday']);

  useEffect(() => {
    if (profile) {
      setName(profile.name); setAge(String(profile.age));
      setHeight(String(profile.height)); setWeight(String(profile.weight));
      setLevel(profile.experienceLevel);
    }
    if (currentMetrics) {
      setRhr(String(currentMetrics.restingHeartRate));
      setMhr(String(currentMetrics.maxHeartRate));
      setFtp(String(currentMetrics.ftp));
      setFiveK(String(Math.floor(currentMetrics.recentFiveKTime / 60)) + ':' + String(currentMetrics.recentFiveKTime % 60).padStart(2, '0'));
      setSwimPace(String(Math.floor(currentMetrics.swimPace / 60)) + ':' + String(currentMetrics.swimPace % 60).padStart(2, '0'));
    }
    if (trainingPreferences) {
      setHours(String(trainingPreferences.hoursPerWeek));
      setSwimPct(String(Math.round(trainingPreferences.disciplineDistribution.swim * 100)));
      setBikePct(String(Math.round(trainingPreferences.disciplineDistribution.bike * 100)));
      setRunPct(String(Math.round(trainingPreferences.disciplineDistribution.run * 100)));
      setTrainingDays(trainingPreferences.preferredTrainingDays);
    }
  }, [profile, currentMetrics, trainingPreferences]);

  const notify = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      id: profile?.id || generateId(),
      name, age: Number(age), height: Number(height), weight: Number(weight),
      experienceLevel: level,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    notify();
  };

  const parseTimeInput = (value: string): number => {
    const parts = value.split(':');
    if (parts.length === 2) return Number(parts[0]) * 60 + Number(parts[1]);
    return Number(value);
  };

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    saveMetrics({
      restingHeartRate: Number(rhr),
      maxHeartRate: Number(mhr),
      ftp: Number(ftp),
      recentFiveKTime: parseTimeInput(fiveK),
      swimPace: parseTimeInput(swimPace),
      lastUpdated: new Date().toISOString(),
    });
    notify();
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(swimPct) + Number(bikePct) + Number(runPct);
    if (Math.abs(total - 100) > 2) {
      alert('Discipline percentages must add up to 100%');
      return;
    }
    savePreferences({
      hoursPerWeek: Number(hours),
      disciplineDistribution: {
        swim: Number(swimPct) / 100,
        bike: Number(bikePct) / 100,
        run: Number(runPct) / 100,
      },
      preferredTrainingDays: trainingDays,
      restDays: DAYS.filter(d => !trainingDays.includes(d)),
    });
    notify();
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bodycoaching-${getToday()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const ok = importData(ev.target?.result as string);
      alert(ok ? 'Data imported successfully!' : 'Import failed. Invalid file format.');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('This will delete ALL your data permanently. Are you sure?')) {
      clearAllData();
      alert('All data cleared.');
    }
  };

  const toggleDay = (day: string) => {
    setTrainingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'metrics', label: '📊 Metrics' },
    { id: 'training', label: '⚙️ Training' },
    { id: 'data', label: '💾 Data' },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile & Settings</h1>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
          ✓ Saved successfully
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Athlete Profile</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="Your name" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} required min="10" max="90" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} required min="100" max="250" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="175" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} required min="30" max="200" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="70" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                <button key={l} type="button" onClick={() => setLevel(l)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    level === l ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 border-gray-200 hover:border-sky-300'
                  }`}>
                  {l === 'beginner' ? '🌱' : l === 'intermediate' ? '🔥' : '⚡'} {l}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
            Save Profile
          </button>
        </form>
      )}

      {tab === 'metrics' && (
        <form onSubmit={handleSaveMetrics} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Current Fitness Metrics</h2>
          <p className="text-xs text-gray-500">These metrics help generate better training plans. Update after testing.</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resting HR (bpm)</label>
              <input type="number" value={rhr} onChange={e => setRhr(e.target.value)} min="30" max="100" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max HR (bpm)</label>
              <input type="number" value={mhr} onChange={e => setMhr(e.target.value)} min="100" max="230" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="185" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FTP — Functional Threshold Power (watts)</label>
            <input type="number" value={ftp} onChange={e => setFtp(e.target.value)} min="50" max="500" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="200" />
            <p className="text-xs text-gray-400 mt-0.5">Your sustainable power for ~60 min on the bike</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recent 5K Run Time (mm:ss)</label>
            <input value={fiveK} onChange={e => setFiveK(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="25:00" />
            <p className="text-xs text-gray-400 mt-0.5">Format: minutes:seconds (e.g. 25:30)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Swim Pace per 100m (mm:ss)</label>
            <input value={swimPace} onChange={e => setSwimPace(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="2:00" />
            <p className="text-xs text-gray-400 mt-0.5">Comfortable training pace per 100m</p>
          </div>

          {currentMetrics && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium">Current values:</p>
              <p>Resting HR: {currentMetrics.restingHeartRate} bpm · Max HR: {currentMetrics.maxHeartRate} bpm</p>
              <p>FTP: {currentMetrics.ftp}W · 5K: {formatFiveK(currentMetrics.recentFiveKTime)} · Swim: {formatFiveK(currentMetrics.swimPace)}/100m</p>
            </div>
          )}

          <button type="submit" className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
            Save Metrics
          </button>
        </form>
      )}

      {tab === 'training' && (
        <form onSubmit={handleSavePrefs} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Training Preferences</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours per week available: {hours}h</label>
            <input type="range" min="3" max="25" value={hours} onChange={e => setHours(e.target.value)} className="w-full accent-sky-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>3h (minimal)</span><span>14h (moderate)</span><span>25h (elite)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discipline Distribution (must equal 100%)</label>
            <div className="space-y-2">
              {[
                { label: '🏊 Swimming', val: swimPct, set: setSwimPct },
                { label: '🚴 Cycling', val: bikePct, set: setBikePct },
                { label: '🏃 Running', val: runPct, set: setRunPct },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm w-28 shrink-0">{label}</span>
                  <input type="range" min="10" max="70" value={val} onChange={e => set(e.target.value)} className="flex-1 accent-sky-600" />
                  <span className="text-sm font-medium w-10 text-right">{val}%</span>
                </div>
              ))}
              <p className={`text-xs ${Math.abs(Number(swimPct) + Number(bikePct) + Number(runPct) - 100) <= 2 ? 'text-green-600' : 'text-red-500'}`}>
                Total: {Number(swimPct) + Number(bikePct) + Number(runPct)}% {Math.abs(Number(swimPct) + Number(bikePct) + Number(runPct) - 100) <= 2 ? '✓' : '(should be 100%)'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Training Days</label>
            <div className="grid grid-cols-4 gap-1">
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    trainingDays.includes(day) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'
                  }`}>
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{trainingDays.length} training days selected</p>
          </div>

          <button type="submit" className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
            Save Preferences
          </button>
        </form>
      )}

      {tab === 'data' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Export Data</h2>
            <p className="text-sm text-gray-500 mb-4">Download all your data as a JSON file for backup or transfer.</p>
            <button onClick={handleExport} className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
              📥 Download Data (JSON)
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Import Data</h2>
            <p className="text-sm text-gray-500 mb-4">Restore from a previously exported JSON file.</p>
            <label className="block w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-center cursor-pointer hover:bg-gray-200 transition-colors">
              📤 Choose JSON File
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
            <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">Permanently delete all your data. This cannot be undone.</p>
            <button onClick={handleClear} className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors">
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

