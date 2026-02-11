"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

export function useAnalytics() {
    const pathname = usePathname();
    const { user } = useAuth();
    const startTime = useRef(Date.now());

    // Track Page Views
    useEffect(() => {
        if (!user || !pathname) return;
        trackEvent("PAGE_VIEW", pathname);
    }, [pathname, user]);

    async function trackEvent(eventType: string, eventName: string, metadata?: any) {
        if (!user) return;

        try {
            await fetch("/api/analytics/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.uid,
                    eventType,
                    eventName,
                    metadata,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            });
        } catch (err) {
            console.error("Analytics Error:", err);
        }
    }

    return { trackEvent };
}
