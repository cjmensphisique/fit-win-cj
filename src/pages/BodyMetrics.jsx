import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Scale, Plus, Trash2, TrendingUp, TrendingDown,
  ChevronDown, X, Ruler, Zap
} from 'lucide-react';

import { API_URL as API } from '../api';

const FIELDS = [
  { key: 'weight',  label: 'Weight',    unit: 'kg',  color: '#ffc105' },
  { key: 'bodyFat', label: 'Body Fat',  unit: '%',   color: '#f87171' },
  { key: 'chest',   label: 'Chest',     unit: 'cm',  color: '#60a5fa' },
  { key: 'waist',   label: 'Waist',     unit: 'cm',  color: '#4ade80' },
  { key: 'hips',    label: 'Hips',      unit: 'cm',  color: '#a78bfa' },
];

// Minimal SVG line chart
function TrendChart({ data, field, color }) {
  if (data.length < 2) return null;
  const values = data.map(d => parseFloat(d[field] || 0)).filter(v => !isNaN(v));
  if (values.length < 2) return null;

  const W = 300, H = 80, PAD = 10;
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((v - min) / range) * (H - 2 * PAD);
    return `${x},${y}`;
  });
  const points = pts.join(' ');
  const first = values[0], last = values[values.length - 1];
  const delta = last - first;
  const trend = delta === 0 ? '=' : delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ccc' }}>
          {FIELDS.find(f => f.key === field)?.label} Trend
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
          {trend} {FIELDS.find(f => f.key === field)?.unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id={`grad-${field}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`${PAD},${H - PAD} ${pts.join(' ')} ${W - PAD},${H - PAD}`}
          fill={`url(#grad-${field})`}
        />
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Last dot */}
        {(() => { const [lx, ly] = pts[pts.length - 1].split(','); return <circle cx={lx} cy={ly} r="4" fill={color} />; })()}
      </svg>
    </div>
  );
}

export default function BodyMetrics({ clientId: propClientId }) {
  const { user } = useAuth();
  const clientId = propClientId || user?.id;

  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', chest: '', waist: '', hips: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [chartField, setChartField] = useState('weight');
  const [deleteId, setDeleteId] = useState(null);

  const isAdmin = user?.role === 'admin';

  const load = async () => {
    if (!clientId) return;
    try {
      const r = await fetch(`${API}/api/metrics/${clientId}`);
      const d = await r.json();
      setMetrics(Array.isArray(d) ? d : []);
    } catch { setMetrics([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const setField = k => v => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.date) return;
    setSaving(true);
    try {
      await fetch(`${API}/api/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, clientId }),
      });
      await load();
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', chest: '', waist: '', hips: '', notes: '' });
    } catch {}
    setSaving(false);
  };

  const del = async (id) => {
    await fetch(`${API}/api/metrics/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    await load();
  };

  const latest = metrics[metrics.length - 1];
  const prev   = metrics[metrics.length - 2];

  const delta = (key) => {
    if (!latest || !prev || !latest[key] || !prev[key]) return null;
    return (parseFloat(latest[key]) - parseFloat(prev[key])).toFixed(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,193,5,0.12)', border: '1px solid rgba(255,193,5,0.2)' }}>
            <Scale className="w-5 h-5" style={{ color: '#ffc105' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Body Metrics</h1>
            <p className="text-sm mt-0.5" style={{ color: '#ccc' }}>{metrics.length} entries logged</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0"
          style={{ background: '#ffc105', color: '#111' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
        >
          <Plus className="w-4 h-4" />
          Log Metrics
        </button>
      </div>

      {/* AI Insight Banner */}
      {metrics.length >= 2 && !isAdmin && (
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
             <Zap className="w-5 h-5 text-indigo-400" />
           </div>
           <div>
             <h3 className="text-white font-bold mb-1 flex items-center gap-2">AI Metric Insight <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">Beta</span></h3>
             <p className="text-[#aaa] text-sm leading-relaxed">
               {parseFloat(delta('weight')) < 0 
                 ? `Great job! Your weight has dropped by ${Math.abs(parseFloat(delta('weight')))}kg since your last log. Your body fat trends are also moving in the right direction. Keep prioritizing protein! 🥩`
                 : parseFloat(delta('weight')) > 0 
                   ? `You've gained ${parseFloat(delta('weight'))}kg since your last log. If hypertrophy is your goal, you are on track! If you're cutting, consider adjusting your daily caloric intake.`
                   : `Your weight is holding steady at ${latest?.weight}kg. Consistency is key, keep up your routine!`}
             </p>
           </div>
        </div>
      )}

      {/* Latest stats row */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {FIELDS.map(f => {
            const val = latest[f.key];
            const d = delta(f.key);
            if (!val) return null;
            const up = d !== null && parseFloat(d) > 0;
            const down = d !== null && parseFloat(d) < 0;
            return (
              <div key={f.key} className="rounded-2xl p-4 relative" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: f.color }} />
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#ccc' }}>{f.label}</p>
                <p className="text-2xl font-black text-white">{val}<span className="text-sm font-normal ml-1" style={{ color: '#ccc' }}>{f.unit}</span></p>
                {d !== null && (
                  <div className="flex items-center gap-1 mt-1">
                    {up ? <TrendingUp className="w-3 h-3" style={{ color: '#f87171' }} /> : down ? <TrendingDown className="w-3 h-3" style={{ color: '#4ade80' }} /> : null}
                    <span className="text-xs font-semibold" style={{ color: up ? '#f87171' : down ? '#4ade80' : '#666' }}>
                      {d > 0 ? `+${d}` : d} {f.unit}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {metrics.length >= 2 && (
        <div className="rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          {/* Field selector */}
          <div className="flex gap-2 flex-wrap mb-4">
            {FIELDS.filter(f => metrics.some(m => m[f.key])).map(f => (
              <button
                key={f.key}
                onClick={() => setChartField(f.key)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: chartField === f.key ? f.color : '#1a1a1a',
                  color: chartField === f.key ? '#111' : '#777',
                  border: `1px solid ${chartField === f.key ? f.color : '#2a2a2a'}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <TrendChart
            data={metrics}
            field={chartField}
            color={FIELDS.find(f => f.key === chartField)?.color || '#ffc105'}
          />
        </div>
      )}

      {/* History table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#333', borderTopColor: '#ffc105' }} />
        </div>
      ) : metrics.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <Ruler className="w-10 h-10" style={{ color: '#333' }} />
          <p className="font-semibold text-white text-sm">No metrics logged yet</p>
          <p className="text-xs" style={{ color: '#ccc' }}>Click "Log Metrics" to start tracking</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid #1e1e1e' }}>
            <p className="text-sm font-bold text-white">History</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                  {['Date', 'Weight', 'Body Fat', 'Chest', 'Waist', 'Hips', 'Notes', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider" style={{ color: '#ccc' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...metrics].reverse().map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #111' }}>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{m.date}</td>
                    <td className="px-4 py-3 text-white">{m.weight ? `${m.weight} kg` : '—'}</td>
                    <td className="px-4 py-3 text-white">{m.bodyFat ? `${m.bodyFat}%` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#aaa' }}>{m.chest ? `${m.chest} cm` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#aaa' }}>{m.waist ? `${m.waist} cm` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#aaa' }}>{m.hips ? `${m.hips} cm` : '—'}</td>
                    <td className="px-4 py-3 max-w-[120px] truncate" style={{ color: '#ccc' }}>{m.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: '#bbb' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#444'; }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl" style={{ background: '#161616', border: '1px solid #2a2a2a', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #222' }}>
              <p className="font-bold text-white">Log Metrics</p>
              <button onClick={() => setShowForm(false)} style={{ color: '#ccc' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Date</label>
                <input type="date" value={form.date} onChange={e => setField('date')(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ border: '1px solid #2a2a2a', background: '#111' }} />
              </div>
              {/* Numeric Fields */}
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>{f.label} <span style={{ color: '#ccc' }}>({f.unit})</span></label>
                    <input type="number" step="0.1" value={form[f.key]} onChange={e => setField(f.key)(e.target.value)}
                      placeholder="—"
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ border: '1px solid #2a2a2a', background: '#111' }} />
                  </div>
                ))}
              </div>
              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Notes</label>
                <input type="text" value={form.notes} onChange={e => setField('notes')(e.target.value)}
                  placeholder="e.g. Post-workout, morning fasted..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ border: '1px solid #2a2a2a', background: '#111' }} />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #222' }}>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a' }}>Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#ffc105', color: '#111' }}>
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center space-y-4" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="font-bold text-white">Delete this entry?</p>
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
