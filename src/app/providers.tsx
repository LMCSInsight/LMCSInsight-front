import { type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { store } from "@/app/store";
import { queryClient } from "@/shared/lib/queryClient";
import { AuthProvider } from "@/shared/context/AuthContext";
import { router } from "@/app/router";

interface ProvidersProps {
  children?: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children ?? <RouterProvider router={router} />}
        </AuthProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
