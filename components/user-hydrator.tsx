"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, userLoadingAtom, type UserData } from "@/store/user.store";
import { api } from "@/lib/api";

const CACHE_KEY = "enver_user";

/** Read cached user from localStorage (instant, no network) */
function getCachedUser(): UserData | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/** Persist user to localStorage */
export function setCachedUser(user: UserData | null) {
    try {
        if (user) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(CACHE_KEY);
        }
    } catch {}
}

/**
 * Headless provider that hydrates the Jotai userAtom.
 *
 * 1. On first render → instantly loads from localStorage (no flash)
 * 2. Then background-fetches the latest from the backend
 * 3. Skips refetching if already hydrated in this session
 */
export default function UserHydrator() {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const setUser = useSetAtom(userAtom);
    const setLoading = useSetAtom(userLoadingAtom);
    const currentUser = useAtomValue(userAtom);
    const hasFetched = useRef(false);

    // Step 1: Instant hydrate from localStorage cache
    useEffect(() => {
        if (currentUser !== null) return; // already set (from onboarding or prior)
        const cached = getCachedUser();
        if (cached) {
            setUser(cached);
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Step 2: Background fetch from backend (once per session)
    useEffect(() => {
        if (!clerkLoaded) return;

        if (!clerkUser) {
            setUser(undefined);
            setLoading(false);
            setCachedUser(null);
            return;
        }

        // Skip if we already fetched this session
        if (hasFetched.current) return;
        hasFetched.current = true;

        let cancelled = false;

        const hydrate = async () => {
            try {
                const { data } = await api.get(
                    `/users/by-clerk/${clerkUser.id}`,
                );
                if (cancelled) return;

                if (data.exists && data.user) {
                    setUser(data.user);
                    setCachedUser(data.user);
                } else {
                    setUser(undefined);
                    setCachedUser(null);
                }
            } catch (err) {
                console.error("UserHydrator: fetch failed", err);
                // Keep cached data if available, don't wipe on network error
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        hydrate();
        return () => {
            cancelled = true;
        };
    }, [clerkLoaded, clerkUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}
