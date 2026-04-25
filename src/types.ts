export interface AthleteProfile {
  id: string;
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

export interface CurrentMetrics {
  restingHeartRate: number; // bpm
  maxHeartRate: number; // bpm
  ftp: number; // watts
  recentFiveKTime: number; // seconds
  swimPace: number; // seconds per 100m
  lastUpdated: string;
}

export interface TrainingPreferences {
  hoursPerWeek: number;
  disciplineDistribution: {
    swim: number; // 0-1
    bike: number;
    run: number;
  };
  preferredTrainingDays: string[];
  restDays: string[];
}

export interface Workout {
  id: string;
  name: string;
  discipline: 'swimming' | 'cycling' | 'running';
  description: string;
  scheduledDate: string; // ISO date
  duration: number; // minutes
  targetDistance?: number; // km
  intensity: 'easy' | 'moderate' | 'hard' | 'race';
  notes: string;
  status: 'scheduled' | 'completed' | 'skipped';
}

export interface WorkoutLog {
  id: string;
  workoutId?: string;
  discipline: 'swimming' | 'cycling' | 'running';
  date: string;
  duration: number; // minutes
  distance: number; // km
  averagePace?: number; // min/km
  averagePower?: number; // watts
  averageHeartRate?: number; // bpm
  perceivedEffort: number; // 1-10
  notes: string;
  createdAt: string;
}

export interface Food {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fats: number; // g
  fiber?: number;
  isCustom: boolean;
}

export interface MealFoodEntry {
  foodId: string;
  quantity: number;
  unit: string;
}

export interface Meal {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: MealFoodEntry[];
  createdAt: string;
}

export interface NutritionTargets {
  dailyCalories: number;
  proteinPercent: number; // 0-1
  carbsPercent: number;
  fatsPercent: number;
  waterLitersPerDay: number;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  category: 'speed' | 'endurance' | 'strength' | 'technique';
  discipline: 'swimming' | 'cycling' | 'running' | 'general';
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  completedAt?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'conditioning' | 'technique' | 'core' | 'mobility';
  disciplines: Array<'swimming' | 'cycling' | 'running'>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  duration?: number; // minutes
  reps?: string;
  sets?: number;
  instructions: string[];
}

export interface WaterLog {
  date: string;
  liters: number;
}
