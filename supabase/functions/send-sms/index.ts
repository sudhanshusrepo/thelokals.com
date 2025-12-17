
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MSG91_AUTH_KEY = Deno.env.get('MSG91_AUTH_KEY')
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

// SMS Provider Interface
interface SMSProvider {
    send(phone: string, message: string): Promise<boolean>;
}

// MSG91 Implementation
const msg91Provider: SMSProvider = {
    async send(phone: string, message: string) {
        if (!MSG91_AUTH_KEY) return false;
        console.log(`Sending MSG91 SMS to ${phone}: ${message}`);
        // Implementation would go here
        return true;
    }
}

// Twilio Implementation
const twilioProvider: SMSProvider = {
    async send(phone: string, message: string) {
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return false;

        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
        const body = new URLSearchParams({
            To: phone,
            From: TWILIO_PHONE_NUMBER || '',
            Body: message
        })

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body
        })

        return response.ok;
    }
}

// Logic to parse Supabase Auth Hook payload
serve(async (req) => {
    try {
        const { user, otp, phone } = await req.json();

        if (!phone || !otp) {
            return new Response(JSON.stringify({ error: 'Missing phone or otp' }), { status: 400 });
        }

        const message = `Your verification code is ${otp}`;
        console.log(`[SMS HOOK] Sending ${otp} to ${phone}`);

        // Select Provider
        let sent = false;
        if (TWILIO_ACCOUNT_SID) {
            sent = await twilioProvider.send(phone, message);
        } else if (MSG91_AUTH_KEY) {
            sent = await msg91Provider.send(phone, message);
        } else {
            console.log('[SMS HOOK] No provider configured. Log-only mode.');
            sent = true;
        }

        if (!sent) {
            return new Response(JSON.stringify({ error: 'Failed to send SMS' }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
