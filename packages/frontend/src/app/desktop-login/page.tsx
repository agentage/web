'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LoginButton } from '../../components/auth/LoginButton';

function DesktopLoginContent() {
  const searchParams = useSearchParams();
  const callback = searchParams.get('callback') || 'http://localhost:3739/callback';

  const handleLogin = (provider: 'google' | 'github' | 'microsoft') => {
    const params = new URLSearchParams({
      desktop: 'true',
      callback,
      include_provider_token: 'true',
    });

    window.location.href = `/api/auth/${provider}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in to Agentage Desktop</h1>
          <p className="text-gray-600">Choose your preferred authentication method</p>
        </div>

        {/* Login Buttons */}
        <div className="space-y-3 mb-6">
          <LoginButton provider="google" onClick={() => handleLogin('google')} className="w-full" />
          <LoginButton provider="github" onClick={() => handleLogin('github')} className="w-full" />
          <LoginButton
            provider="microsoft"
            onClick={() => handleLogin('microsoft')}
            className="w-full"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                Secure Desktop Authentication
              </p>
              <p className="text-xs text-blue-700">
                After signing in, you'll be redirected back to the Agentage Desktop application on
                your computer.
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function DesktopLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <DesktopLoginContent />
    </Suspense>
  );
}
