"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            if (authLoading) return;

            if (!user) {
                router.push("/admin/login"); // Or 404
                return;
            }

            try {
                const res = await fetch("/api/auth/check-admin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid: user.uid }),
                });

                if (res.ok) {
                    setIsAdmin(true);
                } else {
                    // Not admin -> Redirect to 404 or home
                    // User requested 404 behavior, but router.push to a 404 page is tricky unless we have one.
                    // We can just render "Not Found" here.
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error(err);
                setIsAdmin(false);
            } finally {
                setChecking(false);
            }
        };

        checkAdmin();
    }, [user, authLoading, router]);

    if (authLoading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-muted-foreground">Page Not Found</p>
                <button onClick={() => router.push("/")} className="text-primary hover:underline">
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminTopbar />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
