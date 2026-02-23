import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Dumbbell, CheckCircle, Circle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ClientWorkoutPlan() {
  const { user } = useAuth();
  const { workoutPlans } = useData();
  const [activeDay, setActiveDay] = useState(() => {
    const dayIdx = new Date().getDay(); // 0=Sun
    return DAYS[dayIdx === 0 ? 6 : dayIdx - 1]; // map to Mon=0
  });
  const [completed, setCompleted] = useState({});

  const plan = workoutPlans.find(p => p.clientId === user.id);

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(255,193,5,0.1)' }}
        >
          <Dumbbell className="w-10 h-10" style={{ color: '#ffc105' }} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Workout Plan Yet</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Your coach hasn't assigned a workout plan yet. Check back soon or message your coach!
        </p>
      </div>
    );
  }

  const toggleExercise = (dayKey, exIdx) => {
    const key = `${dayKey}-${exIdx}`;
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const dayExercises = plan.schedule?.[activeDay] || [];
  const completedCount = dayExercises.filter((_, i) => completed[`${activeDay}-${i}`]).length;
  const activeDays = DAYS.filter(d => (plan.schedule?.[d] || []).length > 0);

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Plan Header */}
      <div
        className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a1a, #222)', border: '1px solid #333' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #ffc105, transparent)' }} />
        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#ffc105' }}>
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white">{plan.name}</h1>
            {plan.description && <p className="text-sm text-gray-400 mt-0.5">{plan.description}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
              <span>⏱ {plan.durationWeeks}w program</span>
              <span>💪 {Object.values(plan.schedule || {}).reduce((s, a) => s + a.length, 0)} exercises</span>
              <span>📅 {activeDays.length} days/week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, i) => {
          const exercises = plan.schedule?.[day] || [];
          const isActive = activeDay === day;
          const isToday = i === todayIndex;
          const hasExercises = exercises.length > 0;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className="flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-medium transition-all"
              style={{
                background: isActive ? '#ffc105' : hasExercises ? 'rgba(255,193,5,0.08)' : '#1a1a1a',
                color: isActive ? '#111' : hasExercises ? '#ffc105' : '#555',
                border: isActive ? '2px solid #ffc105' : hasExercises ? '1px solid rgba(255,193,5,0.25)' : '1px solid #2a2a2a',
              }}
            >
              <span className="font-bold text-xs">{DAY_SHORT[i]}</span>
              <span className="mt-0.5" style={{ fontSize: '10px', opacity: 0.75 }}>
                {exercises.length} ex
              </span>
              {/* TODAY indicator: a small dot below */}
              {isToday && (
                <span
                  className="w-1 h-1 rounded-full mt-1"
                  style={{ background: isActive ? '#111' : '#ffc105' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Today label shown separately below the tabs */}
      {(() => {
        const todayDay = DAYS[todayIndex];
        return (
          <p className="text-xs text-gray-600 -mt-3">
            <span style={{ color: '#ffc105' }}>●</span> Today is{' '}
            <span className="text-gray-400 font-medium">{todayDay}</span>
            {activeDay !== todayDay && (
              <button
                onClick={() => setActiveDay(todayDay)}
                className="ml-2 underline"
                style={{ color: '#ffc105' }}
              >
                Switch to today
              </button>
            )}
          </p>
        );
      })()}

      {/* Exercises */}
      {dayExercises.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 p-10 text-center" style={{ background: '#1a1a1a' }}>
          <p className="text-4xl mb-3">😴</p>
          <p className="text-gray-400 text-sm font-medium">Rest Day</p>
          <p className="text-gray-600 text-xs mt-1">No exercises scheduled for {activeDay}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">{activeDay}'s Workout</span>
            <span className="text-sm font-bold" style={{ color: '#ffc105' }}>
              {completedCount}/{dayExercises.length} done
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${dayExercises.length ? (completedCount / dayExercises.length) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #ffc105, #e6ad00)',
              }}
            />
          </div>

          {dayExercises.map((ex, idx) => {
            const key = `${activeDay}-${idx}`;
            const done = !!completed[key];
            return (
              <div
                key={idx}
                className="rounded-xl p-4 border transition-all"
                style={{
                  background: done ? 'rgba(34,197,94,0.05)' : '#1a1a1a',
                  borderColor: done ? 'rgba(34,197,94,0.3)' : '#2a2a2a',
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleExercise(activeDay, idx)}
                    className="mt-0.5 shrink-0 transition-all hover:scale-110"
                    style={{ color: done ? '#4ade80' : '#555' }}
                  >
                    {done ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${done ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {ex.name || `Exercise ${idx + 1}`}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ex.sets && (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(255,193,5,0.1)', color: '#ffc105' }}>
                          {ex.sets} sets
                        </span>
                      )}
                      {ex.reps && (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
                          {ex.reps} reps
                        </span>
                      )}
                      {ex.rest && (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>
                          {ex.rest} rest
                        </span>
                      )}
                    </div>
                    {ex.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">💡 {ex.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {completedCount === dayExercises.length && dayExercises.length > 0 && (
            <div
              className="rounded-xl p-4 text-center border"
              style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}
            >
              <p className="text-green-400 font-semibold">🎉 Workout Complete! Great job today!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
