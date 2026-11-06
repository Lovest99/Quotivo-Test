import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { CheckCircle2, Lock } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setIsSuccess(true);
    showToast('Password successfully updated!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
          <BrandLogo size="md" className="mx-auto" />
        </Link>
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          Set New Account Password
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          {!isSuccess ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
              >
                Update Password
              </button>
            </form>
          ) : (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Password Successfully Reset
              </h3>
              <p className="text-neutral-500 text-[11px]">
                You can now log in with your updated credentials.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block px-5 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg font-medium"
                >
                  Proceed to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
