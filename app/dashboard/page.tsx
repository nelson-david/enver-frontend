"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/context/toast-context";
import { FloatingNav } from "@/components/layout/floating-nav";
import { NewSecretModal } from "@/components/secrets/new-secret-modal";
import { DeleteSecretModal } from "@/components/secrets/delete-secret-modal";
import { ViewDetailsModal } from "@/components/secrets/view-details-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { envService, type EnvMetadata } from "@/services/env.service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Filter,
    Plus,
    FolderOpen,
    MoreHorizontal,
    Key,
    Settings,
    Trash2,
    Copy,
    ExternalLink,
    Lock,
} from "lucide-react";

export default function Dashboard() {
    const { getToken } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [isNewSecretModalOpen, setIsNewSecretModalOpen] = useState(false);
    const [secretToView, setSecretToView] = useState<any>(null);
    const [secretToDelete, setSecretToDelete] = useState<{
        projectId: string;
        environment: string;
    } | null>(null);

    const {
        data: secrets = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["envs"],
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            return envService.getUserEnvs(token);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async ({
            projectId,
            environment,
        }: {
            projectId: string;
            environment: string;
        }) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            return envService.deleteEnv(projectId, environment, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["envs"] });
            addToast("Secret deleted successfully", "success");
            setSecretToDelete(null);
        },
        onError: (error) => {
            addToast(error.message || "Failed to delete secret", "error");
        },
    });

    const handleDeleteConfirm = () => {
        if (secretToDelete) {
            deleteMutation.mutate(secretToDelete);
        }
    };

    const filteredSecrets = secrets.filter((secret: any) =>
        secret.projectId.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000,
        );

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000)
            return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#050505]">
            <FloatingNav />

            {/* Modal to Create New Secret */}
            <NewSecretModal
                isOpen={isNewSecretModalOpen}
                onClose={() => setIsNewSecretModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["envs"] });
                    addToast("Secret created successfully", "success");
                }}
            />

            {/* Confirmation Modal to Delete Secret */}
            {/* <DeleteSecretModal
                isOpen={!!secretToDelete}
                onClose={() => setSecretToDelete(null)}
                onConfirm={handleDeleteConfirm}
                projectName={secretToDelete?.projectId || ""}
                environment={secretToDelete?.environment || ""}
                isLoading={deleteMutation.isPending}
            /> */}

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                            Your Secure Envs
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            Manage and deploy environment variables securely.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsNewSecretModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white gap-2 w-full sm:w-auto justify-center cursor-pointer shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Secret</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <Input
                            placeholder="Find repository or project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-600 w-full"
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 w-full sm:w-auto justify-center"
                    >
                        <Filter className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Filter</span>
                        <span className="sm:hidden">Filter</span>
                    </Button>
                </div>

                {error ? (
                    <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6 text-center text-red-400">
                        Failed to load environments. Please refresh the page.
                    </div>
                ) : isLoading ? (
                    <>
                        {/* Shimmer Loader: Mobile Card View */}
                        <div className="block sm:hidden space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-4"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-zinc-800/60 animate-pulse border border-zinc-700/30" />
                                            <div className="space-y-2">
                                                <div className="h-4 w-28 rounded bg-zinc-800/60 animate-pulse" />
                                                <div className="h-3 w-40 rounded bg-zinc-800/30 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded bg-zinc-800/40 animate-pulse" />
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40">
                                        <div className="h-5 w-16 rounded-full bg-zinc-800/60 animate-pulse" />
                                        <div className="h-4 w-24 rounded bg-zinc-800/40 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Shimmer Loader: Desktop Table View */}
                        <div className="hidden sm:block rounded-xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800/50 hover:bg-transparent">
                                        <TableHead className="text-zinc-400 font-medium">
                                            PROJECT
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            ENVIRONMENT
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            SHARES
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            LAST UPDATED
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium text-right">
                                            ACTIONS
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[1, 2, 3].map((i) => (
                                        <TableRow
                                            key={i}
                                            className="hover:bg-transparent"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-zinc-800/60 animate-pulse border border-zinc-700/30" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-32 rounded bg-zinc-800/60 animate-pulse" />
                                                        <div className="h-3 w-48 rounded bg-zinc-800/30 animate-pulse" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-5 w-20 rounded-full bg-zinc-800/60 animate-pulse" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-12 rounded bg-zinc-800/60 animate-pulse" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-20 rounded bg-zinc-800/40 animate-pulse" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="h-8 w-8 ml-auto rounded bg-zinc-800/40 animate-pulse" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : filteredSecrets.length === 0 ? (
                    /* Beautiful Premium Empty State */
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center flex flex-col items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4 shadow-inner">
                            <Lock className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-200">
                            No secret environments found
                        </h3>
                        <p className="text-zinc-500 text-sm max-w-sm mt-2 mb-6">
                            Create your first secure environment to split and
                            store your configuration credentials.
                        </p>
                        <Button
                            onClick={() => setIsNewSecretModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                        >
                            <Plus className="h-4 w-4" />
                            Create First Secret
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="block sm:hidden space-y-3">
                            {filteredSecrets.map(
                                (secret: any, index: number) => (
                                    <div
                                        key={secret.id}
                                        className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                                                    <FolderOpen className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-100 text-sm">
                                                        {secret.projectId}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        End-to-End Encrypted
                                                        Vault
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-48"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setSecretToView(
                                                                secret,
                                                            )
                                                        }
                                                        className="gap-2 cursor-pointer"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setSecretToDelete({
                                                                projectId:
                                                                    secret.projectId,
                                                                environment:
                                                                    secret.environment,
                                                            })
                                                        }
                                                        className="gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                            <Badge
                                                variant={
                                                    secret.environment.toLowerCase() as any
                                                }
                                                className="text-[10px] font-medium uppercase tracking-wide"
                                            >
                                                {secret.environment}
                                            </Badge>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-zinc-400">
                                                    <Key className="h-3.5 w-3.5 text-zinc-500" />
                                                    <span className="font-mono text-xs">
                                                        {secret.sharesCount}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-zinc-500">
                                                    {formatRelativeTime(
                                                        secret.updatedAt,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800/50 hover:bg-transparent">
                                        <TableHead className="text-zinc-400 font-medium">
                                            PROJECT
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            ENVIRONMENT
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            SHARES
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            LAST UPDATED
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium text-right">
                                            ACTIONS
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSecrets.map((secret: any) => (
                                        <TableRow
                                            key={secret.id}
                                            className="group"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                                                        <FolderOpen className="h-4 w-4 text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-100 lowercase">
                                                            {secret.projectId}
                                                        </p>
                                                        <p className="text-[11px] text-zinc-500">
                                                            End-to-End Encrypted
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        secret.environment.toLowerCase() as any
                                                    }
                                                    className="text-[10px] font-medium uppercase tracking-wide"
                                                >
                                                    {secret.environment}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-zinc-300">
                                                    <Key className="h-3.5 w-3.5 text-zinc-500" />
                                                    <span className="font-mono text-xs">
                                                        {secret.sharesCount}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-zinc-400">
                                                    {formatRelativeTime(
                                                        secret.updatedAt,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setSecretToView(
                                                                    secret,
                                                                )
                                                            }
                                                            className="gap-2 cursor-pointer"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setSecretToDelete(
                                                                    {
                                                                        projectId:
                                                                            secret.projectId,
                                                                        environment:
                                                                            secret.environment,
                                                                    },
                                                                )
                                                            }
                                                            className="gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </main>
            <NewSecretModal
                isOpen={isNewSecretModalOpen}
                onClose={() => setIsNewSecretModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["envs"] });
                }}
            />
            <DeleteSecretModal
                isOpen={!!secretToDelete}
                onClose={() => setSecretToDelete(null)}
                onConfirm={handleDeleteConfirm}
                projectName={secretToDelete?.projectId || ""}
                environment={secretToDelete?.environment || ""}
                isLoading={deleteMutation.isPending}
            />
            <ViewDetailsModal
                isOpen={!!secretToView}
                onClose={() => setSecretToView(null)}
                secret={secretToView}
            />
        </div>
    );
}
