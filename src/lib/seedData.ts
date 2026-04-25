import { AthleteProfile, CurrentMetrics, TrainingPreferences, Workout, WorkoutLog, Meal, NutritionTargets, Goal, WaterLog } from '../types';

function id(prefix: string, n: number | string) {
  return `${prefix}_demo_${n}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function getSeedData() {
  const today = new Date().toISOString().split('T')[0];

  const profile: AthleteProfile = {
    id: id('profile', 1),
    name: 'Alex Johnson',
    age: 32,
    height: 178,
    weight: 73,
    experienceLevel: 'intermediate',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(2),
  };

  const currentMetrics: CurrentMetrics = {
    restingHeartRate: 54,
    maxHeartRate: 183,
    ftp: 218,
    recentFiveKTime: 1680, // 28:00
    swimPace: 130,         // 2:10 per 100m
    lastUpdated: daysAgo(7),
  };

  const trainingPreferences: TrainingPreferences = {
    hoursPerWeek: 10,
    disciplineDistribution: { swim: 0.25, bike: 0.45, run: 0.30 },
    preferredTrainingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    restDays: ['Wednesday'],
  };

  // ── Workout Logs (past 5 weeks) ──────────────────────────────────
  const workoutLogs: WorkoutLog[] = [
    // Week -5
    { id: id('wl', 1), discipline: 'running', date: daysAgo(35), duration: 40, distance: 6.2, averagePace: 6.5, averageHeartRate: 148, perceivedEffort: 5, notes: 'Easy recovery run', createdAt: daysAgo(35) },
    { id: id('wl', 2), discipline: 'cycling', date: daysAgo(33), duration: 75, distance: 34, averagePower: 185, averageHeartRate: 155, perceivedEffort: 6, notes: 'Steady endurance ride', createdAt: daysAgo(33) },
    { id: id('wl', 3), discipline: 'swimming', date: daysAgo(32), duration: 45, distance: 1.6, averageHeartRate: 138, perceivedEffort: 5, notes: 'Technique focus', createdAt: daysAgo(32) },
    { id: id('wl', 4), discipline: 'running', date: daysAgo(31), duration: 55, distance: 8.5, averagePace: 6.4, averageHeartRate: 162, perceivedEffort: 7, notes: 'Tempo run, felt strong', createdAt: daysAgo(31) },
    // Week -4
    { id: id('wl', 5), discipline: 'cycling', date: daysAgo(28), duration: 90, distance: 42, averagePower: 192, averageHeartRate: 158, perceivedEffort: 7, notes: 'Sweet spot intervals', createdAt: daysAgo(28) },
    { id: id('wl', 6), discipline: 'swimming', date: daysAgo(26), duration: 55, distance: 2.1, averageHeartRate: 142, perceivedEffort: 6, notes: 'Threshold swim sets', createdAt: daysAgo(26) },
    { id: id('wl', 7), discipline: 'running', date: daysAgo(25), duration: 65, distance: 10.1, averagePace: 6.3, averageHeartRate: 158, perceivedEffort: 6, notes: 'Long run — great conditions', createdAt: daysAgo(25) },
    { id: id('wl', 8), discipline: 'cycling', date: daysAgo(24), duration: 60, distance: 26, averagePower: 198, averageHeartRate: 160, perceivedEffort: 6, notes: 'Tempo ride', createdAt: daysAgo(24) },
    // Week -3
    { id: id('wl', 9), discipline: 'running', date: daysAgo(21), duration: 50, distance: 7.8, averagePace: 6.2, averageHeartRate: 155, perceivedEffort: 6, notes: 'Interval session', createdAt: daysAgo(21) },
    { id: id('wl', 10), discipline: 'swimming', date: daysAgo(19), duration: 60, distance: 2.4, averageHeartRate: 145, perceivedEffort: 7, notes: 'Speed work', createdAt: daysAgo(19) },
    { id: id('wl', 11), discipline: 'cycling', date: daysAgo(18), duration: 100, distance: 48, averagePower: 204, averageHeartRate: 162, perceivedEffort: 7, notes: 'Long ride with hills', createdAt: daysAgo(18) },
    { id: id('wl', 12), discipline: 'running', date: daysAgo(17), duration: 70, distance: 11.2, averagePace: 6.1, averageHeartRate: 156, perceivedEffort: 6, notes: 'Weekly long run', createdAt: daysAgo(17) },
    // Week -2
    { id: id('wl', 13), discipline: 'cycling', date: daysAgo(14), duration: 75, distance: 36, averagePower: 208, averageHeartRate: 163, perceivedEffort: 7, notes: 'Hard interval day', createdAt: daysAgo(14) },
    { id: id('wl', 14), discipline: 'swimming', date: daysAgo(12), duration: 55, distance: 2.3, averageHeartRate: 148, perceivedEffort: 6, notes: 'Threshold sets', createdAt: daysAgo(12) },
    { id: id('wl', 15), discipline: 'running', date: daysAgo(11), duration: 55, distance: 8.8, averagePace: 6.0, averageHeartRate: 160, perceivedEffort: 7, notes: '5K time trial — 28:10', createdAt: daysAgo(11) },
    { id: id('wl', 16), discipline: 'cycling', date: daysAgo(10), duration: 110, distance: 52, averagePower: 212, averageHeartRate: 160, perceivedEffort: 7, notes: 'Epic Saturday ride', createdAt: daysAgo(10) },
    // Week -1 (current)
    { id: id('wl', 17), discipline: 'running', date: daysAgo(7), duration: 45, distance: 7.2, averagePace: 5.9, averageHeartRate: 156, perceivedEffort: 6, notes: 'Feeling good', createdAt: daysAgo(7) },
    { id: id('wl', 18), discipline: 'swimming', date: daysAgo(5), duration: 60, distance: 2.5, averageHeartRate: 146, perceivedEffort: 6, notes: 'Mixed set', createdAt: daysAgo(5) },
    { id: id('wl', 19), discipline: 'cycling', date: daysAgo(4), duration: 80, distance: 38, averagePower: 215, averageHeartRate: 161, perceivedEffort: 7, notes: 'FTP intervals', createdAt: daysAgo(4) },
    { id: id('wl', 20), discipline: 'running', date: daysAgo(3), duration: 75, distance: 12.4, averagePace: 5.8, averageHeartRate: 155, perceivedEffort: 6, notes: 'Best long run this block!', createdAt: daysAgo(3) },
    { id: id('wl', 21), discipline: 'running', date: daysAgo(1), duration: 45, distance: 7.5, averagePace: 5.7, averageHeartRate: 158, perceivedEffort: 7, notes: 'Pushing the pace', createdAt: daysAgo(1) },
  ];

  // ── Scheduled Workouts (this week + next 3 days) ─────────────────
  const workouts: Workout[] = [
    {
      id: id('w', 1), name: 'Easy Recovery Run', discipline: 'running',
      description: 'Easy aerobic run at conversational pace. Focus on form and breathing.', scheduledDate: daysAgo(6),
      duration: 40, targetDistance: 6, intensity: 'easy', notes: '', status: 'completed',
    },
    {
      id: id('w', 2), name: 'Swim Technique', discipline: 'swimming',
      description: 'Drill-focused session. Work on catch-up drill and bilateral breathing.', scheduledDate: daysAgo(4),
      duration: 45, targetDistance: 1.8, intensity: 'easy', notes: '', status: 'completed',
    },
    {
      id: id('w', 3), name: 'Sweet Spot Ride', discipline: 'cycling',
      description: '3×15min at 88-93% FTP with 5min recovery. Core training session.', scheduledDate: daysAgo(3),
      duration: 80, targetDistance: 38, intensity: 'hard', notes: '', status: 'completed',
    },
    {
      id: id('w', 4), name: 'Long Run', discipline: 'running',
      description: 'Weekly long run at easy aerobic pace. Builds aerobic base.', scheduledDate: daysAgo(2),
      duration: 75, targetDistance: 12, intensity: 'easy', notes: '', status: 'completed',
    },
    {
      id: id('w', 5), name: 'Threshold Swim', discipline: 'swimming',
      description: '4×400m at T-pace with 60s rest. Key swim fitness session.', scheduledDate: daysAgo(1),
      duration: 55, targetDistance: 2.4, intensity: 'hard', notes: '', status: 'completed',
    },
    {
      id: id('w', 6), name: 'Interval Run', discipline: 'running',
      description: '6×800m at 5K pace with 90s recovery. Warm up 10min first.', scheduledDate: today,
      duration: 55, targetDistance: 10, intensity: 'hard', notes: '', status: 'scheduled',
    },
    {
      id: id('w', 7), name: 'Long Endurance Ride', discipline: 'cycling',
      description: 'Build cycling endurance. Keep effort easy (65-75% FTP). Practice race nutrition.', scheduledDate: daysAgo(-1),
      duration: 120, targetDistance: 55, intensity: 'easy', notes: '', status: 'scheduled',
    },
    {
      id: id('w', 8), name: 'Easy Swim', discipline: 'swimming',
      description: 'Recovery swim with technique focus. Very easy effort.', scheduledDate: daysAgo(-2),
      duration: 40, targetDistance: 1.5, intensity: 'easy', notes: '', status: 'scheduled',
    },
  ];

  // ── Goals ─────────────────────────────────────────────────────────
  const goals: Goal[] = [
    {
      id: id('g', 1), name: 'Run 5K under 27 minutes',
      description: 'Break the 27-minute barrier for a 5K run — currently at 28:10', category: 'speed',
      discipline: 'running', metric: '5K time', targetValue: 27, currentValue: 28.2, unit: 'min',
      deadline: daysAgo(-60), status: 'active', createdAt: daysAgo(45),
    },
    {
      id: id('g', 2), name: 'Complete a Sprint Triathlon',
      description: 'Finish a 750m swim, 20km bike, 5km run event', category: 'endurance',
      discipline: 'general', metric: 'events completed', targetValue: 1, currentValue: 0, unit: 'events',
      deadline: daysAgo(-90), status: 'active', createdAt: daysAgo(90),
    },
    {
      id: id('g', 3), name: 'Cycle 80km in a day',
      description: 'Build up to an 80km single ride — currently at 52km longest', category: 'endurance',
      discipline: 'cycling', metric: 'longest ride distance', targetValue: 80, currentValue: 52, unit: 'km',
      deadline: daysAgo(-45), status: 'active', createdAt: daysAgo(30),
    },
    {
      id: id('g', 4), name: 'Swim 2km non-stop',
      description: 'Build swim endurance to complete 2000m without stopping', category: 'endurance',
      discipline: 'swimming', metric: 'non-stop swim distance', targetValue: 2, currentValue: 1.6, unit: 'km',
      deadline: daysAgo(-30), status: 'active', createdAt: daysAgo(20),
    },
    {
      id: id('g', 5), name: 'Train 5x per week for 4 weeks',
      description: 'Build consistent training habit with 5 sessions per week', category: 'endurance',
      discipline: 'general', metric: 'weeks completed', targetValue: 4, currentValue: 4, unit: 'weeks',
      deadline: daysAgo(-7), status: 'completed', completedAt: daysAgo(3), createdAt: daysAgo(40),
    },
  ];

  // ── Meals ─────────────────────────────────────────────────────────
  const meals: Meal[] = [
    {
      id: id('m', 1), date: today, mealType: 'breakfast',
      foods: [
        { foodId: 'f21', quantity: 80, unit: 'g' },
        { foodId: 'f30', quantity: 1, unit: 'g' },
        { foodId: 'f08', quantity: 150, unit: 'g' },
      ],
      createdAt: today,
    },
    {
      id: id('m', 2), date: today, mealType: 'lunch',
      foods: [
        { foodId: 'f01', quantity: 150, unit: 'g' },
        { foodId: 'f22', quantity: 180, unit: 'g' },
        { foodId: 'f42', quantity: 15, unit: 'ml' },
      ],
      createdAt: today,
    },
    {
      id: id('m', 3), date: today, mealType: 'snack',
      foods: [
        { foodId: 'f20', quantity: 30, unit: 'g' },
        { foodId: 'f30', quantity: 1, unit: 'g' },
      ],
      createdAt: today,
    },
    {
      id: id('m', 4), date: daysAgo(1), mealType: 'breakfast',
      foods: [
        { foodId: 'f05', quantity: 3, unit: 'piece' },
        { foodId: 'f25', quantity: 2, unit: 'g' },
        { foodId: 'f41', quantity: 50, unit: 'g' },
      ],
      createdAt: daysAgo(1),
    },
    {
      id: id('m', 5), date: daysAgo(1), mealType: 'lunch',
      foods: [
        { foodId: 'f03', quantity: 150, unit: 'g' },
        { foodId: 'f29', quantity: 150, unit: 'g' },
      ],
      createdAt: daysAgo(1),
    },
    {
      id: id('m', 6), date: daysAgo(1), mealType: 'dinner',
      foods: [
        { foodId: 'f24', quantity: 200, unit: 'g' },
        { foodId: 'f01', quantity: 120, unit: 'g' },
      ],
      createdAt: daysAgo(1),
    },
    {
      id: id('m', 7), date: daysAgo(2), mealType: 'breakfast',
      foods: [
        { foodId: 'f21', quantity: 80, unit: 'g' },
        { foodId: 'f33', quantity: 80, unit: 'g' },
      ],
      createdAt: daysAgo(2),
    },
    {
      id: id('m', 8), date: daysAgo(2), mealType: 'lunch',
      foods: [
        { foodId: 'f11', quantity: 150, unit: 'g' },
        { foodId: 'f27', quantity: 150, unit: 'g' },
      ],
      createdAt: daysAgo(2),
    },
    {
      id: id('m', 9), date: daysAgo(2), mealType: 'snack',
      foods: [
        { foodId: 'f37', quantity: 40, unit: 'g' },
      ],
      createdAt: daysAgo(2),
    },
  ];

  const waterLogs: WaterLog[] = [
    { date: today, liters: 1.5 },
    { date: daysAgo(1), liters: 2.8 },
    { date: daysAgo(2), liters: 3.1 },
    { date: daysAgo(3), liters: 2.6 },
    { date: daysAgo(4), liters: 3.2 },
    { date: daysAgo(5), liters: 2.4 },
    { date: daysAgo(6), liters: 2.9 },
  ];

  const nutritionTargets: NutritionTargets = {
    dailyCalories: 2700,
    proteinPercent: 0.30,
    carbsPercent: 0.50,
    fatsPercent: 0.20,
    waterLitersPerDay: 3.0,
  };

  return { profile, currentMetrics, trainingPreferences, workouts, workoutLogs, meals, waterLogs, nutritionTargets, goals };
}
