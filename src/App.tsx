import React from 'react';
import { ClerkProvider, clerkConfig } from './lib/auth/clerk';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query/reactQuery';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { AppRoutes } from './AppRoutes';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ClerkProvider {...clerkConfig}>

    <Router>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </Router>
    </ClerkProvider>
  );
}
