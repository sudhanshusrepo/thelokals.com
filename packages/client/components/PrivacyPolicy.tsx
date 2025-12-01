import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
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
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-3">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Privacy Policy</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">TheLokals.com</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 font-mono bg-slate-100 dark:bg-slate-700/50 inline-block px-3 py-1 rounded-full">Last Updated: November 30, 2025</p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            TheLokals.com, a neighborhood services platform in India, collects and processes user data to connect busy families, students, bachelors, home chefs, and providers for services like maids, tiffins, repairs, and car maintenance.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                            This policy complies with India's <strong>Digital Personal Data Protection Act 2023 (DPDP Act)</strong> and <strong>Information Technology Rules 2011</strong>, ensuring transparent handling of personal information.
                        </p>
                        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mt-4">
                            <p className="text-slate-900 dark:text-white font-semibold">
                                ✓ By registering or booking services, you consent to this privacy policy.
                            </p>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2.1 Personal Data</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                            We collect the following personal information during signup, bookings, or support interactions:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                            <li><strong>Name:</strong> For account identification and service delivery</li>
                            <li><strong>Phone Number:</strong> For communication and verification</li>
                            <li><strong>Email Address:</strong> For account management and notifications</li>
                            <li><strong>Location:</strong> For service matching in Bihar, Delhi, and other supported regions</li>
                            <li><strong>Payment Details:</strong> For transaction processing (stored securely by payment gateways)</li>
                            <li><strong>Profile Picture:</strong> Optional, for account personalization</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">2.2 Non-Personal Data</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                            We automatically collect non-personal data via cookies and analytics tools:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                            <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                            <li><strong>IP Address:</strong> For security and fraud prevention</li>
                            <li><strong>Usage Patterns:</strong> Pages viewed, search history, time spent on platform</li>
                            <li><strong>Cookies:</strong> For session management and preferences (see Cookie Policy)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">2.3 Provider Verification Data</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Service providers must submit additional verification documents:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-2">
                            <li>Government-issued ID proofs (Aadhaar, PAN, Driving License)</li>
                            <li>Service credentials and certifications</li>
                            <li>Bank account details for payment processing</li>
                            <li>Background verification documents (as applicable)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">2.4 Sensitive Data</h3>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                            <p className="text-slate-900 dark:text-white font-semibold mb-2">⚠️ Important Notice</p>
                            <p className="text-slate-700 dark:text-slate-300">
                                We do <strong>NOT</strong> collect biometric data, health records, or other sensitive personal information without explicit consent. Location data is collected only when you use location-based features.
                            </p>
                        </div>
                    </section>

                    {/* How We Use Your Data */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. How We Use Your Data</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                            Your data enables us to provide and improve our services:
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">🔍 Service Delivery</h4>
                                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                    <li>• Facilitate bookings and matches</li>
                                    <li>• Connect users with providers</li>
                                    <li>• Process payments securely</li>
                                    <li>• Send booking confirmations</li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">📊 Platform Improvements</h4>
                                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                    <li>• Personalized recommendations</li>
                                    <li>• Analytics and insights</li>
                                    <li>• Feature development</li>
                                    <li>• User experience optimization</li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">🛡️ Security & Compliance</h4>
                                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                    <li>• Fraud prevention</li>
                                    <li>• Dispute resolution</li>
                                    <li>• Legal compliance</li>
                                    <li>• Account verification</li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">📧 Communication</h4>
                                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                    <li>• Booking notifications</li>
                                    <li>• Service updates</li>
                                    <li>• Marketing emails (opt-out available)</li>
                                    <li>• Customer support</li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                            <strong>Anonymized Data:</strong> We analyze aggregated, anonymized data for trends and improvements without identifying individuals.
                        </p>
                    </section>

                    {/* Sharing and Disclosure */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Sharing and Disclosure</h2>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">4.1 With Service Providers</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Your information is shared with matched service providers <strong>solely for service delivery</strong>. Providers receive only the information necessary to complete the service (name, location, contact details).
                        </p>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">4.2 With Third-Party Partners</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                            We share data with trusted third parties under strict contracts:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                            <li><strong>Hosting Services:</strong> Firebase, Supabase (data storage and processing)</li>
                            <li><strong>Payment Gateways:</strong> For secure transaction processing</li>
                            <li><strong>Analytics Tools:</strong> Google Analytics (anonymized data)</li>
                            <li><strong>Communication Services:</strong> SMS and email providers</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">4.3 No Data Sales</h3>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <p className="text-slate-900 dark:text-white font-semibold mb-2">✓ Our Commitment</p>
                            <p className="text-slate-700 dark:text-slate-300">
                                We do <strong>NOT</strong> sell your personal data to advertisers or third parties. Your data is used exclusively for platform operations and service delivery.
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">4.4 Legal Disclosures</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            We may disclose information when required by law, such as:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-2">
                            <li>Court orders or legal processes under Indian law</li>
                            <li>Government investigations or regulatory requests</li>
                            <li>Protection of our rights, property, or safety</li>
                            <li>Prevention of fraud or illegal activities</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">4.5 International Transfers</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            If data is transferred internationally, we use standard contractual clauses and safeguards to ensure DPDP Act compliance.
                        </p>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Data Security and Retention</h2>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5.1 Security Measures</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                            We implement industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                            <li><strong>Encryption:</strong> AES-256 encryption for data at rest and in transit</li>
                            <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                            <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                            <li><strong>Secure Infrastructure:</strong> Hosted on certified cloud platforms</li>
                            <li><strong>Employee Training:</strong> Data protection and security awareness</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">5.2 Breach Notification</h3>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                            <p className="text-slate-900 dark:text-white font-semibold mb-2">🚨 Data Breach Protocol</p>
                            <p className="text-slate-700 dark:text-slate-300">
                                In the event of a data breach, we will notify affected users and relevant authorities within <strong>72 hours</strong> as required by DPDP Act regulations. Notifications will include the nature of the breach and steps to protect your data.
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">5.3 Data Retention</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                            We retain your data as follows:
                        </p>
                        <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 mt-3">
                            <thead className="bg-slate-100 dark:bg-slate-700">
                                <tr>
                                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Data Type</th>
                                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Retention Period</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Active Account Data</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Indefinite (while account is active)</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Transaction Records</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">7 years (legal requirement)</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Inactive Accounts</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">6 months after deletion request</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Marketing Data</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Until opt-out or account deletion</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Anonymized Analytics</td>
                                    <td className="border border-slate-300 dark:border-slate-600 p-3">Indefinite (no personal identifiers)</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Your Rights and Choices</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Under the DPDP Act 2023, you have the following rights:
                        </p>

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">📋 Right to Access</h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                    Request a copy of your personal data we hold. Access your data via account settings or email us.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">✏️ Right to Correction</h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                    Update or correct inaccurate information through your account settings.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">🗑️ Right to Deletion</h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                    Request account deletion via profile settings. We will process your request within 6 months, subject to legal retention requirements.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">📤 Right to Data Portability</h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                    Request your data in a machine-readable format to transfer to another service.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">🚫 Right to Opt-Out</h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                    Opt out of marketing emails anytime via unsubscribe links or account settings. Manage cookie preferences through our consent manager.
                                </p>
                            </div>
                        </div>

                        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mt-4">
                            <p className="text-slate-900 dark:text-white font-semibold mb-2">📧 Exercise Your Rights</p>
                            <p className="text-slate-700 dark:text-slate-300">
                                To exercise any of these rights, email us at <a href="mailto:support@thelokals.com" className="text-teal-600 dark:text-teal-400 hover:underline font-semibold">support@thelokals.com</a> with your request and account details.
                            </p>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Cookies and Tracking</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                            We use cookies and similar technologies to enhance your experience:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                            <li><strong>Essential Cookies:</strong> Required for platform functionality (login, security)</li>
                            <li><strong>Analytics Cookies:</strong> Track usage patterns to improve services</li>
                            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                        </ul>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                            You can manage cookie preferences through your browser settings or our consent manager. Disabling cookies may affect platform functionality.
                        </p>
                    </section>

                    {/* Children's Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Children's Privacy</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            TheLokals.com is not intended for children under 18. We do not knowingly collect data from minors without parental consent. If you believe we have collected data from a minor, please contact us immediately.
                        </p>
                    </section>

                    {/* Policy Updates */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Policy Updates</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. Significant changes will be notified via:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-2">
                            <li>Email notification to registered users</li>
                            <li>Prominent notice on our website/app</li>
                            <li>Updated "Last Updated" date at the top of this policy</li>
                        </ul>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                            Continued use of the platform after updates constitutes acceptance of the revised policy.
                        </p>
                    </section>

                    {/* Contact & Grievances */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Contact Information & Grievances</h2>
                        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                For questions, concerns, or grievances regarding this Privacy Policy or data handling:
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-slate-900 dark:text-white font-semibold">General Inquiries:</p>
                                    <p className="text-slate-700 dark:text-slate-300">
                                        Email: <a href="mailto:support@thelokals.com" className="text-teal-600 dark:text-teal-400 hover:underline">support@thelokals.com</a>
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-900 dark:text-white font-semibold">Grievance Officer:</p>
                                    <p className="text-slate-700 dark:text-slate-300">
                                        Email: <a href="mailto:support@thelokals.com" className="text-teal-600 dark:text-teal-400 hover:underline">support@thelokals.com</a>
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        (As required under IT Rules 2011 and DPDP Act 2023)
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        We aim to respond to all grievances within <strong>48 hours</strong> of receipt.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Acceptance */}
                    <section className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8">
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            By using TheLokals.com, you acknowledge that you have read, understood, and agree to this Privacy Policy and our data handling practices.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
