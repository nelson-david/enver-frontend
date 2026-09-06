"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteSecretModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    projectName: string;
    environment: string;
    isLoading: boolean;
}

export function DeleteSecretModal({
    isOpen,
    onClose,
    onConfirm,
    projectName,
    environment,
    isLoading,
}: DeleteSecretModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-md border rounded-xl border-border-subtle bg-bg-base p-6 shadow-2xl overflow-hidden font-sans"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute right-4 top-4 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none cursor-pointer"
                        >
                            <X className="h-4 w-4 text-text-secondary" />
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            {/* Alert icon with breathing background */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/40 border border-red-900/50 text-red-500 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.07)]">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <h3 className="text-base font-semibold text-text-primary">
                                Delete Environment Secret
                            </h3>
                            <p className="text-text-secondary text-xs mt-2 leading-relaxed">
                                Are you sure you want to delete the secret for project{" "}
                                <span className="font-semibold text-text-primary lowercase">
                                    "{projectName}"
                                </span>{" "}
                                under the{" "}
                                <span className="font-semibold text-text-primary uppercase">
                                    {environment}
                                </span>{" "}
                                environment? This action is irreversible.
                            </p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 border-border-subtle bg-bg-subtle/40 text-text-secondary hover:bg-bg-card/80 hover:text-text-primary cursor-pointer text-xs h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-lg shadow-red-600/10 text-xs h-9"
                            >
                                {isLoading ? "Deleting..." : "Delete Secret"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
