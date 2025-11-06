export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Agentage</h1>
        <p className="text-xl text-gray-600 mb-4">AI Agent Platform</p>
        <p className="text-lg text-gray-500 mb-8">
          Build, share, and deploy AI agents with simplicity
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/about"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Learn More
          </a>
          <a
            href="https://github.com/agentage"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Simple SDK</h3>
          <p className="text-gray-600">
            Create AI agents with a clean, intuitive API. Build powerful agents with minimal code.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Portable Agents</h3>
          <p className="text-gray-600">
            Define agents once, run anywhere. Full portability across platforms and environments.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Shareable Registry</h3>
          <p className="text-gray-600">
            Publish and discover agents in our registry. Share your work with the community.
          </p>
        </div>
      </div>
    </div>
  );
}
