import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Activity, CheckCircle, Moon, User, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminCheckIns() {
  const { checkIns, updateCheckIn, data, addNotification, sendQuickMessage } = useData();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('pending'); // 'pending' | 'reviewed'
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});

  const pending = (checkIns || []).filter(c => !c.reviewed).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const reviewed = (checkIns || []).filter(c => c.reviewed).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const items = filter === 'pending' ? pending : reviewed;

  const handleReview = async (checkIn) => {
    // Mark as reviewed
    await updateCheckIn(checkIn.id, { reviewed: true, adminReply: replyText[checkIn.id] });
    
    // Send a notification to the user
    await addNotification({
      userId: checkIn.clientId,
      message: `Your coach reviewed your Check-In! ${replyText[checkIn.id] ? `"${replyText[checkIn.id]}"` : ''}`,
      type: 'success',
      icon: 'metrics'
    });

    setExpandedId(null);
  };

  const getClientData = (id) => data.clients.find(c => c.id === id) || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Client Check-Ins</h1>
          <p className="text-[#888] mt-2 font-medium">Review progress and give feedback</p>
        </div>
        <div className="flex bg-[#111] p-1 rounded-xl border border-[#222]">
           <button 
             onClick={() => setFilter('pending')} 
             className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 ${filter === 'pending' ? 'bg-[#ffc105] text-black' : 'text-[#888] hover:text-white'}`}
           >
             Pending <span className="bg-black/20 px-1.5 py-0.5 rounded-md">{pending.length}</span>
           </button>
           <button 
             onClick={() => setFilter('reviewed')} 
             className={`px-4 py-2 font-bold text-xs rounded-lg transition-colors ${filter === 'reviewed' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'}`}
           >
             Reviewed
           </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#161616] border border-[#222] rounded-3xl p-12 text-center text-[#888]">
          <CheckCircle className="w-12 h-12 text-[#333] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">You're all caught up!</h3>
          <p className="text-sm">No {filter} check-ins found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(checkIn => {
            const client = getClientData(checkIn.clientId);
            const isExp = expandedId === checkIn.id;

            return (
              <div key={checkIn.id} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden transition-all hover:border-[#444] group">
                {/* Header row */}
                <div 
                  className="flex flex-col md:flex-row items-center justify-between p-5 cursor-pointer select-none gap-4"
                  onClick={() => setExpandedId(isExp ? null : checkIn.id)}
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center font-black text-white shrink-0 shadow-inner border border-[#444]">
                       {client.name ? client.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{client.name || 'Unknown Client'}</h3>
                      <p className="text-xs text-[#888] font-bold mt-0.5">
                        {new Date(checkIn.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-8 w-full md:w-auto bg-[#111] md:bg-transparent px-4 py-2 md:p-0 rounded-xl">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-[#666] uppercase tracking-widest mb-1">Weight</p>
                      <p className="text-lg font-black text-white">{checkIn.weight || '--'} <span className="text-xs text-[#555]">kg</span></p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-[#666] uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Activity className="w-3 h-3 text-[#ffc105]"/> Energy</p>
                      <p className="text-lg font-black text-white">{checkIn.energyLevel}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-[#666] uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Moon className="w-3 h-3 text-[#a78bfa]"/> Sleep</p>
                      <p className="text-lg font-black text-white">{checkIn.sleepQuality}/10</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-[#555] transition-transform duration-300 ml-auto md:ml-4 ${isExp ? 'rotate-180 text-[#ffc105]' : 'group-hover:text-white'}`} />
                  </div>
                </div>

                {/* Expanded content */}
                {isExp && (
                  <div className="border-t border-[#2a2a2a] p-6 bg-[#161616] animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-black text-[#888] uppercase tracking-widest mb-3">Client Notes</h4>
                        <div className="bg-[#111] p-4 rounded-xl border border-[#222] min-h-[100px]">
                          <p className="text-sm text-[#eee] leading-relaxed italic border-l-2 border-[#ffc105] pl-3">
                            "{checkIn.notes || 'No specific notes provided.'}"
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col h-full">
                        <h4 className="text-xs font-black text-[#888] uppercase tracking-widest mb-3">Coach Feedback</h4>
                        {checkIn.reviewed ? (
                          <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 p-4 rounded-xl flex-1 flex flex-col justify-center text-center">
                             <CheckCircle className="w-6 h-6 text-[#4ade80] mx-auto mb-2" />
                             <p className="text-sm font-bold text-white mb-1">Reviewed</p>
                             {checkIn.adminReply && <p className="text-xs text-[#aaa]">"{checkIn.adminReply}"</p>}
                          </div>
                        ) : (
                          <div className="flex flex-col flex-1 gap-3">
                            <textarea
                               value={replyText[checkIn.id] || ''}
                               onChange={e => setReplyText({ ...replyText, [checkIn.id]: e.target.value })}
                               placeholder="Add a quick note of encouragement (optional)..."
                               className="w-full flex-1 bg-[#111] border border-[#333] focus:border-[#ffc105] rounded-xl text-sm p-3 outline-none text-white resize-none transition-colors"
                            />
                            <button 
                               onClick={() => handleReview(checkIn)}
                               className="w-full py-3 bg-[#ffc105] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#e6ad00] transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,193,5,0.2)]"
                            >
                               Mark as Reviewed <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
