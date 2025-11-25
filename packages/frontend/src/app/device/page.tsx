'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const getApiBaseUrl = () => '/api';

function DevicePageContent() {
  const searchParams = useSearchParams();
  const [userCode, setUserCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Pre-fill code from URL if provided
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setUserCode(codeFromUrl.toUpperCase());
      // Auto-verify if code is provided in URL
      verifyAndRedirect(codeFromUrl);
    }
  }, [searchParams]);

  const formatCode = (input: string): string => {
    // Remove non-alphanumeric characters and convert to uppercase
    const clean = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Add hyphen after 4 characters
    if (clean.length > 4) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    }
    return clean;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setUserCode(formatted);
    setError(null);
  };

  const verifyAndRedirect = async (code: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/auth/device/verify?code=${encodeURIComponent(code)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error_description || 'Invalid code');
        setIsVerifying(false);
        return;
      }

      // Code is valid, redirect to GitHub OAuth with the device code
      window.location.href = `${getApiBaseUrl()}/auth/github?device_code=${encodeURIComponent(code)}`;
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userCode.length < 9) {
      // XXXX-XXXX = 9 chars
      setError('Please enter a valid 8-character code');
      return;
    }

    await verifyAndRedirect(userCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Connect Your Device</h1>
          <p className="mt-2 text-gray-600">Enter the code displayed in your CLI to authenticate</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {isVerifying ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Verifying code...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Device Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={userCode}
                  onChange={handleCodeChange}
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                  autoComplete="off"
                  autoFocus
                  className="w-full text-center text-3xl font-mono tracking-widest uppercase px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || userCode.length < 9}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>This will connect your CLI to your GitHub account</p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Don't have a code?{' '}
            <a href="https://agentage.io/docs/cli" className="text-blue-600 hover:text-blue-500">
              Learn how to get started with the CLI
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DevicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <DevicePageContent />
    </Suspense>
  );
}
