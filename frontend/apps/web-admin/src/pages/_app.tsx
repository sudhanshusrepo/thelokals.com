import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import { AdminShellLayout } from '../components/AdminShellLayout';
import '../globals.css';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isPublicRoute = router.pathname === '/login' || router.pathname === '/_error';

    return (
        <AuthProvider>
            {isPublicRoute ? (
                <Component {...pageProps} />
            ) : (
                <AdminShellLayout>
                    <Component {...pageProps} />
                </AdminShellLayout>
            )}
        </AuthProvider>
    );
}
