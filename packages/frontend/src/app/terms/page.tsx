import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Agentage',
  description: 'Terms of Service for Agentage - Learn about our terms and conditions.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12">
          <h1
            data-testid="terms-of-service-page-header"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">Last updated: November 7, 2025</p>
          <p className="text-lg text-gray-600 leading-relaxed mt-4">
            By using Agentage, you agree to these terms. If you don&apos;t agree, please don&apos;t
            use our platform.
          </p>
        </div>

        {/* User Responsibilities */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">User Responsibilities</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">✅ Acceptable Use</h3>
              <ul className="space-y-2 text-green-800">
                <li>• Use platform for legitimate purposes</li>
                <li>• Provide accurate information</li>
                <li>• Respect intellectual property rights</li>
                <li>• Follow community guidelines</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-900 mb-4">❌ Prohibited Activities</h3>
              <ul className="space-y-2 text-red-800">
                <li>• Submit malicious or illegal content</li>
                <li>• Compromise platform security</li>
                <li>• Spam or harassment</li>
                <li>• Share false information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content Submission Requirements */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Content Submission Requirements</h2>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Quality Standards</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Open source with accessible repository</li>
              <li>• Comprehensive documentation</li>
              <li>• Valid implementation</li>
              <li>• No security vulnerabilities</li>
            </ul>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Intellectual Property</h2>

          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              Agentage owns platform content. Users retain ownership of submitted content and grant
              us license to display it.
            </p>
            <p className="text-gray-600">
              Respect others&apos; intellectual property rights. We respond to DMCA takedown
              requests.
            </p>
          </div>
        </div>

        {/* Account Management & Disclaimers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Account Management & Disclaimers
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Account Actions</h3>
              <p className="text-yellow-800 text-sm">
                We may suspend or terminate accounts that violate terms or engage in harmful
                activities. Appeals can be submitted through support channels.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Service Limitations</h3>
              <p className="text-gray-600 text-sm">
                Service provided &quot;as is&quot; without warranties. We don&apos;t guarantee
                third-party content quality. Liability limited to maximum extent permitted by law.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center bg-gray-900 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
          <p className="text-gray-300 mb-6">
            Contact our support team if you have any questions about these Terms of Service.
          </p>
          <a
            href="/contact"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
