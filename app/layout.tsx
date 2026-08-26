import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "@/components/providers";

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://enver-os.xyz"),
    title: "Enver — Zero-Knowledge Secrets Management",
    description:
        "Securely manage environment variables across your team with zero-knowledge encryption, CLI-first workflow, and real-time leakage detection.",
    keywords: [
        "secrets management",
        "environment variables",
        "zero knowledge",
        "Shamir secret sharing",
        "developer tools",
    ],
    openGraph: {
        title: "Enver — Zero-Knowledge Secrets Management",
        description:
            "Securely manage environment variables with zero-knowledge encryption and a CLI-first workflow.",
        url: "https://app.enver-os.xyz",
        siteName: "Enver",
        type: "website",
        images: ["/images/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Enver — Zero-Knowledge Secrets Management",
        description:
            "Securely manage environment variables with zero-knowledge encryption and a CLI-first workflow.",
        images: ["/images/og-image-twitter.png"],
    },
    icons: {
        icon: "/favicon.svg",
        shortcut: "/favicon.svg",
        apple: "/white-logo.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            appearance={{
                variables: {
                    colorPrimary: "#2563eb",
                    colorBackground: "#09090b",
                    colorForeground: "#fafafa",
                    fontFamily: "'DM Sans', sans-serif",
                },
            }}
        >
            <html
                lang="en"
                className={`${dmSans.variable} ${geistMono.variable} dark h-full antialiased`}
                data-scroll-behavior="smooth"
            >
                <body className="min-h-full flex flex-col bg-[#050505] text-[#fafafa] font-sans">
                    <Providers>{children}</Providers>
                </body>
            </html>
        </ClerkProvider>
    );
}
