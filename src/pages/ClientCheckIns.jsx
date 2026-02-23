import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Activity, Camera, CheckCircle, ChevronRight, Moon, Send, Star, User, History } from 'lucide-react';

export default function ClientCheckIns() {
  const { user } = useAuth();
  const { checkIns, createCheckIn } = useData();

  const [view, setView] = useState('new'); // 'new' | 'history'
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: user?.weight || '',
    energyLevel: 5,
    sleepQuality: 5,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // My check-ins
  const myCheckIns = (checkIns || [])
    .filter(c => c.clientId === user?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const lastCheckIn = myCheckIns.length > 0 ? myCheckIns[0] : null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitForm = async () => {
    setSubmitting(true);
    try {
      await createCheckIn({
        clientId: user.id,
        ...formData,
      });
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setView('history');
        setStep(1);
      }, 2000);
    } catch (err) {
      setSubmitting(false);
      alert('Failed to submit check-in: ' + err.message);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-2 rounded-full transition-all duration-500 w-12 ${step === i ? 'bg-[#ffc105]' : step > i ? 'bg-[#4ade80]' : 'bg-[#333]'}`} />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Weekly Check-In</h1>
          <p className="text-[#888] mt-2 font-medium">Log your progress and stay accountable</p>
        </div>
        <div className="flex bg-[#111] p-1 rounded-xl border border-[#222]">
           <button 
             onClick={() => setView('new')} 
             className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors ${view === 'new' ? 'bg-[#ffc105] text-black' : 'text-[#888] hover:text-white'}`}
           >
             New Log
           </button>
           <button 
             onClick={() => setView('history')} 
             className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 ${view === 'history' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'}`}
           >
             <History className="w-3.5 h-3.5" /> History
           </button>
        </div>
      </div>

      {view === 'new' && (
        <div className="bg-[#161616] p-8 md:p-12 rounded-[2rem] border border-[#222] shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffc105]/5 blur-[100px] pointer-events-none rounded-full" />
          
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-20 relative z-10 animate-fade-in">
              <div className="w-20 h-20 bg-[#4ade80]/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-[#4ade80]" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Check-in Submitted!</h2>
              <p className="text-[#888] font-medium">Your coach will review your progress shortly.</p>
            </div>
          ) : (
            <div className="relative z-10 max-w-xl mx-auto">
              <StepIndicator />
              
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center mb-8">
                     <h2 className="text-3xl font-black text-white mb-2">Body Metrics</h2>
                     <p className="text-[#888] text-sm">Let's start with your current weight.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#888] uppercase tracking-wider mb-3 text-center">Current Weight (kg)</label>
                    <input 
                      type="number" 
                      name="weight" 
                      value={formData.weight} 
                      onChange={handleChange}
                      className="w-full text-center text-5xl font-black bg-transparent border-b-2 border-[#333] focus:border-[#ffc105] outline-none text-white py-4 transition-colors placeholder-[#333]"
                      placeholder="0.0" 
                    />
                  </div>
                  <button onClick={() => setStep(2)} className="w-full py-4 bg-[#ffc105] text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-[#e6ad00] transition-colors flex items-center justify-center gap-2">
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center mb-8">
                     <h2 className="text-3xl font-black text-white mb-2">Wellbeing</h2>
                     <p className="text-[#888] text-sm">How have you been feeling this week?</p>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Energy Level */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#aaa] uppercase tracking-wider">
                          <Activity className="w-4 h-4 text-[#ffc105]" /> Energy Level
                        </label>
                        <span className="text-[#ffc105] font-black">{formData.energyLevel}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" 
                        name="energyLevel" value={formData.energyLevel} onChange={handleChange}
                        className="w-full accent-[#ffc105]" 
                      />
                      <div className="flex justify-between text-xs text-[#555] mt-2 font-medium">
                        <span>Exhausted</span>
                        <span>Full of Energy</span>
                      </div>
                    </div>

                    {/* Sleep Quality */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#aaa] uppercase tracking-wider">
                          <Moon className="w-4 h-4 text-[#a78bfa]" /> Sleep Quality
                        </label>
                        <span className="text-[#a78bfa] font-black">{formData.sleepQuality}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" 
                        name="sleepQuality" value={formData.sleepQuality} onChange={handleChange}
                        className="w-full accent-[#a78bfa]" 
                      />
                      <div className="flex justify-between text-xs text-[#555] mt-2 font-medium">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-6 py-4 bg-[#222] text-white font-bold text-sm rounded-xl hover:bg-[#333] transition-colors">
                      Back
                    </button>
                    <button onClick={() => setStep(3)} className="flex-1 py-4 bg-[#ffc105] text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-[#e6ad00] transition-colors flex items-center justify-center gap-2">
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center mb-8">
                     <h2 className="text-3xl font-black text-white mb-2">Final Thoughts</h2>
                     <p className="text-[#888] text-sm">Any extra notes or wins you want to share?</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#888] uppercase tracking-wider mb-2">Notes for Coach</label>
                    <textarea 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleChange}
                      className="w-full h-32 bg-[#1f1f1f] border border-[#333] focus:border-[#ffc105] rounded-xl text-white p-4 outline-none resize-none transition-colors"
                      placeholder="e.g. Hit a new PR on squats! But my left knee is slightly sore."
                    />
                  </div>

                  {/* Mock Photo Upload */}
                  <div className="border-2 border-dashed border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#ffc105]/50 hover:bg-[#ffc105]/5 transition-all group">
                     <Camera className="w-8 h-8 text-[#555] group-hover:text-[#ffc105] mb-2 transition-colors" />
                     <p className="text-white font-bold text-sm">Add Progress Photos</p>
                     <p className="text-[#666] text-xs mt-1">Front, Back, and Side (Optional)</p>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="px-6 py-4 bg-[#222] text-white font-bold text-sm rounded-xl hover:bg-[#333] transition-colors">
                      Back
                    </button>
                    <button 
                      onClick={submitForm} 
                      disabled={submitting}
                      className="flex-1 py-4 bg-gradient-to-r from-[#ffc105] to-[#f59e0b] text-black font-black text-sm uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,193,5,0.3)] disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Check-In'} <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div className="space-y-4">
          {myCheckIns.length === 0 ? (
            <div className="bg-[#161616] p-12 rounded-[2rem] border border-[#222] text-center">
               <History className="w-12 h-12 text-[#333] mx-auto mb-4" />
               <p className="text-white font-bold text-lg mb-1">No past check-ins</p>
               <p className="text-[#888] text-sm mb-6">Your check-in history will appear here.</p>
               <button onClick={() => setView('new')} className="px-6 py-2 bg-[#ffc105] text-black font-bold text-sm rounded-lg hover:bg-[#e6ad00] transition-colors">
                 Submit First Check-in
               </button>
            </div>
          ) : (
            myCheckIns.map(checkIn => (
              <div key={checkIn.id} className="bg-[#161616] p-6 rounded-2xl border border-[#2a2a2a] hover:border-[#444] transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#ffc105] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-white">{new Date(checkIn.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</h3>
                    {checkIn.reviewed && <span className="text-[10px] font-bold px-2 py-0.5 rounded pl-1 bg-[#4ade80]/10 text-[#4ade80] flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Reviewed</span>}
                  </div>
                  <p className="text-sm text-[#aaa] line-clamp-2">{checkIn.notes || 'No specific notes provided.'}</p>
                </div>

                <div className="flex items-center gap-8 bg-[#1a1a1a] p-4 rounded-xl border border-[#222] shrink-0 w-full md:w-auto">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#888] uppercase tracking-widest mb-1">Weight</p>
                    <p className="text-xl font-black text-white">{checkIn.weight} <span className="text-xs text-[#666]">kg</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#888] uppercase tracking-widest mb-1 items-center flex gap-1 justify-center"><Activity className="w-3 h-3 text-[#ffc105]"/> Energy</p>
                    <p className="text-xl font-black text-white">{checkIn.energyLevel}<span className="text-xs text-[#666]">/10</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#888] uppercase tracking-widest mb-1 items-center flex gap-1 justify-center"><Moon className="w-3 h-3 text-[#a78bfa]"/> Sleep</p>
                    <p className="text-xl font-black text-white">{checkIn.sleepQuality}<span className="text-xs text-[#666]">/10</span></p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
