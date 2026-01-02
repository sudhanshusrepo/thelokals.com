import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminRole } from '@thelocals/core/types';

interface RoleGuardProps {
    allowedRoles: AdminRole[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const { adminUser } = useAuth();

    if (!adminUser) return null;

    if (allowedRoles.includes(adminUser.role) || adminUser.role === 'super_admin') {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
