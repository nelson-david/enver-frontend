"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn || !user) {
            router.push("/sign-in");
            return;
        }

        const checkUserInDB = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3250";
                const res = await fetch(`${baseUrl}/api/v1/users/by-clerk/${user.id}`);

                if (!res.ok) {
                    throw new Error("Failed to check user status");
                }

                const data = await res.json();

                if (data.exists) {
                    // User already completed onboarding & exists in MongoDB
                    router.push("/dashboard");
                } else {
                    // New user -> redirect to single page onboarding
                    router.push("/onboarding");
                }
            } catch (err: any) {
                console.error("Auth callback check error:", err);
                setError(err.message || "Something went wrong while verifying user status.");
            }
        };

        checkUserInDB();
    }, [isLoaded, isSignedIn, user, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 text-center">
            {error ? (
                <div className="max-w-md p-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                    <p className="font-semibold text-lg mb-2">Authentication Error</p>
                    <p className="text-sm mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white font-dm-sans">
                            Verifying your account...
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1 font-dm-sans">
                            Checking database profile
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
