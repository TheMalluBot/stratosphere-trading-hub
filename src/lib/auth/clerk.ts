// Simple re-export of Clerk's provider and hooks
// This file serves as a central place to import Clerk functionality
// All components should import from '@/lib/auth/clerk' instead of '@clerk/clerk-react'

export {
  ClerkProvider,
  useAuth,
  useUser,
  useSession,
  useClerk,
  useSignIn,
  useSignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  RedirectToSignUp,
  ClerkLoading,
  ClerkLoaded
} from '@clerk/clerk-react';

// Environment variable check - this will be picked up by Vite
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

// Export a custom hook to access the publishable key if needed
export const useClerkPublishableKey = () => publishableKey;

// Export a type for the Clerk provider props
export type ClerkProviderProps = {
  children: React.ReactNode;
  // Add any additional props you want to support
};

// Export a default configuration object
export const clerkConfig = {
  publishableKey,
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  // Add any other Clerk configuration options here
};
