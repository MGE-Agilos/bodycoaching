export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function formatPace(minPerKm: number): string {
  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

export function formatFiveK(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function getDisciplineColor(discipline: string): string {
  switch (discipline) {
    case 'swimming': return '#3B82F6';
    case 'cycling': return '#10B981';
    case 'running': return '#F97316';
    default: return '#6B7280';
  }
}

export function getDisciplineBg(discipline: string): string {
  switch (discipline) {
    case 'swimming': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cycling': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'running': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getDisciplineIcon(discipline: string): string {
  switch (discipline) {
    case 'swimming': return '🏊';
    case 'cycling': return '🚴';
    case 'running': return '🏃';
    default: return '💪';
  }
}

export function getIntensityColor(intensity: string): string {
  switch (intensity) {
    case 'easy': return 'text-green-600 bg-green-50';
    case 'moderate': return 'text-yellow-600 bg-yellow-50';
    case 'hard': return 'text-orange-600 bg-orange-50';
    case 'race': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(d1: string, d2: string): boolean {
  return d1.split('T')[0] === d2.split('T')[0];
}

export function getDayName(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getWeekLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
