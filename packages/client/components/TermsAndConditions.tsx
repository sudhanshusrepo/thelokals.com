import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in pb-20">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-10">
        <div className="text-center mb-10 border-b border-slate-100 dark:border-slate-700 pb-8">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3">
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Terms of Service</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">TheLokals.com</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 font-mono bg-slate-100 dark:bg-slate-700/50 inline-block px-3 py-1 rounded-full">Last Updated: November 30, 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              These Terms and Conditions outline the rules for using TheLokals.com, a platform connecting users with local home services like maids, tiffins, repairs, and car services in India. By accessing or using the site, users agree to these terms, which prioritize safe transactions for busy families, students, working professionals, and neighborhood providers.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
              <strong>Important:</strong> The platform operates as a marketplace, not a direct service provider. We facilitate connections between service seekers and providers but do not employ or directly provide the services.
            </p>
          </section>

          {/* User Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. User Eligibility and Accounts</h2>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2.1 Age Requirements</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Users must be at least 18 years old to use TheLokals.com. Minors may use the platform only with parental or guardian consent and supervision.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">2.2 Geographic Availability</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Our services are currently available in supported Indian cities, including but not limited to Bihar and Delhi regions. Service availability may vary by location.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">2.3 Account Registration</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
              <li>Registration requires accurate details including phone number and email address</li>
              <li>Providing false information may lead to immediate account suspension</li>
              <li>Users are responsible for maintaining account security and confidentiality</li>
              <li>Sharing account credentials is strictly prohibited</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">2.4 Provider Verification</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Service providers must verify their identity and service credentials before listing services. This includes:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-2">
              <li>Government-issued ID proof</li>
              <li>Service-specific certifications (where applicable)</li>
              <li>Contact verification via phone and email</li>
              <li>Background verification (as required by service category)</li>
            </ul>
          </section>

          {/* Services and Bookings */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Services and Bookings</h2>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3.1 Booking Process</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Bookings can be made via our mobile app or website for listed services. The platform facilitates matches between users and providers but does not handle payments directly. All transactions should use secure payment methods such as UPI or credit/debit cards.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">3.2 Cancellation Policy</h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mt-3">
              <p className="font-semibold text-slate-900 dark:text-white mb-2">User Cancellations:</p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                <li>Free cancellation within 2 hours of booking</li>
                <li>Cancellation fees may apply after 2 hours</li>
                <li>No-show fees apply if service provider arrives but user is unavailable</li>
              </ul>

              <p className="font-semibold text-slate-900 dark:text-white mb-2 mt-4">Provider Cancellations:</p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                <li>24 hours notice required for cancellation</li>
                <li>Penalties apply for late cancellations or no-shows</li>
                <li>Repeated cancellations may result in account suspension</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">3.3 Ratings and Reviews</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Users and providers can rate and review each other after service completion. Reviews must be honest, relevant, and respectful. Fake or malicious reviews will be removed and may result in account suspension.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">3.4 Dispute Resolution</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Disputes between users and providers should be reported to our support team at <a href="mailto:support@thelokals.com" className="text-teal-600 dark:text-teal-400 hover:underline">support@thelokals.com</a>. We aim to resolve all disputes within 48 hours of receiving a complete report.
            </p>
          </section>

          {/* Prohibited Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Prohibited Conduct</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              The following activities are strictly prohibited and will result in immediate account suspension or permanent ban:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
              <li>Spam, fake bookings, or fraudulent activities</li>
              <li>Harassment, abuse, or threatening behavior toward other users or providers</li>
              <li>Illegal activities or promotion of illegal services</li>
              <li>Misuse of personal data or privacy violations</li>
              <li>Reverse-engineering, scraping, or unauthorized access to the platform</li>
              <li>Creating multiple accounts to circumvent restrictions</li>
              <li>Posting offensive, discriminatory, or inappropriate content</li>
            </ul>
          </section>

          {/* Legal Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Legal Compliance</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              All users must comply with applicable Indian laws, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-2">
              <li>Information Technology Act, 2000</li>
              <li>Digital Personal Data Protection Act, 2023</li>
              <li>Consumer Protection Act, 2019</li>
              <li>Payment and Settlement Systems Act, 2007</li>
            </ul>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              TheLokals.com acts solely as a marketplace platform. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-2">
              <li>Quality, safety, or legality of services provided</li>
              <li>Actions or omissions of service providers</li>
              <li>Disputes between users and providers</li>
              <li>Loss or damage resulting from use of the platform</li>
              <li>Service interruptions or technical issues</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
              Users engage with service providers at their own risk and should exercise due diligence.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Intellectual Property</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              All content on TheLokals.com, including logos, designs, text, and software, is protected by intellectual property rights. Users may not copy, reproduce, or distribute platform content without written permission.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Changes to Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any time. Users will be notified of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Contact Information</h2>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                For questions or concerns regarding these Terms and Conditions, please contact us at:
              </p>
              <p className="text-slate-900 dark:text-white font-semibold mt-2">
                Email: <a href="mailto:support@thelokals.com" className="text-teal-600 dark:text-teal-400 hover:underline">support@thelokals.com</a>
              </p>
              <p className="text-slate-900 dark:text-white font-semibold">
                Grievance Officer: <a href="mailto:support@thelokals.com" className="text-teal-600 dark:text-teal-400 hover:underline">support@thelokals.com</a>
              </p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              By using TheLokals.com, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
