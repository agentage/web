'use client';

import { LoginButton } from './LoginButton';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: 'google' | 'github' | 'microsoft') => void;
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Agentage</h2>
            <p className="text-gray-600">Sign in to continue</p>
          </div>

          {/* Login Buttons */}
          <div className="space-y-3">
            <LoginButton provider="google" onClick={() => onLogin('google')} className="w-full" />
            <LoginButton provider="github" onClick={() => onLogin('github')} className="w-full" />
            <LoginButton
              provider="microsoft"
              onClick={() => onLogin('microsoft')}
              className="w-full"
            />
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
