import { ProviderProfile } from '../../types';

export interface StepProps {
  data: ProviderProfile;
  updateData: (updates: Partial<ProviderProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}