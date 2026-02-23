import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Users, Dumbbell, BookOpen, Apple, Scale,
  CreditCard, MessageSquare, CheckCircle, TrendingUp, AlertCircle, 
  Calendar, ChevronRight, ArrowRight, Activity, Bell, Target, Flame
} from 'lucide-react';

// ──── Premium Card Component ─────────────────────────────────────────────────
function DashboardCard({ title, subtitle, icon: Icon, children, className, action, variant = 'default', onClick }) {
  const isGlass = variant === 'glass';
  const isGradient = variant === 'gradient';
  
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-[24px] flex flex-col h-full transition-transform hover:-translate-y-1 duration-300 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: isGradient 
          ? 'linear-gradient(145deg, #1a1a1a, #111111)' 
          : '#161616',
        border: '1px solid #222',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
      }}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="relative z-10 p-5 pb-2 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
             isGradient ? 'bg-white/10 text-white' : 'bg-[#222] text-[#ccc]'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-[10px] font-medium text-[#888]">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 pt-3 flex-1 min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}

// ──── Quick Action Tile ──────────────────────────────────────────────────────
function ActionTile({ icon: Icon, label, onClick, color }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-all group w-full h-full border border-transparent hover:border-[#333]"
    >
      <Icon className="w-6 h-6 transition-colors" style={{ color: color }} />
      <span className="text-xs font-bold text-[#ccc] group-hover:text-white">{label}</span>
    </button>
  );
}

// ──── List Item ──────────────────────────────────────────────────────────────
function ActivityItem({ icon: Icon, main, sub, time, color, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#222] last:border-0 group">
      <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: color || '#777' }} />
      
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-medium text-[#ddd] truncate">{main}</p>
        <p className="text-xs text-[#777] truncate">{sub}</p>
      </div>

      {onDelete && (
        <button 
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#222] rounded-md text-[#888] hover:text-[#f87171] hover:bg-[#333] shrink-0"
          title="Delete Activity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      )}

      <div className="shrink-0 text-right min-w-[36px]">
        <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider">{time}</span>
      </div>
    </div>
  );
}

// ──── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { 
    data, loading, error, 
    notifications, loadNotifications,
    workoutPlans,
    goals // New
  } = useData();
  const navigate = useNavigate();

  const [activeGoal, setActiveGoal] = useState(null);

  useEffect(() => {
    if (goals && user) {
       setActiveGoal(goals.find(g => g.clientId === user.id && g.status === 'active'));
    }
  }, [goals, user]);

  const getDaysLeft = (targetDate) => {
    const diff = new Date(targetDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getProgress = (goal) => {
    const total = (new Date(goal.targetDate) - new Date(goal.startDate)) / (1000 * 60 * 60 * 24);
    const current = (new Date() - new Date(goal.startDate)) / (1000 * 60 * 60 * 24);
    return Math.min(100, Math.max(0, (current / total) * 100));
  };

  const isAdmin = user?.role === 'admin';
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [hiddenActivities, setHiddenActivities] = useState(() => JSON.parse(localStorage.getItem('hiddenActivities') || '[]'));

  const go = (path) => navigate(path);

  useEffect(() => {
    const targetId = isAdmin ? 'admin' : user?.id;
    if (targetId) loadNotifications(targetId);
    
    const fetchExtra = async () => {
      try {
        const p = await fetch('http://localhost:3001/api/payments');
        setPayments(await p.json());
      } catch {}
      try {
        const m = await fetch(`http://localhost:3001/api/messages/${targetId}`);
        setMessages(await m.json());
      } catch {}
    };
    fetchExtra();
    const timer = setInterval(fetchExtra, 5000);
    return () => clearInterval(timer);
  }, [user?.id]);

  // Derived Data
  const clients = data?.clients || [];
  const receiverId = isAdmin ? 'admin' : user?.id;
  const unreadMsgs = (messages || []).filter(m => !m.read && m.receiverId === receiverId).length;
  
  // Admin Finance
  const totalBilled = (payments || []).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const collected = (payments || []).filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const pendingRev = (payments || []).filter(p => p.status === 'pending').length;
  const overdueRev = (payments || []).filter(p => p.status === 'overdue').length;
  const revenuePct = totalBilled > 0 ? (collected / totalBilled) * 100 : 0;

  // Client Finance
  const myDue = (payments || []).filter(p => p.clientId === user?.id && (p.status === 'pending' || p.status === 'overdue'))
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    
  // Latest Message
  const myMessages = (messages || []).filter(m => m.receiverId === user?.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestMessage = myMessages.length > 0 ? myMessages[0].text : '"Keep pushing! You got this 💪"';

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  // ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
  if (isAdmin) {
    // Merge data for a unified "Activity Feed"
    const feed = [
      ...(notifications || []).filter(n => n.icon !== 'message').map(n => ({ id: n.id, type: 'notif', date: n.createdAt, text: n.message, sub: 'Alert', read: n.read })),
      ...(messages || []).filter(m => m.receiverId === 'admin').map(m => ({
        id: m.id,
        type: 'message',
        date: m.createdAt,
        text: `New message from ${clients.find(c => c.id === m.senderId)?.name || 'Client'}`,
        sub: m.text,
        read: m.read
      })),
      ...(payments || []).map(p => ({ 
        id: p.id,
        type: 'payment', 
        date: p.createdAt, 
        text: `Invoice #${p.id.slice(-4)} created for ${clients.find(c => c.id === p.clientId)?.name || 'Client'}`,
        sub: `₹${parseFloat(p.amount).toLocaleString()} · ${p.status}` 
      })),
      ...(payments || []).filter(p => p.status === 'paid').map(p => ({
        id: p.id,
        type: 'money',
        date: p.paidDate || p.createdAt,
        text: `Received payment from ${clients.find(c => c.id === p.clientId)?.name || 'Client'}`,
        sub: `+₹${parseFloat(p.amount).toLocaleString()}`
      })),
      ...(clients || []).map(c => ({
        id: c.id,
        type: 'user',
        date: c.joinedAt || '2025-01-01', // Fallback if missing
        text: `New Client: ${c.name}`,
        sub: 'Joined'
      }))
    ].filter(item => !hiddenActivities.includes(`${item.type}_${item.id}`))
     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleDeleteActivity = async (id, type) => {
      try {
        if (type === 'message') {
          await fetch(`http://localhost:3001/api/messages/${id}`, { method: 'DELETE' });
          setMessages(prev => prev.filter(m => m.id !== id));
        } else if (type === 'payment' || type === 'money') {
          await fetch(`http://localhost:3001/api/payments/${id}`, { method: 'DELETE' });
          setPayments(prev => prev.filter(p => p.id !== id));
        } else if (type === 'notif') {
          await fetch(`http://localhost:3001/api/notifications/${id}`, { method: 'DELETE' });
          loadNotifications(isAdmin ? 'admin' : user.id);
        } else if (type === 'user') {
          const newHidden = [...hiddenActivities, `user_${id}`];
          setHiddenActivities(newHidden);
          localStorage.setItem('hiddenActivities', JSON.stringify(newHidden));
        }
      } catch (err) {
        console.error("Failed to delete activity", err);
      }
    };

    return (
      <div className="gap-4 max-w-[1600px] mx-auto pb-0 h-[calc(100vh-64px)] flex flex-col min-h-0">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#222] pb-4 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-[#888] mt-1 font-medium text-sm">{today} • <span className="text-[#ffc105]">Admin Mode</span></p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => go('/admin/clients')} className="bg-white text-black hover:bg-[#ccc] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
               <Users className="w-4 h-4" /> Manage Clients
             </button>
             <button onClick={() => go('/admin/workout-plans')} className="bg-[#1a1a1a] text-white hover:bg-[#222] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-[#333]">
               Create Plan
             </button>
          </div>
        </div>

        {/* Top Quick Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <DashboardCard title="Total Clients" subtitle="Platform Overview" icon={Users} className="cursor-pointer hover:border-[#60a5fa]" onClick={() => go('/admin/clients')}>
            <div className="flex items-center justify-between h-full -mt-2">
              <span className="text-3xl font-black text-white">{clients.length}</span>
              <div className="p-2.5 bg-[#1f1f1f] rounded-2xl">
                <Users className="w-6 h-6 text-[#60a5fa]" />
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Active Workouts" subtitle="Training Plans" icon={Dumbbell} className="cursor-pointer hover:border-[#a78bfa]" onClick={() => go('/admin/workout-plans')}>
            <div className="flex items-center justify-between h-full -mt-2">
              <span className="text-3xl font-black text-white">{workoutPlans?.length || 0}</span>
              <div className="p-2.5 bg-[#1f1f1f] rounded-2xl">
                <Dumbbell className="w-6 h-6 text-[#a78bfa]" />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Active Diets" subtitle="Meal Plans" icon={Apple} className="cursor-pointer hover:border-[#4ade80]" onClick={() => go('/admin/meal-plans')}>
            <div className="flex items-center justify-between h-full -mt-2">
              <span className="text-3xl font-black text-white">{data?.mealPlans?.length || 0}</span>
              <div className="p-2.5 bg-[#1f1f1f] rounded-2xl">
                <Apple className="w-6 h-6 text-[#4ade80]" />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Messages" subtitle="Communication" icon={MessageSquare} className="cursor-pointer hover:border-[#ffc105]" onClick={() => go('/admin/messages')}>
            <div className="flex items-center justify-between h-full -mt-2">
              <span className="text-3xl font-black text-white w-min">{unreadMsgs} <span className="text-[10px] text-[#888] font-bold uppercase tracking-wider block mt-1">Unread</span></span>
              <div className="p-2.5 bg-[#ffc105]/10 rounded-2xl">
                <MessageSquare className="w-6 h-6 text-[#ffc105]" />
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          
          {/* Main 2-Column Section */}
          <div className="lg:col-span-2 gap-4 flex flex-col min-h-0">
            
            {/* Revenue Widget */}
            <DashboardCard title="Revenue Flow" subtitle="Financial Overview" icon={TrendingUp} variant="gradient" className="min-h-0">
               <div className="flex flex-col flex-1 min-h-0 justify-between gap-4 overflow-y-auto pr-2 pb-2">
                 <div>
                    <div className="flex items-end mb-1 gap-4">
                      <span className="text-4xl font-black text-white">₹{collected.toLocaleString()}</span>
                      <span className="text-xs font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 mb-1 rounded-lg">+12%</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Total Collected</p>
                 </div>
                 
                 {/* Progress Bar */}
                 <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-[10px] text-[#999] font-medium">
                      <span>Collection Progress</span>
                      <span>{Math.round(revenuePct)}%</span>
                    </div>
                    <div className="h-3 bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e]" style={{ width: `${revenuePct}%` }} />
                    </div>
                 </div>

                 {/* Mini Stats Grid */}
                 <div className="grid grid-cols-2 gap-3 mt-3">
                   <div className="p-4 bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] flex justify-between items-center cursor-pointer hover:border-[#ffc105] transition-colors" onClick={() => go('/admin/billing')}>
                     <div>
                       <p className="text-[#888] text-[10px] font-bold uppercase tracking-wider mb-1">Pending Inv.</p>
                       <p className="text-2xl font-bold text-[#ffc105]">{pendingRev}</p>
                     </div>
                     <ArrowRight className="w-4 h-4 text-[#555]" />
                   </div>
                   <div className="p-4 bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] flex justify-between items-center cursor-pointer hover:border-[#f87171] transition-colors" onClick={() => go('/admin/billing')}>
                     <div>
                       <p className="text-[#888] text-[10px] font-bold uppercase tracking-wider mb-1">Overdue</p>
                       <p className="text-2xl font-bold text-[#f87171]">{overdueRev}</p>
                     </div>
                     <ArrowRight className="w-4 h-4 text-[#555]" />
                   </div>
                 </div>
               </div>
            </DashboardCard>

            {/* Admin Goal Assist Overview */}
            <DashboardCard title="Goal Assist Overview" subtitle="Client Progress" icon={Target} className="flex-1 min-h-0">
              <div className="flex flex-col flex-1 -mx-2 -mt-2 min-h-0">
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                   {(goals || []).filter(g => g.status === 'active').length > 0 ? (
                     goals.filter(g => g.status === 'active').map(goal => {
                       const clientRecord = clients.find(c => c.id === goal.clientId);
                       return (
                         <div key={goal.id} className="bg-[#1f1f1f] p-4 rounded-xl border border-[#2a2a2a] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                           <div>
                             <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                               {clientRecord?.name || 'Unknown Client'}
                               <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffc105]/20 text-[#ffc105] uppercase tracking-wider">
                                 {goal.type}
                               </span>
                             </p>
                             <p className="text-xs text-[#888]">{goal.title}</p>
                           </div>
                           <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                             <div className="flex flex-col items-center">
                               <span className="text-xs text-[#666] uppercase font-bold text-[10px]">Streak</span>
                               <span className="text-[#ffc105] font-black text-sm flex items-center gap-1"><Flame className="w-3 h-3"/> {goal.streak || 0}</span>
                             </div>
                             <div className="flex flex-col items-center">
                               <span className="text-xs text-[#666] uppercase font-bold text-[10px]">Days Left</span>
                               <span className="text-white font-black text-sm">{getDaysLeft(goal.targetDate)}</span>
                             </div>
                             <div className="w-24">
                               <div className="flex justify-end text-[10px] text-[#666] mb-1 font-bold">{Math.round(getProgress(goal))}%</div>
                               <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                                 <div className="h-full bg-[#ffc105]" style={{ width: `${getProgress(goal)}%` }} />
                               </div>
                             </div>
                           </div>
                         </div>
                       );
                     })
                   ) : (
                     <div className="flex flex-col items-center justify-center py-10 opacity-30">
                        <Target className="w-8 h-8 mb-2" />
                        <p className="text-sm">No active client goals</p>
                     </div>
                   )}
                </div>
              </div>
            </DashboardCard>

          </div>

          {/* Side Panel Section */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            {/* Activity Feed */}
            <DashboardCard title="Live Activity" subtitle="Real-time Updates" icon={Activity} className="flex-1 min-h-0">
               <div className="flex flex-col flex-1 -mx-2 min-h-0">
                  <div className="flex-1 overflow-y-auto pr-2 space-y-1">
                    {feed.slice(0, 15).map((n, i) => (
                      <ActivityItem 
                        key={i} 
                        main={n.text} 
                        sub={n.sub} 
                        time={new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        color={n.type === 'money' ? '#4ade80' : n.type === 'notif' && !n.read ? '#ffc105' : '#777'} 
                        onDelete={n.id ? () => handleDeleteActivity(n.id, n.type) : undefined}
                      />
                    ))}
                    {feed.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 opacity-30">
                        <Bell className="w-8 h-8 mb-2" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
               </div>
            </DashboardCard>
          </div>

        </div>
      </div>
    );
  }

  // ── CLIENT DASHBOARD ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-[#222] pb-6">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Hello, <span className="text-[#ffc105]">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-[#888] mt-2 font-medium">Ready to crush your goals today?</p>
      </div>

      {/* Hero Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout Hero */}
        <div onClick={() => go('/client/workout-plan')} 
             className="group relative overflow-hidden rounded-[2rem] min-h-[280px] cursor-pointer"
             style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="relative h-full p-8 flex flex-col justify-between z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#a78bfa] uppercase tracking-widest mb-1">Today's Training</p>
              <h3 className="text-3xl font-black text-white mb-2">Superset Strength</h3>
              <div className="flex items-center gap-2 text-white font-bold group-hover:translate-x-2 transition-transform">
                Start Workout <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Hero */}
        <div onClick={() => go('/client/meal-plan')} 
             className="group relative overflow-hidden rounded-[2rem] min-h-[280px] cursor-pointer"
             style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)' }}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="relative h-full p-8 flex flex-col justify-between z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#4ade80] uppercase tracking-widest mb-1">Fuel Your Body</p>
              <h3 className="text-3xl font-black text-white mb-2">High Protein Plan</h3>
              <div className="flex items-center gap-2 text-white font-bold group-hover:translate-x-2 transition-transform">
                View Meals <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utility Grid - Balanced 4-Card Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* COL 1: Goal Assist (New) */}
          <DashboardCard title="Goal Assist" subtitle="Your Focus" icon={Target} variant={activeGoal ? "gradient" : "default"}>
            {activeGoal ? (
               <div className="flex flex-col h-full justify-between relative z-10">
                 <div>
                   <h3 className="text-xl md:text-2xl font-black text-white mb-1 truncate tracking-tight">{activeGoal.title}</h3>
                   <p className="text-[10px] text-[#ffc105] font-black uppercase tracking-widest">{getDaysLeft(activeGoal.targetDate)} Days Left</p>
                 </div>
                 <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-md">
                       <span className="text-xs font-bold text-[#ccc] uppercase tracking-wider">Streak</span>
                       <div className="flex items-center gap-1.5 text-[#ffc105] bg-[#ffc105]/10 px-2 py-1 rounded-md">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-black text-sm">{activeGoal.streak || 0}</span>
                       </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-[#666] mb-2">
                        <span>Progress</span>
                        <span className="text-white">{Math.round(getProgress(activeGoal))}%</span>
                      </div>
                      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#ffc105] relative" style={{ width: `${getProgress(activeGoal)}%` }}>
                           <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}/>
                        </div>
                      </div>
                    </div>
                 </div>
                 <button onClick={() => go('/client/goal-assist')} className="mt-6 w-full py-3 bg-gradient-to-r from-[#ffc105] to-[#f59e0b] text-black font-black text-xs rounded-xl uppercase tracking-widest hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,193,5,0.3)]">
                   View Tracker
                 </button>
               </div>
            ) : (
               <div className="flex flex-col h-full items-center justify-center text-center space-y-4 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1f1f1f] to-[#111] border border-[#333] flex items-center justify-center shadow-[0_0_30px_rgba(255,193,5,0.1)] group">
                    <Target className="w-8 h-8 text-[#ffc105] opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                 </div>
                 <div>
                   <p className="text-white font-black text-lg tracking-tight">No Active Goal</p>
                   <p className="text-xs text-[#888] font-medium leading-relaxed mt-1 max-w-[140px] mx-auto">Set a target to start tracking your progress</p>
                 </div>
                 <button onClick={() => go('/client/goal-assist')} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 hover:border-[#ffc105]/50 transition-all">
                   Set Goal
                 </button>
               </div>
            )}
          </DashboardCard>

        {/* COL 2: My Progress */}
        <DashboardCard title="My Progress" subtitle="Body Metrics" icon={Scale} onClick={() => go('/client/metrics')} className="cursor-pointer group hover:border-[#fb923c]/50 border-transparent transition-colors">
           {/* massive faded background icon */}
           <Scale className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
           <div className="flex flex-col h-full items-center justify-center mt-2 relative z-10">
              <div className="text-center">
                 <p className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(251,146,60,0.15)] group-hover:text-[#fb923c] transition-colors duration-500">{user?.weight || '--'}</p>
                 <p className="text-[#fb923c] text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80 group-hover:opacity-100 transition-opacity">Current Weight (kg)</p>
              </div>
           </div>
           <div className="mt-auto relative z-10">
             <div className="h-16 flex items-end justify-center pb-2">
               <span className="text-[#fb923c] text-[10px] font-black uppercase tracking-[0.15em] opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">Track Metrics →</span>
             </div>
           </div>
        </DashboardCard>
        
        {/* COL 3: Messages */}
        <DashboardCard title="Messages" subtitle="Chat with Coach" icon={MessageSquare} onClick={() => go('/client/messages')} className="cursor-pointer group hover:border-[#ffc105]/50 border-transparent transition-colors">
           {/* background accent blur */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#ffc105] opacity-[0.03] blur-3xl pointer-events-none rounded-full group-hover:opacity-[0.06] transition-opacity duration-500" />
           <div className="space-y-6 flex flex-col justify-center h-full relative z-10">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start gap-4 relative backdrop-blur-sm group-hover:bg-white/10 transition-colors duration-300">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffc105] to-[#f59e0b] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,193,5,0.3)]">
                 <span className="text-[#111] font-black text-lg tracking-tighter">CJ</span>
               </div>
               <div className="flex-1 min-w-0 pt-1">
                 <p className="text-[10px] font-black uppercase tracking-wider text-[#ffc105] mb-1">CJ Fitness Coach</p>
                 <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2 italic">"{latestMessage}"</p>
               </div>
               {unreadMsgs > 0 && (
                 <div className="absolute -top-2.5 -right-2.5 min-w-[24px] h-[24px] bg-gradient-to-br from-[#f87171] to-[#dc2626] rounded-full flex items-center justify-center text-white text-[11px] font-black border-[3px] border-[#161616] shadow-lg px-1.5">
                   {unreadMsgs}
                 </div>
               )}
             </div>
             <div className="text-center w-full mt-auto">
               <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                 unreadMsgs > 0 
                  ? 'text-[#f87171] opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' 
                  : 'text-[#ffc105] opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 inline-block'
               }`}>
                 {unreadMsgs > 0 ? 'Action: Open Unread' : 'Send a message →'}
               </span>
             </div>
           </div>
        </DashboardCard>

        {/* COL 4: Billing */}
        <DashboardCard title="Billing" subtitle={myDue > 0 ? 'Action Required' : 'All Paid'} icon={CreditCard} onClick={() => go('/client/billing')} className={`cursor-pointer group border-transparent transition-colors ${myDue > 0 ? 'hover:border-[#f87171]/50' : 'hover:border-[#4ade80]/50'}`}>
           {myDue > 0 && <div className="absolute inset-0 border border-[#f87171]/20 rounded-[24px] pointer-events-none animate-pulse blur-[1px]" />}
           <div className="flex flex-col items-center justify-center h-full relative z-10 w-full">
             {myDue > 0 ? (
               <div className="text-center w-full flex flex-col h-full justify-between items-center py-2">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f87171]/20 to-[#dc2626]/10 flex items-center justify-center mb-4 border border-[#f87171]/30 relative">
                   <AlertCircle className="w-8 h-8 text-[#f87171]" />
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f87171] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f87171]"></span>
                   </span>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-[#f87171] uppercase tracking-widest mb-1">Total Due</p>
                   <p className="text-[#f87171] text-4xl font-black tracking-tight drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]">₹{myDue.toLocaleString()}</p>
                 </div>
                 <button className="mt-auto w-full max-w-[160px] bg-gradient-to-r from-[#f87171] to-[#ef4444] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(248,113,113,0.3)] hover:shadow-[0_6px_20px_rgba(248,113,113,0.4)] hover:-translate-y-0.5 transition-all">
                   Pay Now
                 </button>
               </div>
             ) : (
                <div className="text-center w-full flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/5 flex items-center justify-center mb-4 border border-[#4ade80]/20 shadow-[inset_0_0_20px_rgba(74,222,128,0.1)] group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle className="w-10 h-10 text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                  </div>
                  <p className="text-white font-black text-lg tracking-tight mb-1">Up to date</p>
                  <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest">No pending invoices</p>
                </div>
             )}
           </div>
        </DashboardCard>
      </div>

    </div>
  );
}
