import { useData } from '../../context/DataContext';
import { TrendingUp, Users, Target, Activity, DollarSign, Zap } from 'lucide-react';

export default function Analytics() {
  const { data } = useData();

  const totalClients = data.clients?.length || 0;
  const activeGoals = data.goals?.filter(g => g.status === 'active')?.length || 0;
  const totalRevenue = data.payments?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0;
  
  // Mock data for graphs
  const revenueMonths = [
    { label: 'Sep', value: 4000 },
    { label: 'Oct', value: 3000 },
    { label: 'Nov', value: 5000 },
    { label: 'Dec', value: 7000 },
    { label: 'Jan', value: 6000 },
    { label: 'Feb', value: totalRevenue > 0 ? totalRevenue : 8500 },
  ];
  const maxRev = Math.max(...revenueMonths.map(m => m.value));

  const engagementScore = 85; // Mock metric 1-100

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="w-10 h-10 text-[#ffc105]" /> Intelligence
          </h1>
          <p className="text-[#888] mt-2 font-medium">Business metrics and performance insights</p>
        </div>
        <div className="bg-[#111] border border-[#222] px-4 py-2 rounded-xl text-sm font-bold text-[#aaa]">
          Last 6 Months
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161616] p-6 rounded-[2rem] border border-[#2a2a2a] relative overflow-hidden group hover:border-[#ffc105]/50 transition-colors">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffc105] opacity-[0.05] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity" />
           <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="w-12 h-12 rounded-xl bg-[#ffc105]/10 flex items-center justify-center border border-[#ffc105]/20 text-[#ffc105]">
               <DollarSign className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-black text-[#888] uppercase tracking-widest">Est. Revenue</p>
               <h3 className="text-3xl font-black text-white tracking-tight">₹{revenueMonths[5].value.toLocaleString()}</h3>
             </div>
           </div>
           <p className="text-[10px] text-[#4ade80] font-black uppercase tracking-wider flex items-center gap-1">
             <TrendingUp className="w-3 h-3" /> +15% from last month
           </p>
        </div>

        <div className="bg-[#161616] p-6 rounded-[2rem] border border-[#2a2a2a] relative overflow-hidden group hover:border-[#a78bfa]/50 transition-colors">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#a78bfa] opacity-[0.05] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity" />
           <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="w-12 h-12 rounded-xl bg-[#a78bfa]/10 flex items-center justify-center border border-[#a78bfa]/20 text-[#a78bfa]">
               <Users className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-black text-[#888] uppercase tracking-widest">Client Base</p>
               <h3 className="text-3xl font-black text-white tracking-tight">{totalClients} Active</h3>
             </div>
           </div>
           <p className="text-[10px] text-[#a78bfa] font-black uppercase tracking-wider">
             94% Retention Rate
           </p>
        </div>

        <div className="bg-[#161616] p-6 rounded-[2rem] border border-[#2a2a2a] relative overflow-hidden group hover:border-[#60a5fa]/50 transition-colors">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#60a5fa] opacity-[0.05] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity" />
           <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="w-12 h-12 rounded-xl bg-[#60a5fa]/10 flex items-center justify-center border border-[#60a5fa]/20 text-[#60a5fa]">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-black text-[#888] uppercase tracking-widest">Engagement</p>
               <h3 className="text-3xl font-black text-white tracking-tight">{engagementScore}/100</h3>
             </div>
           </div>
           <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden mt-2">
             <div className="h-full bg-[#60a5fa]" style={{ width: `${engagementScore}%` }} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#161616] p-8 md:p-10 rounded-[2rem] border border-[#2a2a2a]">
          <h2 className="text-xl font-black text-white mb-8">Revenue Growth</h2>
          <div className="h-64 flex items-end gap-2 sm:gap-4 relative mt-10">
            {/* Y-axis Guides */}
            <div className="absolute w-full flex flex-col justify-between h-full pointer-events-none opacity-20">
              <div className="border-t border-[#444] w-full" />
              <div className="border-t border-[#444] w-full" />
              <div className="border-t border-[#444] w-full" />
              <div className="border-t border-[#444] w-full" />
            </div>

            {revenueMonths.map((m, i) => {
              const height = (m.value / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group z-10 relative">
                  <div className="absolute -top-8 text-[#ffc105] text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:-translate-y-4">
                    ₹{m.value >= 1000 ? `${(m.value/1000).toFixed(1)}k` : m.value}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-[#f59e0b]/20 to-[#ffc105] rounded-t-lg transition-all duration-1000 group-hover:opacity-80" 
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-[10px] font-black text-[#666] uppercase tracking-wider group-hover:text-white transition-colors">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Hit Rates */}
        <div className="bg-[#161616] p-8 md:p-10 rounded-[2rem] border border-[#2a2a2a] flex flex-col">
          <h2 className="text-xl font-black text-white mb-2">Goal Hit Rate (Est)</h2>
          <p className="text-sm text-[#888] mb-8 font-medium">Percentage of clients successfully closing their active goals.</p>
          
          <div className="flex-1 flex items-center justify-center relative">
            <svg viewBox="0 0 36 36" className="w-[200px] h-[200px] drop-shadow-[0_0_20px_rgba(74,222,128,0.2)]">
              <path
                className="text-[#222] stroke-current"
                strokeWidth="3"
                strokeDasharray="100, 100"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#4ade80] stroke-current transition-all duration-1000 ease-out"
                strokeWidth="3"
                strokeDasharray="68, 100" // 68% goal hit rate
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-white">68%</span>
              <span className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest mt-1">Avg Hit Rate</span>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{activeGoals}</p>
              <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Active Goals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">12</p>
              <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
