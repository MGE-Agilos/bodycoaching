import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
  color?: string;
  subtitle?: string;
}

export default function StatCard({ label, value, unit, icon, trend, trendPercent, color = 'bg-white', subtitle }: StatCardProps) {
  return (
    <div className={`${color} rounded-xl border border-gray-100 p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && trendPercent !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendPercent}% this week</span>
            </div>
          )}
        </div>
        {icon && (
          <span className="text-2xl ml-2 opacity-80">{icon}</span>
        )}
      </div>
    </div>
  );
}
