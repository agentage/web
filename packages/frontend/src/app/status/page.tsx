import type { Metadata } from 'next';
import { fetchSystemStatus } from '../../lib/api';

export const metadata: Metadata = {
  title: 'System Status | Agentage',
  description: 'Check the current status of Agentage services and infrastructure.',
};

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  let status;
  let error;

  try {
    status = await fetchSystemStatus();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12">
          <h1
            data-testid="status-page-header"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            System Status
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Real-time status and health monitoring of all Agentage services and infrastructure.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-semibold text-red-900">Service Unavailable</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600">
              Unable to connect to backend service. Please check that the service is running.
            </p>
          </div>
        ) : status ? (
          <div className="space-y-8">
            {/* Overall Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-semibold text-green-900">All Systems Operational</h2>
              </div>
              <p className="text-green-700 mt-2">All services are running smoothly.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Backend Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900">Backend Service</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className="font-semibold text-green-600 uppercase">
                      {status.backend.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Version</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {status.backend.version}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Environment</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {status.backend.environment}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Node Version</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {status.backend.node_version}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Uptime</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {Math.floor(status.backend.uptime)} seconds
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium">Last Check</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {new Date(status.backend.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900">Memory Usage</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">RSS</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {(status.backend.memory.rss / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Heap Total</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {(status.backend.memory.heapTotal / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Heap Used</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {(status.backend.memory.heapUsed / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium">External</span>
                    <span className="font-mono text-gray-900 text-sm">
                      {(status.backend.memory.external / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Frontend Info - Full Width */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900">Frontend Service</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className="font-semibold text-green-600 uppercase">Operational</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Environment</span>
                  <span className="font-mono text-gray-900 text-sm">{status.environment}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Framework</span>
                  <span className="font-mono text-gray-900 text-sm">Next.js 14</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Rendering</span>
                  <span className="font-mono text-gray-900 text-sm">Server-Side (SSR)</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center bg-gray-900 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Need Support?</h2>
              <p className="text-gray-300 mb-6">
                If you&apos;re experiencing issues or have questions about our service status,
                please don&apos;t hesitate to reach out.
              </p>
              <a
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
              >
                Contact Support
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
