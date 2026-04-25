const PREFIX = 'bc_';

export const KEYS = {
  PROFILE: `${PREFIX}profile`,
  METRICS: `${PREFIX}metrics`,
  PREFERENCES: `${PREFIX}preferences`,
  WORKOUTS: `${PREFIX}workouts`,
  WORKOUT_LOGS: `${PREFIX}workout_logs`,
  MEALS: `${PREFIX}meals`,
  WATER_LOGS: `${PREFIX}water_logs`,
  NUTRITION_TARGETS: `${PREFIX}nutrition_targets`,
  GOALS: `${PREFIX}goals`,
  FAVORITE_EXERCISES: `${PREFIX}favorite_exercises`,
};

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}
