'use client';

import { useState, useMemo } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import { EXERCISE_LIBRARY } from '../../data/exercises';
import { Exercise } from '../../types';
import { getDisciplineIcon } from '../../lib/utils';

export default function ExercisesPage() {
  return (
    <ClientLayout>
      <ExercisesContent />
    </ClientLayout>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  strength: '🏋️',
  conditioning: '⚡',
  technique: '🎯',
  core: '🔥',
  mobility: '🧘',
};

const CATEGORY_COLORS: Record<string, string> = {
  strength: 'bg-red-50 border-red-100 text-red-700',
  conditioning: 'bg-orange-50 border-orange-100 text-orange-700',
  technique: 'bg-blue-50 border-blue-100 text-blue-700',
  core: 'bg-yellow-50 border-yellow-100 text-yellow-700',
  mobility: 'bg-green-50 border-green-100 text-green-700',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'text-green-600 bg-green-50',
  intermediate: 'text-yellow-600 bg-yellow-50',
  advanced: 'text-red-600 bg-red-50',
};

function ExercisesContent() {
  const { favoriteExercises, toggleFavoriteExercise, trainingPreferences, profile, addWorkout } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const categories = ['all', 'strength', 'conditioning', 'technique', 'core', 'mobility'];
  const disciplines = ['all', 'swimming', 'cycling', 'running'];

  const filtered = useMemo(() => {
    return EXERCISE_LIBRARY.filter(ex => {
      if (selectedCategory !== 'all' && ex.category !== selectedCategory) return false;
      if (selectedDiscipline !== 'all' && !ex.disciplines.includes(selectedDiscipline as typeof ex.disciplines[0])) return false;
      if (searchQuery && !ex.name.toLowerCase().includes(searchQuery.toLowerCase()) && !ex.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (showFavoritesOnly && !favoriteExercises.includes(ex.id)) return false;
      return true;
    });
  }, [selectedCategory, selectedDiscipline, searchQuery, showFavoritesOnly, favoriteExercises]);

  // Suggest today's workout based on profile and recent activity
  const suggestedExercises = useMemo(() => {
    const prefs = trainingPreferences?.disciplineDistribution;
    const level = profile?.experienceLevel || 'beginner';
    if (!prefs) {
      // No prefs: pick 4 exercises at the user's level
      const atLevel = EXERCISE_LIBRARY.filter(ex => ex.difficulty === level);
      return atLevel.length >= 4 ? atLevel.slice(0, 4) : EXERCISE_LIBRARY.slice(0, 4);
    }
    const topDisc = prefs.swim > prefs.bike && prefs.swim > prefs.run ? 'swimming'
      : prefs.bike > prefs.run ? 'cycling' : 'running';
    // Try exact match first, then relax level, then relax discipline
    const exact = EXERCISE_LIBRARY.filter(ex => ex.disciplines.includes(topDisc as typeof ex.disciplines[0]) && ex.difficulty === level);
    if (exact.length >= 4) return exact.slice(0, 4);
    const anyLevel = EXERCISE_LIBRARY.filter(ex => ex.disciplines.includes(topDisc as typeof ex.disciplines[0]));
    if (anyLevel.length >= 4) return anyLevel.slice(0, 4);
    return EXERCISE_LIBRARY.filter(ex => ex.difficulty === level).slice(0, 4);
  }, [trainingPreferences, profile]);

  const handleAddToTraining = (exercise: Exercise) => {
    const today = new Date().toISOString().split('T')[0];
    addWorkout({
      name: exercise.name,
      discipline: exercise.disciplines[0] || 'running',
      description: exercise.description,
      scheduledDate: today,
      duration: exercise.duration || 30,
      intensity: exercise.difficulty === 'beginner' ? 'easy' : exercise.difficulty === 'intermediate' ? 'moderate' : 'hard',
      notes: `Sets: ${exercise.sets || '-'}, Reps: ${exercise.reps || '-'}`,
      status: 'scheduled',
    });
    setAddedMessage(`"${exercise.name}" added to today's training!`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Exercise Library</h1>

      {addedMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
          ✓ {addedMessage}
        </div>
      )}

      {/* Suggested Workout */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-4 mb-6 text-white shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-bold text-lg">⚡ Suggested Today</h2>
            <p className="text-sky-100 text-sm">Based on your training preferences</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {suggestedExercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="bg-white/10 hover:bg-white/20 rounded-lg p-2.5 text-left transition-colors"
            >
              <p className="text-xl mb-1">{CATEGORY_ICONS[ex.category]}</p>
              <p className="font-medium text-sm leading-tight">{ex.name}</p>
              <p className="text-sky-200 text-xs mt-0.5 capitalize">{ex.category}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-4">
        <input
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />

        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap capitalize ${selectedCategory === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                {cat === 'all' ? 'All' : (CATEGORY_ICONS[cat] || '') + ' ' + cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {disciplines.map(d => (
              <button key={d} onClick={() => setSelectedDiscipline(d)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${selectedDiscipline === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                {d === 'all' ? 'All' : getDisciplineIcon(d) + ' ' + d.substring(0, 4)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${showFavoritesOnly ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-200'}`}
          >
            ⭐ Favorites ({favoriteExercises.length})
          </button>
          <span className="text-xs text-gray-500">{filtered.length} exercises</span>
        </div>
      </div>

      {/* Exercise Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="text-4xl mb-3">🤸</div>
          <p className="text-gray-500">No exercises found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(ex => (
            <div key={ex.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedExercise(ex)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_ICONS[ex.category]}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{ex.name}</p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${CATEGORY_COLORS[ex.category]}`}>{ex.category}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${DIFFICULTY_COLOR[ex.difficulty]}`}>{ex.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavoriteExercise(ex.id); }}
                    className={`text-lg shrink-0 transition-transform hover:scale-110 ${favoriteExercises.includes(ex.id) ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}
                  >
                    ⭐
                  </button>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{ex.description}</p>

                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                  {ex.sets && <span>{ex.sets} sets</span>}
                  {ex.reps && <span>· {ex.reps}</span>}
                  {ex.duration && <span>· {ex.duration}min</span>}
                  <span className="ml-auto flex gap-1">
                    {ex.disciplines.map(d => (
                      <span key={d} title={d}>{getDisciplineIcon(d)}</span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelectedExercise(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{CATEGORY_ICONS[selectedExercise.category]}</span>
                  <h2 className="text-xl font-bold text-gray-900">{selectedExercise.name}</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${CATEGORY_COLORS[selectedExercise.category]}`}>{selectedExercise.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${DIFFICULTY_COLOR[selectedExercise.difficulty]}`}>{selectedExercise.difficulty}</span>
                  {selectedExercise.disciplines.map(d => (
                    <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{getDisciplineIcon(d)} {d}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => setSelectedExercise(null)} className="text-gray-400 hover:text-gray-600 text-xl shrink-0">✕</button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{selectedExercise.description}</p>

            {/* Quick specs */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {selectedExercise.sets && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">Sets</p>
                  <p className="font-bold text-gray-900">{selectedExercise.sets}</p>
                </div>
              )}
              {selectedExercise.reps && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">Reps</p>
                  <p className="font-bold text-gray-900">{selectedExercise.reps}</p>
                </div>
              )}
              {selectedExercise.duration && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-bold text-gray-900">{selectedExercise.duration}min</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">How to perform:</h3>
              <ol className="space-y-2">
                {selectedExercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-6 h-6 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleFavoriteExercise(selectedExercise.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${favoriteExercises.includes(selectedExercise.id) ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-300'}`}
              >
                {favoriteExercises.includes(selectedExercise.id) ? '⭐ Favorited' : '☆ Add to Favorites'}
              </button>
              <button
                onClick={() => { handleAddToTraining(selectedExercise); setSelectedExercise(null); }}
                className="flex-1 bg-sky-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                + Add to Today
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
