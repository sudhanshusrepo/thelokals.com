import React from 'react';
import Link from 'next/link';
import { AppBar } from '../../components/home/AppBar';
import { Footer } from '../../components/home/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <AppBar />

            <div className="pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                        <h1 className="text-4xl font-bold text-primary mb-2">Terms of Service</h1>
                        <p className="text-sm text-muted mb-8">Last updated: January 15, 2025</p>

                        <div className="prose prose-lg max-w-none space-y-6">
                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">1. Acceptance of Terms</h2>
                                <p className="text-muted leading-relaxed">
                                    By accessing and using lokals ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">2. Service Description</h2>
                                <p className="text-muted leading-relaxed mb-4">
                                    lokals is a platform that connects customers with verified local service providers for home services including but not limited to:
                                </p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>AC repair and maintenance</li>
                                    <li>Plumbing services</li>
                                    <li>Electrical work</li>
                                    <li>Home cleaning</li>
                                    <li>Appliance repair</li>
                                    <li>Other home maintenance services</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">3. User Responsibilities</h2>
                                <p className="text-muted leading-relaxed mb-4">As a user of lokals, you agree to:</p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>Provide accurate and complete information during registration and booking</li>
                                    <li>Maintain the confidentiality of your account credentials</li>
                                    <li>Be present at the service location at the scheduled time</li>
                                    <li>Treat service providers with respect and professionalism</li>
                                    <li>Pay for services as agreed upon</li>
                                    <li>Not misuse the platform or engage in fraudulent activities</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">4. Service Provider Relationship</h2>
                                <p className="text-muted leading-relaxed">
                                    lokals acts as an intermediary platform. Service providers are independent contractors and not employees of lokals. We verify providers but do not directly control how services are performed.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">5. Booking and Payment</h2>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>All bookings are subject to provider availability</li>
                                    <li>Prices displayed are estimates and may vary based on actual service requirements</li>
                                    <li>Payment is due upon service completion unless otherwise agreed</li>
                                    <li>We accept UPI, cards, and other digital payment methods</li>
                                    <li>A service fee may be charged for platform usage</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">6. Cancellation Policy</h2>
                                <p className="text-muted leading-relaxed">
                                    Cancellations made 4+ hours before scheduled time: Full refund<br />
                                    Cancellations made 1-4 hours before: 50% cancellation fee<br />
                                    Cancellations made less than 1 hour before: 100% cancellation fee<br />
                                    Provider cancellations: Full refund + ₹100 credit
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">7. Liability Limitations</h2>
                                <p className="text-muted leading-relaxed">
                                    lokals is not liable for damages arising from service provider actions, service quality issues, or property damage during service delivery. We maintain insurance coverage for verified incidents but recommend users verify provider credentials and supervise work.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">8. Dispute Resolution</h2>
                                <p className="text-muted leading-relaxed">
                                    Any disputes will first be addressed through our customer support team. If unresolved, disputes will be subject to arbitration under Indian law in Bangalore jurisdiction.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">9. Changes to Terms</h2>
                                <p className="text-muted leading-relaxed">
                                    We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of updated terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">10. Contact Information</h2>
                                <p className="text-muted leading-relaxed">
                                    For questions about these Terms of Service, contact us at:<br />
                                    Email: legal@thelokals.com<br />
                                    Phone: +91-XXXX-XXXXXX
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200 flex gap-4">
                            <Link href="/privacy" className="text-accent font-semibold hover:underline">Privacy Policy</Link>
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
