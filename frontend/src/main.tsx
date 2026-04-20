import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster, toast } from 'sonner';
import { router } from './app/router';
import { extractErrorMessage } from './shared/lib';
import './app/styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const meta = query.meta as { errorMessage?: string } | undefined;
      toast.error(meta?.errorMessage ?? extractErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      const meta = mutation.meta as { errorMessage?: string } | undefined;
      toast.error(meta?.errorMessage ?? extractErrorMessage(error));
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      const meta = mutation.meta as { successMessage?: string } | undefined;
      if (meta?.successMessage) toast.success(meta.successMessage);
    },
  }),
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
