import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import LoadingScreen from '../components/LoadingScreen';
import logoUrl from '../assets/logo.jpeg';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();
  const { loading } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    // Hide native splash screen when login page is mounted
    if (window.hideLoader) window.hideLoader();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(identifier, password);
      if (result.success) {
        // Redirection handled by Navigate in the render if user state updates
        // but adding local navigate for immediate response
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (storedUser) {
          navigate(storedUser.role === 'admin' ? '/admin' : '/client');
        }
      } else {
        setError(result.error === 'invalid' ? 'Invalid credentials. Please try again.' : result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="flex min-h-screen bg-[#111111]">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255,193,5,0.18) 0%, rgba(30,20,0,0.7) 60%, #111111 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-20 blur-3xl"
          style={{ background: '#ffc105' }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] rounded-full opacity-10 blur-3xl"
          style={{ background: '#ffc105' }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo Icon */}
          <div className="w-24 h-24 flex items-center justify-center mb-6">
            <img 
              src={logoUrl} 
              alt="CJ FITNESS Logo" 
              className="w-full h-full object-cover rounded-2xl shadow-2xl border-2 border-[#ffc105]/30" 
            />
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl font-black tracking-wide mb-4 leading-tight">
            <span style={{ color: '#ffc105' }}>CJ</span>
            <span className="text-white"> FITNESS</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed max-w-xs mb-12">
            Transform your body. Track your progress. Achieve greatness.
          </p>

          {/* Stats */}
          <div className="flex gap-4">
            {[
              { value: '8+', label: 'Years Exp' },
              { value: '20+', label: 'Programs' },
              { value: '95%', label: 'Success Rate' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center px-6 py-4 rounded-xl border"
                style={{
                  background: 'rgba(255,193,5,0.07)',
                  borderColor: 'rgba(255,193,5,0.2)',
                  minWidth: '90px',
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#ffc105' }}>
                  {stat.value}
                </span>
                <span className="text-gray-400 text-xs mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12" style={{ background: '#161616' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex flex-col lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 items-center justify-center">
              <img 
                src={logoUrl} 
                alt="CJ FITNESS Logo" 
                className="w-full h-full object-cover rounded-xl shadow-lg border border-[#ffc105]/30" 
              />
            </div>
            <span className="text-xl font-black">
              <span style={{ color: '#ffc105' }}>CJ</span>
              <span className="text-white"> FITNESS</span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                required
                placeholder="Enter email or phone number"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none transition-all"
                style={{
                  background: '#1e1e1e',
                  border: '1.5px solid #2a2a2a',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#ffc105'; }}
                onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none transition-all pr-12"
                  style={{
                    background: '#1e1e1e',
                    border: '1.5px solid #2a2a2a',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#ffc105'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-400 text-sm text-center py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-black font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-[#ffc105]/20 flex items-center justify-center gap-2"
              style={{
                background: isSubmitting ? '#cc9a00' : '#ffc105',
                opacity: isSubmitting ? 0.8 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

            {/* Forgot password */}
            <div className="text-center pt-1">
              <a
                href="/forgot-password"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
