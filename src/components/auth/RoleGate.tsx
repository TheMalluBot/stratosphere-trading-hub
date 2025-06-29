import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';

interface Props {
  roles: string[]; // roles allowed to view children
  fallback?: React.ReactElement;
  children: React.ReactNode;
}

/**
 * Hide or redirect users that do not possess one of the required roles.
 */
export const RoleGate: React.FC<Props> = ({ roles, fallback, children }) => {
  const userRoles = useUserRoles();
  const hasAccess = roles.length === 0 || userRoles.some((r) => roles.includes(r));

  if (hasAccess) return <>{children}</>;
  if (fallback) return fallback;
  return <Navigate to="/dashboard" replace />;
};
