import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/ui/BrandLogo';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateBusiness, showToast } = useApp();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      showToast('Please accept terms of service to continue', 'warning');
      return;
    }

    if (businessName) {
      updateBusiness({ name: businessName });
    }

    showToast('Account registered! Starting business onboarding...', 'success');
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
          <BrandLogo size="md" className="mx-auto" />
        </Link>
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          Create your business quoting workspace
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">Business or Company Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Apex Civil Contracting"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">Work Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estimating@company.com"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">Account Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded text-blue-600 mt-0.5"
              />
              <span className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                I agree to the Commercial Service Terms and understand that AI quotations require human authorization.
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Register & Begin Setup
            </button>
          </form>

          <div className="pt-2 text-center text-neutral-500">
            <span>Already registered? </span>
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
