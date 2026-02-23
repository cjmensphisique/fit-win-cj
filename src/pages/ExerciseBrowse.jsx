import { useState, useEffect } from 'react';
import { Dumbbell, Search, X } from 'lucide-react';

import { API_URL as API } from '../api';

const MUSCLE_GROUPS = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Core', 'Legs', 'Glutes', 'Calves', 'Full Body', 'Cardio',
];

const DIFFICULTY_COLORS = {
  Beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  Intermediate: { color: '#ffc105', bg: 'rgba(255,193,5,0.1)' },
  Advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
};

function Badge({ color, bg, children }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

export default function ExerciseBrowse() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/exercises`)
      .then(r => r.json())
      .then(d => setExercises(Array.isArray(d) ? d : []))
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      (ex.muscleGroup || '').toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    return matchSearch && matchMuscle;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,193,5,0.12)', border: '1px solid rgba(255,193,5,0.2)' }}>
          <Dumbbell className="w-5 h-5" style={{ color: '#ffc105' }} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Exercise Library</h1>
          <p className="text-sm mt-0.5" style={{ color: '#ccc' }}>{exercises.length} exercises to explore · Tap any for details</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: '#141414', border: '1px solid #222' }}>
        <Search className="w-4 h-4 shrink-0" style={{ color: '#ccc' }} />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white outline-none"
        />
        {search && <button onClick={() => setSearch('')}><X className="w-4 h-4" style={{ color: '#ccc' }} /></button>}
      </div>

      {/* Muscle group chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
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

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#333', borderTopColor: '#ffc105' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Dumbbell className="w-10 h-10" style={{ color: '#333' }} />
          <p className="text-sm font-semibold text-white">
            {exercises.length === 0 ? 'No exercises yet — ask your coach!' : 'No exercises match your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(ex => {
            const diff = DIFFICULTY_COLORS[ex.difficulty] || DIFFICULTY_COLORS.Intermediate;
            return (
              <button
                key={ex.id}
                onClick={() => setSelected(ex)}
                className="text-left rounded-2xl p-4 relative transition-all group"
                style={{ background: '#141414', border: '1px solid #1e1e1e' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#ffc10530'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: diff.color }} />
                <p className="font-bold text-white text-sm mb-1">{ex.name}</p>
                <p className="text-xs mb-2" style={{ color: '#ffc105' }}>{ex.muscleGroup}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge color={diff.color} bg={diff.bg}>{ex.difficulty}</Badge>
                  <Badge color="#a78bfa" bg="rgba(167,139,250,0.1)">{ex.equipment}</Badge>
                </div>
                <div className="flex gap-3 text-xs" style={{ color: '#ccc' }}>
                  <span><span className="font-bold text-white">{ex.defaultSets}</span> sets</span>
                  <span><span className="font-bold text-white">{ex.defaultReps}</span> reps</span>
                  <span><span className="font-bold text-white">{ex.defaultRest}</span> rest</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #222' }}>
              <div>
                <p className="font-bold text-white">{selected.name}</p>
                <p className="text-xs" style={{ color: '#ffc105' }}>{selected.muscleGroup}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg" style={{ color: '#ccc' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const diff = DIFFICULTY_COLORS[selected.difficulty] || DIFFICULTY_COLORS.Intermediate;
                  return (
                    <>
                      <Badge color={diff.color} bg={diff.bg}>{selected.difficulty}</Badge>
                      <Badge color="#a78bfa" bg="rgba(167,139,250,0.1)">{selected.equipment}</Badge>
                    </>
                  );
                })()}
              </div>

              {/* Defaults */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Sets', val: selected.defaultSets },
                  { label: 'Reps', val: selected.defaultReps },
                  { label: 'Rest', val: selected.defaultRest },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid #222' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#ccc' }}>{item.label}</p>
                    <p className="font-black text-white text-lg">{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selected.description && (
                <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#ccc' }}>Instructions</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#bbb' }}>{selected.description}</p>
                </div>
              )}

              <button
                onClick={() => setSelected(null)}
                className="w-full py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#ffc105', color: '#111' }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
