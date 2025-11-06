export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About Agentage</h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vision</h2>
          <p className="text-gray-700 mb-4">
            Agentage is building the future of AI agent development. Our mission is to make
            creating, sharing, and deploying AI agents as simple as writing a README file.
          </p>
          <p className="text-gray-700">
            We believe agents should be portable, shareable, and easy to work with - just like
            modern software packages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Next.js 14 with App Router</li>
            <li>TypeScript for type safety</li>
            <li>Express.js backend API</li>
            <li>Docker for containerization</li>
            <li>Hetzner Cloud infrastructure</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Roadmap</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Phase 1: Core SDK and CLI</li>
            <li>Phase 2: Agent registry and marketplace</li>
            <li>Phase 3: Cross-platform synchronization</li>
            <li>Phase 4: Enhanced features and integrations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Involved</h2>
          <p className="text-gray-700 mb-4">
            Agentage is an open-source project. We welcome contributions from the community.
          </p>
          <a
            href="https://github.com/agentage"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Visit our GitHub
          </a>
        </section>
      </div>
    </div>
  );
}
