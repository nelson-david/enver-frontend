"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, X, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { envService } from "@/services/env.service";
import { encryptAndSplitSecret } from "@/lib/crypto";

interface NewSecretModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function NewSecretModal({
    isOpen,
    onClose,
    onSuccess,
}: NewSecretModalProps) {
    const { getToken } = useAuth();
    const [projectName, setProjectName] = useState("");
    const [environment, setEnvironment] = useState("PRODUCTION");
    const [envContent, setEnvContent] = useState("");
    const [lockKey, setLockKey] = useState("");
    const [showLockKey, setShowLockKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!projectName.trim() || !envContent.trim() || !lockKey.trim()) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            setIsLoading(true);

            // 1. Get Clerk JWT Token
            const token = await getToken();

            // 2. Client-side encryption & Shamir secret splitting
            const encryptedPayload = await encryptAndSplitSecret(
                envContent,
                lockKey,
            );

            // 3. Post payload using Axios Service with Authorization Bearer token
            await envService.createSecret(
                {
                    projectId: projectName.trim(),
                    environment,
                    ...encryptedPayload,
                },
                token,
            );

            // 3. Reset form and notify parent component
            setEnvContent("");
            setLockKey("");
            setProjectName("");
            onClose();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to process and store secret.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-xl border rounded-xl border-border-subtle bg-bg-base p-6 shadow-2xl overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                            <div className="flex items-center gap-2.5">
                                <PlusCircle className="h-5 w-5 text-text-secondary" />
                                <h2 className="text-lg font-semibold text-text-primary tracking-tight font-dm-sans">
                                    New Secret
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Modal Body */}
                            <div className="mt-5 space-y-5">
                                {/* Project Name & Environment Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-dm-sans font-medium text-text-secondary mb-1.5">
                                            Project Name
                                        </label>
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) =>
                                                setProjectName(e.target.value)
                                            }
                                            placeholder="e.g. auth-service"
                                            name="auth-service"
                                            className="w-full rounded-xl border border-border-subtle bg-bg-base px-3.5 py-2.5 text-sm text-text-primary font-mono placeholder:text-text-muted focus:border-accent-emerald focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-dm-sans font-medium text-text-secondary mb-1.5">
                                            Environment
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={environment}
                                                onChange={(e) =>
                                                    setEnvironment(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full appearance-none rounded-xl border border-border-subtle bg-bg-base px-3.5 py-2.5 pr-10 text-sm text-text-primary font-mono focus:border-accent-emerald focus:outline-none transition-colors cursor-pointer"
                                            >
                                                <option value="PRODUCTION">
                                                    Production
                                                </option>
                                                <option value="STAGING">
                                                    Staging
                                                </option>
                                                <option value="DEVELOPMENT">
                                                    Development
                                                </option>
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                                        </div>
                                    </div>
                                </div>

                                {/* .env Content */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-dm-sans font-medium text-text-secondary">
                                            .env Content
                                        </label>
                                        <span className="text-xs font-dm-sans text-text-muted">
                                            Key=Value pairs
                                        </span>
                                    </div>
                                    <textarea
                                        value={envContent}
                                        onChange={(e) =>
                                            setEnvContent(e.target.value)
                                        }
                                        placeholder={`PASTE_YOUR_ENV_VARIABLES=here\nDATABASE_URL=postgres:// ...`}
                                        rows={5}
                                        className="w-full rounded-xl border border-border-subtle bg-bg-base p-3.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none transition-colors resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Encryption Lock Key Card */}
                                <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-accent-mint" />
                                        <span className="text-xs font-dm-sans font-semibold text-text-primary">
                                            Encryption Lock Key
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono text-text-secondary leading-relaxed">
                                        Provide a secure passphrase to encrypt
                                        these variables. This key is never
                                        stored on our servers.
                                    </p>
                                    <div className="relative">
                                        <input
                                            type={
                                                showLockKey
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={lockKey}
                                            onChange={(e) =>
                                                setLockKey(e.target.value)
                                            }
                                            placeholder="••••••••••••••••"
                                            name="encryption-lock-key"
                                            className="w-full rounded-lg border border-border-subtle bg-bg-base px-3.5 py-2.5 pr-10 text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowLockKey(!showLockKey)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                                        >
                                            {showLockKey ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg border border-border-subtle bg-bg-subtle/80 px-4 py-2.5 cursor-pointer text-[13px] font-medium text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    className="bg-accent-emerald-strong hover:bg-accent-emerald text-text-primary gap-2 px-4 py-5 rounded-lg font-medium text-[13px] shadow-lg shadow-accent-emerald-strong/25"
                                >
                                    <Lock className="h-3.5 w-4.5" />
                                    Encrypt & Upload Securely
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
