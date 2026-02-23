import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Activity, Dumbbell, Star, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#222] pb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#222] rounded-xl hover:bg-[#333] transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">Coach Profile</h1>
          <p className="text-[#888] text-sm">Manage your personal admin settings and details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffc105] to-[#f59e0b] mx-auto flex items-center justify-center text-[#111] text-3xl font-black shadow-[0_0_30px_rgba(255,193,5,0.2)] mb-4">
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.name || 'CJ Fitness'}</h2>
            <p className="text-xs uppercase tracking-widest text-[#ffc105] font-bold mb-4">{user?.role || 'Admin'}</p>
            <p className="text-[#888] text-sm">{user?.email || 'No email attached'}</p>
          </div>

          <div className="bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] p-6 space-y-4">
             <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Quick Stats</h3>
             <div className="flex justify-between items-center text-sm border-b border-[#333] pb-3">
               <span className="text-[#888] flex items-center gap-2"><User className="w-4 h-4"/> Role</span>
               <span className="text-white font-medium capitalize">{user?.role || 'Admin'}</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b border-[#333] pb-3">
               <span className="text-[#888] flex items-center gap-2"><Star className="w-4 h-4 text-[#ffc105]"/> Status</span>
               <span className="text-[#4ade80] font-bold">Active</span>
             </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
           <div className="bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] p-6">
             <h3 className="text-lg font-bold text-white mb-6">Profile Details</h3>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#888] mb-1.5 font-bold">Full Name</label>
                  <input type="text" readOnly value={user?.name || 'CJ Fitness'} className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-xl opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#888] mb-1.5 font-bold">Email Address</label>
                  <input type="email" readOnly value={user?.email || 'chiranjeeviwyld5@gmail.com'} className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-xl opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#888] mb-1.5 font-bold">Business Name</label>
                  <input type="text" readOnly value="CJ FITNESS" className="w-full bg-[#111] border border-[#333] text-white px-4 py-3 rounded-xl opacity-70 cursor-not-allowed" />
                </div>
                
                <div className="pt-4 border-t border-[#333] mt-6">
                  <p className="text-sm text-[#888] italic">Note: Admin credentials and core identity settings are hardcoded in the auth system for security.</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
