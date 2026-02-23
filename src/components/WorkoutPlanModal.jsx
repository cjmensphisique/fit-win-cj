import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const emptyExercise = () => ({ id: Date.now().toString() + Math.random(), name: '', sets: '', reps: '', rest: '', notes: '' });

const emptySchedule = () => Object.fromEntries(DAYS.map(d => [d, []]));

export default function WorkoutPlanModal({ isOpen, onClose, onSave, plan, clients }) {
  const [form, setForm] = useState({ name: '', description: '', durationWeeks: 4, clientId: '', schedule: emptySchedule() });
  const [activeDay, setActiveDay] = useState('Monday');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name || '',
        description: plan.description || '',
        durationWeeks: plan.durationWeeks || 4,
        clientId: plan.clientId || '',
        schedule: plan.schedule || emptySchedule(),
      });
    } else {
      setForm({ name: '', description: '', durationWeeks: 4, clientId: '', schedule: emptySchedule() });
    }
    setActiveDay('Monday');
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, id: plan?.id });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const addExercise = () => {
    setForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [activeDay]: [...(prev.schedule[activeDay] || []), emptyExercise()],
      },
    }));
  };

  const updateExercise = (idx, field, value) => {
    setForm(prev => {
      const exercises = [...(prev.schedule[activeDay] || [])];
      exercises[idx] = { ...exercises[idx], [field]: value };
      return { ...prev, schedule: { ...prev.schedule, [activeDay]: exercises } };
    });
  };

  const removeExercise = (idx) => {
    setForm(prev => {
      const exercises = (prev.schedule[activeDay] || []).filter((_, i) => i !== idx);
      return { ...prev, schedule: { ...prev.schedule, [activeDay]: exercises } };
    });
  };

  const dayExercises = form.schedule[activeDay] || [];
  const totalExercises = Object.values(form.schedule).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div
        className="w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col"
        style={{ background: '#1a1a1a', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#ffc105' }}>
              <Dumbbell className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-lg font-bold text-white">{plan ? 'Edit Workout Plan' : 'Create Workout Plan'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {/* Plan Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Plan Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. 12-Week Hypertrophy Program"
                  className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Assign to Client</label>
                <select
                  value={form.clientId}
                  onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                >
                  <option value="">— Unassigned —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duration (weeks)</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={form.durationWeeks}
                  onChange={e => setForm(p => ({ ...p, durationWeeks: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description..."
                  className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Day Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400 uppercase tracking-wide">Weekly Schedule</label>
                <span className="text-xs text-gray-500">{totalExercises} exercises total</span>
              </div>
              <div className="flex gap-1 flex-wrap mb-4">
                {DAYS.map((day, i) => {
                  const count = (form.schedule[day] || []).length;
                  const active = activeDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDay(day)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative"
                      style={{
                        background: active ? '#ffc105' : count > 0 ? 'rgba(255,193,5,0.1)' : '#222',
                        color: active ? '#111' : count > 0 ? '#ffc105' : '#666',
                        border: active ? 'none' : count > 0 ? '1px solid rgba(255,193,5,0.3)' : '1px solid #333',
                      }}
                    >
                      {DAY_SHORT[i]}
                      {count > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                          style={{ background: active ? '#111' : '#ffc105', color: active ? '#ffc105' : '#111', fontSize: '9px' }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Exercises for active day */}
              <div className="space-y-3">
                {dayExercises.map((ex, idx) => (
                  <div key={ex.id} className="rounded-xl p-4 border border-gray-700" style={{ background: '#222' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-400">Exercise {idx + 1}</span>
                      <button type="button" onClick={() => removeExercise(idx)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Exercise name *"
                          value={ex.name}
                          onChange={e => updateExercise(idx, 'name', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Sets (e.g. 4)"
                          value={ex.sets}
                          onChange={e => updateExercise(idx, 'sets', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Reps (e.g. 8-12)"
                          value={ex.reps}
                          onChange={e => updateExercise(idx, 'reps', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Rest (e.g. 90s)"
                          value={ex.rest}
                          onChange={e => updateExercise(idx, 'rest', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={ex.notes}
                          onChange={e => updateExercise(idx, 'notes', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExercise}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-500 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Exercise to {activeDay}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-700 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#ffc105', color: '#111' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
            >
              {saving ? 'Saving…' : plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
