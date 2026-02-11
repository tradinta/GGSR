"use client";

import { useEffect, useState } from "react";
import { BarChart, Users, Activity, MousePointer } from "lucide-react";

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-bold uppercase">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-full">
                            <Activity className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-bold uppercase">Active (24h)</p>
                            <h3 className="text-2xl font-bold">{stats?.activeUsers || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <MousePointer className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-bold uppercase">Total Events</p>
                            <h3 className="text-2xl font-bold">{stats?.totalEvents || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Events Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-accent/20">
                    <h3 className="font-bold">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-accent/50 text-muted-foreground font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Event</th>
                                <th className="p-4">Details</th>
                                <th className="p-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stats?.recentEvents?.map((event: any) => (
                                <tr key={event.id} className="hover:bg-accent/10 transition-colors">
                                    <td className="p-4 font-mono text-xs">{event.userId?.slice(0, 8)}...</td>
                                    <td className="p-4">
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                                            {event.eventType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {event.eventName} <span className="opacity-50">{event.metadata}</span>
                                    </td>
                                    <td className="p-4 text-xs text-muted-foreground">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
