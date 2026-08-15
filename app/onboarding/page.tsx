"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { userAtom } from "@/store/user.store";
import { setCachedUser } from "@/components/user-hydrator";
import { onboardingService } from "@/services/onboarding.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Shield,
    Sparkles,
    Check,
    ArrowRight,
    Loader2,
    Link as LinkIcon,
} from "lucide-react";

// Curated avatar presets with high visual appeal
const AVATAR_PRESETS = [
    {
        id: "clerk",
        label: "Clerk Profile",
        url: "", // Populated dynamically from user.imageUrl
    },
    {
        id: "neon-blue",
        label: "Cyber Blue",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    },
    {
        id: "emerald-glow",
        label: "Emerald",
        url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80",
    },
    {
        id: "violet-gradient",
        label: "Violet Wave",
        url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=150&auto=format&fit=crop&q=80",
    },
    {
        id: "sunset-glow",
        label: "Amber Dusk",
        url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80",
    },
];

export default function OnboardingPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const setUser = useSetAtom(userAtom);

    const [name, setName] = useState("");
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("");
    const [customAvatarUrl, setCustomAvatarUrl] = useState("");
    const [isCustomUrlActive, setIsCustomUrlActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && (!isSignedIn || !user)) {
            router.push("/sign-in");
            return;
        }

        if (user) {
            // Default name prefill
            const fullName =
                user.fullName ||
                `${user.firstName || ""} ${user.lastName || ""}`.trim();
            setName(
                fullName ||
                    user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
                    "",
            );

            // Default avatar prefill
            if (user.imageUrl) {
                setSelectedAvatarUrl(user.imageUrl);
            } else {
                setSelectedAvatarUrl(AVATAR_PRESETS[1].url);
            }
        }
    }, [isLoaded, isSignedIn, user, router]);

    const activeImageUrl = isCustomUrlActive
        ? customAvatarUrl
        : selectedAvatarUrl;

    const handleFinish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!name.trim()) {
            setError("Please enter your name to complete onboarding.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result = await onboardingService.completeOnboarding({
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || "",
                name: name.trim(),
                imageUrl: activeImageUrl,
            });

            // Save to Jotai atom + localStorage cache
            setUser(result.user);
            setCachedUser(result.user);

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Onboarding error:", err);
            setError(
                err.message || "Failed to finish onboarding. Please try again.",
            );
            setSubmitting(false);
        }
    };

    if (!isLoaded || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4 font-dm-sans">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Brand Header */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="text-2xl font-bold text-white tracking-tight font-dm-sams">
                        Enver
                    </span>
                </div>

                {/* Main Card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-3">
                            <Sparkles className="h-3.5 w-3.5" /> Welcome aboard
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Set up your profile
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1">
                            Choose how you'll appear across your team's secure
                            environments.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleFinish} className="space-y-6">
                        {/* Live Avatar Preview */}
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 border-2 border-blue-500/40 shadow-xl ring-4 ring-zinc-900">
                                    <AvatarImage
                                        src={activeImageUrl}
                                        alt={name || "User Avatar"}
                                    />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-200 text-xl font-bold">
                                        {name
                                            ? name.substring(0, 2).toUpperCase()
                                            : "EV"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="text-xs text-zinc-400">
                                Selected Avatar Preview
                            </span>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-xs font-semibold text-zinc-300 uppercase tracking-wider"
                            >
                                Your Display Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="bg-zinc-800/60 border-zinc-700 text-white placeholder:text-zinc-500 h-11 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                required
                            />
                        </div>

                        {/* Image / Avatar Selection Grid */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                                Choose Profile Image
                            </Label>

                            <div className="grid grid-cols-5 gap-3">
                                {AVATAR_PRESETS.map((preset) => {
                                    const imgUrl =
                                        preset.id === "clerk"
                                            ? user.imageUrl || preset.url
                                            : preset.url;
                                    const isSelected =
                                        !isCustomUrlActive &&
                                        selectedAvatarUrl === imgUrl;

                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => {
                                                setIsCustomUrlActive(false);
                                                setSelectedAvatarUrl(imgUrl);
                                            }}
                                            className={`relative rounded-xl p-1 border transition-all flex flex-col items-center justify-center aspect-square overflow-hidden group ${
                                                isSelected
                                                    ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
                                                    : "border-zinc-800 bg-zinc-800/40 hover:border-zinc-700"
                                            }`}
                                        >
                                            <Avatar className="h-full w-full rounded-lg">
                                                <AvatarImage
                                                    src={imgUrl}
                                                    alt={preset.label}
                                                />
                                                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                                    {preset.label[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-[1px] flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom URL Input option */}
                            <div className="pt-2">
                                {!isCustomUrlActive ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsCustomUrlActive(true)
                                        }
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-medium transition-colors"
                                    >
                                        <LinkIcon className="h-3.5 w-3.5" /> Use
                                        custom image URL
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="customUrl"
                                                className="text-xs text-zinc-400"
                                            >
                                                Custom Avatar URL
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsCustomUrlActive(false)
                                                }
                                                className="text-xs text-zinc-400 hover:text-zinc-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        <Input
                                            id="customUrl"
                                            type="url"
                                            value={customAvatarUrl}
                                            onChange={(e) =>
                                                setCustomAvatarUrl(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://example.com/avatar.png"
                                            className="bg-zinc-800/60 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-xs"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit / Finish Button */}
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                    Saving Profile...
                                </>
                            ) : (
                                <>
                                    Finish & Go to Dashboard
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
