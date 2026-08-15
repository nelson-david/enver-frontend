"use client";

import { useState } from "react";
import { Provider as JotaiProvider } from "jotai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserHydrator from "./user-hydrator";
import { ToastProvider } from "@/context/toast-context";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <JotaiProvider>
                <UserHydrator />
                <ToastProvider>{children}</ToastProvider>
            </JotaiProvider>
        </QueryClientProvider>
    );
}
