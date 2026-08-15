"use client";

import React, { useEffect, useState } from "react";

interface ToastItemProps {
    toast: {
        id: string;
        message: string;
        type: "success" | "error" | "info" | "warning";
    };
    onClose: () => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    const getStyle = () => {
        switch (toast.type) {
            case "success":
                return "bg-accent-main text-white";
            case "error":
                return "bg-accent-orange text-white";
            case "warning":
                return "bg-accent-purple text-white";
            case "info":
                return "bg-white text-foreground border-foreground";
            default:
                return "bg-white text-foreground";
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case "success":
                return (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                );
            case "error":
                return (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                );
            case "warning":
                return (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                );
            case "info":
                return (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                );
        }
    };

    return (
        <div
            className={`pointer-events-auto flex items-center gap-4 p-4 min-w-[320px] rounded-[16px] border-2 border-foreground shadow-[4px_4px_0px_#000] transition-all duration-300 transform
            ${getStyle()} 
            ${isExiting ? "translate-x-[150%] opacity-0" : "translate-x-0 opacity-100 animate-slide-in-right"}`}
        >
            <div className="shrink-0">{getIcon()}</div>
            <p className="flex-1 font-bold text-sm tracking-tight">
                {toast.message}
            </p>
            <button
                onClick={handleClose}
                className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
};
