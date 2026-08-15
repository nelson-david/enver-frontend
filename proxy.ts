import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // Allow public routes without authentication
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // Not signed in → redirect to sign-in
    if (!userId) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
    }

    // Signed in — check if user exists in backend DB
    // Skip check for /onboarding and /api to prevent infinite redirect loops
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith("/onboarding") || pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3250/api/v1";
        const res = await fetch(`${apiUrl}/users/by-clerk/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            const data = await res.json();
            if (!data.exists) {
                // User not in our DB → redirect to single-page onboarding
                return NextResponse.redirect(new URL("/onboarding", req.url));
            }
        }
    } catch (error) {
        // Graceful degradation if backend server is unreachable
        console.error("Backend check failed in middleware:", error);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
