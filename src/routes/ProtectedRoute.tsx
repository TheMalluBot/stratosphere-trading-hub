import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

interface Props {
  children: React.ReactNode;
}

// Wrap children so that they render only when SignedIn; otherwise redirect
export const ProtectedRoute: React.FC<Props> = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn redirectUrl="/auth" />
    </SignedOut>
  </>
);

export default ProtectedRoute;
