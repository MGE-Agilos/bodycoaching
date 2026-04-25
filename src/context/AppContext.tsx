'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AthleteProfile, CurrentMetrics, TrainingPreferences, Workout, WorkoutLog, Meal, NutritionTargets, Goal, WaterLog } from '../types';
import { loadFromStorage, saveToStorage, KEYS } from '../lib/storage';
import { generateId } from '../lib/utils';

const DEFAULT_NUTRITION_TARGETS: NutritionTargets = {
  dailyCalories: 2500,
  proteinPercent: 0.25,
  carbsPercent: 0.55,
  fatsPercent: 0.20,
  waterLitersPerDay: 3,
};

interface AppContextType {
  profile: AthleteProfile | null;
  currentMetrics: CurrentMetrics | null;
  trainingPreferences: TrainingPreferences | null;
  workouts: Workout[];
  workoutLogs: WorkoutLog[];
  meals: Meal[];
  waterLogs: WaterLog[];
  nutritionTargets: NutritionTargets;
  goals: Goal[];
  favoriteExercises: string[];

  saveProfile: (profile: AthleteProfile) => void;
  saveMetrics: (metrics: CurrentMetrics) => void;
  savePreferences: (prefs: TrainingPreferences) => void;

  addWorkout: (workout: Omit<Workout, 'id'>) => Workout;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  addWorkouts: (workouts: Omit<Workout, 'id'>[]) => void;
  replaceWeekWorkouts: (weekStart: string, workouts: Omit<Workout, 'id'>[]) => void;

  addWorkoutLog: (log: Omit<WorkoutLog, 'id' | 'createdAt'>) => WorkoutLog;
  updateWorkoutLog: (id: string, updates: Partial<WorkoutLog>) => void;
  deleteWorkoutLog: (id: string) => void;

  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => Meal;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;

  setWaterLog: (date: string, liters: number) => void;
  saveNutritionTargets: (targets: NutritionTargets) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  completeGoal: (id: string) => void;

  toggleFavoriteExercise: (exerciseId: string) => void;

  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics | null>(null);
  const [trainingPreferences, setTrainingPreferences] = useState<TrainingPreferences | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets>(DEFAULT_NUTRITION_TARGETS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(loadFromStorage<AthleteProfile | null>(KEYS.PROFILE, null));
    setCurrentMetrics(loadFromStorage<CurrentMetrics | null>(KEYS.METRICS, null));
    setTrainingPreferences(loadFromStorage<TrainingPreferences | null>(KEYS.PREFERENCES, null));
    setWorkouts(loadFromStorage<Workout[]>(KEYS.WORKOUTS, []));
    setWorkoutLogs(loadFromStorage<WorkoutLog[]>(KEYS.WORKOUT_LOGS, []));
    setMeals(loadFromStorage<Meal[]>(KEYS.MEALS, []));
    setWaterLogs(loadFromStorage<WaterLog[]>(KEYS.WATER_LOGS, []));
    setNutritionTargets(loadFromStorage<NutritionTargets>(KEYS.NUTRITION_TARGETS, DEFAULT_NUTRITION_TARGETS));
    setGoals(loadFromStorage<Goal[]>(KEYS.GOALS, []));
    setFavoriteExercises(loadFromStorage<string[]>(KEYS.FAVORITE_EXERCISES, []));
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) saveToStorage(KEYS.PROFILE, profile); }, [profile, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.METRICS, currentMetrics); }, [currentMetrics, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.PREFERENCES, trainingPreferences); }, [trainingPreferences, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.WORKOUTS, workouts); }, [workouts, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.WORKOUT_LOGS, workoutLogs); }, [workoutLogs, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.MEALS, meals); }, [meals, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.WATER_LOGS, waterLogs); }, [waterLogs, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.NUTRITION_TARGETS, nutritionTargets); }, [nutritionTargets, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.GOALS, goals); }, [goals, loaded]);
  useEffect(() => { if (loaded) saveToStorage(KEYS.FAVORITE_EXERCISES, favoriteExercises); }, [favoriteExercises, loaded]);

  const saveProfile = useCallback((p: AthleteProfile) => setProfile(p), []);
  const saveMetrics = useCallback((m: CurrentMetrics) => setCurrentMetrics(m), []);
  const savePreferences = useCallback((p: TrainingPreferences) => setTrainingPreferences(p), []);

  const addWorkout = useCallback((workout: Omit<Workout, 'id'>): Workout => {
    const w = { ...workout, id: generateId() };
    setWorkouts(prev => [...prev, w]);
    return w;
  }, []);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }, []);

  const addWorkouts = useCallback((ws: Omit<Workout, 'id'>[]) => {
    const newWorkouts = ws.map(w => ({ ...w, id: generateId() }));
    setWorkouts(prev => [...prev, ...newWorkouts]);
  }, []);

  const replaceWeekWorkouts = useCallback((weekStart: string, ws: Omit<Workout, 'id'>[]) => {
    const weekEnd = new Date(weekStart + 'T00:00:00');
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    setWorkouts(prev => {
      const kept = prev.filter(w => w.scheduledDate < weekStart || w.scheduledDate > weekEndStr);
      const newWorkouts = ws.map(w => ({ ...w, id: generateId() }));
      return [...kept, ...newWorkouts];
    });
  }, []);

  const addWorkoutLog = useCallback((log: Omit<WorkoutLog, 'id' | 'createdAt'>): WorkoutLog => {
    const l = { ...log, id: generateId(), createdAt: new Date().toISOString() };
    setWorkoutLogs(prev => [...prev, l]);
    return l;
  }, []);

  const updateWorkoutLog = useCallback((id: string, updates: Partial<WorkoutLog>) => {
    setWorkoutLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteWorkoutLog = useCallback((id: string) => {
    setWorkoutLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  const addMeal = useCallback((meal: Omit<Meal, 'id' | 'createdAt'>): Meal => {
    const m = { ...meal, id: generateId(), createdAt: new Date().toISOString() };
    setMeals(prev => [...prev, m]);
    return m;
  }, []);

  const updateMeal = useCallback((id: string, updates: Partial<Meal>) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  }, []);

  const setWaterLog = useCallback((date: string, liters: number) => {
    setWaterLogs(prev => {
      const idx = prev.findIndex(w => w.date === date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { date, liters };
        return updated;
      }
      return [...prev, { date, liters }];
    });
  }, []);

  const saveNutritionTargets = useCallback((t: NutritionTargets) => setNutritionTargets(t), []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>): Goal => {
    const g = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
    setGoals(prev => [...prev, g]);
    return g;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const completeGoal = useCallback((id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'completed', completedAt: new Date().toISOString() } : g));
  }, []);

  const toggleFavoriteExercise = useCallback((exerciseId: string) => {
    setFavoriteExercises(prev =>
      prev.includes(exerciseId) ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId]
    );
  }, []);

  const exportData = useCallback(() => JSON.stringify({
    profile, currentMetrics, trainingPreferences, workouts, workoutLogs,
    meals, waterLogs, nutritionTargets, goals, favoriteExercises,
    exportedAt: new Date().toISOString(),
  }, null, 2), [profile, currentMetrics, trainingPreferences, workouts, workoutLogs, meals, waterLogs, nutritionTargets, goals, favoriteExercises]);

  const importData = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.profile) setProfile(data.profile);
      if (data.currentMetrics) setCurrentMetrics(data.currentMetrics);
      if (data.trainingPreferences) setTrainingPreferences(data.trainingPreferences);
      if (data.workouts) setWorkouts(data.workouts);
      if (data.workoutLogs) setWorkoutLogs(data.workoutLogs);
      if (data.meals) setMeals(data.meals);
      if (data.waterLogs) setWaterLogs(data.waterLogs);
      if (data.nutritionTargets) setNutritionTargets(data.nutritionTargets);
      if (data.goals) setGoals(data.goals);
      if (data.favoriteExercises) setFavoriteExercises(data.favoriteExercises);
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setProfile(null); setCurrentMetrics(null); setTrainingPreferences(null);
    setWorkouts([]); setWorkoutLogs([]); setMeals([]); setWaterLogs([]);
    setNutritionTargets(DEFAULT_NUTRITION_TARGETS); setGoals([]); setFavoriteExercises([]);
  }, []);

  return (
    <AppContext.Provider value={{
      profile, currentMetrics, trainingPreferences, workouts, workoutLogs,
      meals, waterLogs, nutritionTargets, goals, favoriteExercises,
      saveProfile, saveMetrics, savePreferences,
      addWorkout, updateWorkout, deleteWorkout, addWorkouts, replaceWeekWorkouts,
      addWorkoutLog, updateWorkoutLog, deleteWorkoutLog,
      addMeal, updateMeal, deleteMeal,
      setWaterLog, saveNutritionTargets,
      addGoal, updateGoal, deleteGoal, completeGoal,
      toggleFavoriteExercise,
      exportData, importData, clearAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
