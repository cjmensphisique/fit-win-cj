import { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

export default function NetworkStatus() {
  const [setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(!navigator.onLine);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRestored(true);
      setShowToast(true);
      
      // Auto-hide the "Back Online" success toast after 3 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
        setRestored(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setRestored(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast) return null;

  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm"
      style={{
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Toast slide up animation style keyframe */}
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

      <div
        className="flex items-start gap-4 p-4 rounded-2xl shadow-2xl transition-all border"
        style={{
          background: '#161616',
          borderColor: restored ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: restored ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: restored ? '#4ade80' : '#f87171',
          }}
        >
          {restored ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-white">
            {restored ? 'Connection Restored' : 'No Internet Connection'}
          </p>
          <p className="text-xs text-[#888] mt-0.5 leading-normal">
            {restored 
              ? 'You are back online. All features are available.' 
              : 'Please check your internet connectivity. Operating in offline mode.'}
          </p>
        </div>

        {!restored && (
          <button 
            onClick={() => setShowToast(false)}
            className="p-1 rounded-lg hover:bg-[#222] transition-colors shrink-0 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
