"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingNav } from "@/components/layout/floating-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, userLoadingAtom } from "@/store/user.store";
import { setCachedUser } from "@/components/user-hydrator";
import { useToast } from "@/context/toast-context";
import { TokensTab } from "@/components/settings/tokens-tab";
import { cn } from "@/lib/utils";
import {
    User,
    Shield,
    CreditCard,
    Users,
    AlertTriangle,
    Key,
    Menu,
    X,
    Sparkles,
    Lock,
} from "lucide-react";

const sidebarItems = [
    { id: "account", label: "Account", icon: User },
    { id: "tokens", label: "CLI Tokens", icon: Key },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "team", label: "Team", icon: Users },
];

function SettingsContent() {
    const searchParams = useSearchParams();
    const user = useAtomValue(userAtom);
    const userLoading = useAtomValue(userLoadingAtom);
    const setUser = useSetAtom(userAtom);
    const { addToast } = useToast();

    const initialTab = searchParams.get("tab") || "account";
    const [activeTab, setActiveTab] = useState(
        sidebarItems.some((i) => i.id === initialTab) ? initialTab : "account",
    );
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && sidebarItems.some((i) => i.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            setDisplayName(user.name || "");
        }
    }, [user]);

    const handleSaveChanges = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const updatedUser = { ...user, name: displayName };

            setUser(updatedUser);
            setCachedUser(updatedUser);
            addToast("Profile updated successfully", "success");
        } catch (error) {
            addToast("Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const formatMemberSince = (dateString?: string) => {
        if (!dateString) return "Recently";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Recently";
        }
    };

    const handleTabClick = (itemId: string) => {
        setActiveTab(itemId);
        const newUrl = itemId === "account" ? "/settings" : `/settings?tab=${itemId}`;
        window.history.replaceState(null, "", newUrl);
    };

    return (
        <div className="min-h-screen bg-bg-base">
            <FloatingNav />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                        Settings
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Manage your account preferences and security tokens.
                    </p>
                </div>

                {/* Mobile Sidebar Toggle */}
                <div className="lg:hidden mb-4">
                    <Button
                        variant="outline"
                        className="w-full border-white/10 bg-bg-subtle text-text-secondary hover:bg-bg-card hover:text-text-primary justify-between"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                        <span className="flex items-center gap-2">
                            {(() => {
                                const ActiveIcon =
                                    sidebarItems.find((i) => i.id === activeTab)
                                        ?.icon || User;
                                return <ActiveIcon className="h-4 w-4 text-accent-emerald" />;
                            })()}
                            {
                                sidebarItems.find((i) => i.id === activeTab)
                                    ?.label
                            }
                        </span>
                        {mobileSidebarOpen ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Menu className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Mobile Sidebar Dropdown */}
                    <div className="overflow-hidden">
                        <nav className="mt-2 space-y-0.5 rounded-lg border border-white/10 bg-bg-card/50 p-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            handleTabClick(item.id);
                                            setMobileSidebarOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                                            isActive
                                                ? "bg-bg-card/80 text-text-primary border border-white/10"
                                                : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Two-Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Sidebar - Hidden on mobile, visible on lg */}
                    <aside className="hidden lg:block w-48 shrink-0">
                        <nav className="space-y-0.5">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabClick(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative overflow-hidden cursor-pointer",
                                            isActive
                                                ? "bg-bg-card/80 text-text-primary border border-white/10"
                                                : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-emerald rounded-full" />
                                        )}
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Right Content Area */}
                    <div className="flex-1 space-y-6">
                        <AnimatePresence mode="wait">
                            {userLoading && activeTab === "account" ? (
                                <div key="loading" className="space-y-6">
                                    {/* Shimmer Loader for Account Information Card */}
                                    <div className="rounded-xl border border-white/10 bg-bg-card/30 p-4 sm:p-6">
                                        <div className="mb-6 space-y-2">
                                            <div className="h-6 w-48 rounded bg-bg-subtle/80 animate-pulse" />
                                            <div className="h-4 w-64 rounded bg-bg-subtle/50 animate-pulse" />
                                        </div>

                                        {/* Avatar Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                            <div className="h-16 w-16 rounded-full bg-bg-subtle/80 animate-pulse border-2 border-white/10" />
                                            <div className="h-10 w-full sm:w-40 rounded-md bg-bg-subtle/60 animate-pulse" />
                                        </div>

                                        {/* Form Inputs */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="h-4 w-24 rounded bg-bg-subtle/70 animate-pulse" />
                                                    <div className="h-10 w-full rounded-md bg-bg-subtle/60 animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-24 rounded bg-bg-subtle/70 animate-pulse" />
                                                    <div className="h-10 w-full rounded-md bg-bg-subtle/60 animate-pulse" />
                                                    <div className="h-3 w-48 rounded bg-bg-subtle/40 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-24 rounded bg-bg-subtle/70 animate-pulse" />
                                                <div className="h-11 w-full rounded-md bg-bg-subtle/40 animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
                                            <div className="h-10 w-full sm:w-32 rounded-md bg-bg-subtle/80 animate-pulse" />
                                        </div>
                                    </div>

                                    {/* Shimmer Loader for Danger Zone Card */}
                                    <div className="rounded-xl border border-red-900/20 bg-red-950/5 p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-red-950/30 animate-pulse shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-5 w-32 rounded bg-red-900/30 animate-pulse" />
                                                <div className="h-4 w-full max-w-md rounded bg-red-900/20 animate-pulse" />
                                            </div>
                                            <div className="h-10 w-full sm:w-32 rounded-md bg-red-950/30 animate-pulse shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === "account" ? (
                                <div key="account" className="space-y-6">
                                    {/* Account Information Card */}
                                    <div className="rounded-xl border border-white/10 bg-bg-card/30 p-4 sm:p-6">
                                        <div className="mb-6">
                                            <h2 className="text-base sm:text-lg font-medium text-text-primary tracking-tight">
                                                Account Information
                                            </h2>
                                            <p className="text-sm text-text-secondary mt-0.5">
                                                Update your personal profile details.
                                            </p>
                                        </div>

                                        {/* Avatar Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                            <Avatar className="h-16 w-16 border-2 border-white/10">
                                                {user?.imageUrl ? (
                                                    <AvatarImage
                                                        src={user.imageUrl}
                                                        alt={
                                                            user?.name ||
                                                            "User Avatar"
                                                        }
                                                    />
                                                ) : null}
                                                <AvatarFallback className="bg-bg-subtle text-text-secondary text-lg uppercase">
                                                    {user?.name
                                                        ? user.name.substring(0, 2)
                                                        : "UN"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled
                                                className="border-white/10 bg-bg-card/40 text-text-muted cursor-not-allowed w-full sm:w-auto justify-center py-4"
                                            >
                                                Avatar Managed on Clerk
                                            </Button>
                                        </div>

                                        {/* Form Inputs */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="displayName"
                                                        className="text-sm text-text-secondary"
                                                    >
                                                        Display Name
                                                    </Label>
                                                    <Input
                                                        id="displayName"
                                                        value={displayName}
                                                        onChange={(e) =>
                                                            setDisplayName(e.target.value)
                                                        }
                                                        className="bg-bg-subtle border-white/10 text-text-primary placeholder:text-text-muted focus-visible:ring-accent-emerald"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="email"
                                                        className="text-sm text-text-secondary"
                                                    >
                                                        Email Address
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        disabled
                                                        value={user?.email || ""}
                                                        className="bg-bg-card/40 border-white/10 text-text-muted cursor-not-allowed"
                                                    />
                                                    <p className="text-[11px] text-text-muted">
                                                        Email is managed by your Clerk authentication session.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="memberSince"
                                                    className="text-sm text-text-secondary"
                                                >
                                                    Member Since
                                                </Label>
                                                <div className="tracking-tight h-11 px-3 rounded-md border border-white/10 bg-bg-card/20 text-text-secondary text-sm flex items-center">
                                                    {formatMemberSince(
                                                        user?.createdAt?.toString(),
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
                                            <Button
                                                onClick={handleSaveChanges}
                                                disabled={isSaving}
                                                className="bg-accent-emerald-strong hover:bg-accent-emerald text-text-primary w-full sm:w-auto cursor-pointer"
                                            >
                                                {isSaving
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Danger Zone Card */}
                                    <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-950/50 border border-red-900/50 shrink-0">
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-base sm:text-md font-medium text-red-400">
                                                    Danger Zone
                                                </h2>
                                                <p className="text-xs text-red-300/70 mt-0.5">
                                                    Permanently delete your account and all associated secrets. This action cannot be undone.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-red-800/50 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 w-full sm:w-auto shrink-0 cursor-pointer"
                                            >
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === "tokens" ? (
                                <div key="tokens">
                                    <TokensTab />
                                </div>
                            ) : activeTab === "billing" ? (
                                <div
                                    key="billing"
                                    className="rounded-xl border border-white/10 bg-bg-card/30 p-8 text-center flex flex-col items-center justify-center min-h-75"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-card border border-white/10 text-accent-mint mb-4 shadow-inner">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-medium text-text-primary">
                                        Billing Plan
                                    </h3>
                                    <p className="text-text-secondary text-sm max-w-sm mt-2 font-medium">
                                        Enver is currently free, until premium features are shipped.
                                    </p>
                                </div>
                            ) : activeTab === "team" ? (
                                <div
                                    key="team"
                                    className="rounded-xl border border-white/10 bg-bg-card/30 p-8 text-center flex flex-col items-center justify-center min-h-75"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-card border border-white/10 text-text-muted mb-4 shadow-inner">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-medium text-text-primary">
                                        Teams & Collaborators
                                    </h3>
                                    <p className="text-text-muted text-sm max-w-sm mt-2">
                                        Feature coming soon
                                    </p>
                                </div>
                            ) : (
                                <div
                                    key="security"
                                    className="rounded-xl border border-white/10 bg-bg-card/30 p-8 text-center flex flex-col items-center justify-center min-h-75"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-card border border-white/10 text-text-muted mb-4 shadow-inner">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-medium text-text-primary">
                                        Security Settings
                                    </h3>
                                    <p className="text-text-muted text-sm max-w-sm mt-2">
                                        Security configuration settings will be customizable soon.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function Settings() {
    return (
        <Suspense fallback={null}>
            <SettingsContent />
        </Suspense>
    );
}
