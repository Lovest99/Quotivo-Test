import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Eye, EyeOff, ShieldCheck, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { availableUsers, switchUser, showToast } = useApp();

  const [email, setEmail] = useState('marcus@apexcivil.example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      const match = availableUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        StorageService.setCurrentUser(match);
        showToast(`Welcome back, ${match.name}!`, 'success');
        navigate('/app');
      } else {
        // Fallback demo user
        showToast('Logged in (Simulated demo session)', 'success');
        navigate('/app');
      }
    }, 400);
  };

  const handleQuickDemoLogin = (userId: string) => {
    switchUser(userId);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
          <BrandLogo size="md" className="mx-auto" />
        </Link>
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          Sign in to your business quoting workspace
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          {/* Quick Demo Access Bar */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-100 dark:border-neutral-800 space-y-2">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 block text-[11px] uppercase tracking-wider">
              Quick Demo Persona Access:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('usr_owner_01')}
                className="p-1.5 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:border-blue-500 text-[10px] font-semibold text-neutral-800 dark:text-neutral-100 text-center"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('usr_staff_01')}
                className="p-1.5 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:border-blue-500 text-[10px] font-semibold text-neutral-800 dark:text-neutral-100 text-center"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('usr_approver_01')}
                className="p-1.5 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:border-blue-500 text-[10px] font-semibold text-neutral-800 dark:text-neutral-100 text-center"
              >
                Approver
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">Password</label>
                <Link to="/forgot-password" className="text-blue-600 hover:underline text-[11px]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-rose-600 text-[11px] font-medium">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-2 text-center text-neutral-500">
            <span>Don't have an account yet? </span>
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
