'use client';

import Link from 'next/link';
import { useState } from 'react';

// Logo Component - Enhanced/Premium Style
const Logo = () => (
  <Link href="/" className="flex items-center space-x-3">
    <div className="relative">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
    </div>
    <div>
      <div className="text-xl font-black text-gray-900 hover:text-blue-600 transition-colors">
        Agentage
      </div>
      <div className="text-xs text-gray-500 font-mono">v{process.env.APP_VERSION}</div>
    </div>
  </Link>
);

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto px-4 h-full">
          {/* Top Bar with Secondary Links */}
          <div className="hidden md:flex items-center justify-between py-2 text-xs border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Discover the future of AI integrations
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors">
                Terms
              </a>
              <a
                href="https://github.com/agentage/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo - Enhanced Style */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Navigation - Enhanced Links with Icons */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
                </svg>
                Home
              </Link>
              <Link
                href="/documentation"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Documentation
              </Link>
              <Link
                href="/status"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Status
              </Link>
              <a
                href="/contact"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Contact
              </a>
            </nav>

            {/* Right Section - Enhanced Actions */}
            <div className="flex items-center space-x-3">
              {/* Get Started button */}
              <Link
                href="/documentation"
                className="hidden sm:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-blue-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Get Started
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-3 text-gray-600 hover:text-gray-900 hover:bg-slate-50 rounded-xl transition-colors"
                onClick={toggleMobileMenu}
                data-testid="mobile-menu-button"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu - Enhanced Overlay */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
              <div className="px-4 py-6 space-y-4">
                <Link
                  href="/"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
                  onClick={toggleMobileMenu}
                >
                  <svg
                    className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
                  </svg>
                  Home
                </Link>
                <Link
                  href="/documentation"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
                  onClick={toggleMobileMenu}
                >
                  <svg
                    className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Documentation
                </Link>
                <Link
                  href="/status"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
                  onClick={toggleMobileMenu}
                >
                  <svg
                    className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Status
                </Link>
                <a
                  href="/contact"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl font-medium transition-all group"
                  onClick={toggleMobileMenu}
                >
                  <svg
                    className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Contact
                </a>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {/* Get Started */}
                  <Link
                    href="/documentation"
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-blue-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                    onClick={toggleMobileMenu}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Get Started
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
