import React from 'react';

/**
 * LoadingScreen component that mimics the native splash screen in index.html.
 * Used for Suspense fallbacks and initial authentication checks to ensure
 * a seamless visual transition.
 */
const LoadingScreen = () => {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-[99999]"
      style={{ background: '#141414' }}
    >
      <style>{`
        @keyframes pulse-loader {
          0% { opacity: 0.6; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.6; transform: scale(0.98); }
        }
        .loader-logo-react {
          font-family: 'Inter', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -1px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: pulse-loader 2s infinite ease-in-out;
        }
      `}</style>
      <div className="loader-logo-react">
        <span style={{ color: '#ffc105' }}>CJ</span>
        <span style={{ color: '#fff' }}>FITNESS</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
