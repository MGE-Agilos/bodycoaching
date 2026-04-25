'use client';

import { useState, useMemo } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Meal, MealFoodEntry } from '../../types';
import { FOOD_DATABASE } from '../../data/foods';
import { getToday, formatDate } from '../../lib/utils';
import Link from 'next/link';
import { CircularProgress } from '../../components/SimpleChart';

export default function NutritionPage() {
  return (
    <ClientLayout>
      <NutritionContent />
    </ClientLayout>
  );
}

function calcMealNutrition(meal: Meal) {
  let cal = 0, prot = 0, carbs = 0, fats = 0;
  meal.foods.forEach(entry => {
    const food = FOOD_DATABASE.find(f => f.id === entry.foodId);
    if (!food) return;
    const ratio = entry.quantity / food.servingSize;
    cal += food.calories * ratio;
    prot += food.protein * ratio;
    carbs += food.carbs * ratio;
    fats += food.fats * ratio;
  });
  return { cal: Math.round(cal), prot: Math.round(prot), carbs: Math.round(carbs), fats: Math.round(fats) };
}

function NutritionContent() {
  const { meals, waterLogs, nutritionTargets, addMeal, deleteMeal, setWaterLog } = useApp();
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMealType, setNewMealType] = useState<Meal['mealType']>('breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState('');
  const [foodQty, setFoodQty] = useState('1');
  const [currentMealFoods, setCurrentMealFoods] = useState<MealFoodEntry[]>([]);
  const [waterInput, setWaterInput] = useState('');
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

  const dayMeals = meals.filter(m => m.date === selectedDate);
  const waterLog = waterLogs.find(w => w.date === selectedDate);
  const waterLiters = waterLog?.liters || 0;

  const dayTotals = useMemo(() => {
    return dayMeals.reduce((acc, meal) => {
      const n = calcMealNutrition(meal);
      return { cal: acc.cal + n.cal, prot: acc.prot + n.prot, carbs: acc.carbs + n.carbs, fats: acc.fats + n.fats };
    }, { cal: 0, prot: 0, carbs: 0, fats: 0 });
  }, [dayMeals]);

  const targets = {
    cal: nutritionTargets.dailyCalories,
    prot: Math.round(nutritionTargets.dailyCalories * nutritionTargets.proteinPercent / 4),
    carbs: Math.round(nutritionTargets.dailyCalories * nutritionTargets.carbsPercent / 4),
    fats: Math.round(nutritionTargets.dailyCalories * nutritionTargets.fatsPercent / 9),
  };

  const filteredFoods = FOOD_DATABASE.filter(f =>
    foodSearch.length < 2 ? false : f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const handleAddMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMealFoods.length === 0) { alert(t.nutrition.addFood); return; }
    addMeal({ date: selectedDate, mealType: newMealType, foods: currentMealFoods });
    setShowAddMeal(false); setCurrentMealFoods([]); setFoodSearch('');
  };

  const handleAddFoodToMeal = () => {
    if (!selectedFood) { return; }
    const food = FOOD_DATABASE.find(f => f.id === selectedFood);
    if (!food) return;
    setCurrentMealFoods(prev => [...prev, { foodId: selectedFood, quantity: Number(foodQty), unit: food.servingUnit }]);
    setSelectedFood(''); setFoodSearch(''); setFoodQty('1');
  };

  const removeFoodFromMeal = (idx: number) => setCurrentMealFoods(prev => prev.filter((_, i) => i !== idx));

  const handleWaterAdd = () => {
    const amount = Number(waterInput);
    if (!amount || amount <= 0) return;
    setWaterLog(selectedDate, Math.round((waterLiters + amount) * 10) / 10);
    setWaterInput('');
  };

  const MEAL_TYPES: Meal['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayMs = meals.filter(m => m.date === dateStr);
    const cal = dayMs.reduce((s, m) => s + calcMealNutrition(m).cal, 0);
    return { date: dateStr, day: d.toLocaleDateString('en-US', { weekday: 'short' }), cal };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t.nutrition.title}</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {(['daily', 'weekly'] as const).map(tabId => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === tabId ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
            {tabId === 'daily' ? `📅 ${t.nutrition.daily}` : `📊 ${t.nutrition.weekly}`}
          </button>
        ))}
      </div>

      {tab === 'daily' && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">{selectedDate === getToday() ? t.common.today : formatDate(selectedDate)}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{dayMeals.length} {t.nutrition.mealType.toLowerCase()}</span>
                <Link href="/profile" className="text-xs text-sky-600 hover:underline">Edit targets →</Link>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 justify-items-center">
              <CircularProgress value={targets.cal > 0 ? (dayTotals.cal / targets.cal) * 100 : 0} color="#F97316" label={t.nutrition.calories} unit="" current={dayTotals.cal} target={targets.cal} />
              <CircularProgress value={targets.prot > 0 ? (dayTotals.prot / targets.prot) * 100 : 0} color="#3B82F6" label={t.nutrition.protein} unit="g" current={dayTotals.prot} target={targets.prot} />
              <CircularProgress value={targets.carbs > 0 ? (dayTotals.carbs / targets.carbs) * 100 : 0} color="#10B981" label={t.nutrition.carbs} unit="g" current={dayTotals.carbs} target={targets.carbs} />
              <CircularProgress value={targets.fats > 0 ? (dayTotals.fats / targets.fats) * 100 : 0} color="#8B5CF6" label={t.nutrition.fats} unit="g" current={dayTotals.fats} target={targets.fats} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900">💧 {t.nutrition.waterIntake}</h2>
              <span className="text-sm font-medium text-blue-600">{waterLiters.toFixed(1)}L / {nutritionTargets.waterLitersPerDay}L</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${Math.min(100, (waterLiters / nutritionTargets.waterLitersPerDay) * 100)}%` }} />
            </div>
            <div className="flex gap-2">
              {[0.25, 0.5, 1].map(amt => (
                <button key={amt} onClick={() => setWaterLog(selectedDate, Math.round((waterLiters + amt) * 10) / 10)}
                  className="flex-1 bg-blue-50 text-blue-700 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                  +{amt}L
                </button>
              ))}
              <input type="number" value={waterInput} onChange={e => setWaterInput(e.target.value)} step="0.1" min="0" max="5"
                placeholder={t.nutrition.waterPlaceholder} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300" />
              <button onClick={handleWaterAdd} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">{t.nutrition.logWater}</button>
            </div>
          </div>

          <div className="space-y-3">
            {MEAL_TYPES.map(mealType => {
              const typeMeals = dayMeals.filter(m => m.mealType === mealType);
              const typeTotals = typeMeals.reduce((acc, m) => {
                const n = calcMealNutrition(m);
                return { cal: acc.cal + n.cal, prot: acc.prot + n.prot, carbs: acc.carbs + n.carbs, fats: acc.fats + n.fats };
              }, { cal: 0, prot: 0, carbs: 0, fats: 0 });

              return (
                <div key={mealType} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{MEAL_ICONS[mealType]}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{t.common.mealTypes[mealType]}</p>
                        {typeMeals.length > 0 && (
                          <p className="text-xs text-gray-500">{typeTotals.cal} kcal · {typeTotals.prot}g P · {typeTotals.carbs}g C · {typeTotals.fats}g F</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { setNewMealType(mealType); setCurrentMealFoods([]); setShowAddMeal(true); }}
                      className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-100 transition-colors"
                    >
                      + {t.nutrition.addFood}
                    </button>
                  </div>

                  {typeMeals.length > 0 && (
                    <div className="border-t border-gray-50 px-4 pb-3">
                      {typeMeals.map(meal => {
                        const n = calcMealNutrition(meal);
                        return (
                          <div key={meal.id} className="mt-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                {meal.foods.map((entry, idx) => {
                                  const food = FOOD_DATABASE.find(f => f.id === entry.foodId);
                                  return food ? (
                                    <div key={idx} className="flex items-center justify-between text-sm py-0.5">
                                      <span className="text-gray-700">{food.name}</span>
                                      <span className="text-gray-400 text-xs">{entry.quantity}{entry.unit}</span>
                                    </div>
                                  ) : null;
                                })}
                                <p className="text-xs text-gray-500 mt-1">{n.cal} kcal · {n.prot}g P · {n.carbs}g C · {n.fats}g F</p>
                              </div>
                              <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg shrink-0">🗑️</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'weekly' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">{t.nutrition.weeklyCalories}</h2>
            <div className="space-y-2">
              {last7.map(d => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8 shrink-0">{d.day}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${targets.cal > 0 ? Math.min(100, (d.cal / targets.cal) * 100) : 0}%`, minWidth: d.cal > 0 ? '2rem' : '0' }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-14 text-right ${d.date === selectedDate ? 'text-orange-600' : 'text-gray-600'}`}>{d.cal} kcal</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500 text-right">{t.nutrition.targets}: {targets.cal} kcal/day</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">{t.nutrition.weeklyTrend}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t.nutrition.calories, value: Math.round(last7.reduce((s, d) => s + d.cal, 0) / 7), unit: 'kcal', target: targets.cal },
                { label: t.nutrition.water, value: (waterLogs.filter(w => last7.some(d => d.date === w.date)).reduce((s, w) => s + w.liters, 0) / 7).toFixed(1), unit: 'L/day', target: nutritionTargets.waterLitersPerDay },
              ].map(({ label, value, unit, target }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
                  <p className="text-xs text-gray-400">{t.nutrition.targets}: {target} {unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowAddMeal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t.nutrition.addMeal} — {t.common.mealTypes[newMealType]}</h2>
              <button onClick={() => setShowAddMeal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.nutrition.foodSearch}</label>
              <input
                value={foodSearch} onChange={e => setFoodSearch(e.target.value)}
                placeholder={t.nutrition.foodSearch}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              {foodSearch.length >= 2 && filteredFoods.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">{t.nutrition.noFoodsFound}</p>
              )}
              {filteredFoods.length > 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {filteredFoods.slice(0, 10).map(food => (
                    <button key={food.id} type="button"
                      onClick={() => { setSelectedFood(food.id); setFoodSearch(food.name); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-sky-50 flex justify-between items-center ${selectedFood === food.id ? 'bg-sky-50 text-sky-800' : 'text-gray-700'}`}>
                      <span>{food.name}</span>
                      <span className="text-xs text-gray-400">{food.calories}kcal/{food.servingSize}{food.servingUnit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nutrition.quantity}</label>
                <input type="number" value={foodQty} onChange={e => setFoodQty(e.target.value)} min="0.1" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={handleAddFoodToMeal}
                  disabled={!selectedFood}
                  className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-40">
                  {t.nutrition.addSelectedFood}
                </button>
              </div>
            </div>

            {currentMealFoods.length > 0 && (
              <div className="mb-4 border border-gray-100 rounded-lg overflow-hidden">
                <p className="text-xs font-medium text-gray-500 px-3 py-2 bg-gray-50">{t.nutrition.mealFoods}</p>
                {currentMealFoods.map((entry, idx) => {
                  const food = FOOD_DATABASE.find(f => f.id === entry.foodId)!;
                  const cal = Math.round((food.calories * entry.quantity) / food.servingSize);
                  return (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 border-t border-gray-50">
                      <span className="text-sm text-gray-700">{food.name} ({entry.quantity}{entry.unit})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{cal} kcal</span>
                        <button onClick={() => removeFoodFromMeal(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleAddMealSubmit}>
              <button type="submit" disabled={currentMealFoods.length === 0}
                className="w-full bg-emerald-500 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-40">
                {t.nutrition.saveMeal} ({currentMealFoods.length})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
