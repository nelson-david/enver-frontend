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
            <DialogContent className="sm:max-w-[600px] bg-[#09090b] border-zinc-800/80 text-zinc-100 p-0 overflow-hidden">
                <div className="p-6 border-b border-zinc-800/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                                <FolderOpen className="h-5 w-5 text-zinc-400" />
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
                                <DialogDescription className="text-zinc-500 mt-1">
                                    End-to-End Encrypted Vault Details
                                </DialogDescription>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                    {/* Environment Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Environment Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
                                <p className="text-xs text-zinc-500 mb-1">
                                    Total Shares
                                </p>
                                <p className="text-lg font-mono text-zinc-200">
                                    {secret.sharesCount}
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
                                <p className="text-xs text-zinc-500 mb-1">
                                    Last Updated
                                </p>
                                <p className="text-sm text-zinc-200">
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
                        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
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
                                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-600 flex-1"
                            />
                            <Select
                                value={newMemberRole}
                                onValueChange={setNewMemberRole}
                            >
                                <SelectTrigger className="w-[120px] bg-zinc-900/50 border-zinc-800 text-zinc-100">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
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
                                className="bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {addMemberMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UserPlus className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Members List */}
                        <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
                            {isLoadingMembers ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                </div>
                            ) : members.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    No members found.
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-zinc-700">
                                                    {member.imageUrl ? (
                                                        <AvatarImage
                                                            src={
                                                                member.imageUrl
                                                            }
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs uppercase">
                                                        {member.name
                                                            ? member.name.substring(
                                                                  0,
                                                                  2,
                                                              )
                                                            : "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-200">
                                                        {member.name ||
                                                            "Unknown User"}
                                                        {member.isOwner && (
                                                            <Badge
                                                                variant="outline"
                                                                className="ml-2 text-[10px] border-blue-900/50 text-blue-400 bg-blue-950/20"
                                                            >
                                                                Owner
                                                            </Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] uppercase border-zinc-700 text-zinc-400"
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
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
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
                        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Activity Logs
                        </h3>
                        <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
                            {isLoadingActivities ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    No activity logs found.
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {activities.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-3 p-4"
                                        >
                                            <Avatar className="h-8 w-8 border border-zinc-700 shrink-0">
                                                {log.user?.imageUrl ? (
                                                    <AvatarImage
                                                        src={log.user.imageUrl}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs uppercase">
                                                    {log.user?.name
                                                        ? log.user.name.substring(
                                                              0,
                                                              2,
                                                          )
                                                        : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-zinc-200">
                                                    <span className="font-medium">
                                                        {log.user?.name ||
                                                            "Unknown User"}
                                                    </span>{" "}
                                                    <span className="text-zinc-400">
                                                        {log.details}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-1">
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
