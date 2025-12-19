'use client';
import { ProviderLanding } from '@/components/ProviderLanding';
import { useRouter } from 'next/navigation';



export default function Home() {
  const router = useRouter();

  const handleRegister = () => {
    router.push('/dashboard');
  };

  return <ProviderLanding onRegisterClick={handleRegister} />;
}
