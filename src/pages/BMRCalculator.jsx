import { useState } from 'react';
import {
  Calculator, User, Users, Activity, Flame,
  Scale, Ruler, ChevronRight, RotateCcw, Info
} from 'lucide-react';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', sub: 'Little or no exercise', multiplier: 1.2 },
  { label: 'Lightly Active', sub: '1–3 days/week', multiplier: 1.375 },
  { label: 'Moderately Active', sub: '3–5 days/week', multiplier: 1.55 },
  { label: 'Very Active', sub: '6–7 days/week', multiplier: 1.725 },
  { label: 'Super Active', sub: 'Physical job or 2x/day', multiplier: 1.9 },
];

const BMI_BANDS = [
  { max: 18.5, label: 'Underweight', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  { max: 25,   label: 'Normal',      color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  { max: 30,   label: 'Overweight',  color: '#ffc105', bg: 'rgba(255,193,5,0.12)'  },
  { max: 999,  label: 'Obese',       color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
];

function getBMIBand(bmi) {
  return BMI_BANDS.find(b => bmi < b.max) || BMI_BANDS[BMI_BANDS.length - 1];
}

function InputField({ label, value, onChange, unit, min, max, step = 1, icon: Icon, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {hint && (
          <span className="text-xs normal-case font-normal" style={{ color: '#ccc' }}>({hint})</span>
        )}
      </label>
      <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a', background: '#111' }}>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent px-4 py-3 text-white text-base font-semibold outline-none"
          style={{ minWidth: 0 }}
        />
        <span
          className="px-3 py-3 text-xs font-bold border-l shrink-0"
          style={{ borderColor: '#2a2a2a', color: '#ffc105', background: 'rgba(255,193,5,0.06)' }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

function ResultCard({ label, value, sub, color, bg, icon: Icon, large }) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all"
      style={{ background: bg || '#141414', border: `1px solid ${color}30` }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ccc' }}>{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
        )}
      </div>
      <p className={`font-black text-white leading-none ${large ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1.5" style={{ color }}>{sub}</p>}
    </div>
  );
}

export default function BMRCalculator() {
  const [gender, setGender] = useState('male');
  const [form, setForm] = useState({ weight: '', height: '', age: '' });
  const [activity, setActivity] = useState(ACTIVITY_LEVELS[1]);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const set = (field) => (val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.weight || form.weight <= 0 || form.weight > 300) e.weight = 'Enter weight between 1–300 kg';
    if (!form.height || form.height <= 0 || form.height > 280) e.height = 'Enter height between 1–280 cm';
    if (!form.age || form.age < 10 || form.age > 120)           e.age    = 'Enter age between 10–120';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const calculate = () => {
    if (!validate()) return;

    const w = parseFloat(form.weight);
    const h = parseFloat(form.height);
    const a = parseFloat(form.age);

    // BMR — Mifflin-St Jeor
    const bmr = gender === 'male'
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161;

    // BMI
    const hm = h / 100;
    const bmi = w / (hm * hm);

    // TDEE
    const tdee = bmr * activity.multiplier;

    setResult({ bmr, bmi, tdee });
  };

  const reset = () => {
    setForm({ weight: '', height: '', age: '' });
    setResult(null);
    setErrors({});
    setActivity(ACTIVITY_LEVELS[1]);
    setGender('male');
  };

  const bmiBand = result ? getBMIBand(result.bmi) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,193,5,0.12)', border: '1px solid rgba(255,193,5,0.2)' }}
        >
          <Calculator className="w-5 h-5" style={{ color: '#ffc105' }} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">BMR &amp; BMI Calculator</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#ccc' }}>
            Calculate your Basal Metabolic Rate and Body Mass Index instantly
          </p>
        </div>
      </div>

      {/* Formula Info Banner */}
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'rgba(255,193,5,0.05)', border: '1px solid rgba(255,193,5,0.12)' }}
      >
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#ffc105' }} />
        <div className="text-xs leading-relaxed" style={{ color: '#bbb' }}>
          <span className="font-semibold text-white">Mifflin-St Jeor Equation: </span>
          <span className="font-medium" style={{ color: '#ffc105' }}>Male</span>
          <span> — BMR = (10 × kg) + (6.25 × cm) − (5 × age) + 5 &nbsp;|&nbsp; </span>
          <span className="font-medium" style={{ color: '#a78bfa' }}>Female</span>
          <span> — BMR = (10 × kg) + (6.25 × cm) − (5 × age) − 161</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>

        {/* Gender Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid #1e1e1e' }}>
          {[
            { key: 'male',   label: 'Male',   icon: User,  accent: '#60a5fa' },
            { key: 'female', label: 'Female', icon: Users, accent: '#a78bfa' },
          ].map(g => {
            const active = gender === g.key;
            return (
              <button
                key={g.key}
                onClick={() => { setGender(g.key); setResult(null); }}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 text-sm font-bold transition-all"
                style={{
                  background: active ? `${g.accent}10` : 'transparent',
                  color: active ? g.accent : '#555',
                  borderBottom: active ? `2px solid ${g.accent}` : '2px solid transparent',
                }}
              >
                <g.icon className="w-4 h-4" />
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <InputField
                label="Weight"
                value={form.weight}
                onChange={set('weight')}
                unit="kg"
                min={1} max={300}
                icon={Scale}
              />
              {errors.weight && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.weight}</p>}
            </div>
            <div>
              <InputField
                label="Height"
                value={form.height}
                onChange={set('height')}
                unit="cm"
                min={1} max={280}
                icon={Ruler}
              />
              {errors.height && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.height}</p>}
            </div>
            <div>
              <InputField
                label="Age"
                value={form.age}
                onChange={set('age')}
                unit="yrs"
                min={10} max={120}
                icon={Activity}
                hint="10–120"
              />
              {errors.age && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.age}</p>}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#bbb' }}>
              Activity Level <span className="normal-case font-normal" style={{ color: '#ccc' }}>(for daily calorie burn)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {ACTIVITY_LEVELS.map(lvl => {
                const active = activity.label === lvl.label;
                return (
                  <button
                    key={lvl.label}
                    onClick={() => setActivity(lvl)}
                    className="flex flex-col items-start sm:items-center sm:text-center px-3 py-2.5 rounded-xl text-left sm:text-center transition-all"
                    style={{
                      background: active ? 'rgba(255,193,5,0.1)' : '#111',
                      border: `1px solid ${active ? '#ffc105' : '#222'}`,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: active ? '#ffc105' : '#aaa' }}>
                      {lvl.label}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: '#ccc', fontSize: '10px' }}>
                      {lvl.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={calculate}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: '#ffc105', color: '#111' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
            >
              <Calculator className="w-4 h-4" />
              Calculate
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#ccc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#bbb'; }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      {result && (
        <div className="space-y-4 animate-fadeIn">

          {/* Thin divider with label */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: '#1e1e1e' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ffc105' }}>Your Results</span>
            <div className="h-px flex-1" style={{ background: '#1e1e1e' }} />
          </div>

          {/* BMR — hero card */}
          <div
            className="rounded-2xl p-6 sm:p-8 relative overflow-hidden text-center"
            style={{ background: '#0d0d0d', border: '1px solid #222' }}
          >
            {/* Yellow glow */}
            <div
              className="absolute"
              style={{
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(255,193,5,0.08) 0%, transparent 70%)',
                top: '-100px', left: '50%', transform: 'translateX(-50%)',
                borderRadius: '50%',
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #ffc105, transparent)' }} />

            <div className="relative">
              <div
                className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(255,193,5,0.1)', color: '#ffc105', border: '1px solid rgba(255,193,5,0.2)' }}
              >
                <Flame className="w-3 h-3" />
                Basal Metabolic Rate
              </div>
              <p className="text-6xl sm:text-7xl font-black text-white leading-none">
                {Math.round(result.bmr)}
              </p>
              <p className="text-sm font-semibold mt-2" style={{ color: '#bbb' }}>
                calories / day at complete rest
              </p>
              <p className="text-xs mt-1" style={{ color: '#ccc' }}>
                This is the minimum calories your body needs to maintain basic functions.
              </p>
            </div>
          </div>

          {/* Secondary results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* BMI */}
            <ResultCard
              label="Body Mass Index"
              value={result.bmi.toFixed(1)}
              sub={bmiBand.label}
              color={bmiBand.color}
              bg={bmiBand.bg}
              icon={Scale}
            />
            {/* TDEE */}
            <ResultCard
              label="Daily Calorie Burn"
              value={Math.round(result.tdee).toLocaleString()}
              sub={`TDEE — ${activity.label}`}
              color="#fb923c"
              bg="rgba(251,146,60,0.06)"
              icon={Activity}
            />
            {/* BMI Gauge */}
            <div
              className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
              style={{ background: '#141414', border: '1px solid #1e1e1e' }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: '#a78bfa' }} />
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#ccc' }}>BMI Scale</p>
              {/* Segmented bar */}
              <div className="flex rounded-full overflow-hidden h-3 gap-0.5 mb-2">
                {BMI_BANDS.map((b, i) => {
                  // proportional widths: U=20, N=30, OW=25, Ob=25
                  const widths = [20, 30, 25, 25];
                  return (
                    <div key={i} style={{ flex: `0 0 ${widths[i]}%`, background: b.color, opacity: 0.7 }} />
                  );
                })}
              </div>
              {/* Indicator */}
              <div
                className="relative h-0 mb-3"
                style={{
                  // map BMI 0–40 to 0–100%
                  marginLeft: `${Math.min(Math.max((result.bmi / 40) * 100, 0), 98)}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: `6px solid ${bmiBand.color}`,
                    position: 'absolute',
                    top: '-12px',
                    left: '-5px',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: '#ccc', fontSize: '9px' }}>
                <span>16</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
              </div>
              <p className="mt-2 text-sm font-bold" style={{ color: bmiBand.color }}>{bmiBand.label}</p>
            </div>
          </div>

          {/* Caloric Goal Breakdown */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #1e1e1e' }}>
              <p className="text-sm font-bold text-white">Caloric Goal Breakdown</p>
              <p className="text-xs mt-0.5" style={{ color: '#ccc' }}>Based on your TDEE of {Math.round(result.tdee)} kcal/day</p>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Weight Loss', delta: -500, color: '#60a5fa', note: '~0.5 kg/week' },
                { label: 'Maintenance', delta: 0,    color: '#4ade80', note: 'Keep current weight' },
                { label: 'Muscle Gain',  delta: +300, color: '#ffc105', note: '+0.3 kg/week' },
              ].map(goal => (
                <div
                  key={goal.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: '#111', border: `1px solid ${goal.color}20` }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: goal.color }}>{goal.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#ccc' }}>{goal.note}</p>
                  </div>
                  <p className="text-lg font-black text-white">
                    {Math.round(result.tdee + goal.delta).toLocaleString()}
                    <span className="text-xs font-normal ml-1" style={{ color: '#ccc' }}>kcal</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs" style={{ color: '#bbb' }}>
            These calculations are estimates using the Mifflin-St Jeor equation. Results may vary based on individual physiology. Consult a dietician or medical professional for personalized advice.
          </p>
        </div>
      )}
    </div>
  );
}
