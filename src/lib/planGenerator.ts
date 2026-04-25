import { Workout, AthleteProfile, TrainingPreferences } from '../types';
import { generateId, toISODate } from './utils';

interface WorkoutTemplate {
  name: string;
  discipline: 'swimming' | 'cycling' | 'running';
  duration: number;
  intensity: 'easy' | 'moderate' | 'hard' | 'race';
  description: string;
  targetDistance?: number;
}

const BEGINNER: WorkoutTemplate[] = [
  { name: 'Easy Run', discipline: 'running', duration: 30, intensity: 'easy', description: 'Conversational pace run. Focus on maintaining consistent breathing. Run at a pace where you can speak in full sentences.', targetDistance: 4 },
  { name: 'Swim Technique', discipline: 'swimming', duration: 45, intensity: 'easy', description: 'Drill-focused session. Work on stroke mechanics and breathing rhythm. Include catch-up drill and bilateral breathing.', targetDistance: 1.5 },
  { name: 'Easy Bike Ride', discipline: 'cycling', duration: 45, intensity: 'easy', description: 'Steady endurance ride at comfortable pace. Focus on maintaining cadence 80-90 rpm. Stay in zones 1-2.', targetDistance: 15 },
  { name: 'Tempo Run', discipline: 'running', duration: 35, intensity: 'moderate', description: 'Comfortably hard pace for the full duration. You should be able to speak short phrases. Builds lactate threshold.', targetDistance: 5 },
  { name: 'Bike Endurance', discipline: 'cycling', duration: 60, intensity: 'moderate', description: 'Longer ride building aerobic base. Maintain steady power output. Include 2×10min at moderate effort.', targetDistance: 20 },
  { name: 'Swim Intervals', discipline: 'swimming', duration: 40, intensity: 'moderate', description: '8×50m at threshold pace with 30s rest. Focus on effort control and consistent splits.', targetDistance: 1.2 },
  { name: 'Long Run', discipline: 'running', duration: 50, intensity: 'easy', description: 'Long slow distance run. Build aerobic capacity and fat oxidation. Keep it very easy.', targetDistance: 7 },
  { name: 'Recovery Swim', discipline: 'swimming', duration: 30, intensity: 'easy', description: 'Very easy swim focused on technique. Low intensity, high quality. Great day after hard effort.', targetDistance: 1 },
  { name: 'Bike Hills', discipline: 'cycling', duration: 50, intensity: 'moderate', description: 'Find a hilly route and enjoy it! Great for building cycling power without high speed risk.', targetDistance: 18 },
];

const INTERMEDIATE: WorkoutTemplate[] = [
  { name: 'Interval Run', discipline: 'running', duration: 55, intensity: 'hard', description: '6×800m at 5K pace with 90s recovery jog. Builds speed and lactate threshold. Warm up 10min first.', targetDistance: 10 },
  { name: 'Swim Mixed Set', discipline: 'swimming', duration: 60, intensity: 'moderate', description: '400m warm up, 6×100m threshold with 20s rest, 4×50m sprint with 30s rest, 200m cool down.', targetDistance: 2.5 },
  { name: 'Sweet Spot Ride', discipline: 'cycling', duration: 75, intensity: 'hard', description: '3×15min at 88-93% FTP with 5min recovery. Core training stimulus for cycling fitness.', targetDistance: 35 },
  { name: 'Easy Recovery Run', discipline: 'running', duration: 40, intensity: 'easy', description: 'Very easy recovery run. Keeps legs moving after harder sessions without adding stress.', targetDistance: 6 },
  { name: 'Long Ride', discipline: 'cycling', duration: 120, intensity: 'easy', description: 'Build cycling endurance. Keep effort easy (65-75% FTP). Practice your race nutrition strategy.', targetDistance: 50 },
  { name: 'Threshold Swim', discipline: 'swimming', duration: 55, intensity: 'hard', description: '4×400m at T-pace with 60s rest. Key session for swim fitness. Maintain consistent split times.', targetDistance: 2.5 },
  { name: 'Long Run', discipline: 'running', duration: 75, intensity: 'easy', description: 'Weekly long run at easy aerobic pace. Builds aerobic capacity and mental toughness.', targetDistance: 12 },
  { name: 'Hill Repeats', discipline: 'running', duration: 50, intensity: 'hard', description: '8×200m hill sprints with walk-down recovery. Builds leg power and running economy.', targetDistance: 7 },
  { name: 'Open Water Swim', discipline: 'swimming', duration: 45, intensity: 'moderate', description: 'Sighting practice and race simulation in open water. Build confidence away from lane ropes.', targetDistance: 2 },
  { name: 'Tempo Ride', discipline: 'cycling', duration: 60, intensity: 'moderate', description: '40min continuous at tempo effort (76-87% FTP). Builds sustainable cycling power.', targetDistance: 25 },
];

const ADVANCED: WorkoutTemplate[] = [
  { name: 'Track Session', discipline: 'running', duration: 70, intensity: 'hard', description: '2×(4×400m at 5K pace) — 90s between reps, 5min between sets. Very high intensity. Warm up 15min.', targetDistance: 12 },
  { name: 'Swim Speed Set', discipline: 'swimming', duration: 75, intensity: 'hard', description: '400m warm up, 12×100m at T-pace with 15s rest, 8×25m sprint with 30s rest, 400m cool down.', targetDistance: 3.5 },
  { name: 'FTP Ride', discipline: 'cycling', duration: 90, intensity: 'race', description: '20min FTP test or 60min at FTP (100% power). Maximum sustainable effort. Key fitness benchmark.', targetDistance: 45 },
  { name: 'Recovery Swim', discipline: 'swimming', duration: 40, intensity: 'easy', description: 'Easy technique swim after hard days. Focus on stroke quality and mental refreshment.', targetDistance: 1.5 },
  { name: 'Epic Ride', discipline: 'cycling', duration: 180, intensity: 'easy', description: 'Long endurance ride. Spend time in the saddle, test race nutrition. Target zones 1-2.', targetDistance: 80 },
  { name: 'Race Pace Run', discipline: 'running', duration: 90, intensity: 'moderate', description: 'Sustained run at target triathlon run pace. Critical aerobic development session.', targetDistance: 18 },
  { name: 'VO2max Swim', discipline: 'swimming', duration: 70, intensity: 'hard', description: '10×100m on 2:00 interval. Go as fast as possible on each rep. The ultimate swim fitness test.', targetDistance: 3 },
  { name: 'Brick Workout', discipline: 'cycling', duration: 120, intensity: 'moderate', description: '90min bike at race pace + immediate 20min run. Critical for triathlon transition adaptation.', targetDistance: 50 },
  { name: 'Long Run (Race Sim)', discipline: 'running', duration: 110, intensity: 'moderate', description: 'Long run with middle section at race pace. Simulate the later stages of the triathlon run.', targetDistance: 20 },
  { name: 'Speed Endurance Swim', discipline: 'swimming', duration: 60, intensity: 'hard', description: '4×500m at threshold pace with 60s rest. Builds the aerobic capacity for a fast open water swim.', targetDistance: 2.8 },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function selectWeekWorkouts(templates: WorkoutTemplate[], targetMinutes: number, dist: { swim: number; bike: number; run: number }): WorkoutTemplate[] {
  const swimMin = Math.round(targetMinutes * dist.swim);
  const bikeMin = Math.round(targetMinutes * dist.bike);
  const runMin = Math.round(targetMinutes * dist.run);

  const pick = (pool: WorkoutTemplate[], budget: number): WorkoutTemplate[] => {
    const result: WorkoutTemplate[] = [];
    let used = 0;
    let idx = 0;
    while (used < budget - 20 && idx < pool.length * 3) {
      const t = pool[idx % pool.length];
      if (used + t.duration <= budget + 30) {
        result.push(t);
        used += t.duration;
      }
      idx++;
    }
    return result;
  };

  return [
    ...pick(templates.filter(t => t.discipline === 'swimming'), swimMin),
    ...pick(templates.filter(t => t.discipline === 'cycling'), bikeMin),
    ...pick(templates.filter(t => t.discipline === 'running'), runMin),
  ];
}

export function generateWeeklyPlan(weekStart: Date, profile: AthleteProfile, preferences: TrainingPreferences): Workout[] {
  const templates = profile.experienceLevel === 'beginner' ? BEGINNER
    : profile.experienceLevel === 'intermediate' ? INTERMEDIATE : ADVANCED;

  const targetMinutes = preferences.hoursPerWeek * 60;
  const selected = selectWeekWorkouts(templates, targetMinutes, preferences.disciplineDistribution);

  // Separate hard and easy for alternating pattern
  const hard = selected.filter(t => t.intensity === 'hard' || t.intensity === 'race');
  const easy = selected.filter(t => t.intensity === 'easy' || t.intensity === 'moderate');

  const ordered: WorkoutTemplate[] = [];
  let h = 0, e = 0;
  while (h < hard.length || e < easy.length) {
    if (e < easy.length) ordered.push(easy[e++]);
    if (h < hard.length) ordered.push(hard[h++]);
    if (e < easy.length) ordered.push(easy[e++]);
  }

  const preferredDays = preferences.preferredTrainingDays.length > 0
    ? preferences.preferredTrainingDays
    : ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const dayOffsets = preferredDays
    .map(d => DAYS.indexOf(d))
    .filter(i => i !== -1)
    .map(dayIdx => (dayIdx === 0 ? 6 : dayIdx - 1)) // convert to Mon=0 offsets
    .sort((a, b) => a - b);

  return ordered.slice(0, dayOffsets.length).map((template, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayOffsets[i]);
    return {
      id: generateId(),
      name: template.name,
      discipline: template.discipline,
      description: template.description,
      scheduledDate: toISODate(date),
      duration: template.duration,
      targetDistance: template.targetDistance,
      intensity: template.intensity,
      notes: '',
      status: 'scheduled' as const,
    };
  }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
}
