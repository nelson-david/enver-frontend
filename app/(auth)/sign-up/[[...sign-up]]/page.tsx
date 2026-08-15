import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4">
            <div className="mb-6 flex items-center gap-2">
                <span className="font-dm-sans text-2xl font-bold text-white tracking-tight">
                    Enver
                </span>
            </div>
            <SignUp
                appearance={{
                    elements: {
                        card: "bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl shadow-2xl rounded-2xl",
                        headerTitle: "text-zinc-100 font-dm-sans font-semibold",
                        headerSubtitle: "text-zinc-400 font-dm-sans",
                        socialButtonsBlockButton: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700",
                        formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white font-medium",
                        footerActionLink: "text-blue-400 hover:text-blue-300",
                    },
                }}
            />
        </div>
    );
}
