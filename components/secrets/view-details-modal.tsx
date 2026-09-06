"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/context/toast-context";
import { api } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Trash2,
    UserPlus,
    Shield,
    Key,
    FolderOpen,
    Activity,
} from "lucide-react";

interface Member {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    role: string;
    isOwner: boolean;
}

interface ActivityLog {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        imageUrl?: string;
    } | null;
}

interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    secret: any;
}

export function ViewDetailsModal({
    isOpen,
    onClose,
    secret,
}: ViewDetailsModalProps) {
    const { getToken } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("member");

    const { data: members = [], isLoading: isLoadingMembers } = useQuery({
        queryKey: ["project-members", secret?.projectId],
        queryFn: async () => {
            if (!secret?.projectId) return [];
            const token = await getToken();
            const response = await api.get(
                `/projects/${secret.projectId}/members`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            return response.data.data as Member[];
        },
        enabled: isOpen && !!secret?.projectId,
    });

    const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
        queryKey: ["project-activity", secret?.projectId],
        queryFn: async () => {
            if (!secret?.projectId) return [];
            const token = await getToken();
            const response = await api.get(`/activity/${secret.projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data as ActivityLog[];
        },
        enabled: isOpen && !!secret?.projectId,
    });

    const addMemberMutation = useMutation({
        mutationFn: async () => {
            const token = await getToken();
            const response = await api.post(
                `/projects/${secret.projectId}/members`,
                { email: newMemberEmail, role: newMemberRole },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project-members", secret?.projectId],
            });
            addToast("Member added successfully", "success");
            setNewMemberEmail("");
        },
        onError: (error: any) => {
            addToast(
                error.response?.data?.error || "Failed to add member",
                "error",
            );
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: async (email: string) => {
            const token = await getToken();
            const response = await api.delete(
                `/projects/${secret.projectId}/members/${encodeURIComponent(email)}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project-members", secret?.projectId],
            });
            addToast("Member removed successfully", "success");
        },
        onError: (error: any) => {
            addToast(
                error.response?.data?.error || "Failed to remove member",
                "error",
            );
        },
    });

    if (!secret) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-150 bg-bg-base border-border-subtle text-text-primary p-0 overflow-hidden">
                <div className="p-6 border-b border-border-subtle">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-card/50 border border-border-subtle">
                                <FolderOpen className="h-5 w-5 text-text-secondary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    {secret.projectId}
                                    <Badge
                                        variant={
                                            secret.environment.toLowerCase() as any
                                        }
                                        className="text-[10px] font-medium uppercase tracking-wide"
                                    >
                                        {secret.environment}
                                    </Badge>
                                </div>
                                <DialogDescription className="text-text-muted mt-1">
                                    End-to-End Encrypted Vault Details
                                </DialogDescription>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                    {/* Environment Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Environment Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border border-border-subtle bg-bg-subtle/30 p-4">
                                <p className="text-xs text-text-muted mb-1">
                                    Total Shares
                                </p>
                                <p className="text-lg font-mono text-text-primary">
                                    {secret.sharesCount}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border-subtle bg-bg-subtle/30 p-4">
                                <p className="text-xs text-text-muted mb-1">
                                    Last Updated
                                </p>
                                <p className="text-sm text-text-primary">
                                    {new Date(
                                        secret.updatedAt,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Project Members
                        </h3>

                        {/* Add Member Form */}
                        <div className="flex items-center gap-3">
                            <Input
                                placeholder="Email address"
                                value={newMemberEmail}
                                onChange={(e) =>
                                    setNewMemberEmail(e.target.value)
                                }
                                className="bg-bg-subtle/50 border-border-subtle text-text-primary placeholder:text-text-muted focus-visible:ring-accent-emerald flex-1"
                            />
                            <Select
                                value={newMemberRole}
                                onValueChange={setNewMemberRole}
                            >
                                <SelectTrigger className="w-30 bg-bg-subtle/50 border-border-subtle text-text-primary">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-bg-subtle border-border-subtle text-text-primary">
                                    <SelectItem value="member">
                                        Member
                                    </SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={() => addMemberMutation.mutate()}
                                disabled={
                                    !newMemberEmail ||
                                    addMemberMutation.isPending
                                }
                                className="bg-accent-emerald-strong hover:bg-accent-emerald text-text-primary shadow-lg shadow-accent-emerald-strong/20"
                            >
                                {addMemberMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UserPlus className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Members List */}
                        <div className="rounded-lg border border-border-subtle bg-bg-subtle/30 overflow-hidden">
                            {isLoadingMembers ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="h-6 w-6 text-accent-emerald animate-spin" />
                                </div>
                            ) : members.length === 0 ? (
                                <div className="p-8 text-center text-text-muted text-sm">
                                    No members found.
                                </div>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-border-subtle">
                                                    {member.imageUrl ? (
                                                        <AvatarImage
                                                            src={
                                                                member.imageUrl
                                                            }
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-bg-card text-text-secondary text-xs uppercase">
                                                        {member.name
                                                            ? member.name.substring(
                                                                  0,
                                                                  2,
                                                              )
                                                            : "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">
                                                        {member.name ||
                                                            "Unknown User"}
                                                        {member.isOwner && (
                                                            <Badge
                                                                variant="outline"
                                                                className="ml-2 text-[10px] border-accent-emerald/40 text-accent-mint bg-accent-emerald/15"
                                                            >
                                                                Owner
                                                            </Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] uppercase border-border-subtle text-text-secondary"
                                                >
                                                    {member.role}
                                                </Badge>
                                                {!member.isOwner && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeMemberMutation.mutate(
                                                                member.email,
                                                            )
                                                        }
                                                        disabled={
                                                            removeMemberMutation.isPending
                                                        }
                                                        className="h-8 w-8 text-text-muted hover:text-red-400 hover:bg-red-950/20"
                                                    >
                                                        {removeMemberMutation.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Activity Logs
                        </h3>
                        <div className="rounded-lg border border-border-subtle bg-bg-subtle/30 overflow-hidden">
                            {isLoadingActivities ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="h-6 w-6 text-accent-emerald animate-spin" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="p-8 text-center text-text-muted text-sm">
                                    No activity logs found.
                                </div>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    {activities.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-3 p-4"
                                        >
                                            <Avatar className="h-8 w-8 border border-border-subtle shrink-0">
                                                {log.user?.imageUrl ? (
                                                    <AvatarImage
                                                        src={log.user.imageUrl}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="bg-bg-card text-text-secondary text-xs uppercase">
                                                    {log.user?.name
                                                        ? log.user.name.substring(
                                                              0,
                                                              2,
                                                          )
                                                        : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-text-primary">
                                                    <span className="font-medium">
                                                        {log.user?.name ||
                                                            "Unknown User"}
                                                    </span>{" "}
                                                    <span className="text-text-secondary">
                                                        {log.details}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-text-muted mt-1">
                                                    {new Date(
                                                        log.createdAt,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
