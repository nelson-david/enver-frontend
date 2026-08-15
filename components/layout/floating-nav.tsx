"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Menu,
    X,
    Settings,
    LayoutDashboard,
    LogIn,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { userAtom, userLoadingAtom } from "@/store/user.store";
import Image from "next/image";

export function FloatingNav() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isSignedIn, isLoaded } = useUser();
    const user = useAtomValue(userAtom) as { imageUrl?: string };
    const isLoading = useAtomValue(userLoadingAtom);

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Desktop Navigation */}
            <div className="hidden md:block mx-auto max-w-5xl px-6 pt-4">
                <nav className="flex items-center justify-between rounded-full border border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5 backdrop-blur-xl">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="font-dm-sans tracking-tight font-semibold text-white text-xl">
                            Enver
                        </span>
                    </Link>

                    {/* Segmented Nav Control */}
                    <div className="flex items-center rounded-full bg-zinc-800/50 p-1">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-medium transition-all font-dm-sans tracking-tight",
                                        isActive
                                            ? "bg-zinc-700 text-white"
                                            : "text-zinc-400 hover:text-zinc-200",
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Clerk User Button / Sign In */}
                    <div className="flex items-center gap-3">
                        {isLoaded && isSignedIn ? (
                            <>
                                {isLoading ? (
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox:
                                                    "h-8 w-8 border border-zinc-700 rounded-full",
                                            },
                                        }}
                                    />
                                ) : (
                                    <div className="border border-zinc-800 cursor-pointer h-8 w-8 flex items-center justify-center rounded-full overflow-hidden">
                                        <img
                                            src={user.imageUrl as string}
                                            alt="User_Profile_Image"
                                            width={32}
                                            height={32}
                                            className="w-100 h-100 object-cover object-center"
                                        />
                                    </div>
                                )}
                            </>
                        ) : isLoaded ? (
                            <SignInButton mode="modal">
                                <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-full px-4"
                                >
                                    <LogIn className="h-3.5 w-3.5 mr-1" /> Sign
                                    In
                                </Button>
                            </SignInButton>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
                        )}
                    </div>
                </nav>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <nav className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/95 px-4 py-3 backdrop-blur-xl">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <Shield className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-base font-semibold text-white">
                            Enver
                        </span>
                    </Link>

                    {/* Mobile Menu Button & User Avatar */}
                    <div className="flex items-center gap-2">
                        {isLoaded && isSignedIn && (
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox:
                                            "h-8 w-8 border border-zinc-700 rounded-full",
                                    },
                                }}
                            />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </nav>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="border-b border-zinc-800/80 bg-zinc-900/95 backdrop-blur-xl px-4 py-3">
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                                                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
