"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/toast-context";
import { api } from "@/lib/api";
import { FloatingNav } from "@/components/layout/floating-nav";
import { NewSecretModal } from "@/components/secrets/new-secret-modal";
import { DeleteSecretModal } from "@/components/secrets/delete-secret-modal";
import { ViewDetailsModal } from "@/components/secrets/view-details-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    MoreHorizontal,
    Search,
    Folder,
    Copy,
    ExternalLink,
    Trash2,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Secret {
    id: string;
    projectId: string;
    environment: string;
    sharesCount: number;
    updatedAt: string;
}

export default function DashboardPage() {
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
        queryKey: ["secrets"],
        queryFn: async () => {
            const token = await getToken();
            const response = await api.get("/envs", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data as Secret[];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (data: {
            projectId: string;
            environment: string;
        }) => {
            const token = await getToken();
            const response = await api.delete(
                `/envs/${data.projectId}?environment=${data.environment}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["secrets"] });
            addToast("Environment deleted successfully", "success");
        },
        onError: (error: any) => {
            addToast(
                error.response?.data?.error || "Failed to delete environment",
                "error",
            );
        },
    });

    const filteredSecrets = secrets.filter(
        (secret) =>
            secret.projectId
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            secret.environment
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const handleDeleteConfirm = () => {
        if (secretToDelete) {
            deleteMutation.mutate(secretToDelete);
            setSecretToDelete(null);
        }
    };

    const getBadgeVariant = (environment: string) => {
        switch (environment) {
            case "PRODUCTION":
                return "production";
            case "STAGING":
                return "staging";
            case "DEVELOPMENT":
                return "development";
            default:
                return "default";
        }
    };

    return (
        <div className="min-h-screen bg-bg-base">
            <FloatingNav />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                            Your Secure Envs
                        </h1>
                        <p className="text-text-secondary">
                            Manage and deploy environment variables securely.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsNewSecretModalOpen(true)}
                        className="bg-accent-emerald-strong hover:bg-accent-emerald text-text-primary"
                    >
                        + New Secret
                    </Button>
                </div>

                <div className="mb-6 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                        <Input
                            placeholder="Find repository or project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 bg-bg-subtle border-white/10 pl-10 text-text-primary placeholder:text-text-muted focus-visible:ring-accent-emerald"
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="h-10 border-white/10 bg-bg-subtle text-text-secondary hover:text-text-primary"
                    >
                        Filter
                    </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-bg-card/30">
                    {isLoading ? (
                        <div className="p-8">
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 rounded-lg border border-white/10 bg-bg-card/50 p-4"
                                    >
                                        <div className="h-10 w-10 animate-pulse rounded-lg bg-bg-subtle/80" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 animate-pulse rounded bg-bg-subtle/80" />
                                            <div className="h-3 w-48 animate-pulse rounded bg-bg-subtle/50" />
                                        </div>
                                        <div className="h-6 w-20 animate-pulse rounded-full bg-bg-subtle/80" />
                                        <div className="h-4 w-12 animate-pulse rounded bg-bg-subtle/80" />
                                        <div className="h-4 w-16 animate-pulse rounded bg-bg-subtle/80" />
                                        <div className="h-8 w-8 animate-pulse rounded bg-bg-subtle/80" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <p className="text-red-400">
                                Failed to load secrets
                            </p>
                        </div>
                    ) : filteredSecrets.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-text-muted">No secrets found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-text-muted">
                                        PROJECT
                                    </TableHead>
                                    <TableHead className="text-text-muted">
                                        ENVIRONMENT
                                    </TableHead>
                                    <TableHead className="text-text-muted">
                                        KEYS
                                    </TableHead>
                                    <TableHead className="text-text-muted">
                                        LAST UPDATED
                                    </TableHead>
                                    <TableHead className="text-right text-text-muted">
                                        ACTIONS
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredSecrets.map((secret) => (
                                        <motion.tr
                                            key={secret.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-white/5 hover:bg-bg-card/60"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Folder className="h-4 w-4 text-text-muted" />
                                                    <div>
                                                        <div className="font-medium text-text-primary">
                                                            {secret.projectId}
                                                        </div>
                                                        <div className="text-xs text-text-muted">
                                                            Cluster
                                                            configuration
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        getBadgeVariant(
                                                            secret.environment,
                                                        ) as any
                                                    }
                                                >
                                                    {secret.environment}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-text-secondary">
                                                    🔑 {secret.sharesCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-text-secondary">
                                                {new Date(
                                                    secret.updatedAt,
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-text-secondary hover:text-text-primary"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48 bg-bg-card border-white/10"
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
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    secret.projectId,
                                                                );
                                                                addToast(
                                                                    "Project ID copied",
                                                                    "success",
                                                                );
                                                            }}
                                                            className="gap-2 cursor-pointer"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                            Copy Project ID
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSecretToDelete(
                                                                    {
                                                                        projectId:
                                                                            secret.projectId,
                                                                        environment:
                                                                            secret.environment,
                                                                    },
                                                                );
                                                            }}
                                                            className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete Environment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    )}
                </div>
            </main>

            <NewSecretModal
                isOpen={isNewSecretModalOpen}
                onClose={() => setIsNewSecretModalOpen(false)}
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
