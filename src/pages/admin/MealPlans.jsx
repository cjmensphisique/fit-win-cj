import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Apple, Plus, Trash2, Edit2, X, ChevronDown, Users, Save
} from 'lucide-react';

const API = 'http://localhost:3001';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };
const MEAL_COLORS = { breakfast: '#ffc105', lunch: '#4ade80', dinner: '#60a5fa', snacks: '#a78bfa' };

const GOALS = ['Bulk', 'Cut', 'Maintain', 'Recomp'];

function emptyDay() {
  return { breakfast: [], lunch: [], dinner: [], snacks: [] };
}
function emptySchedule() {
  return Object.fromEntries(DAYS.map(d => [d, emptyDay()]));
}
function emptyItem() {
  return { food: '', portion: '', protein: '', carbs: '', fat: '', calories: '' };
}

function macroTotal(items) {
  return ['protein', 'carbs', 'fat', 'calories'].reduce((acc, k) => {
    acc[k] = items.reduce((s, i) => s + (parseFloat(i[k]) || 0), 0);
    return acc;
  }, {});
}

function MacroPill({ label, val, color }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
      {label}: {Math.round(val)}
    </span>
  );
}

export default function MealPlans() {
  const { data } = useData();
  const clients = data?.clients || [];
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('Monday');

  // form state
  const [form, setForm] = useState({ name: '', clientId: '', goal: 'Maintain', schedule: emptySchedule() });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    try {
      const r = await fetch(`${API}/api/meal-plans`);
      const d = await r.json();
      setPlans(Array.isArray(d) ? d : []);
    } catch { setPlans([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', clientId: clients[0]?.id || '', goal: 'Maintain', schedule: emptySchedule() });
    setTab('Monday');
    setErrors({});
    setSubmitted(false);
    setShowForm(true);
  };
  const openEdit = (plan) => {
    setEditing(plan);
    setForm({ ...plan, schedule: plan.schedule || emptySchedule() });
    setTab('Monday');
    setErrors({});
    setSubmitted(false);
    setShowForm(true);
  };

  const setF = k => v => {
    setForm(f => ({ ...f, [k]: v }));
    // Clear error for this field as user types
    if (submitted) setErrors(e => ({ ...e, [k]: undefined }));
  };

  // Add food item to a meal slot
  const addItem = (day, mealType) => {
    setForm(f => {
      const sched = { ...f.schedule };
      sched[day] = { ...sched[day] };
      sched[day][mealType] = [...(sched[day][mealType] || []), emptyItem()];
      return { ...f, schedule: sched };
    });
  };

  const setItem = (day, mealType, idx, key, val) => {
    setForm(f => {
      const sched = JSON.parse(JSON.stringify(f.schedule));
      sched[day][mealType][idx][key] = val;
      return { ...f, schedule: sched };
    });
  };

  const removeItem = (day, mealType, idx) => {
    setForm(f => {
      const sched = JSON.parse(JSON.stringify(f.schedule));
      sched[day][mealType].splice(idx, 1);
      return { ...f, schedule: sched };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Plan name is required';
    if (!form.clientId) e.clientId = 'Please select a client';
    return e;
  };

  const save = async () => {
    setSubmitted(true);
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      await fetch(`${API}/api/meal-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      });
      // Notify client
      if (!editing && form.clientId) {
        await fetch(`${API}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: form.clientId,
            message: `A new meal plan "${form.name}" has been assigned to you!`,
            type: 'success', icon: 'nutrition',
          }),
        });
      }
      await load();
      setShowForm(false);
    } catch {}
    setSaving(false);
  };

  const del = async (id) => {
    await fetch(`${API}/api/meal-plans/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    await load();
  };

  const clientName = (id) => clients.find(c => c.id === id)?.name || 'Unknown';

  const dayTotals = (daySchedule) => {
    if (!daySchedule) return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    const allItems = Object.values(daySchedule).flat();
    return macroTotal(allItems);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <Apple className="w-5 h-5" style={{ color: '#4ade80' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Meal Plans</h1>
            <p className="text-sm mt-0.5" style={{ color: '#ccc' }}>{plans.length} plans created</p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0"
          style={{ background: '#4ade80', color: '#111' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* Plan cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#333', borderTopColor: '#4ade80' }} />
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <Apple className="w-10 h-10" style={{ color: '#333' }} />
          <p className="font-semibold text-white text-sm">No meal plans yet</p>
          <p className="text-xs" style={{ color: '#ccc' }}>Click "Create Plan" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map(plan => {
            const client = clients.find(c => c.id === plan.clientId);
            return (
              <div key={plan.id} className="rounded-2xl p-5 relative group transition-all"
                style={{ background: '#141414', border: '1px solid #1e1e1e' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: '#4ade80' }} />
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-bold text-white">{plan.name}</p>
                    <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: '#ccc' }}>
                      <Users className="w-3 h-3" /> {client?.name || '—'}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}><Edit2 className="w-3.5 h-3.5" style={{ color: '#ffc105' }} /></button>
                    <button onClick={() => setDeleteId(plan.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}><Trash2 className="w-3.5 h-3.5" style={{ color: '#f87171' }} /></button>
                  </div>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-3"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>{plan.goal}</span>
                {/* Day summary */}
                <div className="flex flex-wrap gap-1">
                  {DAYS.map(d => {
                    const items = Object.values(plan.schedule?.[d] || {}).flat();
                    return (
                      <div key={d} className="text-xs px-1.5 py-0.5 rounded" style={{ background: items.length > 0 ? 'rgba(74,222,128,0.12)' : '#111', color: items.length > 0 ? '#4ade80' : '#333' }}>
                        {d.slice(0, 3)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-0 sm:px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full sm:max-w-2xl rounded-b-none sm:rounded-2xl flex flex-col overflow-hidden" style={{ background: '#161616', border: '1px solid #2a2a2a', maxHeight: '96vh' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #222' }}>
              <p className="font-bold text-white">{editing ? 'Edit Meal Plan' : 'Create Meal Plan'}</p>
              <button onClick={() => setShowForm(false)} style={{ color: '#ccc' }}><X className="w-4 h-4" /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Plan Name */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: errors.name ? '#f87171' : '#bbb' }}>Plan Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setF('name')(e.target.value)}
                    placeholder="e.g. Lean Bulk Program"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                    style={{
                      border: `1px solid ${errors.name ? '#f87171' : '#2a2a2a'}`,
                      background: errors.name ? 'rgba(248,113,113,0.05)' : '#111',
                      boxShadow: errors.name ? '0 0 0 2px rgba(248,113,113,0.15)' : 'none',
                    }}
                  />
                  {errors.name && <p className="text-xs font-medium" style={{ color: '#f87171' }}>⚠ {errors.name}</p>}
                </div>
                {/* Client */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: errors.clientId ? '#f87171' : '#bbb' }}>Client *</label>
                  <div className="relative">
                    <select
                      value={form.clientId}
                      onChange={e => setF('clientId')(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none appearance-none transition-all"
                      style={{
                        border: `1px solid ${errors.clientId ? '#f87171' : '#2a2a2a'}`,
                        background: errors.clientId ? 'rgba(248,113,113,0.05)' : '#111',
                        boxShadow: errors.clientId ? '0 0 0 2px rgba(248,113,113,0.15)' : 'none',
                      }}
                    >
                      <option value="">Select client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#ccc' }} />
                  </div>
                  {errors.clientId && <p className="text-xs font-medium" style={{ color: '#f87171' }}>⚠ {errors.clientId}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Goal</label>
                  <div className="relative">
                    <select value={form.goal} onChange={e => setF('goal')(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none appearance-none" style={{ border: '1px solid #2a2a2a', background: '#111' }}>
                      {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#ccc' }} />
                  </div>
                </div>
              </div>

              {/* Day tabs */}
              <div>
                <div className="flex overflow-x-auto gap-0" style={{ borderBottom: '1px solid #222' }}>
                  {DAYS.map(d => {
                    const hasItems = Object.values(form.schedule?.[d] || {}).flat().length > 0;
                    return (
                      <button key={d} onClick={() => setTab(d)}
                        className="shrink-0 px-3 py-2 text-xs font-bold transition-all"
                        style={{
                          color: tab === d ? '#4ade80' : '#555',
                          borderBottom: tab === d ? '2px solid #4ade80' : '2px solid transparent',
                          background: 'transparent',
                        }}
                      >
                        {d.slice(0, 3)}{hasItems && <span className="ml-1 w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Meal slots for selected day */}
                <div className="mt-4 space-y-4">
                  {MEAL_TYPES.map(mealType => {
                    const color = MEAL_COLORS[mealType];
                    const items = form.schedule?.[tab]?.[mealType] || [];
                    const totals = macroTotal(items);
                    return (
                      <div key={mealType} className="rounded-xl overflow-hidden" style={{ border: '1px solid #222' }}>
                        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#111', borderBottom: items.length > 0 ? '1px solid #1e1e1e' : 'none' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                            <p className="text-sm font-bold" style={{ color }}>{MEAL_LABELS[mealType]}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {items.length > 0 && (
                              <div className="flex gap-2 text-xs" style={{ color: '#ccc' }}>
                                <span>{Math.round(totals.calories)} kcal</span>
                                <span>P:{Math.round(totals.protein)}g</span>
                              </div>
                            )}
                            <button onClick={() => addItem(tab, mealType)}
                              className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-all"
                              style={{ background: `${color}15`, color }}>
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          </div>
                        </div>
                        {items.map((item, idx) => (
                          <div key={idx} className="px-4 py-3 flex flex-wrap gap-2 items-center" style={{ borderBottom: '1px solid #141414' }}>
                            <input value={item.food} onChange={e => setItem(tab, mealType, idx, 'food', e.target.value)}
                              placeholder="Food item" className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                              style={{ border: '1px solid #2a2a2a', background: '#0d0d0d' }} />
                            <input value={item.portion} onChange={e => setItem(tab, mealType, idx, 'portion', e.target.value)}
                              placeholder="Portion" className="w-20 px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                              style={{ border: '1px solid #2a2a2a', background: '#0d0d0d' }} />
                            {[['protein', 'P g'], ['carbs', 'C g'], ['fat', 'F g'], ['calories', 'kcal']].map(([k, ph]) => (
                              <input key={k} type="number" value={item[k]} onChange={e => setItem(tab, mealType, idx, k, e.target.value)}
                                placeholder={ph} className="w-16 px-2 py-1.5 rounded-lg text-xs text-white outline-none text-center"
                                style={{ border: '1px solid #2a2a2a', background: '#0d0d0d' }} />
                            ))}
                            <button onClick={() => removeItem(tab, mealType, idx)} style={{ color: '#bbb' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                              onMouseLeave={e => e.currentTarget.style.color = '#444'}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 shrink-0" style={{ borderTop: '1px solid #222' }}>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a' }}>Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#4ade80', color: '#111' }}>
                <Save className="w-4 h-4" />{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center space-y-4" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="font-bold text-white">Delete this meal plan?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a' }}>Cancel</button>
              <button onClick={() => del(deleteId)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#f87171', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
