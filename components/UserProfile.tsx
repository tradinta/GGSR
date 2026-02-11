"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, Copy, LogOut, Trash2, X, Clock, CheckCircle, ArrowRight, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"details" | "transactions">("details");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Switch Account State
    const [isSwitching, setIsSwitching] = useState(false);
    const [restoreId, setRestoreId] = useState("");
    const [restoreLoading, setRestoreLoading] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleRestore = async () => {
        if (!restoreId.trim()) return;
        setRestoreLoading(true);
        try {
            const email = `user_${restoreId.trim()}@kihumba.com`;
            await signInWithEmailAndPassword(auth, email, restoreId.trim());
            toast.success("Identity Restored Successfully");
            setIsSwitching(false);
            setRestoreId("");
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error("Invalid Secret Password. Could not restore identity.");
        } finally {
            setRestoreLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            setTimeout(() => {
                setTransactions([]);
                setLoading(false);
            }, 500);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "transactions") {
            fetchTransactions();
        }
    }, [activeTab]);

    const handleDelete = async () => {
        if (!user) return;
        if (!confirm("Are you sure? This will WIPEOUT all your data permanently.")) return;

        try {
            await fetch("/api/auth/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid })
            });
            await logout();
            onClose();
            toast.success("Identity Deleted. You are now a ghost.");
            window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete identity");
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-accent/20">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-full">
                            {isSwitching ? <RotateCcw className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                        </div>
                        <h2 className="font-bold">{isSwitching ? "Restore Identity" : "Your Identity"}</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {isSwitching ? (
                    <div className="p-6 space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Enter your <strong>Secret Password (UID)</strong> to switch to another identity.
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Secret Password</label>
                            <input
                                type="text"
                                value={restoreId}
                                onChange={(e) => setRestoreId(e.target.value)}
                                placeholder="Paste your UID here..."
                                className="w-full bg-black border border-border p-3 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <button
                            onClick={handleRestore}
                            disabled={restoreLoading || !restoreId}
                            className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {restoreLoading ? "Restoring..." : "Restore Identity"}
                        </button>
                        <button
                            onClick={() => setIsSwitching(false)}
                            className="w-full py-2 text-xs text-muted-foreground hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === "details" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-accent/50"}`}
                            >
                                Credentials
                            </button>
                            <button
                                onClick={() => setActiveTab("transactions")}
                                className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === "transactions" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-accent/50"}`}
                            >
                                Transactions
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {activeTab === "details" ? (
                                <>
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-yellow-500 text-xs">
                                        Save these details! We do not store any other personal info. If you lose this, your account is gone.
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">My Secret Email / Username</label>
                                            <div className="flex gap-2">
                                                <code className="flex-1 bg-black border border-border p-3 rounded-lg text-sm text-primary font-mono block truncate">
                                                    user_{user.uid.slice(0, 8)}@kihumba.com
                                                </code>
                                                <button onClick={() => copyToClipboard(`user_${user.uid.slice(0, 8)}@kihumba.com`, "Email")} className="p-3 bg-accent hover:bg-white/10 rounded-lg">
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">My Secret Password (UID)</label>
                                            <div className="flex gap-2">
                                                <code className="flex-1 bg-black border border-border p-3 rounded-lg text-sm text-primary font-mono block truncate">
                                                    {user.uid}
                                                </code>
                                                <button onClick={() => copyToClipboard(user.uid, "Password")} className="p-3 bg-accent hover:bg-white/10 rounded-lg">
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {loading ? (
                                        <p className="text-center text-muted-foreground text-xs py-10">Loading transactions...</p>
                                    ) : transactions.length > 0 ? (
                                        transactions.map((tx, i) => (
                                            <div key={i} className="bg-accent/20 p-3 rounded-lg border border-border flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-sm">{tx.amount} KES</div>
                                                    <div className="text-xs text-muted-foreground">{tx.date}</div>
                                                </div>
                                                <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">PENDING</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 space-y-2">
                                            <div className="mx-auto w-12 h-12 bg-accent/50 rounded-full flex items-center justify-center">
                                                <Clock className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-bold">No Transactions Yet</p>
                                            <p className="text-xs text-muted-foreground">Start a transfer to see it here.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-accent/10 border-t border-border flex justify-between items-center">
                            <button onClick={() => setIsSwitching(true)} className="text-xs text-primary hover:text-white flex items-center gap-1">
                                <RotateCcw className="h-3 w-3" /> Switch Account
                            </button>

                            <div className="flex gap-4">
                                <button onClick={() => { logout(); onClose(); }} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">
                                    <LogOut className="h-3 w-3" /> Sign Out
                                </button>
                                <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1">
                                    <Trash2 className="h-3 w-3" /> Delete Identity
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
