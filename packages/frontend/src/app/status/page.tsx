import { fetchSystemStatus } from '../../lib/api';

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
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">System Status</h1>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-4">
            Make sure the backend service is running on port 3001
          </p>
        </div>
      ) : status ? (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-green-900">All Systems Operational</h2>
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Backend Service</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">
                  {status.backend.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Version:</span>
                <span className="font-mono text-gray-900">{status.backend.version}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Environment:</span>
                <span className="font-mono text-gray-900">{status.backend.environment}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Node Version:</span>
                <span className="font-mono text-gray-900">{status.backend.node_version}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-mono text-gray-900">
                  {Math.floor(status.backend.uptime)} seconds
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Check:</span>
                <span className="font-mono text-gray-900">
                  {new Date(status.backend.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Memory Usage</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">RSS:</span>
                <span className="font-mono text-gray-900">
                  {(status.backend.memory.rss / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Heap Total:</span>
                <span className="font-mono text-gray-900">
                  {(status.backend.memory.heapTotal / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Heap Used:</span>
                <span className="font-mono text-gray-900">
                  {(status.backend.memory.heapUsed / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">External:</span>
                <span className="font-mono text-gray-900">
                  {(status.backend.memory.external / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          </div>

          {/* Frontend Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frontend Service</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Environment:</span>
                <span className="font-mono text-gray-900">{status.environment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Framework:</span>
                <span className="font-mono text-gray-900">Next.js 14</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
