import React from 'react';
import Link from 'next/link';
import { AppBar } from '../../components/home/AppBar';
import { Footer } from '../../components/home/Footer';

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-background">
            <AppBar />

            <div className="pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                        <h1 className="text-4xl font-bold text-primary mb-2">Refund & Cancellation Policy</h1>
                        <p className="text-sm text-muted mb-8">Last updated: January 15, 2025</p>

                        <div className="prose prose-lg max-w-none space-y-6">
                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">1. Cancellation by Customer</h2>

                                <div className="bg-slate-50 rounded-xl p-6 my-4">
                                    <h3 className="text-lg font-semibold text-primary mb-3">Cancellation Timeline</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <span className="text-green-600 font-bold">✓</span>
                                            <div>
                                                <strong>4+ hours before service:</strong> 100% refund
                                                <p className="text-sm text-muted">Full refund processed within 5-7 business days</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-amber-600 font-bold">!</span>
                                            <div>
                                                <strong>1-4 hours before service:</strong> 50% refund
                                                <p className="text-sm text-muted">50% cancellation fee applies</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-red-600 font-bold">✗</span>
                                            <div>
                                                <strong>Less than 1 hour before:</strong> No refund
                                                <p className="text-sm text-muted">100% cancellation fee (provider already en route)</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">2. Cancellation by Service Provider</h2>
                                <p className="text-muted leading-relaxed mb-4">
                                    If a service provider cancels your booking:
                                </p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>100% refund of all charges</li>
                                    <li>₹100 credit added to your lokals wallet</li>
                                    <li>Priority rebooking with another provider</li>
                                    <li>Refund processed within 24-48 hours</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">3. Service Quality Issues</h2>
                                <p className="text-muted leading-relaxed mb-4">
                                    If you're unsatisfied with service quality:
                                </p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>Report issue within 24 hours of service completion</li>
                                    <li>Provide photos/evidence if applicable</li>
                                    <li>Our team will investigate within 48 hours</li>
                                    <li>Eligible for partial/full refund or free rework</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">4. Refund Processing</h2>
                                <div className="bg-blue-50 rounded-xl p-6 my-4">
                                    <h3 className="text-lg font-semibold text-primary mb-3">Refund Timeline</h3>
                                    <ul className="space-y-2 text-muted">
                                        <li><strong>UPI/Wallets:</strong> 1-3 business days</li>
                                        <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                                        <li><strong>Net Banking:</strong> 5-7 business days</li>
                                        <li><strong>lokals Wallet:</strong> Instant credit</li>
                                    </ul>
                                </div>
                                <p className="text-muted leading-relaxed">
                                    Refunds are processed to the original payment method. Bank processing times may vary.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">5. Non-Refundable Scenarios</h2>
                                <p className="text-muted leading-relaxed mb-4">
                                    Refunds will not be provided in these cases:
                                </p>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>Customer not present at service location</li>
                                    <li>Incorrect address provided by customer</li>
                                    <li>Customer refuses service after provider arrival</li>
                                    <li>Service completed as agreed (quality disputes handled separately)</li>
                                    <li>Cancellation after service completion</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">6. Rescheduling</h2>
                                <p className="text-muted leading-relaxed">
                                    You can reschedule bookings free of charge if done 4+ hours before the scheduled time. Rescheduling within 4 hours may incur a ₹50 fee.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">7. Promotional Credits & Coupons</h2>
                                <ul className="list-disc ml-6 text-muted space-y-2">
                                    <li>Promotional credits are non-refundable</li>
                                    <li>Only the amount paid in cash/card is refunded</li>
                                    <li>Unused credits remain in your wallet</li>
                                    <li>Credits have expiry dates as mentioned in offer terms</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">8. How to Request Refund</h2>
                                <div className="bg-slate-50 rounded-xl p-6 my-4">
                                    <ol className="space-y-3 text-muted">
                                        <li><strong>1.</strong> Go to "My Bookings" in your account</li>
                                        <li><strong>2.</strong> Select the booking you want to cancel</li>
                                        <li><strong>3.</strong> Click "Cancel Booking" or "Request Refund"</li>
                                        <li><strong>4.</strong> Provide reason for cancellation</li>
                                        <li><strong>5.</strong> Confirm cancellation</li>
                                        <li><strong>6.</strong> Receive confirmation email with refund details</li>
                                    </ol>
                                </div>
                                <p className="text-muted leading-relaxed">
                                    For assistance, contact support at refunds@thelokals.com or call +91-XXXX-XXXXXX
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">9. Dispute Resolution</h2>
                                <p className="text-muted leading-relaxed">
                                    If you disagree with a refund decision, you can escalate to our dispute resolution team within 7 days. Final decisions are made within 15 business days.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-primary mt-8 mb-4">10. Contact Information</h2>
                                <p className="text-muted leading-relaxed">
                                    For refund-related queries:<br />
                                    Email: refunds@thelokals.com<br />
                                    Phone: +91-XXXX-XXXXXX<br />
                                    Hours: Monday-Saturday, 9 AM - 7 PM IST
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200 flex gap-4">
                            <Link href="/terms" className="text-accent font-semibold hover:underline">Terms of Service</Link>
                            <Link href="/privacy" className="text-accent font-semibold hover:underline">Privacy Policy</Link>
                            <Link href="/cookies" className="text-accent font-semibold hover:underline">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
