import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Agentage',
  description:
    "Get in touch with the Agentage team. We're here to help with any questions or support you need.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-16">
          <h1
            data-testid="contact-page-header"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Have questions about Agentage? Looking to contribute or collaborate? We&apos;d love to
            hear from you. Our team is here to help you make the most of our AI integration
            platform.
          </p>
        </div>

        {/* Community & Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Community & Resources</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <p className="text-gray-600 leading-relaxed mb-6">
              Join our growing community of developers and users. Connect with others, share
              knowledge, and stay updated on the latest developments in AI integration and
              automation.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <h4 className="font-semibold text-gray-900">Documentation & Guides</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <Link href="/about" className="text-blue-600 hover:text-blue-700">
                      About Agentage
                    </Link>
                  </li>
                  <li>
                    <Link href="/status" className="text-blue-600 hover:text-blue-700">
                      System Status
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <h4 className="font-semibold text-gray-900">External Resources</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a
                      href="https://github.com/agentage/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      GitHub Organization
                    </a>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Send Us a Message</h2>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Response Times</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">General inquiries:</span>
                    <span className="font-medium">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technical support:</span>
                    <span className="font-medium">Within 12 hours</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Before You Contact</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Check our documentation first</li>
                  <li>• Search existing discussions on GitHub</li>
                  <li>• Be specific about your use case</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-900 rounded-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re looking to integrate AI capabilities or collaborate with our team,
            Agentage is here to help you succeed in building the future of AI-powered applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Learn More
            </Link>
            <Link
              href="/"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
