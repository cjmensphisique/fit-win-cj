import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar, { notifRoute } from './Sidebar';
import { Menu, Bell, X, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

// ── Toast alert for new notifications ────────────────────────────────────────
function NotifToast({ notif, onClose, onClick }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 w-full max-w-sm shadow-2xl rounded-2xl p-4 text-left transition-all"
      style={{
        background: '#1a1a1a',
        border: '1px solid rgba(255,193,5,0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,193,5,0.15)',
        animation: 'slideInRight 0.3s ease',
      }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,193,5,0.15)' }}>
        <Bell className="w-4 h-4" style={{ color: '#ffc105' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold" style={{ color: '#ffc105' }}>New Notification</p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: '#ccc' }}>{notif.message}</p>
        <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: '#ccc' }}>
          <ChevronRight className="w-2.5 h-2.5" /> Tap to view
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        className="p-1 rounded-lg shrink-0 transition-colors"
        style={{ color: '#bbb' }}
        onMouseEnter={e => e.currentTarget.style.color = '#bbb'}
        onMouseLeave={e => e.currentTarget.style.color = '#444'}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </button>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { notifications, loadNotifications, markNotificationRead } = useData();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const prevCountRef = useRef(null);

  const shownIdsRef = useRef(new Set());

  // Track new unread notifications and show toasts
  useEffect(() => {
    if (!user) return;
    const targetId = user.role === 'admin' ? 'admin' : user.id;
    loadNotifications(targetId);
  }, [user]);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    
    // Check if we already have shownIds populated
    if (shownIdsRef.current.size === 0) {
      notifications.filter(n => !n.read).forEach(n => shownIdsRef.current.add(n.id));
      return; // Don't toast existing unread on load
    }

    // Find newly arrived unread notifications
    const newUnread = notifications.filter(n => !n.read && !shownIdsRef.current.has(n.id));
    if (newUnread.length > 0) {
      newUnread.forEach(n => {
        shownIdsRef.current.add(n.id);
        setToasts(prev => [...prev, { ...n, toastId: `${n.id}-${Date.now()}` }]);
      });
    }
  }, [notifications]);

  const dismissToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  const handleToastClick = async (notif) => {
    dismissToast(notif.toastId);
    if (!notif.read) await markNotificationRead(notif.id);
    const route = notifRoute(notif, user?.role);
    navigate(route);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#111111', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* CSS for toast animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* Toast stack — bottom right */}
      <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.toastId} className="pointer-events-auto">
            <NotifToast
              notif={t}
              onClose={() => dismissToast(t.toastId)}
              onClick={() => handleToastClick(t)}
            />
          </div>
        ))}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-20 lg:hidden"
          style={{ background: '#141414', borderColor: '#1e1e1e' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl transition-colors shrink-0"
            style={{ color: '#aaa' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
          >
            <Menu className="w-8 h-8" />
          </button>
          <span className="text-base font-black">
            <span style={{ color: '#ffc105' }}>CJ</span>
            <span className="text-white"> FITNESS</span>
          </span>
        </div>

        <div className="py-5 px-4 sm:py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
