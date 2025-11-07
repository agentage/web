import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Agentage',
  description: 'Privacy Policy for Agentage - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12">
          <h1
            data-testid="privacy-policy-page-header"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">Last updated: November 7, 2025</p>
          <p className="text-lg text-gray-600 leading-relaxed mt-4">
            This Privacy Policy explains how we collect, use, and protect your data on Agentage.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Information We Collect</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🔐 Account Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Email and profile from OAuth providers</li>
                <li>• Username and display name</li>
                <li>• Profile picture and preferences</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Usage Data</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Search queries and browsing behavior</li>
                <li>• Platform interactions and bookmarks</li>
                <li>• IP address and device information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How We Use Your Information</h2>

          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="space-y-2 text-gray-600">
              <li>• Provide and improve platform services</li>
              <li>• Enable user authentication and account management</li>
              <li>• Send important updates and communications</li>
              <li>• Ensure platform security and prevent abuse</li>
              <li>• Comply with legal requirements</li>
            </ul>
          </div>
        </div>

        {/* Data Sharing and Security */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Data Sharing and Security</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">🔒 Sharing Policy</h3>
              <p className="text-blue-800 mb-3">
                We don&apos;t sell, trade, or otherwise transfer your personal information to third
                parties. We only share data with trusted service providers, for legal compliance, or
                when publicly submitted by you.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">🔐 Security Measures</h3>
              <p className="text-green-800 mb-3">
                We use encryption, secure storage, regular audits, and access controls to protect
                your data.
              </p>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Rights</h2>

          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">You can:</p>
            <ul className="space-y-2 text-gray-600">
              <li>• Manage email preferences in account settings</li>
              <li>• Request a copy of your personal data</li>
              <li>• Update your profile information</li>
              <li>• Delete your account and associated data</li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center bg-gray-900 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
          <p className="text-gray-300 mb-6">
            Contact us if you have questions about this Privacy Policy or how we handle your data.
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
