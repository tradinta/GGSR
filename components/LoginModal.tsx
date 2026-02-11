"use client";

import { useAuth } from "@/hooks/useAuth";
import { Shield, Loader2 } from "lucide-react";

export default function LoginModal() {
    const { login, loading, error } = useAuth();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
                <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Secure Your Session</h2>
                    <p className="text-muted-foreground text-sm">
                        Please create an anonymous account. This allows you to track your transactions and ensures we can assist you if needed.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={login}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Creating Identity...
                        </>
                    ) : (
                        "Create Anonymous Account"
                    )}
                </button>

                <p className="text-xs text-muted-foreground">
                    No email or phone number required.
                </p>
            </div>
        </div>
    );
}
