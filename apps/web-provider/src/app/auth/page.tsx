import AuthClient from './AuthClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function LoginPage() {
    return <AuthClient />;
}
