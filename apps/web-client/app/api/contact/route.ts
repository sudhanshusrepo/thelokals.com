import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@thelocals/core/services/supabase';

// Force Node.js runtime to avoid Edge Runtime limitations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

// Rate limiting: Simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    record.count++;
    return true;
}

function validateFormData(data: any): data is ContactFormData {
    if (!data || typeof data !== 'object') return false;

    const { name, email, phone, message } = data;

    // Name validation
    if (typeof name !== 'string' || name.trim().length < 2) {
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
        return false;
    }

    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (typeof phone !== 'string' || !phoneRegex.test(phone.replace(/\s/g, ''))) {
        return false;
    }

    // Message validation
    if (typeof message !== 'string' || message.trim().length < 10) {
        return false;
    }

    return true;
}

// Honeypot check (simple spam prevention)
function isSpam(data: any): boolean {
    // Check for honeypot field (should be added to form but hidden from users)
    if (data.website || data.url) {
        return true;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /viagra/i,
        /cialis/i,
        /casino/i,
        /lottery/i,
        /\b(buy|cheap|discount)\s+(pills|meds|medication)/i,
    ];

    const fullText = `${data.name} ${data.email} ${data.message}`.toLowerCase();
    return suspiciousPatterns.some(pattern => pattern.test(fullText));
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse request body
        const body = await request.json();

        // Validate form data
        if (!validateFormData(body)) {
            return NextResponse.json(
                { error: 'Invalid form data. Please check all fields.' },
                { status: 400 }
            );
        }

        // Spam check
        if (isSpam(body)) {
            console.log('Spam detected:', body.email);
            // Return success to avoid revealing spam detection
            return NextResponse.json({ success: true });
        }

        const { name, email, phone, message } = body;

        // Store in database
        const { data: contactData, error: dbError } = await supabase
            .from('contact_submissions')
            .insert({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.replace(/\s/g, ''),
                message: message.trim(),
                ip_address: ip,
                user_agent: request.headers.get('user-agent') || '',
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // Continue even if DB insert fails - still send email
        }

        // Send email notification (using Supabase Edge Function)
        try {
            const emailResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        to: 'support@thelokals.com',
                        subject: `New Contact Form Submission from ${name}`,
                        html: `
                            <h2>New Contact Form Submission</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>Message:</strong></p>
                            <p>${message.replace(/\n/g, '<br>')}</p>
                            <hr>
                            <p><small>Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</small></p>
                            <p><small>IP: ${ip}</small></p>
                        `,
                    }),
                }
            );

            if (!emailResponse.ok) {
                console.error('Email sending failed:', await emailResponse.text());
            }
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Don't fail the request if email fails
        }

        // Send auto-reply to user
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        to: email,
                        subject: 'We received your message - TheLokals',
                        html: `
                            <h2>Thank you for contacting us!</h2>
                            <p>Hi ${name},</p>
                            <p>We've received your message and will get back to you within 24 hours.</p>
                            <p><strong>Your message:</strong></p>
                            <p>${message.replace(/\n/g, '<br>')}</p>
                            <hr>
                            <p>Best regards,<br>The Lokals Team</p>
                            <p><small>This is an automated response. Please do not reply to this email.</small></p>
                        `,
                    }),
                }
            );
        } catch (autoReplyError) {
            console.error('Auto-reply error:', autoReplyError);
        }

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'An error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
