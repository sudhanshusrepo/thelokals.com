import { bookingService } from '../packages/core/services/bookingService';
import { supabase } from '../packages/core/services/supabase';

async function verifyTiers() {
    console.log('Starting Provider Tiers Verification...');

    // 1. Create Mock Providers (if not exist)
    const tiers = ['tier1', 'tier2', 'tier3'];
    const providers = [];

    for (const tier of tiers) {
        // This part is tricky without admin access or mock data function
        // Ideally we would fetch an existing provider and update their tier for testing
        // For now, let's assume we have a provider or can fetch one.

        // Strategy: Find a provider, update tier, calc commission
        const { data: provider, error } = await supabase
            .from('providers')
            .select('id, full_name')
            .limit(1)
            .single();

        if (error || !provider) {
            console.error('No providers found to test with.');
            return;
        }

        console.log(`Testing with provider: ${provider.id} (${tier})`);

        // Update Tier
        const { error: updateError } = await supabase
            .from('providers')
            .update({ tier: tier })
            .eq('id', provider.id);

        if (updateError) {
            console.error(`Error updating provider to ${tier}:`, updateError);
            continue;
        }

        // Calculate Commission
        const amount = 1000; // ₹1000
        const result = await bookingService.calculateCommission(provider.id, amount);

        console.log(`[${tier.toUpperCase()}] Amount: ₹${amount}, Commission: ₹${result.commission}, Net: ₹${result.netAmount}`);

        // Verify
        const expectedRate = tier === 'tier1' ? 0.12 : 0.15;
        const expectedCommission = amount * expectedRate;

        if (result.commission === expectedCommission) {
            console.log('✅ Commission Correct');
        } else {
            console.error(`❌ Commission Incorrect. Expected ${expectedCommission}, got ${result.commission}`);
        }
    }
}

verifyTiers().catch(console.error);
