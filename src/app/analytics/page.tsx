'use client';

import { useState, useMemo } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { LineChart, BarChart, PieChart } from '../../components/SimpleChart';
import { formatDuration, getDisciplineColor } from '../../lib/utils';

export default function AnalyticsPage() {
  return (
    <ClientLayout>
      <AnalyticsContent />
    </ClientLayout>
  );
}

function AnalyticsContent() {
  const { workoutLogs } = useApp();
  const { t } = useLanguage();
  const [range, setRange] = useState<'4w' | '8w' | '12w' | '6m' | 'all'>('8w');
  const [discipline, setDiscipline] = useState<'all' | 'swimming' | 'cycling' | 'running'>('all');

  const cutoffDate = useMemo(() => {
    const d = new Date();
    if (range === '4w') d.setDate(d.getDate() - 28);
    else if (range === '8w') d.setDate(d.getDate() - 56);
    else if (range === '12w') d.setDate(d.getDate() - 84);
    else if (range === '6m') d.setMonth(d.getMonth() - 6);
    else d.setFullYear(d.getFullYear() - 5);
    return d.toISOString().split('T')[0];
  }, [range]);

  const filtered = useMemo(() =>
    workoutLogs
      .filter(l => l.date >= cutoffDate && (discipline === 'all' || l.discipline === discipline))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [workoutLogs, cutoffDate, discipline]
  );

  // Weekly volume (hours)
  const weeklyVolume = useMemo(() => {
    const weeks: Record<string, number> = {};
    filtered.forEach(l => {
      const d = new Date(l.date + 'T00:00:00');
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeks[key] = (weeks[key] || 0) + l.duration;
    });
    return Object.entries(weeks).map(([label, mins]) => ({ label, value: Math.round(mins / 60 * 10) / 10 }));
  }, [filtered]);

  // Running pace over time
  const runPaceData = useMemo(() =>
    workoutLogs
      .filter(l => l.discipline === 'running' && l.date >= cutoffDate && l.averagePace && l.averagePace > 0 && l.averagePace < 15)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(l => ({
        label: new Date(l.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number(l.averagePace!.toFixed(1)),
      })),
    [workoutLogs, cutoffDate]
  );

  // Cycling power over time
  const cyclingPowerData = useMemo(() =>
    workoutLogs
      .filter(l => l.discipline === 'cycling' && l.date >= cutoffDate && l.averagePower && l.averagePower > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(l => ({
        label: new Date(l.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: l.averagePower!,
      })),
    [workoutLogs, cutoffDate]
  );

  // Swim distance over time
  const swimDistData = useMemo(() =>
    workoutLogs
      .filter(l => l.discipline === 'swimming' && l.date >= cutoffDate && l.distance > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(l => ({
        label: new Date(l.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: l.distance,
      })),
    [workoutLogs, cutoffDate]
  );

  // Discipline distribution
  const discDistribution = useMemo(() => {
    const counts = { swimming: 0, cycling: 0, running: 0 };
    filtered.forEach(l => { counts[l.discipline] += l.duration; });
    return [
      { label: 'Swim', value: counts.swimming, color: '#3B82F6' },
      { label: 'Bike', value: counts.cycling, color: '#10B981' },
      { label: 'Run', value: counts.running, color: '#F97316' },
    ].filter(d => d.value > 0);
  }, [filtered]);

  // Intensity distribution
  const effortData = useMemo(() => {
    const buckets = { Easy: 0, Moderate: 0, Hard: 0, Max: 0 };
    filtered.forEach(l => {
      if (l.perceivedEffort <= 3) buckets.Easy++;
      else if (l.perceivedEffort <= 5) buckets.Moderate++;
      else if (l.perceivedEffort <= 8) buckets.Hard++;
      else buckets.Max++;
    });
    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
  }, [filtered]);

  // Personal records
  const prs = useMemo(() => {
    const runLogs = workoutLogs.filter(l => l.discipline === 'running' && l.distance > 0);
    const bikeLogs = workoutLogs.filter(l => l.discipline === 'cycling' && l.distance > 0);
    const swimLogs = workoutLogs.filter(l => l.discipline === 'swimming' && l.distance > 0);
    return {
      bestRunPace: runLogs.length ? Math.min(...runLogs.filter(l => l.averagePace && l.averagePace > 0).map(l => l.averagePace!)) : null,
      longestRun: runLogs.length ? Math.max(...runLogs.map(l => l.distance)) : null,
      bestPower: bikeLogs.filter(l => l.averagePower).length ? Math.max(...bikeLogs.filter(l => l.averagePower).map(l => l.averagePower!)) : null,
      longestBike: bikeLogs.length ? Math.max(...bikeLogs.map(l => l.distance)) : null,
      longestSwim: swimLogs.length ? Math.max(...swimLogs.map(l => l.distance)) : null,
      totalWorkouts: workoutLogs.length,
      totalTime: workoutLogs.reduce((s, l) => s + l.duration, 0),
      totalDistance: workoutLogs.reduce((s, l) => s + l.distance, 0),
    };
  }, [workoutLogs]);

  const totalHours = filtered.reduce((s, l) => s + l.duration, 0);
  const totalDist = filtered.reduce((s, l) => s + l.distance, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t.analytics.title}</h1>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['4w', '8w', '12w', '6m', 'all'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'swimming', 'cycling', 'running'] as const).map(d => (
              <button key={d} onClick={() => setDiscipline(d)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${discipline === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                {d === 'all' ? 'All' : d.substring(0, 4)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {workoutLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-gray-500">{t.analytics.noData}</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.analytics.totalSessions}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900">{formatDuration(totalHours)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.analytics.totalTime}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900">{totalDist.toFixed(0)}<span className="text-base font-normal text-gray-500">km</span></p>
              <p className="text-xs text-gray-500 mt-0.5">{t.analytics.totalDistance}</p>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">{t.analytics.weeklyVolume}</h3>
              <BarChart data={weeklyVolume} color="#0EA5E9" height={140} unit="h" />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">{t.analytics.disciplineBreakdown}</h3>
              {discDistribution.length > 0 ? (
                <div className="flex items-center gap-4">
                  <PieChart data={discDistribution} size={130} />
                  <div className="flex-1 space-y-1.5">
                    {discDistribution.map(d => (
                      <div key={d.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-700">{d.label}</span>
                        </div>
                        <span className="text-gray-500 font-medium">{formatDuration(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-gray-400 text-sm text-center py-8">No data for selected period</p>}
            </div>
          </div>

          {/* Discipline-specific charts */}
          <div className="space-y-4 mb-6">
            {runPaceData.length >= 2 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-1">🏃 {t.analytics.runningPace}</h3>
                <p className="text-xs text-gray-500 mb-3">Lower = faster</p>
                <LineChart data={runPaceData} color={getDisciplineColor('running')} height={130} />
              </div>
            )}

            {cyclingPowerData.length >= 2 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">🚴 {t.analytics.cyclingPower}</h3>
                <LineChart data={cyclingPowerData} color={getDisciplineColor('cycling')} height={130} />
              </div>
            )}

            {swimDistData.length >= 2 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">🏊 Swim Distance per Session (km)</h3>
                <LineChart data={swimDistData} color={getDisciplineColor('swimming')} height={130} />
              </div>
            )}

            {effortData.some(d => d.value > 0) && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">{t.analytics.intensityDistribution}</h3>
                <BarChart
                  data={effortData}
                  color="#8B5CF6"
                  height={120}
                />
              </div>
            )}
          </div>

          {/* Personal Records */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">{t.analytics.personalRecords}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: t.analytics.totalSessions, value: prs.totalWorkouts, unit: '' },
                { label: t.analytics.totalTime, value: formatDuration(prs.totalTime), unit: '' },
                { label: t.analytics.totalDistance, value: prs.totalDistance.toFixed(0), unit: 'km' },
                prs.bestRunPace ? { label: t.analytics.runningPace, value: prs.bestRunPace.toFixed(1), unit: 'min/km' } : null,
                prs.longestRun ? { label: t.analytics.longestRun, value: prs.longestRun.toFixed(1), unit: 'km' } : null,
                prs.bestPower ? { label: t.analytics.cyclingPower, value: prs.bestPower, unit: 'W' } : null,
                prs.longestBike ? { label: t.analytics.longestRide, value: prs.longestBike.toFixed(1), unit: 'km' } : null,
                prs.longestSwim ? { label: t.analytics.longestSwim, value: prs.longestSwim.toFixed(1), unit: 'km' } : null,
              ].filter(Boolean).map((pr, i) => pr && (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{pr.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">
                    {pr.value} <span className="text-sm font-normal text-gray-500">{pr.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
