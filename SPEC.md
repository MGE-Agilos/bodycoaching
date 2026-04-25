# Technical Specification: BodyCoaching

## Overview

BodyCoaching is a progressive web application designed to help triathletes manage their training journey comprehensively. The app enables athletes to track workouts, manage nutrition, set and monitor performance objectives, and visualize improvement over time—all entirely offline with instant loading. Built as a static Next.js 14 export deployable to GitHub Pages, it stores all user data locally in browser storage, requiring zero backend infrastructure.

## User Stories

- As an athlete, I can create a profile with my experience level and current fitness metrics so that the app can tailor recommendations to my capabilities.
- As a triathlon trainee, I can view a weekly training plan broken down by discipline (swimming, cycling, running) so that I know what to practice each day.
- As a user, I can log completed workouts with duration, distance, and perceived effort so that I can track my consistency.
- As an athlete, I can set SMART goals (e.g., "Complete 5km run in 25 minutes") so that I have measurable targets to work toward.
- As a coach-less athlete, I can receive adaptive exercise suggestions based on my fitness level and time availability so that my training remains challenging but achievable.
- As a health-conscious trainee, I can log daily meals and view macro/calorie summaries so that I can optimize nutrition alongside training.
- As a performance-focused user, I can view charts showing my progress across key metrics (pace, power, endurance) so that I can see improvement over weeks and months.
- As a mobile user, I can access my training plan and log workouts on my phone so that I can use the app during or immediately after training.
- As a returning user, I can sync my data across devices via local storage export/import so that I don't lose my training history.
- As a user, I can customize my weekly training hours and preferred disciplines so that the app respects my available time and interests.

## Pages & Routes

### 1. `/` – Landing / Dashboard
**Purpose:** Home page and primary hub after login.
**Key Components:**
- Navigation bar (persistent across all pages)
- Weekly training overview card (summary of scheduled workouts)
- Progress mini-charts (last 4 weeks of key metrics)
- Today's plan summary (scheduled workouts and meals)
- Quick-action buttons (Log Workout, Log Meal, View Goals)

**User Interactions:**
- Click navigation links to jump to other sections
- View week-at-a-glance snapshot
- Access quick-add forms for logging data

### 2. `/profile` – Athlete Profile & Settings
**Purpose:** Create and manage athlete profile, set preferences.
**Key Components:**
- Profile form (name, age, height, weight, experience level: beginner/intermediate/advanced)
- Current fitness metrics (resting heart rate, max heart rate, FTP for cycling, recent 5K time)
- Weekly training preferences (hours per week available, discipline focus: swim/bike/run distribution)
- Data management section (export/import localStorage JSON)
- Reset/clear data button

**User Interactions:**
- Fill profile form (saved to localStorage)
- Edit existing metrics
- Toggle training preferences
- Download data as JSON file
- Upload previously exported JSON file
- Clear all app data (with confirmation)

### 3. `/training` – Weekly Training Plan
**Purpose:** View, create, and manage the weekly training schedule.
**Key Components:**
- Week selector (previous/current/next week navigation)
- 7-day grid showing scheduled workouts (color-coded by discipline)
- Workout detail modal or drawer (opens on click)
  - Workout name, type, duration, target intensity/zone
  - Description and instructions
  - Edit/delete buttons
- "Generate Week" button (creates adaptive plan based on profile)
- Manual workout creator (for custom workouts)

**User Interactions:**
- Navigate weeks with arrows
- Click a day to view/edit scheduled workouts
- Generate adaptive weekly plan (algorithm considers experience level, available hours, recent completion rate)
- Add custom workouts to specific days
- Mark workouts as completed (status indicator)
- View estimated time commitment for the week

### 4. `/workouts` – Workout Logging & History
**Purpose:** Log completed workouts, view past performance.
**Key Components:**
- Quick-log form (discipline, duration, distance, avg pace/power, perceived effort 1-10, notes)
- Workout history table/list (sortable by date, discipline, metric)
- Detailed workout view (expandable row)
- Filter by discipline and date range
- Statistics summary (total distance, hours, workouts this month)

**User Interactions:**
- Fill quick-log form immediately after training
- Submit to add to history
- Click past workout to view details
- Edit/delete logged workouts
- Filter history by type and date
- View aggregate stats

### 5. `/nutrition` – Meal Logging & Nutrition Tracking
**Purpose:** Track daily food intake and macronutrient balance.
**Key Components:**
- Daily meal logger (breakfast, lunch, dinner, snacks)
- Meal search/database (simplified: ~100 common foods with pre-entered macros)
- Meal entry form (food name, quantity, macros if not in database)
- Daily summary (total calories, protein, carbs, fats, water intake)
- Nutrition chart/goal indicator (visual progress toward daily targets)
- Weekly nutrition overview (charts showing macro trends)
- Nutrition recommendations based on training volume

**User Interactions:**
- Select date (today or past days)
- Search food database
- Add food to meal
- Specify quantity (grams, pieces, cups)
- View automatically calculated macros
- Log water intake (manual entry)
- Review daily/weekly summaries
- Delete logged meals

### 6. `/goals` – Objectives & Progress Tracking
**Purpose:** Set, monitor, and celebrate performance goals.
**Key Components:**
- Goal creation form (SMART: specific, measurable, achievable, relevant, time-bound)
  - Goal name, description, category (speed, endurance, strength, technique)
  - Target metric and target value
  - Deadline (date)
  - Related discipline (swim/bike/run)
- Active goals list (progress bars showing movement toward target)
- Completed goals archive (historical achievements)
- Goal detail view (breakdown of progress, related workouts, trend chart)
- Goal suggestions based on profile (adaptive recommendations)

**User Interactions:**
- Create new goal with form validation
- View active goals with progress visualization
- Click goal to see detailed breakdown and related workouts
- Manually update goal progress (e.g., record that 5K PB was achieved)
- Archive completed goals
- View suggested goals based on recent performance

### 7. `/analytics` – Performance Insights & Charts
**Purpose:** Deep-dive analytics showing trends and patterns.
**Key Components:**
- Customizable date range selector
- Multiple chart views:
  - Running pace over time (trend chart)
  - Cycling power/speed over time
  - Swimming pace/distance over time
  - Weekly training volume (bar chart)
  - Intensity distribution (zone breakdown)
  - Total hours by discipline (pie chart)
- Stats cards (all-time max, personal records, streaks)
- Download report button (PNG/PDF export of charts)

**User Interactions:**
- Select date range
- Toggle between different metrics
- Hover chart for details
- View PB history
- Export charts or summary report

### 8. `/exercises` – Exercise Library & Suggestions
**Purpose:** Browse exercise catalog and receive personalized suggestions.
**Key Components:**
- Exercise category tabs (strength, conditioning, technique, core, mobility)
- Exercise cards showing:
  - Exercise name, image/description
  - Reps/duration recommendations
  - Discipline tags (swim/bike/run applicable)
  - Difficulty level
- Exercise detail modal (full description, video link if available, variations)
- "Suggest Today's Workout" button (AI-style recommendations based on training plan and profile)
- Favorites/saved exercises list

**User Interactions:**
- Browse exercise library
- Filter by category or discipline
- Click exercise for details and form tips
- Add exercises to "favorites"
- Receive personalized daily exercise suggestions
- Add suggested exercises to training plan

---

## Component Breakdown

### Navigation
**Purpose:** Persistent top navigation across all pages.
**Props:**
```typescript
interface NavProps {
  activeRoute: string;
}
```
**Behavior:**
- Displays logo, links to main sections (Dashboard, Training, Workouts, Nutrition, Goals, Analytics, Exercises, Profile)
- Hamburger menu on mobile (<768px)
- Sticky positioning at top
- Active link highlight

### WorkoutCard
**Purpose:** Display a single scheduled or logged workout.
**Props:**
```typescript
interface WorkoutCardProps {
  workout: Workout;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
}
```
**Behavior:**
- Shows workout type icon, name, duration, intensity
- Click to expand details
- Edit/delete context menu
- Completion checkbox
- Color-coded by discipline (blue=swim, green=bike, red=run)

### ProgressChart
**Purpose:** Render interactive line/bar charts for progress tracking.
**Props:**
```typescript
interface ProgressChartProps {
  data: Array<{ date: string; value: number }>;
  metric: string; // 'pace', 'power', 'distance', etc.
  unit: string;
  chartType: 'line' | 'bar';
}
```
**Behavior:**
- Uses Recharts library (lightweight, no external API calls)
- Responsive width
- Tooltip on hover
- Renders instantly from localStorage data

### GoalProgressBar
**Purpose:** Visual progress indicator for a single goal.
**Props:**
```typescript
interface GoalProgressBarProps {
  goal: Goal;
  currentProgress: number;
}
```
**Behavior:**
- Horizontal bar showing % toward target
- Color changes based on progress (red < 25%, yellow < 75%, green ≥ 75%)
- Percentage text overlay
- Deadline badge if < 2 weeks away

### NutritionSummary
**Purpose:** Display daily macro summary and targets.
**Props:**
```typescript
interface NutritionSummaryProps {
  date: string;
  meals: Meal[];
  targets: NutritionTargets;
}
```
**Behavior:**
- Four circular progress indicators (calories, protein, carbs, fats)
- Color-coded (green=within target, yellow=slight overage, red=significant overage)
- Click to drill into details
- Responsive stacking on mobile

### QuickLogForm
**Purpose:** Fast data entry modal/drawer for logging workouts or meals.
**Props:**
```typescript
interface QuickLogFormProps {
  type: 'workout' | 'meal';
  onSubmit: (data: WorkoutLog | Meal) => void;
  onCancel: () => void;
}
```
**Behavior:**
- Minimal fields to reduce friction
- Auto-focus first input
- Submit/Cancel buttons
- Keyboard shortcuts (Escape to cancel, Cmd/Ctrl+Enter to submit)
- Closes on successful submit

### StatCard
**Purpose:** Display a single metric or stat in a card format.
**Props:**
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
}
```
**Behavior:**
- Icon on left, label and large value on right
- Optional trend indicator (↑/↓ with percentage)
- Color trend (green=up if positive, red=down if negative)

---

## Data Model

### User Profile
```typescript
interface AthleteProfile {
  id: string; // UUID
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string; // ISO date
  updatedAt: string;
}

interface CurrentMetrics {
  restingHeartRate: number; // bpm
  maxHeartRate: number; // bpm
  ftp: number; // watts (for cycling)
  recentFiveKTime: number; // seconds
  swimPace: number; // seconds per 100m
  lastUpdated: string; // ISO date
}

interface TrainingPreferences {
  hoursPerWeek: number;
  disciplineDistribution: {
    swim: number; // 0-1 (percentage)
    bike: number;
    run: number;
  };
  preferredTrainingDays: string[]; // ['Monday', 'Tuesday', ...]
  restDays: string[];
}
```

### Workouts
```typescript
interface Workout {
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

interface WorkoutLog {
  id: string;
  workoutId?: string; // reference to scheduled workout
  discipline: 'swimming' | 'cycling' | 'running';
  date: string; // ISO date
  duration: number; // minutes
  distance: number; // km
  averagePace?: number; // min/km
  averagePower?: number; // watts (cycling)
  averageHeartRate?: number; // bpm
  perceiverdEffort: number; // 1-10 scale
  notes: string;
  createdAt: string;
}

interface WeeklyPlan {
  weekStart: string; // ISO date (Monday)
  workouts: Workout[];
  totalHours: number;
  estimatedIntensity: 'easy' | 'moderate' | 'hard';
}
```

### Nutrition
```typescript
interface Food {
  id: string;
  name: string;
  servingSize: number; // grams or standard unit
  servingUnit: string; // 'g', 'ml', 'piece', 'cup'
  calories: number;
  protein: number; // grams
  carbs: number;
  fats: number;
  fiber?: number;
  isCustom: boolean; // true if user-created
}

interface Meal {
  id: string;
  date: string; // ISO date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    foodId: string;
    quantity: number;
    unit: string;
  }>;
  createdAt: string;
}

interface DailyNutrition {
  date: string;
  meals: Meal[];
  waterIntakeL: number;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface NutritionTargets {
  dailyCalories: number;
  proteinPercent: number; // 0-1 (e.g., 0.25 = 25%)
  carbsPercent: number;
  fatsPercent: number;
  waterLitersPerDay: number;
}
```

### Goals
```typescript
interface Goal {
  id: string;
  name: string;
  description: string;
  category: 'speed' | 'endurance' | 'strength' | 'technique';
  discipline: 'swimming' | 'cycling' | 'running' | 'general';
  metric: string; // 'pace', 'power', 'distance', '5K time', etc.
  targetValue: number;
  currentValue: number;
  unit: string; // 'min/km', 'watts', 'km', 'minutes'
  deadline: string; // ISO date
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  completedAt?: string;
}
```

### App State (Global Store)
```typescript
interface AppState {
  profile: AthleteProfile | null;
  currentMetrics: CurrentMetrics | null;
  trainingPreferences: TrainingPreferences | null;
  workouts: Workout[];
  workoutLogs: WorkoutLog[];
  weeklyPlans: WeeklyPlan[];
  nutrition: DailyNutrition[];
  foods: Food[]; // includes built-in library + custom
  goals: Goal[];
  exercises: Exercise[];
  lastSyncedAt: string; // ISO date
}
```

### Exercise Library
```typescript
interface