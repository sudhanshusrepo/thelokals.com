import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

export const Support: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="text-4xl">💬</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">How can we help?</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          We're here to assist you with any questions or issues you might have.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => window.location.href = 'mailto:support@thelokals.com'}>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.EMAIL} /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Email Support</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Get a response within 24 hours</p>
          <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Send Email <span className="text-lg">→</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">Coming Soon</div>
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Live Chat</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Chat instantly with our team</p>
          <button disabled className="text-slate-400 dark:text-slate-500 font-semibold text-sm flex items-center gap-1 cursor-not-allowed">
            Start Chat <span className="text-lg">→</span>
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">❓</span> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          <FAQItem
            question="How do I book a service?"
            answer="Simply select a service category from the home page, describe your needs, and our AI will help you get matched with the right professional."
          />
          <FAQItem
            question="How do I cancel a booking?"
            answer="Go to your Bookings tab, find the booking you want to cancel, and click the cancel button. Please note our cancellation policy."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit cards, debit cards, UPI, and digital payment methods through our secure payment gateway."
          />
          <FAQItem
            question="Are the service providers verified?"
            answer="Yes, all our service providers go through a thorough verification process including background checks and skill assessments."
          />
        </div>
      </div>

      {/* Legal Links */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 pb-8">
        <button
          onClick={() => navigate('/dashboard/terms')}
          className="text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium text-sm transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Terms & Conditions
        </button>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
        <button
          onClick={() => navigate('/dashboard/privacy')}
          className="text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium text-sm transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Privacy Policy
        </button>
      </div>
    </div>
  );
};

const FAQItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => (
  <details className="group bg-slate-50 dark:bg-slate-700/30 rounded-xl overflow-hidden transition-all duration-200 open:bg-teal-50 dark:open:bg-teal-900/10 border border-transparent open:border-teal-100 dark:open:border-teal-800/30">
    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-slate-900 dark:text-white select-none">
      {question}
      <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </span>
    </summary>
    <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in">
      {answer}
    </div>
  </details>
);

