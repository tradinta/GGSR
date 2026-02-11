"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check Admin Role via API
            const res = await fetch("/api/auth/check-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid }),
            });

            if (res.ok) {
                toast.success("Welcome back, Admin");
                router.push("/admin");
            } else {
                toast.error("Unauthorized: You do not have admin access.");
                await auth.signOut(); // Force logout
            }
        } catch (err: any) {
            console.error(err);
            toast.error("Login Failed", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl space-y-6">
                <div className="text-center space-y-2">
                    <ShieldAlert className="h-10 w-10 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-white">Restricted Access</h1>
                    <p className="text-zinc-400 text-sm">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 uppercase font-bold">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-red-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 uppercase font-bold">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white focus:outline-none focus:border-red-500 transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authenticate"}
                    </button>
                </form>
            </div>
        </div>
    );
}
