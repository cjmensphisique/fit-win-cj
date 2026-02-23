import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Apple, ChevronRight, Flame } from 'lucide-react';

import { API_URL as API } from '../api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };
const MEAL_COLORS = { breakfast: '#ffc105', lunch: '#4ade80', dinner: '#60a5fa', snacks: '#a78bfa' };

const TODAY_DAY = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

function macroTotal(items) {
  return ['protein', 'carbs', 'fat', 'calories'].reduce((acc, k) => {
    acc[k] = items.reduce((s, i) => s + (parseFloat(i[k]) || 0), 0);
    return acc;
  }, {});
}

function MacroBar({ label, val, max, color }) {
  const pct = Math.min((val / (max || 1)) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: '#bbb' }}>{label}</span>
        <span className="font-bold text-white">{Math.round(val)}g</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ClientMealPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(TODAY_DAY);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/api/meal-plans`)
      .then(r => r.json())
      .then(d => {
        const mine = Array.isArray(d) ? d.find(p => p.clientId === user.id) : null;
        setPlan(mine || null);
      })
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#333', borderTopColor: '#4ade80' }} />
    </div>
  );

  if (!plan) return (
    <div className="flex flex-col items-center py-24 gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.08)' }}>
        <Apple className="w-7 h-7" style={{ color: '#4ade80' }} />
      </div>
      <p className="font-bold text-white">No meal plan assigned yet</p>
      <p className="text-sm text-center" style={{ color: '#ccc', maxWidth: 260 }}>Your coach will assign a personalised nutrition plan soon. Check back later!</p>
    </div>
  );

  const daySchedule = plan.schedule?.[activeDay] || {};
  const dayAllItems = Object.values(daySchedule).flat();
  const dayTotals = macroTotal(dayAllItems);

  // Estimate macro targets based on goal
  const targets = {
    Bulk: { protein: 180, carbs: 350, fat: 70, calories: 2800 },
    Cut: { protein: 200, carbs: 150, fat: 60, calories: 1800 },
    Maintain: { protein: 160, carbs: 250, fat: 65, calories: 2200 },
    Recomp: { protein: 190, carbs: 200, fat: 65, calories: 2100 },
  };
  const target = targets[plan.goal] || targets['Maintain'];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: '#4ade80' }} />
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(74,222,128,0.1)' }}>
            <Apple className="w-5 h-5" style={{ color: '#4ade80' }} />
          </div>
          <div className="flex-1">
            <p className="font-black text-white text-lg">{plan.name}</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>{plan.goal}</span>
              <span className="text-xs" style={{ color: '#ccc' }}>Assigned by Coach CJ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily calorie + macro summary */}
      <div className="rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4" style={{ color: '#fb923c' }} />
          <span className="text-sm font-bold text-white">Today's Targets</span>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto font-bold" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>
            {Math.round(dayTotals.calories)} / {target.calories} kcal
          </span>
        </div>
        <div className="space-y-3">
          <MacroBar label="Protein" val={dayTotals.protein} max={target.protein} color="#ffc105" />
          <MacroBar label="Carbs"   val={dayTotals.carbs}   max={target.carbs}   color="#60a5fa" />
          <MacroBar label="Fat"     val={dayTotals.fat}     max={target.fat}     color="#a78bfa" />
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex overflow-x-auto gap-0 rounded-xl p-1" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        {DAYS.map(d => {
          const items = Object.values(plan.schedule?.[d] || {}).flat();
          const isToday = d === TODAY_DAY;
          const active = activeDay === d;
          return (
            <button key={d} onClick={() => setActiveDay(d)}
              className="flex-1 shrink-0 flex flex-col items-center py-2 rounded-lg text-xs font-bold transition-all relative"
              style={{
                background: active ? '#ffc105' : 'transparent',
                color: active ? '#111' : isToday ? '#ffc105' : '#555',
                minWidth: 40,
              }}>
              {d.slice(0, 3)}
              {items.length > 0 && (
                <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: active ? '#111' : '#4ade80' }} />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs -mt-2" style={{ color: '#ccc' }}>
        ● Today is <span className="text-white font-semibold">{TODAY_DAY}</span>
      </p>

      {/* Meals for active day */}
      <div className="space-y-3">
        {MEAL_TYPES.map(mealType => {
          const items = daySchedule[mealType] || [];
          const color = MEAL_COLORS[mealType];
          const totals = macroTotal(items);
          if (items.length === 0) return null;
          return (
            <div key={mealType} className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e1e1e' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="font-bold text-sm" style={{ color }}>{MEAL_LABELS[mealType]}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: '#ccc' }}>{Math.round(totals.calories)} kcal</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < items.length - 1 ? '1px solid #111' : 'none' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.food || '—'}</p>
                    {item.portion && <p className="text-xs mt-0.5" style={{ color: '#ccc' }}>{item.portion}</p>}
                  </div>
                  <div className="flex gap-3 text-xs" style={{ color: '#ccc' }}>
                    <span>P <span className="text-white font-bold">{item.protein || 0}g</span></span>
                    <span>C <span className="text-white font-bold">{item.carbs || 0}g</span></span>
                    <span>F <span className="text-white font-bold">{item.fat || 0}g</span></span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {dayAllItems.length === 0 && (
          <div className="text-center py-10 rounded-2xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <p className="text-sm font-semibold" style={{ color: '#ccc' }}>Rest day — no meals scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}
