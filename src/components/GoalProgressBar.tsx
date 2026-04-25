'use client';

import { Goal } from '../types';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface GoalProgressBarProps {
  goal: Goal;
}

export default function GoalProgressBar({ goal }: GoalProgressBarProps) {
  const { t } = useLanguage();
  const pct = goal.targetValue > 0
    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    : 0;

  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
  const urgent = daysLeft <= 14 && daysLeft > 0;
  const overdue = daysLeft <= 0;

  const barColor = pct >= 75 ? 'bg-green-500' : pct >= 25 ? 'bg-yellow-400' : 'bg-red-400';
  const disciplineEmoji = goal.discipline === 'swimming' ? '🏊' : goal.discipline === 'cycling' ? '🚴' : goal.discipline === 'running' ? '🏃' : '🏆';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{disciplineEmoji}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{goal.name}</p>
            <p className="text-xs text-gray-500">{goal.metric} · {t.goals.categories[goal.category as keyof typeof t.goals.categories] || goal.category}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            overdue ? 'bg-red-100 text-red-700' : urgent ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {overdue ? t.goals.overdue : urgent ? `${daysLeft} ${t.goals.daysLeft}` : formatDate(goal.deadline)}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{goal.currentValue} {goal.unit}</span>
          <span className="font-medium text-gray-700">{pct}%</span>
          <span>{goal.targetValue} {goal.unit}</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{goal.description}</p>
      )}
    </div>
  );
}
