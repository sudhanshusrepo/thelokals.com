import React from 'react';

export const Support: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Customer Support</h1>
          <p className="text-slate-600 dark:text-slate-400">We're here to help you</p>
        </div>

        <div className="space-y-6">
          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📧</span>
                <h3 className="font-bold text-slate-900 dark:text-white">Email Support</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Get help via email
              </p>
              <a
                href="mailto:support@thelokals.com"
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                support@thelokals.com
              </a>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💬</span>
                <h3 className="font-bold text-slate-900 dark:text-white">Live Chat</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Chat with our team
              </p>
              <button className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                Start Chat (Coming Soon)
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 cursor-pointer">
                <summary className="font-semibold text-slate-900 dark:text-white">
                  How do I book a service?
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Simply select a service category from the home page, describe your needs, and our AI will help you get matched with the right professional.
                </p>
              </details>

              <details className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 cursor-pointer">
                <summary className="font-semibold text-slate-900 dark:text-white">
                  How do I cancel a booking?
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Go to your Bookings tab, find the booking you want to cancel, and click the cancel button. Please note our cancellation policy.
                </p>
              </details>

              <details className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 cursor-pointer">
                <summary className="font-semibold text-slate-900 dark:text-white">
                  What payment methods do you accept?
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  We accept all major credit cards, debit cards, and digital payment methods through our secure payment gateway.
                </p>
              </details>

              <details className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 cursor-pointer">
                <summary className="font-semibold text-slate-900 dark:text-white">
                  Are the service providers verified?
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Yes, all our service providers go through a thorough verification process including background checks and skill assessments.
                </p>
              </details>
            </div>
          </div>

          {/* Terms Link */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              For more information, please read our{' '}
              <a href="/dashboard/terms" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                Terms & Conditions
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
