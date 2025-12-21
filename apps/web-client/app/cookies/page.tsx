import React from 'react';
import Link from 'next/link';
import { AppBar } from '../../components/home/AppBar';
import { Footer } from '../../components/home/Footer';

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-background">
            <AppBar />

            <div className="pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                        <h1 className="text-4xl font-bold text-primary mb-2">Cookie Policy</h1>
                        <p className="text-sm text-muted mb-8">Last updated: January 15, 2025</p>

                        <div className="prose prose-lg max-w-none space-y-6">
                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">1. What Are Cookies?</h2>
                                <p className="text-muted leading-relaxed">
                                    Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience, remember your preferences, and analyze how you use our platform.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">2. Types of Cookies We Use</h2>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-primary mb-2">Essential Cookies</h3>
                                        <p className="text-muted text-sm mb-2">Required for basic website functionality</p>
                                        <ul className="list-disc ml-6 text-muted text-sm space-y-1">
                                            <li>User authentication and session management</li>
                                            <li>Security and fraud prevention</li>
                                            <li>Load balancing and performance</li>
                                        </ul>
                                        <p className="text-xs text-muted mt-2">These cannot be disabled as they're necessary for the site to work.</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-primary mb-2">Functional Cookies</h3>
                                        <p className="text-muted text-sm mb-2">Enhance your experience with personalized features</p>
                                        <ul className="list-disc ml-6 text-muted text-sm space-y-1">
                                            <li>Remember your preferences (language, location)</li>
                                            <li>Store booking history and favorites</li>
                                            <li>Auto-fill forms with saved information</li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-primary mb-2">Analytics Cookies</h3>
                                        <p className="text-muted text-sm mb-2">Help us understand how visitors use our site</p>
                                        <ul className="list-disc ml-6 text-muted text-sm space-y-1">
                                            <li>Track page views and user journeys</li>
                                            <li>Measure service performance</li>
                                            <li>Identify popular features and content</li>
                                        </ul>
                                        <p className="text-xs text-muted mt-2">We use Google Analytics and similar tools.</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-primary mb-2">Marketing Cookies</h3>
                                        <p className="text-muted text-sm mb-2">Deliver relevant advertisements and promotions</p>
                                        <ul className="list-disc ml-6 text-muted text-sm space-y-1">
                                            <li>Show personalized offers based on interests</li>
                                            <li>Measure ad campaign effectiveness</li>
                                            <li>Prevent showing the same ad repeatedly</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">3. Third-Party Cookies</h2>
                                <p className="text-muted leading-relaxed mb-4">
                                    We use services from trusted third parties that may set their own cookies:
                                </p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li><strong>Google Analytics:</strong> Website analytics and user behavior tracking</li>
                                    <li><strong>Payment Gateways:</strong> Secure payment processing (Razorpay, Stripe)</li>
                                    <li><strong>Social Media:</strong> Social sharing and login features</li>
                                    <li><strong>Customer Support:</strong> Live chat and support tools</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">4. Managing Cookie Preferences</h2>

                                <div className="bg-blue-50 rounded-xl p-6 my-4">
                                    <h3 className="text-lg font-semibold text-primary mb-3">How to Control Cookies</h3>
                                    <ul className="space-y-2 text-muted">
                                        <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies</li>
                                        <li><strong>Cookie Banner:</strong> Manage preferences via our cookie consent banner</li>
                                        <li><strong>Opt-Out Tools:</strong> Use browser extensions like Privacy Badger</li>
                                        <li><strong>Do Not Track:</strong> Enable DNT in your browser settings</li>
                                    </ul>
                                </div>

                                <p className="text-sm text-muted bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                                    ⚠️ <strong>Note:</strong> Disabling cookies may affect website functionality and limit your ability to use certain features.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">5. Browser-Specific Instructions</h2>
                                <div className="space-y-2 text-muted">
                                    <p><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</p>
                                    <p><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</p>
                                    <p><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</p>
                                    <p><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and data stored</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">6. Cookie Duration</h2>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                                    <li><strong>Persistent Cookies:</strong> Remain for a set period (typically 30 days to 2 years)</li>
                                    <li><strong>Authentication Cookies:</strong> Expire after 30 days of inactivity</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">7. Mobile App Data</h2>
                                <p className="text-muted leading-relaxed">
                                    Our mobile apps use similar technologies (device identifiers, local storage) to provide functionality. You can manage these through your device settings under App Permissions.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">8. Updates to Cookie Policy</h2>
                                <p className="text-muted leading-relaxed">
                                    We may update this policy to reflect changes in technology or legal requirements. Check this page periodically for updates. Last update date is shown at the top.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">9. Contact Us</h2>
                                <p className="text-muted leading-relaxed">
                                    For questions about our cookie usage:<br />
                                    Email: privacy@thelokals.com<br />
                                    Subject: Cookie Policy Inquiry
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200 flex gap-4">
                            <Link href="/terms" className="text-accent font-semibold hover:underline">Terms of Service</Link>
                            <Link href="/privacy" className="text-accent font-semibold hover:underline">Privacy Policy</Link>
                            <Link href="/refund" className="text-accent font-semibold hover:underline">Refund Policy</Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
