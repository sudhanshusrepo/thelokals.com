import React from 'react';
import Link from 'next/link';
import { AppBar } from '../../components/home/AppBar';
import Footer from '../../components/home/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <AppBar />

            <div className="pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                        <h1 className="text-4xl font-bold text-primary mb-2">Privacy Policy</h1>
                        <p className="text-sm text-muted mb-8">Last updated: January 15, 2025</p>

                        <div className="prose prose-lg max-w-none space-y-6">
                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">1. Information We Collect</h2>
                                <h3 className="text-xl font-semibold text-primary mt-4 mb-2">Personal Information</h3>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>Name, phone number, and email address</li>
                                    <li>Service address and location data</li>
                                    <li>Payment information (processed securely through third-party providers)</li>
                                    <li>Service preferences and booking history</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-primary mt-4 mb-2">Usage Data</h3>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>Device information and IP address</li>
                                    <li>Browser type and operating system</li>
                                    <li>Pages visited and time spent on platform</li>
                                    <li>Search queries and service interactions</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">2. How We Use Your Information</h2>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>To facilitate service bookings and connect you with providers</li>
                                    <li>To process payments and send booking confirmations</li>
                                    <li>To improve our platform and user experience</li>
                                    <li>To send service updates, reminders, and promotional offers (with consent)</li>
                                    <li>To prevent fraud and ensure platform security</li>
                                    <li>To comply with legal obligations</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">3. Information Sharing</h2>
                                <p className="text-muted leading-relaxed mb-4">We share your information only in these circumstances:</p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li><strong>With Service Providers:</strong> Name, phone, address, and service details to fulfill bookings</li>
                                    <li><strong>With Payment Processors:</strong> Necessary payment information (we don't store card details)</li>
                                    <li><strong>With Analytics Partners:</strong> Anonymized usage data to improve services</li>
                                    <li><strong>For Legal Compliance:</strong> When required by law or to protect rights and safety</li>
                                </ul>
                                <p className="text-muted leading-relaxed mt-4">
                                    We never sell your personal information to third parties.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">4. Data Security</h2>
                                <p className="text-muted leading-relaxed">
                                    We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">5. Your Rights</h2>
                                <p className="text-muted leading-relaxed mb-4">You have the right to:</p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate information</li>
                                    <li>Request deletion of your data</li>
                                    <li>Opt-out of marketing communications</li>
                                    <li>Export your data in a portable format</li>
                                    <li>Withdraw consent for data processing</li>
                                </ul>
                                <p className="text-muted leading-relaxed mt-4">
                                    To exercise these rights, contact us at privacy@thelokals.com
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">6. Cookies and Tracking</h2>
                                <p className="text-muted leading-relaxed">
                                    We use cookies and similar technologies to enhance user experience, analyze usage, and personalize content. You can control cookie preferences through your browser settings. See our <Link href="/cookies" className="text-accent hover:underline">Cookie Policy</Link> for details.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">7. Data Retention</h2>
                                <p className="text-muted leading-relaxed">
                                    We retain your personal data for as long as necessary to provide services and comply with legal obligations. Booking history is retained for 7 years for accounting purposes. You can request earlier deletion subject to legal requirements.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">8. Children's Privacy</h2>
                                <p className="text-muted leading-relaxed">
                                    Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from children.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">9. Changes to Privacy Policy</h2>
                                <p className="text-muted leading-relaxed">
                                    We may update this policy periodically. Significant changes will be notified via email or platform notification. Continued use after changes constitutes acceptance.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">10. Contact Us</h2>
                                <p className="text-muted leading-relaxed">
                                    For privacy-related questions or concerns:<br />
                                    Email: privacy@thelokals.com<br />
                                    Address: [Company Address]<br />
                                    Data Protection Officer: dpo@thelokals.com
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200 flex gap-4">
                            <Link href="/terms" className="text-accent font-semibold hover:underline">Terms of Service</Link>
                            <Link href="/refund" className="text-accent font-semibold hover:underline">Refund Policy</Link>
                            <Link href="/cookies" className="text-accent font-semibold hover:underline">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
