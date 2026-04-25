'use client';

import { useState, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { AthleteProfile, CurrentMetrics, TrainingPreferences } from '../../types';
import { generateId, getToday, formatFiveK } from '../../lib/utils';

export default function ProfilePage() {
  return (
    <ClientLayout>
      <ProfileContent />
    </ClientLayout>
  );
}

const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ProfileContent() {
  const { profile, currentMetrics, trainingPreferences, nutritionTargets, saveProfile, saveMetrics, savePreferences, saveNutritionTargets, exportData, importData, clearAllData } = useApp();
  const { t } = useLanguage();

  const [tab, setTab] = useState<'profile' | 'metrics' | 'training' | 'nutrition' | 'data'>('profile');
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const [rhr, setRhr] = useState('');
  const [mhr, setMhr] = useState('');
  const [ftp, setFtp] = useState('');
  const [fiveK, setFiveK] = useState('');
  const [swimPace, setSwimPace] = useState('');

  const [hours, setHours] = useState('8');
  const [swimPct, setSwimPct] = useState('30');
  const [bikePct, setBikePct] = useState('40');
  const [runPct, setRunPct] = useState('30');
  const [trainingDays, setTrainingDays] = useState<string[]>(['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday']);

  const [nCalories, setNCalories] = useState('2500');
  const [nProteinPct, setNProteinPct] = useState('25');
  const [nCarbsPct, setNCarbsPct] = useState('55');
  const [nFatsPct, setNFatsPct] = useState('20');
  const [nWater, setNWater] = useState('3');

  const DAY_LABELS: Record<string, string> = {
    Monday: t.common.days.monday,
    Tuesday: t.common.days.tuesday,
    Wednesday: t.common.days.wednesday,
    Thursday: t.common.days.thursday,
    Friday: t.common.days.friday,
    Saturday: t.common.days.saturday,
    Sunday: t.common.days.sunday,
  };

  const DAY_SHORT: Record<string, string> = {
    Monday: t.common.days.mon,
    Tuesday: t.common.days.tue,
    Wednesday: t.common.days.wed,
    Thursday: t.common.days.thu,
    Friday: t.common.days.fri,
    Saturday: t.common.days.sat,
    Sunday: t.common.days.sun,
  };

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
    if (nutritionTargets) {
      setNCalories(String(nutritionTargets.dailyCalories));
      setNProteinPct(String(Math.round(nutritionTargets.proteinPercent * 100)));
      setNCarbsPct(String(Math.round(nutritionTargets.carbsPercent * 100)));
      setNFatsPct(String(Math.round(nutritionTargets.fatsPercent * 100)));
      setNWater(String(nutritionTargets.waterLitersPerDay));
    }
  }, [profile, currentMetrics, trainingPreferences, nutritionTargets]);

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
      restingHeartRate: Number(rhr), maxHeartRate: Number(mhr), ftp: Number(ftp),
      recentFiveKTime: parseTimeInput(fiveK), swimPace: parseTimeInput(swimPace),
      lastUpdated: new Date().toISOString(),
    });
    notify();
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(swimPct) + Number(bikePct) + Number(runPct);
    if (Math.abs(total - 100) > 2) { alert(t.profile.training.invalidPercentages); return; }
    savePreferences({
      hoursPerWeek: Number(hours),
      disciplineDistribution: { swim: Number(swimPct) / 100, bike: Number(bikePct) / 100, run: Number(runPct) / 100 },
      preferredTrainingDays: trainingDays,
      restDays: DAYS_EN.filter(d => !trainingDays.includes(d)),
    });
    notify();
  };

  const handleSaveNutrition = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(nProteinPct) + Number(nCarbsPct) + Number(nFatsPct);
    if (Math.abs(total - 100) > 2) { alert(t.profile.nutrition.invalidMacros); return; }
    saveNutritionTargets({
      dailyCalories: Number(nCalories), proteinPercent: Number(nProteinPct) / 100,
      carbsPercent: Number(nCarbsPct) / 100, fatsPercent: Number(nFatsPct) / 100,
      waterLitersPerDay: Number(nWater),
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
      alert(ok ? t.profile.data.importSuccess : t.profile.data.importFail);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm(t.profile.data.clearConfirm)) {
      clearAllData();
      alert(t.profile.data.clearDone);
    }
  };

  const toggleDay = (day: string) => {
    setTrainingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const tabs = [
    { id: 'profile', label: t.profile.tabs.profile },
    { id: 'metrics', label: t.profile.tabs.metrics },
    { id: 'training', label: t.profile.tabs.training },
    { id: 'nutrition', label: t.profile.tabs.nutrition },
    { id: 'data', label: t.profile.tabs.data },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.profile.title}</h1>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
          {t.profile.saved}
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === tabItem.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">{t.profile.athleteProfile}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.fullName}</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder={t.profile.namePlaceholder} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.age}</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} required min="10" max="90" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.height}</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} required min="100" max="250" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="175" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.weight}</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} required min="30" max="200" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="70" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.experienceLevel}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                <button key={l} type="button" onClick={() => setLevel(l)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    level === l ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 border-gray-200 hover:border-sky-300'
                  }`}>
                  {l === 'beginner' ? '🌱' : l === 'intermediate' ? '🔥' : '⚡'} {t.common.levels[l]}
                </button>
              ))}
            </div>
          </div>

          {height && weight && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
              <span className="font-medium">{t.profile.bmi}: </span>
              {(() => {
                const bmi = Number(weight) / Math.pow(Number(height) / 100, 2);
                const label = bmi < 18.5 ? t.profile.underweight : bmi < 25 ? t.profile.normal : bmi < 30 ? t.profile.overweight : t.profile.obese;
                return <span>{bmi.toFixed(1)} — {label}</span>;
              })()}
            </div>
          )}

          <button type="submit" className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
            {t.profile.saveProfile}
          </button>
        </form>
      )}

      {tab === 'metrics' && (
        <form onSubmit={handleSaveMetrics} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">{t.profile.metrics.title}</h2>
          <p className="text-xs text-gray-500">{t.profile.metrics.subtitle}</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.metrics.restingHr}</label>
              <input type="number" value={rhr} onChange={e => setRhr(e.target.value)} min="30" max="100" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.metrics.maxHr}</label>
              <input type="number" value={mhr} onChange={e => setMhr(e.target.value)} min="100" max="230" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="185" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.metrics.ftp}</label>
            <input type="number" value={ftp} onChange={e => setFtp(e.target.value)} min="50" max="500" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="200" />
            <p className="text-xs text-gray-400 mt-0.5">{t.profile.metrics.ftpHint}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.metrics.fiveK}</label>
            <input value={fiveK} onChange={e => setFiveK(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="25:00" />
            <p className="text-xs text-gray-400 mt-0.5">{t.profile.metrics.fiveKHint}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.metrics.swimPace}</label>
            <input value={swimPace} onChange={e => setSwimPace(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="2:00" />
            <p className="text-xs text-gray-400 mt-0.5">{t.profile.metrics.swimPaceHint}</p>
          </div>

          {currentMetrics && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium">{t.profile.metrics.currentValues}</p>
              <p>{t.profile.metrics.restingHr}: {currentMetrics.restingHeartRate} · {t.profile.metrics.maxHr}: {currentMetrics.maxHeartRate}</p>
              <p>FTP: {currentMetrics.ftp}W · 5K: {formatFiveK(currentMetrics.recentFiveKTime)} · Swim: {formatFiveK(currentMetrics.swimPace)}/100m</p>
            </div>
          )}

          <button type="submit" className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
            {t.profile.metrics.saveMetrics}
          </button>
        </form>
      )}

      {tab === 'training' && (
        <form onSubmit={handleSavePrefs} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">{t.profile.training.title}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.training.hoursPerWeek}: {hours}h</label>
            <input type="range" min="3" max="25" value={hours} onChange={e => setHours(e.target.value)} className="w-full accent-sky-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{t.profile.training.minimal}</span>
              <span>{t.profile.training.moderate}</span>
              <span>{t.profile.training.elite}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.training.disciplineDistribution}</label>
            <div className="space-y-2">
              {[
                { label: `🏊 ${t.common.disciplines.swimming}`, val: swimPct, set: setSwimPct },
                { label: `🚴 ${t.common.disciplines.cycling}`, val: bikePct, set: setBikePct },
                { label: `🏃 ${t.common.disciplines.running}`, val: runPct, set: setRunPct },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm w-28 shrink-0">{label}</span>
                  <input type="range" min="10" max="70" value={val} onChange={e => set(e.target.value)} className="flex-1 accent-sky-600" />
                  <span className="text-sm font-medium w-10 text-right">{val}%</span>
                </div>
              ))}
              <p className={`text-xs ${Math.abs(Number(swimPct) + Number(bikePct) + Number(runPct) - 100) <= 2 ? 'text-green-600' : 'text-red-500'}`}>
                Total: {Number(swimPct) + Number(bikePct) + Number(runPct)}% {Math.abs(Number(swimPct) + Number(bikePct) + Number(runPct) - 100) <= 2 ? '✓' : t.profile.training.totalShouldBe}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.training.preferredDays}</label>
            <div className="grid grid-cols-4 gap-1">
              {DAYS_EN.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    trainingDays.includes(day) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'
                  }`}>
                  {DAY_SHORT[day]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{trainingDays.length} {t.profile.training.trainingDaysSelected}</p>
          </div>

          <button type="submit" className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
            {t.profile.training.savePreferences}
          </button>
        </form>
      )}

      {tab === 'nutrition' && (
        <form onSubmit={handleSaveNutrition} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900">{t.profile.nutrition.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t.profile.nutrition.subtitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.nutrition.calorieTarget}</label>
            <div className="flex items-center gap-2">
              <input type="number" value={nCalories} onChange={e => setNCalories(e.target.value)} min="1200" max="6000" step="50" required
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              <span className="text-sm text-gray-500 shrink-0">{t.profile.nutrition.kcalPerDay}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {[2000, 2500, 3000].map(cal => (
                <button key={cal} type="button" onClick={() => setNCalories(String(cal))}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${Number(nCalories) === cal ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}>
                  {cal} kcal
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.nutrition.macroDistribution}</label>
            <div className="space-y-3">
              {[
                { label: t.profile.nutrition.protein, val: nProteinPct, set: setNProteinPct, color: 'accent-blue-600', grams: Math.round(Number(nCalories) * Number(nProteinPct) / 100 / 4) },
                { label: t.profile.nutrition.carbs, val: nCarbsPct, set: setNCarbsPct, color: 'accent-emerald-600', grams: Math.round(Number(nCalories) * Number(nCarbsPct) / 100 / 4) },
                { label: t.profile.nutrition.fats, val: nFatsPct, set: setNFatsPct, color: 'accent-violet-600', grams: Math.round(Number(nCalories) * Number(nFatsPct) / 100 / 9) },
              ].map(({ label, val, set, color, grams }) => (
                <div key={label}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm w-36 shrink-0">{label}</span>
                    <input type="range" min="10" max="70" value={val} onChange={e => set(e.target.value)} className={`flex-1 ${color}`} />
                    <span className="text-sm font-medium w-10 text-right">{val}%</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-36">{t.profile.nutrition.approxGrams} {grams}g / {t.profile.nutrition.perDay.replace('/ ', '')} {t.profile.nutrition.atKcal} {nCalories} kcal</p>
                </div>
              ))}
              <p className={`text-xs mt-1 font-medium ${Math.abs(Number(nProteinPct) + Number(nCarbsPct) + Number(nFatsPct) - 100) <= 2 ? 'text-green-600' : 'text-red-500'}`}>
                Total: {Number(nProteinPct) + Number(nCarbsPct) + Number(nFatsPct)}%
                {Math.abs(Number(nProteinPct) + Number(nCarbsPct) + Number(nFatsPct) - 100) <= 2 ? ' ✓' : ` ${t.profile.nutrition.mustBe100}`}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.nutrition.waterTarget}</label>
            <div className="flex items-center gap-2">
              <input type="number" value={nWater} onChange={e => setNWater(e.target.value)} min="1" max="6" step="0.5" required
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              <span className="text-sm text-gray-500 shrink-0">{t.profile.nutrition.litersPerDay}</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {[2, 2.5, 3, 3.5].map(l => (
                <button key={l} type="button" onClick={() => setNWater(String(l))}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${Number(nWater) === l ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}>
                  {l}L
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p className="font-medium text-gray-700">{t.profile.nutrition.currentSummary}</p>
            <p>{nCalories} kcal · {Math.round(Number(nCalories) * Number(nProteinPct) / 100 / 4)}g protein · {Math.round(Number(nCalories) * Number(nCarbsPct) / 100 / 4)}g carbs · {Math.round(Number(nCalories) * Number(nFatsPct) / 100 / 9)}g fat</p>
            <p>💧 {nWater}L water</p>
          </div>

          <button type="submit" className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
            {t.profile.nutrition.saveNutrition}
          </button>
        </form>
      )}

      {tab === 'data' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">{t.profile.data.exportTitle}</h2>
            <p className="text-sm text-gray-500 mb-4">{t.profile.data.exportDesc}</p>
            <button onClick={handleExport} className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors">
              {t.profile.data.exportBtn}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">{t.profile.data.importTitle}</h2>
            <p className="text-sm text-gray-500 mb-4">{t.profile.data.importDesc}</p>
            <label className="block w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-center cursor-pointer hover:bg-gray-200 transition-colors">
              {t.profile.data.importBtn}
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
            <h2 className="font-semibold text-red-700 mb-1">{t.profile.data.dangerZone}</h2>
            <p className="text-sm text-gray-500 mb-4">{t.profile.data.dangerDesc}</p>
            <button onClick={handleClear} className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors">
              {t.profile.data.clearBtn}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">{t.profile.data.demoTitle}</h2>
            <p className="text-sm text-gray-500 mb-4">{t.profile.data.demoDesc}</p>
            <button
              onClick={() => {
                if (confirm(t.profile.data.demoConfirm)) {
                  if (typeof window !== 'undefined') localStorage.removeItem('bc_demo_seeded');
                  window.location.reload();
                }
              }}
              className="w-full bg-violet-500 text-white py-2.5 rounded-lg font-medium hover:bg-violet-600 transition-colors"
            >
              {t.profile.data.demoBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
