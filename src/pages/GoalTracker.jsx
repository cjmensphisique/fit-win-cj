import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Target, CheckCircle, Trophy, Flame, 
  ChevronRight, ArrowRight, Plus, X, Trash2, ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ──── Utility: Calculate Days Left ───────────────────────────────────────────
const getDaysLeft = (targetDate) => {
  const diff = new Date(targetDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ──── Wizard Component ───────────────────────────────────────────────────────
function GoalWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    duration: 30, // days
    dailyTargets: [''],
    monthlyTargets: [''],
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const addTarget = (type) => update(type, [...form[type], '']);
  const updateTarget = (type, idx, val) => {
    const arr = [...form[type]];
    arr[idx] = val;
    update(type, arr);
  };
  const removeTarget = (type, idx) => {
    const arr = form[type].filter((_, i) => i !== idx);
    update(type, arr);
  };

  const handleFinish = () => {
    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setDate(startDate.getDate() + parseInt(form.duration));
    
    onComplete({
      ...form,
      startDate: startDate.toISOString().split('T')[0],
      targetDate: targetDate.toISOString().split('T')[0],
      dailyTargets: form.dailyTargets.filter(t => t.trim()),
      monthlyTargets: form.monthlyTargets.filter(t => t.trim()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#161616] border border-[#222] rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#222] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white">Create Your Goal 🎯</h2>
            <p className="text-[#888] text-sm">Step {step} of 3</p>
          </div>
          <button onClick={onCancel} className="text-[#666] hover:text-white"><X /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#ccc] uppercase tracking-wider">What is your main goal?</label>
                <input 
                  value={form.title} 
                  onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Lose 5kg, Run a 5k, Drink 3L Water" 
                  className="w-full bg-[#111] border border-[#333] rounded-xl p-4 text-xl text-white outline-none focus:border-[#ffc105]"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#ccc] uppercase tracking-wider">Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[30, 60, 90].map(d => (
                    <button 
                      key={d} 
                      onClick={() => update('duration', d)}
                      className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                        form.duration === d 
                          ? 'border-[#ffc105] bg-[#ffc105]/10 text-[#ffc105]' 
                          : 'border-[#222] bg-[#1a1a1a] text-[#666] hover:border-[#444]'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="space-y-4">
                <label className="text-sm font-bold text-[#ccc] uppercase tracking-wider">Daily Habits (Your System)</label>
                <p className="text-xs text-[#666]">What small things will you do every single day to achieve this?</p>
                {form.dailyTargets.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      value={t} 
                      onChange={e => updateTarget('dailyTargets', i, e.target.value)}
                      placeholder={`Habit #${i+1} (e.g. 10k steps)`}
                      className="flex-1 bg-[#111] border border-[#333] rounded-xl p-3 text-white outline-none focus:border-[#4ade80]"
                      autoFocus={i === form.dailyTargets.length - 1}
                    />
                    {form.dailyTargets.length > 1 && (
                      <button onClick={() => removeTarget('dailyTargets', i)} className="text-[#444] hover:text-[#f87171]"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => addTarget('dailyTargets')} className="text-sm font-bold text-[#4ade80] flex items-center gap-2 hover:underline">
                  <Plus className="w-4 h-4" /> Add Habit
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="space-y-4">
                <label className="text-sm font-bold text-[#ccc] uppercase tracking-wider">Milestones (Checkpoints)</label>
                <p className="text-xs text-[#666]">What specific results do you want to see by the end?</p>
                {form.monthlyTargets.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      value={t} 
                      onChange={e => updateTarget('monthlyTargets', i, e.target.value)}
                      placeholder={`Result #${i+1} (e.g. Fit into old jeans)`}
                      className="flex-1 bg-[#111] border border-[#333] rounded-xl p-3 text-white outline-none focus:border-[#a78bfa]"
                      autoFocus={i === form.monthlyTargets.length - 1}
                    />
                     {form.monthlyTargets.length > 1 && (
                      <button onClick={() => removeTarget('monthlyTargets', i)} className="text-[#444] hover:text-[#f87171]"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => addTarget('monthlyTargets')} className="text-sm font-bold text-[#a78bfa] flex items-center gap-2 hover:underline">
                  <Plus className="w-4 h-4" /> Add Milestone
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#222] flex justify-between">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`px-6 py-3 rounded-xl font-bold text-[#888] hover:text-white ${step === 1 ? 'invisible' : ''}`}
          >
            Back
          </button>
          <button 
            onClick={() => {
              if (step < 3) setStep(s => s + 1);
              else handleFinish();
            }}
            disabled={!form.title}
            className="px-8 py-3 rounded-xl font-bold bg-[#ffc105] text-[#111] hover:bg-[#e6ad00] flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? 'Start Journey 🚀' : 'Next Step'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ──── Main Page ──────────────────────────────────────────────────────────────
export default function GoalTracker() {
  const { user } = useAuth();
  const { goals, loadGoals, createGoal, updateGoal, deleteGoal } = useData();
  const [showWizard, setShowWizard] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) loadGoals(user.id);
  }, [user?.id]);

  useEffect(() => {
    // Find active goal
    setActiveGoal(goals?.find(g => g.status === 'active') || null);
  }, [goals]);

  const handleCreate = async (data) => {
    await createGoal({ ...data, clientId: user.id });
    setShowWizard(false);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const handleCheckIn = async (idx, isChecked) => {
    if (!activeGoal) return;
    
    // Existing checkins for today?
    let todayCheckin = activeGoal.checkins.find(c => c.date === today);
    if (!todayCheckin) {
      todayCheckin = { date: today, completedHabits: [] };
      activeGoal.checkins.push(todayCheckin);
    }

    // Update completed habits
    let habits = todayCheckin.completedHabits || [];
    if (isChecked) {
      if (!habits.includes(idx)) habits.push(idx);
    } else {
      habits = habits.filter(i => i !== idx);
    }
    
    // Check if daily streak content met (e.g. >50% habits done?)
    // For simplicity: Streak incr if at least 1 habit done today
    const wasStreak = todayCheckin.streakCounted;
    const isStreak = habits.length > 0;
    
    // Optimistic Update
    const updatedCheckins = activeGoal.checkins.map(c => c.date === today ? { ...c, completedHabits: habits, streakCounted: isStreak } : c);
    
    // Calculate new streak
    // Logic: If yesterday had streak, and today has streak, streak = Streak + 1. 
    // This is complex for frontend-only optimism.
    
    // Simple update
    await updateGoal(activeGoal.id, { checkins: updatedCheckins });
  };
  
  const getProgress = (goal) => {
    const total = (new Date(goal.targetDate) - new Date(goal.startDate)) / (1000 * 60 * 60 * 24);
    const current = (new Date() - new Date(goal.startDate)) / (1000 * 60 * 60 * 24);
    return Math.min(100, Math.max(0, (current / total) * 100));
  };

  if (!activeGoal && !showWizard) {
    return (
      <div className="max-w-4xl mx-auto h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 border border-[#333]">
           <Target className="w-10 h-10 text-[#666]" />
        </div>
        <h1 className="text-4xl font-black text-white">No Active Goal</h1>
        <p className="text-[#888] max-w-md text-lg">"The tragedy of life doesn't lie in not reaching your goal. The tragedy lies in having no goal to reach."</p>
        <button 
          onClick={() => setShowWizard(true)}
          className="px-8 py-4 bg-[#ffc105] text-black font-bold rounded-2xl text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,193,5,0.3)]"
        >
          Set a Goal Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {showWizard && <GoalWizard onComplete={handleCreate} onCancel={() => setShowWizard(false)} />}
      
      {activeGoal && (
        <>
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 text-center border border-[#222]" 
               style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)' }}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ffc105] to-transparent opacity-50" />
            
            <p className="text-[#ffc105] font-bold uppercase tracking-[0.2em] mb-4 text-sm">Active Goal</p>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">{activeGoal.title}</h1>
            
            <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="bg-[#222] px-6 py-3 rounded-2xl border border-[#333]">
                <p className="text-[#666] text-xs font-bold uppercase mb-1">Time Left</p>
                <p className="text-2xl font-black text-white">{getDaysLeft(activeGoal.targetDate)} Days</p>
              </div>
              <div className="bg-[#222] px-6 py-3 rounded-2xl border border-[#333]">
                 <div className="flex items-center gap-2 mb-1 justify-center">
                    <p className="text-[#666] text-xs font-bold uppercase">Current Streak</p>
                    <Flame className="w-3 h-3 text-[#fb923c]" />
                 </div>
                <p className="text-2xl font-black text-[#fb923c]">{activeGoal.streak || 0}</p>
              </div>
              <div className="bg-[#222] px-6 py-3 rounded-2xl border border-[#333]">
                <p className="text-[#666] text-xs font-bold uppercase mb-1">Progress</p>
                <p className="text-2xl font-black text-[#4ade80]">{Math.round(getProgress(activeGoal))}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Checklist */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-6 h-6 text-[#4ade80]" />
                <h2 className="text-2xl font-bold text-white">Daily Actions</h2>
              </div>
              
              <div className="space-y-3">
                {activeGoal.dailyTargets.map((target, idx) => {
                  const todayCheckin = activeGoal.checkins?.find(c => c.date === today);
                  const isDone = todayCheckin?.completedHabits?.includes(idx);
                  
                  return (
                    <label 
                      key={idx} 
                      className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 group
                        ${isDone 
                          ? 'bg-[#064e3b]/20 border-[#064e3b] shadow-[0_0_20px_rgba(74,222,128,0.05)]' 
                          : 'bg-[#161616] border-[#222] hover:border-[#333]'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isDone ? 'bg-[#4ade80] border-[#4ade80]' : 'border-[#444] group-hover:border-[#666]'}
                      `}>
                         {isDone && <CheckCircle className="w-5 h-5 text-black" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={!!isDone} 
                        onChange={e => handleCheckIn(idx, e.target.checked)} 
                        className="hidden" 
                      />
                      <span className={`text-lg font-medium transition-colors ${isDone ? 'text-white line-through decoration-[#4ade80]/50' : 'text-[#ccc]'}`}>
                        {target}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-[#a78bfa]" />
                <h2 className="text-2xl font-bold text-white">Milestones</h2>
              </div>
              
              <div className="space-y-4">
                 {activeGoal.monthlyTargets.map((m, i) => (
                   <div key={i} className="bg-[#161616] border border-[#222] p-5 rounded-2xl flex gap-4">
                     <div className="flex flex-col items-center gap-1">
                        <div className="w-0.5 h-full bg-[#222] rounded-full" />
                     </div>
                     <div>
                       <p className="text-[#888] text-xs font-bold uppercase mb-1">Target {i + 1}</p>
                       <p className="text-white font-medium text-lg leading-tight">{m}</p>
                     </div>
                   </div>
                 ))}
                 
                 <div className="bg-[#161616] border border-[#222] p-5 rounded-2xl flex gap-4 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-[#666]" />
                    </div>
                    <div>
                      <p className="text-[#888] text-xs font-bold uppercase mb-1">Finish Line</p>
                      <p className="text-white font-medium">{new Date(activeGoal.targetDate).toDateString()}</p>
                    </div>
                 </div>
              </div>

               <div className="pt-6 border-t border-[#222] mt-6">
                  <button 
                  onClick={() => {
                     if (confirm('Give up on this goal? Progress will be lost.')) deleteGoal(activeGoal.id);
                  }}
                  className="w-full py-3 text-[#666] hover:text-[#f87171] text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Abandon Goal
                  </button>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
