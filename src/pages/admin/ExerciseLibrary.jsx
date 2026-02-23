import { useState, useEffect, useMemo } from 'react';
import {
  Dumbbell, Plus, Search, X, Edit2, Trash2,
  ChevronDown, Filter, BookOpen, Zap
} from 'lucide-react';

import { API_URL as API } from '../../api';

const MUSCLE_GROUPS = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Core', 'Legs', 'Glutes', 'Calves', 'Full Body', 'Cardio',
];

const EQUIPMENT_LIST = [
  'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight',
  'Kettlebell', 'Resistance Band', 'Smith Machine', 'Cardio Machine', 'Other',
];

const DIFFICULTY_COLORS = {
  Beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  Intermediate: { color: '#ffc105', bg: 'rgba(255,193,5,0.1)' },
  Advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
};

const EMPTY_FORM = {
  name: '', muscleGroup: 'Chest', equipment: 'Barbell',
  difficulty: 'Intermediate', description: '',
  defaultSets: 3, defaultReps: '8-12', defaultRest: '60s',
};

function Badge({ color, bg, children }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

function FormInput({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent px-3 py-2.5 rounded-xl text-sm text-white outline-none"
        style={{ border: '1px solid #2a2a2a', background: '#111' }}
        {...rest}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none appearance-none"
          style={{ border: '1px solid #2a2a2a', background: '#111' }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#ccc' }} />
      </div>
    </div>
  );
}

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/exercises`);
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch { setExercises([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    return matchSearch && matchMuscle;
  }), [exercises, search, muscleFilter]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (ex) => { setEditing(ex); setForm({ ...ex }); setShowForm(true); };

  const setField = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await fetch(`${API}/api/exercises/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API}/api/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      await load();
      setShowForm(false);
    } catch {}
    setSaving(false);
  };

  const del = async (id) => {
    await fetch(`${API}/api/exercises/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    await load();
  };

  const total = exercises.length;
  const groups = [...new Set(exercises.map(e => e.muscleGroup))].length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Exercise Library</h1>
          <p className="text-sm mt-0.5" style={{ color: '#ccc' }}>
            {total} exercises across {groups} muscle groups
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0"
          style={{ background: '#ffc105', color: '#111' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
        >
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>
      </div>

      {/* Search + Muscle Filter */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: '#141414', border: '1px solid #222' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: '#ccc' }} />
          <input
            type="text"
            placeholder="Search exercises or muscle group..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none"
            style={{ '::placeholder': { color: '#ccc' } }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="shrink-0">
              <X className="w-4 h-4" style={{ color: '#ccc' }} />
            </button>
          )}
        </div>

        {/* Muscle group chips — scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {MUSCLE_GROUPS.map(g => {
            const active = muscleFilter === g;
            return (
              <button
                key={g}
                onClick={() => setMuscleFilter(g)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: active ? '#ffc105' : '#1a1a1a',
                  color: active ? '#111' : '#777',
                  border: `1px solid ${active ? '#ffc105' : '#2a2a2a'}`,
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin" style={{ borderColor: '#333', borderTopColor: '#ffc105' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,193,5,0.08)' }}>
            <Dumbbell className="w-7 h-7" style={{ color: '#ffc105' }} />
          </div>
          <p className="font-semibold text-white text-sm">No exercises found</p>
          <p className="text-xs" style={{ color: '#ccc' }}>
            {search || muscleFilter !== 'All' ? 'Try adjusting your search or filters' : 'Add your first exercise'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(ex => {
            const diff = DIFFICULTY_COLORS[ex.difficulty] || DIFFICULTY_COLORS.Intermediate;
            return (
              <div
                key={ex.id}
                className="rounded-2xl p-4 relative transition-all group"
                style={{ background: '#141414', border: '1px solid #1e1e1e' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: diff.color }} />

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm leading-snug truncate">{ex.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#ffc105' }}>{ex.muscleGroup}</p>
                  </div>
                  {/* Actions — visible on hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(ex)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,193,5,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <Edit2 className="w-3.5 h-3.5" style={{ color: '#ffc105' }} />
                    </button>
                    <button
                      onClick={() => setDeleteId(ex.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge color={diff.color} bg={diff.bg}>{ex.difficulty}</Badge>
                  <Badge color="#a78bfa" bg="rgba(167,139,250,0.1)">{ex.equipment}</Badge>
                </div>

                {/* Defaults */}
                <div className="flex gap-3 text-xs" style={{ color: '#ccc' }}>
                  <span><span className="font-bold text-white">{ex.defaultSets}</span> sets</span>
                  <span><span className="font-bold text-white">{ex.defaultReps}</span> reps</span>
                  <span><span className="font-bold text-white">{ex.defaultRest}</span> rest</span>
                </div>

                {ex.description && (
                  <p className="text-xs mt-2.5 leading-relaxed line-clamp-2" style={{ color: '#ccc' }}>{ex.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Form Drawer ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{ background: '#161616', border: '1px solid #2a2a2a', maxHeight: '92vh' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #222' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,193,5,0.12)' }}>
                  <Dumbbell className="w-4 h-4" style={{ color: '#ffc105' }} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{editing ? 'Edit Exercise' : 'New Exercise'}</p>
                  <p className="text-xs" style={{ color: '#ccc' }}>
                    {editing ? `Editing "${editing.name}"` : 'Add to your library'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#ccc' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#222'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent'; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 130px)' }}>
              <FormInput label="Exercise Name *" value={form.name} onChange={setField('name')} placeholder="e.g. Incline Bench Press" />

              <div className="grid grid-cols-2 gap-3">
                <FormSelect label="Muscle Group" value={form.muscleGroup} onChange={setField('muscleGroup')} options={MUSCLE_GROUPS.filter(g => g !== 'All')} />
                <FormSelect label="Equipment" value={form.equipment} onChange={setField('equipment')} options={EQUIPMENT_LIST} />
              </div>

              <FormSelect label="Difficulty" value={form.difficulty} onChange={setField('difficulty')} options={['Beginner', 'Intermediate', 'Advanced']} />

              <div className="grid grid-cols-3 gap-3">
                <FormInput label="Default Sets" value={form.defaultSets} onChange={setField('defaultSets')} type="number" min={1} max={20} />
                <FormInput label="Default Reps" value={form.defaultReps} onChange={setField('defaultReps')} placeholder="8-12" />
                <FormInput label="Default Rest" value={form.defaultRest} onChange={setField('defaultRest')} placeholder="60s" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setField('description')(e.target.value)}
                  rows={3}
                  placeholder="Instructions, cues, form tips..."
                  className="w-full bg-transparent px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
                  style={{ border: '1px solid #2a2a2a', background: '#111' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #222' }}>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#ccc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#bbb'; }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: form.name.trim() ? '#ffc105' : '#333', color: form.name.trim() ? '#111' : '#666' }}
                onMouseEnter={e => { if (form.name.trim()) e.currentTarget.style.background = '#e6ad00'; }}
                onMouseLeave={e => { if (form.name.trim()) e.currentTarget.style.background = '#ffc105'; }}
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center space-y-4" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(248,113,113,0.1)' }}>
              <Trash2 className="w-6 h-6" style={{ color: '#f87171' }} />
            </div>
            <div>
              <p className="font-bold text-white">Delete Exercise?</p>
              <p className="text-sm mt-1" style={{ color: '#ccc' }}>This action cannot be undone.</p>
            </div>
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
