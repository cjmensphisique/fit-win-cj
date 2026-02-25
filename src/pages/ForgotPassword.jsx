import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Phone & Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_URL}/auth/verify-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await resp.json();
      if (resp.ok) {
        setStep(2);
      } else {
        setError(data.error || 'User with this email not found');
      }
    } catch (err) {
      setError('Connection failed. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, newPassword })
      });
      const data = await resp.json();
      if (resp.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Reset failed. Please verify your phone number.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-yellow-500">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {success ? 'Success!' : step === 1 ? 'Enter your email to verify your account' : 'Verify your phone number to set a new password'}
          </p>
        </div>
        
        {success ? (
          <div className="mt-8 text-center">
            <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
              Your password has been reset successfully.
            </div>
            <Link to="/login" className="flex w-full justify-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={step === 1 ? handleVerifyEmail : handleResetPassword}>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {step === 1 ? (
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full rounded-md border-0 bg-gray-700 py-2 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 px-3"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-400 mb-1 ml-1">Registered Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="relative block w-full rounded-md border-0 bg-gray-700 py-2 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 px-3"
                      placeholder="e.g. 1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-xs font-medium text-gray-400 mb-1 ml-1">New Password</label>
                    <input
                      id="new-password"
                      name="password"
                      type="password"
                      required
                      className="relative block w-full rounded-md border-0 bg-gray-700 py-2 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 px-3"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : step === 1 ? 'Verify Email' : 'Reset Password'}
              </button>
            </div>
            
            {step === 2 && (
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-400 hover:text-white"
              >
                Try a different email
              </button>
            )}
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="font-medium text-yellow-500 hover:text-yellow-400">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
