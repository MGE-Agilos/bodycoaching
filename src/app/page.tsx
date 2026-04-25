'use client';

import { useState } from 'react';
import Link from 'next/link';
import ClientLayout from '../components/ClientLayout';
import StatCard from '../components/StatCard';
import GoalProgressBar from '../components/GoalProgressBar';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { getToday, getWeekStart, toISODate, formatDuration, getDisciplineIcon, getDisciplineColor, getDisciplineBg } from '../lib/utils';
import { FOOD_DATABASE } from '../data/foods';

export default function DashboardPage() {
  return (
    <ClientLayout>
      <Dashboard />
    </ClientLayout>
  );
}

function Dashboard() {
  const { profile, workouts, workoutLogs, goals, meals, isDemoMode } = useApp();
  const { t, language } = useLanguage();
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);

  const today = getToday();
  const weekStart = toISODate(getWeekStart(new Date()));
  const weekEnd = toISODate(new Date(new Date(weekStart + 'T00:00:00').getTime() + 6 * 86400000));

  const todayWorkouts = workouts.filter(w => w.scheduledDate === today);
  const weekWorkouts = workouts.filter(w => w.scheduledDate >= weekStart && w.scheduledDate <= weekEnd);
  const completedThisWeek = weekWorkouts.filter(w => w.status === 'completed');

  const thisMonthStart = today.substring(0, 7) + '-01';
  const monthLogs = workoutLogs.filter(l => l.date >= thisMonthStart);
  const totalMinutes = monthLogs.reduce((s, l) => s + l.duration, 0);
  const totalDistance = monthLogs.reduce((s, l) => s + (l.distance || 0), 0);

  const streak = (() => {
    const logDates = new Set(workoutLogs.map(l => l.date));
    let count = 0;
    const d = new Date(today + 'T00:00:00');
    if (!logDates.has(today)) d.setDate(d.getDate() - 1);
    while (logDates.has(d.toISOString().split('T')[0])) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const activeGoals = goals.filter(g => g.status === 'active');

  const todayMeals = meals.filter(m => m.date === today);
  const todayCalories = todayMeals.reduce((sum, meal) => {
    return sum + meal.foods.reduce((s, entry) => {
      const food = FOOD_DATABASE.find(f => f.id === entry.foodId);
      if (!food) return s;
      return s + (food.calories * entry.quantity) / food.servingSize;
    }, 0);
  }, 0);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? t.dashboard.goodMorning : greetingHour < 18 ? t.dashboard.goodAfternoon : t.dashboard.goodEvening;

  const DAY_LABELS = [
    t.common.days.mon, t.common.days.tue, t.common.days.wed,
    t.common.days.thu, t.common.days.fri, t.common.days.sat, t.common.days.sun,
  ];

  const locale = language === 'fr' ? 'fr-FR' : language === 'nl' ? 'nl-NL' : 'en-US';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}{profile ? `, ${profile.name.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {isDemoMode && !demoBannerDismissed && (
        <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl p-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0">🎯</span>
            <div>
              <p className="font-semibold text-violet-900 text-sm">{t.dashboard.demo.title}</p>
              <p className="text-xs text-violet-700 mt-0.5">
                {t.dashboard.demo.subtitle}{' '}
                <Link href="/profile" className="underline font-medium">{t.dashboard.demo.profileLink}</Link>{' '}
                {t.dashboard.demo.subtitleEnd}
              </p>
            </div>
          </div>
          <button onClick={() => setDemoBannerDismissed(true)} className="text-violet-400 hover:text-violet-600 text-lg shrink-0 leading-none">✕</button>
        </div>
      )}

      {!profile && (
        <div className="mb-6 bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sky-900">{t.dashboard.welcome.title}</p>
            <p className="text-sm text-sky-700 mt-0.5">{t.dashboard.welcome.subtitle}</p>
          </div>
          <Link href="/profile" className="shrink-0 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
            {t.dashboard.welcome.cta}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/workouts" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-3 text-center transition-colors shadow-sm">
          <div className="text-2xl">💪</div>
          <div className="text-xs font-medium mt-1">{t.dashboard.logWorkout}</div>
        </Link>
        <Link href="/nutrition" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-3 text-center transition-colors shadow-sm">
          <div className="text-2xl">🥗</div>
          <div className="text-xs font-medium mt-1">{t.dashboard.logMeal}</div>
        </Link>
        <Link href="/training" className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-3 text-center transition-colors shadow-sm">
          <div className="text-2xl">📅</div>
          <div className="text-xs font-medium mt-1">{t.dashboard.trainingPlan}</div>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label={t.common.thisMonth} value={formatDuration(totalMinutes)} icon="⏱️" subtitle={`${monthLogs.length} ${t.dashboard.sessions}`} />
        <StatCard label={t.dashboard.distance} value={totalDistance.toFixed(0)} unit="km" icon="📍" subtitle={t.common.thisMonth.toLowerCase()} />
        <StatCard label={t.dashboard.streak} value={streak} unit={streak === 1 ? t.dashboard.day : t.dashboard.days} icon="🔥" subtitle={t.dashboard.consecutiveTraining} />
        <StatCard label={t.dashboard.todayCalories} value={Math.round(todayCalories)} unit="kcal" icon="🥗" subtitle={`${todayMeals.length} ${t.dashboard.mealsLogged}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">{t.dashboard.todayPlan}</h2>
            <Link href="/training" className="text-sm text-sky-600 hover:text-sky-700 font-medium">{t.dashboard.seeWeek}</Link>
          </div>
          {todayWorkouts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">🛋️</div>
              <p className="text-gray-500 text-sm">{t.dashboard.restDay}</p>
              <Link href="/training" className="inline-block mt-3 text-sm text-sky-600 hover:underline font-medium">
                {t.dashboard.addWorkout}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayWorkouts.map(workout => (
                <div key={workout.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getDisciplineIcon(workout.discipline)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{workout.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getDisciplineBg(workout.discipline)}`}>
                          {t.common.disciplines[workout.discipline]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDuration(workout.duration)}
                        {workout.targetDistance ? ` · ${workout.targetDistance}km` : ''}
                        {' · '}<span className="capitalize">{t.common.intensity[workout.intensity]}</span>
                      </p>
                    </div>
                    {workout.status === 'completed' && <span className="text-green-500 text-xl shrink-0">✓</span>}
                  </div>
                  {workout.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{workout.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">{t.dashboard.activeGoals}</h2>
            <Link href="/goals" className="text-sm text-sky-600 hover:text-sky-700 font-medium">{t.dashboard.manageGoals}</Link>
          </div>
          {activeGoals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-gray-500 text-sm">{t.dashboard.noGoals}</p>
              <Link href="/goals" className="inline-block mt-3 text-sm text-sky-600 hover:underline font-medium">
                {t.dashboard.addGoal}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activeGoals.slice(0, 3).map(goal => (
                <GoalProgressBar key={goal.id} goal={goal} />
              ))}
              {activeGoals.length > 3 && (
                <Link href="/goals" className="block text-center text-sm text-sky-600 hover:underline py-1">
                  +{activeGoals.length - 3} {t.dashboard.moreGoals}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {weekWorkouts.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">{t.common.thisWeek}</h2>
            <Link href="/training" className="text-sm text-sky-600 hover:text-sky-700 font-medium">{t.dashboard.fullPlan}</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="grid grid-cols-7 gap-1">
              {DAY_LABELS.map((day, i) => {
                const d = new Date(weekStart + 'T00:00:00');
                d.setDate(d.getDate() + i);
                const dateStr = toISODate(d);
                const dayWorkouts = weekWorkouts.filter(w => w.scheduledDate === dateStr);
                const isToday = dateStr === today;
                return (
                  <div key={day} className={`text-center p-2 rounded-lg ${isToday ? 'bg-sky-50 ring-2 ring-sky-200' : ''}`}>
                    <p className={`text-xs font-medium mb-1 ${isToday ? 'text-sky-700' : 'text-gray-500'}`}>{day}</p>
                    <p className="text-xs text-gray-400">{d.getDate()}</p>
                    <div className="mt-1 flex flex-col gap-0.5 items-center">
                      {dayWorkouts.length === 0 ? (
                        <div className="w-5 h-1 rounded-full bg-gray-100" />
                      ) : (
                        dayWorkouts.map(w => (
                          <div key={w.id} className="w-5 h-1.5 rounded-full" style={{ backgroundColor: w.status === 'completed' ? '#22C55E' : getDisciplineColor(w.discipline) }} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-blue-500 inline-block" /> {t.dashboard.weekLegend.swim}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" /> {t.dashboard.weekLegend.bike}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-orange-500 inline-block" /> {t.dashboard.weekLegend.run}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" /> {t.dashboard.weekLegend.done}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
