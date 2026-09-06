"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FloatingNav } from "@/components/layout/floating-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/toast-context";
import { tokenService, type ApiTokenMetadata } from "@/services/token.service";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    User,
    Shield,
    CreditCard,
    Users,
    Key,
    Plus,
    Trash2,
    Copy,
    Check,
    AlertTriangle,
    Terminal,
    Loader2,
    Calendar,
    Clock,
    Menu,
    X,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const sidebarItems = [
    {
        id: "account",
        label: "Account",
        icon: User,
        href: "/settings?tab=account",
    },
    { id: "tokens", label: "CLI Tokens", icon: Key, href: "/settings/tokens" },
    {
        id: "security",
        label: "Security",
        icon: Shield,
        href: "/settings?tab=security",
    },
    {
        id: "billing",
        label: "Billing",
        icon: CreditCard,
        href: "/settings?tab=billing",
    },
    { id: "team", label: "Team", icon: Users, href: "/settings?tab=team" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
} as const;

export default function TokenSettingsPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Form States
    const [tokenName, setTokenName] = useState("");
    const [ttlDays, setTtlDays] = useState<number | null>(30); // Default to 30 days
    const [selectedScope, setSelectedScope] = useState<string>("read:secrets");
    const [createdTokenData, setCreatedTokenData] = useState<{
        rawToken: string;
        displayPrefix: string;
    } | null>(null);

    // Clipboard Copy States
    const [copiedToken, setCopiedToken] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState(false);

    // Revocation Confirm State (stores token ID currently in confirm-revoke mode)
    const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

    // Fetch Tokens
    const { data: tokens = [], isLoading } = useQuery<ApiTokenMetadata[]>({
        queryKey: ["tokens"],
        queryFn: async () => {
            const token = await getToken();
            return tokenService.getTokens(token);
        },
    });

    // Create Token Mutation
    const createMutation = useMutation({
        mutationFn: async (payload: {
            name: string;
            ttlDays: number | null;
            scopes: string[];
        }) => {
            const token = await getToken();
            return tokenService.createToken(payload, token);
        },
        onSuccess: (data) => {
            setCreatedTokenData({
                rawToken: data.rawToken,
                displayPrefix: data.displayPrefix,
            });
            queryClient.invalidateQueries({ queryKey: ["tokens"] });
            addToast("API token generated successfully", "success");
        },
        onError: (err: any) => {
            addToast(err.message || "Failed to generate token", "error");
        },
    });

    // Revoke Token Mutation
    const revokeMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return tokenService.deleteToken(id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tokens"] });
            addToast("API token revoked", "success");
            setConfirmRevokeId(null);
        },
        onError: (err: any) => {
            addToast(err.message || "Failed to revoke token", "error");
        },
    });

    const handleCreateToken = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tokenName.trim()) {
            addToast("Please provide a name for the token", "error");
            return;
        }
        createMutation.mutate({
            name: tokenName.trim(),
            ttlDays,
            scopes: [selectedScope],
        });
    };

    const handleCopyToken = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedToken(true);
        addToast("Token copied to clipboard", "success");
        setTimeout(() => setCopiedToken(false), 2000);
    };

    const handleCopySnippet = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(true);
        addToast("Command copied to clipboard", "success");
        setTimeout(() => setCopiedSnippet(false), 2000);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setCreatedTokenData(null);
        setTokenName("");
        setTtlDays(30);
        setSelectedScope("read:secrets");
        createMutation.reset();
    };

    const formatExpiryDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "Never";
        }
    };

    const formatRelativeTime = (dateString: string | null) => {
        if (!dateString) return "Never";
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);

            if (diffSec < 60) return "Just now";
            if (diffMin < 60) return `${diffMin}m ago`;
            if (diffHour < 24) return `${diffHour}h ago`;
            if (diffDay < 30) return `${diffDay}d ago`;

            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        } catch {
            return "Recently";
        }
    };

    return (
        <div className="min-h-screen bg-bg-base">
            <FloatingNav />

            <motion.main
                className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-4 py-6 sm:py-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
                    <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                        Settings
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Manage your account preferences and security tokens.
                    </p>
                </motion.div>

                {/* Mobile Sidebar Toggle */}
                <motion.div className="lg:hidden mb-4" variants={itemVariants}>
                    <Button
                        variant="outline"
                        className="w-full border-border-subtle bg-bg-subtle/50 text-text-secondary hover:bg-bg-card hover:text-text-primary justify-between"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                        <span className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-accent-emerald" />
                            CLI Tokens
                        </span>
                        {mobileSidebarOpen ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Menu className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Mobile Sidebar Dropdown */}
                    <motion.div
                        initial={false}
                        animate={{
                            height: mobileSidebarOpen ? "auto" : 0,
                            opacity: mobileSidebarOpen ? 1 : 0,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                    >
                        <nav className="mt-2 space-y-0.5 rounded-lg border border-border-subtle bg-bg-subtle/30 p-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.id === "tokens";
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.href) {
                                                router.push(item.href);
                                            }
                                            setMobileSidebarOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                                            isActive
                                                ? "bg-bg-card/80 text-text-primary"
                                                : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </motion.div>
                </motion.div>

                {/* Two-Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Sidebar */}
                    <motion.aside
                        className="hidden lg:block w-48 shrink-0"
                        variants={itemVariants}
                    >
                        <nav className="space-y-0.5">
                            {sidebarItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = item.id === "tokens";
                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => router.push(item.href)}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative overflow-hidden cursor-pointer",
                                            isActive
                                                ? "bg-bg-card/80 text-text-primary"
                                                : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                                        )}
                                        whileHover={{ x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: index * 0.05 + 0.2,
                                            duration: 0.3,
                                        }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeSidebarIndicator"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-emerald rounded-full"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </motion.aside>

                    {/* Right Content Area */}
                    <div className="flex-1 space-y-6">
                        <motion.div
                            variants={itemVariants}
                            className="rounded-xl border border-border-subtle bg-bg-subtle/30 p-4 sm:p-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-base sm:text-lg font-medium text-text-primary tracking-tight">
                                        Personal Access Tokens (PAT)
                                    </h2>
                                    <p className="text-sm text-text-secondary mt-0.5">
                                        Generate tokens to authenticate securely
                                        with Enver from the CLI.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-accent-emerald-strong hover:bg-accent-emerald text-text-primary gap-2 w-full sm:w-auto justify-center cursor-pointer shadow-lg shadow-accent-emerald-strong/25"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Generate New Token</span>
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                                    <Loader2 className="h-8 w-8 text-accent-emerald animate-spin mb-4" />
                                    <p className="text-sm">
                                        Loading security tokens...
                                    </p>
                                </div>
                            ) : tokens.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border-subtle p-8 text-center bg-bg-base/20">
                                    <Key className="h-10 w-10 text-text-dim mx-auto mb-3" />
                                    <h3 className="text-sm font-medium text-text-secondary">
                                        No CLI tokens active
                                    </h3>
                                    <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                                        You haven't generated any Personal
                                        Access Tokens yet. Create one to log in
                                        via the CLI.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Responsive List */}
                                    <div className="block sm:hidden space-y-3">
                                        {tokens.map((token) => (
                                            <div
                                                key={token.id}
                                                className="rounded-lg border border-border-subtle bg-bg-card/50 p-4 space-y-3 relative overflow-hidden"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-text-primary truncate">
                                                            {token.name}
                                                        </p>
                                                        <code className="text-xs font-mono text-text-muted mt-0.5 block">
                                                            {
                                                                token.displayPrefix
                                                            }
                                                            ...
                                                        </code>
                                                    </div>
                                                    {confirmRevokeId ===
                                                    token.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setConfirmRevokeId(
                                                                        null,
                                                                    )
                                                                }
                                                                className="h-7 px-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    revokeMutation.mutate(
                                                                        token.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    revokeMutation.isPending
                                                                }
                                                                className="h-7 px-2.5 text-xs bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                                                            >
                                                                {revokeMutation.isPending
                                                                    ? "..."
                                                                    : "Revoke"}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setConfirmRevokeId(
                                                                    token.id,
                                                                )
                                                            }
                                                            className="h-8 w-8 text-text-muted hover:text-red-400 hover:bg-red-950/20 cursor-pointer shrink-0"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle text-[11px] text-text-muted">
                                                    <div>
                                                        <span className="block text-[10px] text-text-dim uppercase tracking-wide">
                                                            Created
                                                        </span>
                                                        <span>
                                                            {new Date(
                                                                token.createdAt,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] text-text-dim uppercase tracking-wide">
                                                            Expires
                                                        </span>
                                                        <span>
                                                            {formatExpiryDate(
                                                                token.expiresAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="block text-[10px] text-text-dim uppercase tracking-wide">
                                                            Last Used
                                                        </span>
                                                        <span>
                                                            {formatRelativeTime(
                                                                token.lastUsedAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden sm:block rounded-lg border border-border-subtle overflow-hidden bg-bg-base/10">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-border-subtle hover:bg-transparent bg-bg-subtle/50">
                                                    <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider h-11">
                                                        TOKEN NAME
                                                    </TableHead>
                                                    <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider h-11">
                                                        PREFIX
                                                    </TableHead>
                                                    <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider h-11">
                                                        CREATED
                                                    </TableHead>
                                                    <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider h-11">
                                                        EXPIRES
                                                    </TableHead>
                                                    <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider h-11">
                                                        LAST USED
                                                    </TableHead>
                                                    <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider text-right h-11">
                                                        ACTION
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tokens.map((token) => (
                                                    <TableRow
                                                        key={token.id}
                                                        className="border-b border-border-light hover:bg-bg-card/10 transition-colors"
                                                    >
                                                        <TableCell className="font-medium text-text-primary py-3.5">
                                                            {token.name}
                                                        </TableCell>
                                                        <TableCell className="py-3.5">
                                                            <code className="text-xs font-mono text-text-secondary bg-bg-subtle/60 px-1.5 py-0.5 rounded border border-border-subtle">
                                                                {
                                                                    token.displayPrefix
                                                                }
                                                                ...
                                                            </code>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-text-secondary py-3.5">
                                                            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                                <Calendar className="h-3.5 w-3.5 text-text-muted" />
                                                                {new Date(
                                                                    token.createdAt,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-text-secondary py-3.5">
                                                            <span
                                                                className={cn(
                                                                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                                                    token.expiresAt &&
                                                                        new Date(
                                                                            token.expiresAt,
                                                                        ) <
                                                                            new Date()
                                                                        ? "bg-red-950/20 text-red-400 border-red-900/30"
                                                                        : "bg-bg-subtle/30 text-text-secondary border-border-subtle",
                                                                )}
                                                            >
                                                                {formatExpiryDate(
                                                                    token.expiresAt,
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-text-secondary py-3.5">
                                                            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                                <Clock className="h-3.5 w-3.5 text-text-muted" />
                                                                {formatRelativeTime(
                                                                    token.lastUsedAt,
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right py-3.5">
                                                            {confirmRevokeId ===
                                                            token.id ? (
                                                                <div className="inline-flex items-center gap-2">
                                                                    <span className="text-[11px] text-text-muted font-medium">
                                                                        Revoke?
                                                                    </span>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            setConfirmRevokeId(
                                                                                null,
                                                                            )
                                                                        }
                                                                        className="h-7 px-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-card/40 cursor-pointer"
                                                                    >
                                                                        No
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            revokeMutation.mutate(
                                                                                token.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            revokeMutation.isPending
                                                                        }
                                                                        className="h-7 px-3 text-xs bg-red-600/90 hover:bg-red-600 text-white cursor-pointer rounded"
                                                                    >
                                                                        {revokeMutation.isPending
                                                                            ? "Revoking..."
                                                                            : "Yes, Revoke"}
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        setConfirmRevokeId(
                                                                            token.id,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 text-text-muted hover:text-red-400 hover:bg-red-950/30 cursor-pointer rounded"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.main>

            {/* Token Generation Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                            onClick={createdTokenData ? undefined : closeModal} // Disable backdrop close on success screen
                        />

                        {/* Modal Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="bg-bg-card border border-border-subtle text-text-primary rounded-xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden"
                        >
                            {!createdTokenData ? (
                                // Step 1: Input details form
                                <form
                                    onSubmit={handleCreateToken}
                                    className="p-6 space-y-4"
                                >
                                    <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                        <h3 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
                                            <Key className="h-4.5 w-4.5 text-accent-emerald" />
                                            Generate API Token
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-2 mt-2">
                                        <Label
                                            htmlFor="tName"
                                            className="text-xs text-text-secondary font-medium"
                                        >
                                            Token Name
                                        </Label>
                                        <Input
                                            id="tName"
                                            value={tokenName}
                                            onChange={(e) =>
                                                setTokenName(e.target.value)
                                            }
                                            placeholder="e.g. Work Laptop, CI/CD Pipeline"
                                            className="bg-bg-subtle/60 border-border-subtle text-text-primary placeholder:text-text-muted focus-visible:ring-accent-emerald focus-visible:border-accent-emerald text-sm h-10"
                                            autoFocus
                                            required
                                        />
                                        <p className="text-[10px] text-text-muted">
                                            Give the token a friendly name to
                                            identify it later.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-text-secondary font-medium">
                                            Expiration (TTL)
                                        </Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <select
                                                value={
                                                    ttlDays === null
                                                        ? "never"
                                                        : String(ttlDays)
                                                }
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setTtlDays(
                                                        val === "never"
                                                            ? null
                                                            : Number(val),
                                                    );
                                                }}
                                                className="bg-bg-subtle/60 border border-border-subtle text-text-secondary hover:text-text-primary rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-emerald focus:border-accent-emerald cursor-pointer"
                                            >
                                                <option value="7">
                                                    7 Days
                                                </option>
                                                <option value="30">
                                                    30 Days
                                                </option>
                                                <option value="90">
                                                    90 Days
                                                </option>
                                                <option value="365">
                                                    1 Year
                                                </option>
                                                <option value="never">
                                                    No Expiration (Never)
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-text-secondary font-medium">
                                            Scopes
                                        </Label>
                                        <Select
                                            value={selectedScope}
                                            onValueChange={(value) => {
                                                setSelectedScope(value);
                                            }}
                                        >
                                            <SelectTrigger className="w-full bg-bg-subtle/60 border-border-subtle text-text-secondary">
                                                <SelectValue className="font-mono text-xs" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-bg-subtle border-border-subtle text-text-primary">
                                                <SelectItem
                                                    value="read:secrets"
                                                    className="font-mono text-xs"
                                                >
                                                    read:secrets (Read‑Only)
                                                </SelectItem>
                                                <SelectItem
                                                    value="write:secrets"
                                                    className="font-mono text-xs"
                                                >
                                                    write:secrets (Full Access)
                                                </SelectItem>
                                                <SelectItem
                                                    value="admin"
                                                    className="font-mono text-xs"
                                                >
                                                    admin (Admin Access)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-text-muted">
                                            Select the scope this token can
                                            perform. "write:secrets" includes
                                            read access and the ability to
                                            modify environments.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeModal}
                                            className="border-border-subtle bg-bg-subtle/40 text-text-secondary hover:text-text-primary hover:bg-bg-card cursor-pointer h-9 px-4 text-xs font-medium"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                            className="bg-accent-emerald-strong hover:bg-accent-emerald text-text-primary cursor-pointer h-9 px-4 text-xs font-medium shadow-lg shadow-accent-emerald-strong/20"
                                        >
                                            {createMutation.isPending
                                                ? "Generating..."
                                                : "Generate Token"}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                // Step 2: Show raw token (success step)
                                <div className="p-6 space-y-5">
                                    <div className="text-center pb-2">
                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-emerald/20 border border-accent-emerald/40 mb-3">
                                            <Check className="h-5 w-5 text-accent-mint" />
                                        </div>
                                        <h3 className="text-base font-semibold text-text-primary tracking-tight">
                                            Token Generated Successfully
                                        </h3>
                                        <p className="text-xs text-text-muted mt-1">
                                            Use this token to authenticate your
                                            terminal.
                                        </p>
                                    </div>

                                    {/* Security Warning Alert - mint-lean caution */}
                                    <div className="rounded-lg border border-accent-mint/25 bg-accent-mint/10 p-3 flex items-start gap-2.5">
                                        <AlertTriangle className="h-4.5 w-4.5 text-accent-mint shrink-0 mt-0.5" />
                                        <div className="text-[11px] text-text-secondary leading-relaxed font-medium">
                                            Make sure to copy your token now.
                                            You won't be able to see it again
                                            once you close this modal!
                                        </div>
                                    </div>

                                    {/* Raw Token Input Display */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">
                                            Raw Token
                                        </span>
                                        <div className="relative flex items-center">
                                            <Input
                                                readOnly
                                                value={
                                                    createdTokenData.rawToken
                                                }
                                                className="bg-bg-base border-border-subtle text-text-secondary font-mono text-xs pr-11 h-9.5 select-all"
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleCopyToken(
                                                        createdTokenData.rawToken,
                                                    )
                                                }
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-text-secondary hover:text-text-primary hover:bg-bg-subtle/80 cursor-pointer"
                                            >
                                                {copiedToken ? (
                                                    <Check className="h-3.5 w-3.5 text-accent-mint" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* CLI Login Snippet */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1">
                                            <Terminal className="h-3 w-3 text-text-muted" />
                                            CLI Login Command
                                        </span>
                                        <div className="relative flex items-center">
                                            <code className="w-full bg-bg-base border border-border-subtle text-text-secondary font-mono text-[11px] px-3 py-2 rounded-md pr-11 truncate select-all">
                                                ev login{" "}
                                                {createdTokenData.rawToken}
                                            </code>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleCopySnippet(
                                                        `ev login ${createdTokenData.rawToken}`,
                                                    )
                                                }
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-text-secondary hover:text-text-primary hover:bg-bg-subtle/80 cursor-pointer"
                                            >
                                                {copiedSnippet ? (
                                                    <Check className="h-3.5 w-3.5 text-accent-mint" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="button"
                                            onClick={closeModal}
                                            className="w-full bg-bg-subtle hover:bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary cursor-pointer h-9 text-xs font-semibold"
                                        >
                                            Done & Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
