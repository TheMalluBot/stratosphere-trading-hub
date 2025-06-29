import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that handles authentication state
 * and redirects users appropriately based on their authentication status.
 * 
 * @param children - The components to render when authentication requirements are met
 * @param requireAuth - Whether authentication is required (default: true)
 */
export const ProtectedRoute = ({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Handle authentication requirements
  if (requireAuth && !isSignedIn) {
    // Redirect to login if authentication is required but user is not signed in
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (!requireAuth && isSignedIn) {
    // Redirect to dashboard if user is already signed in but trying to access public routes
    return <Navigate to="/dashboard" replace />;
  }

  // Render children when authentication requirements are met
  return <>{children}</>;
};
