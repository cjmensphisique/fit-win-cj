import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import logoUrl from '../assets/logo.jpeg';
import { API_URL } from '../api';
import {
  LayoutDashboard, Users,
  LogOut, BookOpen, Apple, Scale, CreditCard,
  MessageSquare, Dumbbell, Calculator, Bell, Target, Check, X,
  ChevronRight, Activity, TrendingUp, AlarmClock
} from 'lucide-react';

// Map notification icons to route destinations (client-side)
export function notifRoute(notif, role) {
  const prefix = role === 'admin' ? '/admin' : '/client';
  const icon = notif.icon || '';
  const msg = (notif.message || '').toLowerCase();
  if (icon === 'billing' || msg.includes('invoice')) return `${prefix}/billing`;
  if (icon === 'nutrition' || msg.includes('meal plan')) return `${prefix}/meal-plan`;
  if (icon === 'workout' || msg.includes('workout')) return `${prefix}/workout-plan`;
  if (icon === 'message' || msg.includes('message')) return `${prefix}/messages`;
  if (msg.includes('badge')) return `${prefix}/profile`;
  if (msg.includes('check-in') || msg.includes('check in')) return `${prefix}/check-ins`;
  if (icon === 'metrics' || msg.includes('metric') || msg.includes('progress')) return `${prefix}/metrics`;
  if (msg.includes('exercise')) return `${prefix}/exercise-library`;
  return `${prefix}`;
}

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { notifications, loadNotifications, markNotificationRead, markAllNotificationsRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const bellRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/client';

  const [unreadMessages, setUnreadMessages] = useState(0);
  const prevUnreadRef = useRef(0);

  // Play a chime sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop to A4

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.log('Audio playback prevented by browser policy');
    }
  };

  // Check if unread count increased to play sound
  const unread = (notifications || []).filter(n => !n.read);
  useEffect(() => {
    if (unread.length > prevUnreadRef.current && prevUnreadRef.current !== 0) {
      playNotificationSound();
    }
    prevUnreadRef.current = unread.length;
  }, [unread.length]);

  // Load notifications and messages for this user
  useEffect(() => {
    if (!user) return;
    const receiverId = isAdmin ? 'admin' : user.id;

    const fetchAll = () => {
      loadNotifications(receiverId);
      fetch(`${API_URL}/api/messages/${receiverId}`)
        .then(res => res.json())
        .then(msgs => {
          console.log('Sidebar msgs:', msgs);
          const unreadCount = msgs.filter(m => m.receiverId === receiverId && !m.read).length;
          console.log('Sidebar unreadCount calculated:', unreadCount, 'for receiverId:', receiverId);
          setUnreadMessages(unreadCount);
        })
        .catch(() => {});
    };

    fetchAll();
    const timer = setInterval(fetchAll, 5000);
    window.addEventListener('messages-read', fetchAll);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('messages-read', fetchAll);
    };
  }, [user?.id, isAdmin]);

  // Close notif panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target) && !e.target.closest('#notif-panel')) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const adminNav = [
    { name: 'Dashboard',       path: '/admin',                   icon: LayoutDashboard },
    { name: 'Analytics',       path: '/admin/analytics',         icon: TrendingUp },
    { name: 'Clients',         path: '/admin/clients',           icon: Users },
    { name: 'Reminders',       path: '/admin/reminders',         icon: AlarmClock },
    { name: 'Workout Plans',   path: '/admin/workout-plans',     icon: Dumbbell },
    { name: 'Exercise Library',path: '/admin/exercise-library',  icon: BookOpen },
    { name: 'Meal Plans',      path: '/admin/meal-plans',        icon: Apple },
    { name: 'Weekly Check-Ins',path: '/admin/check-ins',         icon: Activity },
    { name: 'Billing',         path: '/admin/billing',           icon: CreditCard },
    { name: 'Messages',        path: '/admin/messages',          icon: MessageSquare },
    { name: 'BMR Calculator',  path: '/admin/bmr-calculator',    icon: Calculator },
  ];

  const clientNav = [
    { name: 'Dashboard',       path: '/client',                  icon: LayoutDashboard },
    { name: 'My Workout',      path: '/client/workout-plan',     icon: Dumbbell },
    { name: 'Exercise Library',path: '/client/exercise-library', icon: BookOpen },
    { name: 'Meal Plan',       path: '/client/meal-plan',        icon: Apple },
    { name: 'Body Metrics',    path: '/client/metrics',          icon: Scale },
    { name: 'Weekly Check-In', path: '/client/check-ins',        icon: Activity },
    { name: 'Goal Assist',     path: '/client/goal-assist',      icon: Target },
    { name: 'Billing',         path: '/client/billing',          icon: CreditCard },
    { name: 'Messages',        path: '/client/messages',         icon: MessageSquare },
    { name: 'BMR Calculator',  path: '/client/bmr-calculator',   icon: Calculator },
  ];

  const navItems = isAdmin ? adminNav : clientNav;

  const isActive = (path) => {
    if (path === prefix) return location.pathname === prefix;
    return location.pathname.startsWith(path);
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markNotificationRead(notif.id);
    const route = notifRoute(notif, user?.role);
    setShowNotifs(false);
    onClose?.();
    navigate(route);
  };

  const handleMarkAll = async () => {
    const targetId = isAdmin ? 'admin' : user.id;
    await markAllNotificationsRead(targetId);
  };

  // Compute notification panel position from bell button bounding rect
  const bellRect = showNotifs ? bellRef.current?.getBoundingClientRect() : null;
  const panelStyle = {
    position: 'fixed',
    top: bellRect ? bellRect.bottom + 8 : 80,
    left: bellRect ? Math.min(bellRect.left, window.innerWidth - 336) : 4,
    width: 320,
    zIndex: 9999,
    background: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: 16,
    boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,193,5,0.08)',
    overflow: 'hidden',
  };

  return (
    <div
      className="flex flex-col h-full w-64"
      style={{ background: '#141414', borderRight: '1px solid #1e1e1e' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
        <Link to={prefix} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0 pr-3">
          <img 
            src={logoUrl} 
            alt="CJ FITNESS Logo" 
            className="w-12 h-12 object-cover rounded-xl shadow-lg border border-yellow-500/30" 
          />
          <div className="flex-1 min-w-0">
            <div className="truncate">
              <span className="text-[18px] font-black tracking-tight" style={{ color: '#ffc105' }}>CJ</span>
              <span className="text-[18px] font-black tracking-tight text-white"> FITNESS</span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5 truncate" style={{ color: '#bbb' }}>
              {isAdmin ? 'Admin Portal' : 'Client Portal'}
            </p>
          </div>
        </Link>
        {/* Bell button */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative p-2 rounded-xl transition-all"
            style={{ background: showNotifs ? 'rgba(255,193,5,0.15)' : 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,193,5,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = showNotifs ? 'rgba(255,193,5,0.15)' : 'transparent'}
            title="Notifications"
          >
            <Bell className="w-5 h-5" style={{ color: unread.length > 0 ? '#ffc105' : '#bbb' }} />
            {unread.length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black rounded-full px-1"
                style={{ background: '#ffc105', color: '#111' }}
              >
                {unread.length > 9 ? '9+' : unread.length}
              </span>
            )}
          </button>

          {/* Notification panel — using Portal to break out of sidebar stacking context */}
          {showNotifs && createPortal(
            <div id="notif-panel" style={panelStyle}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #222' }}>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: '#ffc105' }} />
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unread.length > 0 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#ffc105', color: '#111' }}>
                      {unread.length} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unread.length > 0 && (
                    <button onClick={handleMarkAll} className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
                      style={{ color: '#4ade80', background: 'rgba(74,222,128,0.08)' }}>
                      <Check className="w-3 h-3" /> All read
                    </button>
                  )}
                  <button onClick={() => setShowNotifs(false)} style={{ color: '#ccc' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-80">
                {(notifications || []).length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: '#2a2a2a' }} />
                    <p className="text-sm" style={{ color: '#ccc' }}>No notifications yet</p>
                  </div>
                ) : (
                  [...(notifications || [])].reverse().map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 transition-all"
                      style={{
                        background: n.read ? 'transparent' : 'rgba(255,193,5,0.04)',
                        borderBottom: '1px solid #1e1e1e',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(255,193,5,0.04)'}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: n.read ? '#333' : '#ffc105', boxShadow: n.read ? 'none' : '0 0 6px #ffc10580' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug" style={{ color: n.read ? '#ccc' : '#ddd' }}>{n.message}</p>
                        <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#bbb' }}>
                          <ChevronRight className="w-2.5 h-2.5" />
                          {n.read ? 'Click to view' : 'Tap to open →'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 mt-2">
        {navItems.map(item => {
          const active = isActive(item.path);
          const isMessages = item.name === 'Messages';
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative"
              style={{
                background: active ? 'rgba(255,193,5,0.12)' : 'transparent',
                color: active ? '#ffc105' : '#aaa',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e0e0e0'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#aaa'; } }}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">{item.name}</span>
              
              {isMessages && unreadMessages > 0 ? (
                <div className="ml-auto flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-black" 
                     style={{ background: '#f87171', color: '#111', boxShadow: '0 0 10px rgba(248,113,113,0.4)' }}>
                  {unreadMessages}
                </div>
              ) : active && !isMessages ? (
                <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ background: '#ffc105' }} />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-5 shrink-0" style={{ borderTop: '1px solid #1e1e1e', paddingTop: '12px' }}>
        <div className="flex items-center gap-2 px-2 py-2.5 rounded-xl mb-1 transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
          <Link to={`${prefix}/profile`} className="flex-1 min-w-0 flex items-center gap-3" onClick={onClose}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: 'rgba(255,193,5,0.15)', color: '#ffc105' }}
            >
              {(isAdmin ? 'CJ' : (user?.name || user?.email || 'U'))[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate hover:text-[#ffc105] transition-colors">{isAdmin ? 'CJ' : (user?.name || 'User')}</p>
              <p className="text-xs capitalize truncate" style={{ color: '#bbb' }}>{user?.role} Portal</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg transition-all shrink-0"
            title="Sign out"
            style={{ color: '#ccc' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Sidebar);
