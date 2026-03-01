"use client";

import { signIn } from "next-auth/react";
import { Github, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="glass-card p-10 max-w-sm w-full text-center">
                <div className="mb-6 flex justify-center">
                    <span className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
                        <Cpu size={28} />
                    </span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
                <p className="text-slate-400 text-sm mb-8">
                    Sign in with your GitHub account to manage portfolio content.
                </p>
                <Button
                    onClick={() => signIn("github", { callbackUrl: "/admin" })}
                    className="w-full bg-white text-black hover:bg-slate-100 font-medium"
                >
                    <Github size={18} className="mr-2" />
                    Sign in with GitHub
                </Button>
                <p className="text-xs text-slate-600 mt-5">
                    Access restricted to authorized accounts only.
                </p>
            </div>
        </div>
    );
}
