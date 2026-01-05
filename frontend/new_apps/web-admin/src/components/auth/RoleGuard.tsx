import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminRole } from '@thelocals/core/types';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: AdminRole[];
    fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
    const { adminUser, loading } = useAuth();

    if (loading) return null;

    if (!adminUser || !allowedRoles.includes(adminUser.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
