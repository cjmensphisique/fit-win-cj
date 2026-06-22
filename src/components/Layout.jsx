import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar, { notifRoute } from './Sidebar';
import { Menu, Bell, X, ChevronRight, Download, Share } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api';

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

  const location = useLocation();
  const activeSessionIdRef = useRef(sessionStorage.getItem('activeActivityId'));

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Load dismissal state
    const dismissed = sessionStorage.getItem('dismissedPwaPrompt') === 'true';
    setIsDismissed(dismissed);

    // Check if standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandaloneMode) return;

    // Check if iOS
    const ios = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
    setIsIOS(ios);

    // Check if prompt was already captured globally
    if (window.deferredPrompt) {
      setIsInstallable(true);
    }

    // Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
      setIsInstallable(true);
    };

    // Listen to custom global PWA event
    const handleCustomPromptReady = () => {
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-deferred-prompt-ready', handleCustomPromptReady);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-deferred-prompt-ready', handleCustomPromptReady);
    };
  }, []);

  const dismissPrompt = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dismissedPwaPrompt', 'true');
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const promptObj = deferredPrompt || window.deferredPrompt;
    if (promptObj) {
      promptObj.prompt();
      const { outcome } = await promptObj.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        dismissPrompt();
      }
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    }
  };

  const showInstallButton = isInstallable || (isIOS && !(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone));

  // 1. Session tracking effect
  useEffect(() => {
    if (!user || user.role !== 'client') return;

    const startSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: user.id,
            clientName: user.name || user.email || 'Client'
          })
        });
        if (res.ok) {
          const result = await res.json();
          if (result.activityId) {
            activeSessionIdRef.current = result.activityId;
            sessionStorage.setItem('activeActivityId', result.activityId);
          }
        }
      } catch (err) {
        console.error('Failed to start PWA activity tracking:', err);
      }
    };

    if (!activeSessionIdRef.current) {
      startSession();
    }
  }, [user]);

  // 2. Heartbeat & Page Navigation effect
  useEffect(() => {
    if (!user || user.role !== 'client' || !activeSessionIdRef.current) return;

    const sendHeartbeat = async (pagePath) => {
      try {
        await fetch(`${API_URL}/api/activity/heartbeat`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: activeSessionIdRef.current,
            page: pagePath
          })
        });
      } catch (err) {
        // Silent error
      }
    };

    sendHeartbeat(location.pathname);

    const intervalId = setInterval(() => {
      sendHeartbeat(location.pathname);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, location.pathname]);

  // 3. Tab close / Unload session termination effect
  useEffect(() => {
    const handleUnload = () => {
      if (activeSessionIdRef.current) {
        const url = `${API_URL}/api/activity/end`;
        const headers = { type: 'application/json' };
        const blob = new Blob([JSON.stringify({ activityId: activeSessionIdRef.current })], headers);
        navigator.sendBeacon(url, blob);
        
        sessionStorage.removeItem('activeActivityId');
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  useEffect(() => {
    // Hide native splash screen when layout is mounted
    if (window.hideLoader) window.hideLoader();
  }, []);

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
      className="flex h-[100dvh] overflow-hidden"
      style={{ background: '#111111', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* CSS for toast animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* Toast stack — bottom right (moved up to avoid overlap with sticky install button) */}
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
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
            <span className="text-white"> FITNESS GEEK</span>
          </span>
        </div>

        <div className="py-5 px-4 sm:py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Sticky Install App Floating Popup Card */}
      {showInstallButton && !isDismissed && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#1f1f1f] border border-[#ffc105]/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)] rounded-2xl p-4 pr-10 flex flex-col gap-2 max-w-[280px] relative">
            <button
              onClick={dismissPrompt}
              className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-white transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ffc105]/10 flex items-center justify-center shrink-0">
                <Download className="w-4.5 h-4.5 text-[#ffc105]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-bold text-xs">Install App</h4>
                <p className="text-[10px] text-gray-400">Get offline access & fullscreen dashboard.</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="mt-1.5 w-full py-2 bg-[#ffc105] hover:bg-[#eab308] text-black text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors text-center"
            >
              Install Now
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari PWA installation modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-[#ffc105]/30 rounded-3xl p-6 max-w-sm w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffc105] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#ffc105]/20 mb-4">
                <Download className="w-8 h-8 text-black" />
              </div>
              
              <h3 className="text-white font-black text-lg mb-2">Install CJ Fitness Geek</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                To install this app on your iPhone or iPad, please follow these steps in Safari:
              </p>
              
              <div className="space-y-4 w-full text-left bg-black/30 p-4 rounded-2xl border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ffc105]/10 text-[#ffc105] flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-xs text-gray-300">
                    Tap the <span className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded text-white mx-0.5"><Share className="w-3.5 h-3.5" /> Share</span> button at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ffc105]/10 text-[#ffc105] flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-xs text-gray-300">
                    Scroll down and tap <span className="font-bold text-white">"Add to Home Screen"</span>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ffc105]/10 text-[#ffc105] flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-xs text-gray-300">
                    Tap <span className="font-bold text-white">"Add"</span> in the top right corner.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-colors text-xs uppercase tracking-wider"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
