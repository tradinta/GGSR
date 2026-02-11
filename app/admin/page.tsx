import prisma from "@/lib/prisma";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";

// In a real app, use authentication (e.g., NextAuth)
// For this demo, we'll just render it protected by layout or middleware (middleware not implemented yet)

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-xl">
                    <h3 className="text-sm text-muted-foreground uppercase font-bold">Total Volume</h3>
                    <p className="text-3xl font-bold mt-2">
                        {(orders.reduce((acc, o) => acc + o.amountKES, 0) / 1000).toFixed(1)}k <span className="text-sm text-muted-foreground">KES</span>
                    </p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl">
                    <h3 className="text-sm text-muted-foreground uppercase font-bold">Pending Orders</h3>
                    <p className="text-3xl font-bold mt-2 text-yellow-400">
                        {orders.filter(o => o.status === "PAID").length}
                    </p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl">
                    <h3 className="text-sm text-muted-foreground uppercase font-bold">Completed</h3>
                    <p className="text-3xl font-bold mt-2 text-primary">
                        {orders.filter(o => o.status === "COMPLETED").length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search email or ref..."
                        className="w-full bg-card border border-border rounded-lg pl-9 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-md border border-primary/20">All</button>
                    <button className="px-3 py-1 bg-card hover:bg-accent text-muted-foreground text-xs font-bold rounded-md border border-border">Pending</button>
                    <button className="px-3 py-1 bg-card hover:bg-accent text-muted-foreground text-xs font-bold rounded-md border border-border">Completed</button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase bg-accent/20">
                            <th className="p-4 font-bold">Time</th>
                            <th className="p-4 font-bold">User / Email</th>
                            <th className="p-4 font-bold">Amount</th>
                            <th className="p-4 font-bold">Payout</th>
                            <th className="p-4 font-bold">Details</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-border hover:bg-accent/10 transition-colors">
                                <td className="p-4 text-xs font-mono text-muted-foreground">
                                    {order.createdAt.toLocaleTimeString()} <br />
                                    {order.createdAt.toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-sm">{order.email.split("@")[0]}</div>
                                    <div className="text-xs text-muted-foreground">{order.email}</div>
                                </td>
                                <td className="p-4 font-bold text-white">
                                    {order.amountKES.toLocaleString()} KES
                                </td>
                                <td className="p-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-accent px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-border">
                                            {order.payoutMethod}
                                        </span>
                                        <span className="font-mono text-primary font-bold">
                                            ${order.amountUSDT.toFixed(2)}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-xs font-mono max-w-[200px] truncate text-muted-foreground">
                                    {order.payoutDetails}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex w-fit items-center gap-1 ${order.status === "PAID" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30" :
                                            order.status === "COMPLETED" ? "bg-green-900/50 text-green-400 border border-green-500/30" :
                                                "bg-red-900/50 text-red-400 border border-red-500/30"
                                        }`}>
                                        {order.status === "PAID" && <Clock className="h-3 w-3" />}
                                        {order.status === "COMPLETED" && <CheckCircle className="h-3 w-3" />}
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-xs bg-primary hover:bg-primary/90 text-black px-3 py-1.5 rounded font-bold transition-all">
                                        Open
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <p>No transactions found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
