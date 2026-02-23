import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending email
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-yellow-500">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email to reset your password
          </p>
        </div>
        
        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                required
                className="relative block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 px-3"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-green-400 mb-4">
              If an account exists for {email}, we have sent a reset link.
            </p>
            <p className="text-gray-400 text-sm">
              (This is a simulation. In a real app, check your email.)
            </p>
          </div>
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
