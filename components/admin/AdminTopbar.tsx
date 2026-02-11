"use client";

import { Bell, User } from "lucide-react";

export default function AdminTopbar() {
    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="text-sm text-muted-foreground">
                Admin / <span className="text-white font-medium">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-white transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                </button>
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border">
                    <User className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        </header>
    );
}
