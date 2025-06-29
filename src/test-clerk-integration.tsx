// Test file to isolate Clerk authentication issues
import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';

// Minimal Clerk provider component
export function TestClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey="pk_test_dGVzdC1tb25rZXktNTUuY2xlcmsuYWNjb3VudHMuZGV2JA"
      afterSignInUrl="/test"
      afterSignUpUrl="/test"
    >
      {children}
    </ClerkProvider>
  );
}

// Test component using the provider
export function TestComponent() {
  return (
    <TestClerkProvider>
      <div>Test Clerk Integration</div>
    </TestClerkProvider>
  );
}

// This is just a test file - not meant to be used in production
