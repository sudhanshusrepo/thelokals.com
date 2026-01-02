import { supabase } from '@thelocals/core/services/supabase';

interface ApprovalAction {
    providerId: string;
    action: 'approve' | 'reject' | 'suspend';
    reason?: string;
    adminId: string;
}

export const providerApprovalService = {
    async approveProvider(action: ApprovalAction): Promise<void> {
        const { providerId, adminId, reason } = action;

        // Update provider status
        const { error: updateError } = await supabase
            .from('providers')
            .update({
                verification_status: action.action === 'approve' ? 'approved' : action.action === 'reject' ? 'rejected' : 'suspended',
                verified_at: new Date().toISOString(),
                verified_by: adminId,
                rejection_reason: reason || null
            })
            .eq('id', providerId);

        if (updateError) throw updateError;

        // Log to approval history
        const { error: historyError } = await supabase
            .from('provider_approval_history')
            .insert({
                provider_id: providerId,
                action: action.action === 'approve' ? 'approved' : action.action === 'reject' ? 'rejected' : 'suspended',
                performed_by: adminId,
                reason: reason || null
            });

        if (historyError) throw historyError;

        // Send notification (implement later)
        await this.sendApprovalNotification(providerId, action.action);
    },

    async getPendingProviders(): Promise<any[]> {
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .eq('verification_status', 'pending')
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getProviderDetails(id: string): Promise<any> {
        const { data, error } = await supabase
            .from('providers')
            .select(`
        *,
        provider_documents (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async sendApprovalNotification(providerId: string, status: 'approve' | 'reject' | 'suspend'): Promise<void> {
        // TODO: Implement email/SMS notification
        console.log(`Sending ${status} notification to provider ${providerId}`);
    }
};
