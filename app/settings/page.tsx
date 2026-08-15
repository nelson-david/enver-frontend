"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { onboardingService } from "@/services/onboarding.service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    Loader2,
} from "lucide-react";

interface Token {
    id: string;
    name: string;
    lastUsed: string;
}

const tokens: Token[] = [
    { id: "1", name: "production-deploy-key", lastUsed: "2 days ago" },
    { id: "2", name: "local-dev-cli", lastUsed: "Never" },
];

const sidebarItems = [
    { id: "account", label: "Account", icon: User },
    { id: "tokens", label: "CLI Tokens", icon: Key },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "team", label: "Team", icon: Users },
];

export default function Settings() {
    const router = useRouter();
    const user = useAtomValue(userAtom);
    const userLoading = useAtomValue(userLoadingAtom);
    const setUser = useSetAtom(userAtom);
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState("account");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState("");

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
        if (itemId === "tokens") {
            router.push("/settings/tokens");
        } else {
            setActiveTab(itemId);
            router.replace(`/settings?tab=${itemId}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505]">
            <FloatingNav />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                        Settings
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Manage your account preferences and security tokens.
                    </p>
                </div>

                {/* Mobile Sidebar Toggle */}
                <div className="lg:hidden mb-4">
                    <Button
                        variant="outline"
                        className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 justify-between"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                        <span className="flex items-center gap-2">
                            {(() => {
                                const ActiveIcon =
                                    sidebarItems.find((i) => i.id === activeTab)
                                        ?.icon || User;
                                return <ActiveIcon className="h-4 w-4" />;
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
                        <nav className="mt-2 space-y-0.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-2">
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
                                            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-zinc-800/80 text-white"
                                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
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
                            {sidebarItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabClick(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative overflow-hidden cursor-pointer",
                                            isActive
                                                ? "bg-zinc-800/80 text-white"
                                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full" />
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
                            {userLoading ? (
                                <div key="loading" className="space-y-6">
                                    {/* Shimmer Loader for Account Information Card */}
                                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-4 sm:p-6">
                                        <div className="mb-6 space-y-2">
                                            <div className="h-6 w-48 rounded bg-zinc-800/60 animate-pulse" />
                                            <div className="h-4 w-64 rounded bg-zinc-800/30 animate-pulse" />
                                        </div>

                                        {/* Avatar Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                            <div className="h-16 w-16 rounded-full bg-zinc-800/60 animate-pulse border-2 border-zinc-700/50" />
                                            <div className="h-10 w-full sm:w-40 rounded-md bg-zinc-800/40 animate-pulse" />
                                        </div>

                                        {/* Form Inputs */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="h-4 w-24 rounded bg-zinc-800/50 animate-pulse" />
                                                    <div className="h-10 w-full rounded-md bg-zinc-800/40 animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-24 rounded bg-zinc-800/50 animate-pulse" />
                                                    <div className="h-10 w-full rounded-md bg-zinc-800/40 animate-pulse" />
                                                    <div className="h-3 w-48 rounded bg-zinc-800/30 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-24 rounded bg-zinc-800/50 animate-pulse" />
                                                <div className="h-11 w-full rounded-md bg-zinc-800/30 animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="flex justify-end mt-6 pt-6 border-t border-zinc-800/50">
                                            <div className="h-10 w-full sm:w-32 rounded-md bg-zinc-800/60 animate-pulse" />
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
                                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-6">
                                        <div className="mb-6">
                                            <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
                                                Account Information
                                            </h2>
                                            <p className="text-sm text-zinc-400 mt-0.5">
                                                Update your personal profile
                                                details.
                                            </p>
                                        </div>

                                        {/* Avatar Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                            <Avatar className="h-16 w-16 border-2 border-zinc-700">
                                                {user?.imageUrl ? (
                                                    <AvatarImage
                                                        src={user.imageUrl}
                                                        alt={
                                                            user?.name ||
                                                            "User Avatar"
                                                        }
                                                    />
                                                ) : null}
                                                <AvatarFallback className="bg-zinc-800 text-zinc-200 text-lg uppercase">
                                                    {user?.name
                                                        ? user.name.substring(
                                                              0,
                                                              2,
                                                          )
                                                        : "UN"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled
                                                className="border-zinc-800 bg-zinc-900/40 text-zinc-400 cursor-not-allowed w-full sm:w-auto justify-center py-4"
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
                                                        className="text-sm text-zinc-300"
                                                    >
                                                        Display Name
                                                    </Label>
                                                    <Input
                                                        id="displayName"
                                                        value={displayName}
                                                        onChange={(e) =>
                                                            setDisplayName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="email"
                                                        className="text-sm text-zinc-300"
                                                    >
                                                        Email Address
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        disabled
                                                        value={
                                                            user?.email || ""
                                                        }
                                                        className="bg-zinc-900/40 border-zinc-800 text-zinc-500 cursor-not-allowed"
                                                    />
                                                    <p className="text-[11px] text-zinc-500">
                                                        Email is managed by your
                                                        Clerk authentication
                                                        session.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="memberSince"
                                                    className="text-sm text-zinc-300"
                                                >
                                                    Member Since
                                                </Label>
                                                <div className="tracking-tight h-11 px-3 rounded-md border border-zinc-800 bg-zinc-900/20 text-zinc-400 text-sm flex items-center">
                                                    {formatMemberSince(
                                                        user?.createdAt?.toString(),
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="flex justify-end mt-6 pt-6 border-t border-zinc-800/50">
                                            <Button
                                                onClick={handleSaveChanges}
                                                disabled={isSaving}
                                                className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto cursor-pointer"
                                            >
                                                {isSaving
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* API Tokens Card */}
                                    {/* <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                            <div>
                                                <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
                                                    API Tokens
                                                </h2>
                                                <p className="text-sm text-zinc-400 mt-0.5">
                                                    Manage tokens for
                                                    programmatic access to
                                                    Enver.
                                                </p>
                                            </div>
                                            <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 w-full sm:w-auto justify-center cursor-pointer">
                                                <Plus className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    Create Token
                                                </span>
                                                <span className="sm:hidden">
                                                    Create
                                                </span>
                                            </Button>
                                        </div>

                                        <div className="block sm:hidden space-y-3">
                                            {tokens.map((token) => (
                                                <div
                                                    key={token.id}
                                                    className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Key className="h-4 w-4 text-zinc-500 shrink-0" />
                                                        <code className="text-sm font-mono text-zinc-300 truncate">
                                                            {token.name}
                                                        </code>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                                                            {token.lastUsed}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 shrink-0 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="hidden sm:block rounded-lg border border-zinc-800/50 overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-zinc-800/50 hover:bg-transparent bg-zinc-900/50">
                                                        <TableHead className="text-zinc-400 font-medium text-xs uppercase tracking-wider">
                                                            TOKEN NAME
                                                        </TableHead>
                                                        <TableHead className="text-zinc-400 font-medium text-xs uppercase tracking-wider">
                                                            LAST USED
                                                        </TableHead>
                                                        <TableHead className="text-zinc-400 font-medium text-xs uppercase tracking-wider text-right">
                                                            ACTIONS
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tokens.map((token) => (
                                                        <TableRow
                                                            key={token.id}
                                                            className="border-b border-zinc-800/30 hover:bg-zinc-800/20"
                                                        >
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Key className="h-4 w-4 text-zinc-500" />
                                                                    <code className="text-sm font-mono text-zinc-300">
                                                                        {
                                                                            token.name
                                                                        }
                                                                    </code>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-sm text-zinc-400">
                                                                    {
                                                                        token.lastUsed
                                                                    }
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div> */}

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
                                                    Permanently delete your
                                                    account and all associated
                                                    secrets. This action cannot
                                                    be undone.
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
                            ) : activeTab === "billing" ? (
                                <div
                                    key="billing"
                                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center flex flex-col items-center justify-center min-h-75"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-blue-500 mb-4 shadow-inner">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-medium text-zinc-200">
                                        Billing Plan
                                    </h3>
                                    <p className="text-zinc-400 text-sm max-w-sm mt-2 font-medium">
                                        Enver is currently free, until premium
                                        features are shipped.
                                    </p>
                                </div>
                            ) : activeTab === "team" ? (
                                <div
                                    key="team"
                                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center flex flex-col items-center justify-center min-h-75"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4 shadow-inner">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-medium text-zinc-200">
                                        Teams & Collaborators
                                    </h3>
                                    <p className="text-zinc-500 text-sm max-w-sm mt-2">
                                        Feature coming soon
                                    </p>
                                </div>
                            ) : (
                                <div
                                    key="security"
                                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center flex flex-col items-center justify-center min-h-75"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4 shadow-inner">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-medium text-zinc-200">
                                        Security Settings
                                    </h3>
                                    <p className="text-zinc-500 text-sm max-w-sm mt-2">
                                        Security configuration settings will be
                                        customizable soon.
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
