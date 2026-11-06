import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
          <BrandLogo size="md" className="mx-auto" />
        </Link>
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          Account Password Recovery
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-neutral-500 leading-relaxed">
                Enter your work email address and we'll send instructions to reset your account password.
              </p>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Password Reset Email Dispatched
              </h3>
              <p className="text-neutral-500 leading-relaxed text-[11px]">
                In this demo mode, a simulated reset link has been dispatched to <strong className="font-mono text-neutral-800 dark:text-neutral-200">{email}</strong>.
              </p>
              <div className="pt-2">
                <Link
                  to="/reset-password?token=demo_token"
                  className="inline-block px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg font-medium"
                >
                  Simulate Password Reset Link
                </Link>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
