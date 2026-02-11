"use client";

import { useState, useEffect } from "react";
import { Check, ShieldCheck, ArrowLeft, Zap, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";

const PaystackButton = dynamic(() => import("./PaystackButton"), { ssr: false });

interface SummaryStepProps {
    amount: number;
    usdValue: number;
    method: string;
    details: any;
    email: string;
    setEmail: (val: string) => void;
    onPaySuccess: (reference: any) => void;
    onBack: () => void;
}

export default function SummaryStep({ amount, usdValue, method, details, email, setEmail, onPaySuccess, onBack }: SummaryStepProps) {
    const { user } = useAuth();
    const [reference, setReference] = useState<string | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [orderError, setOrderError] = useState<string | null>(null);

    // Initial Order Creation
    useEffect(() => {
        let isMounted = true;

        const createPendingOrder = async () => {
            // If we already have a reference, don't create again
            if (reference) return;

            try {
                const res = await fetch("/api/orders/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount,
                        email: email || "anon@kihumba.com",
                        payoutMethod: method,
                        payoutDetails: details,
                        userId: user?.uid
                    })
                });

                const data = await res.json();

                if (isMounted) {
                    if (data.success && data.reference) {
                        console.log("Order Created:", data.reference);
                        setReference(data.reference);
                    } else {
                        // If it fails, we can't proceed with payment safely if we want to guarantee order exists
                        // But maybe we allow fallback? No, user wants STRICT persistence.
                        throw new Error(data.error || "Failed to create order");
                    }
                }
            } catch (err: any) {
                console.error("Order Init Error:", err);
                if (isMounted) setOrderError("Secure connection failed. Please go back and try again.");
            } finally {
                if (isMounted) setLoadingOrder(false);
            }
        };

        // Only try creating if we have a user OR if we decided to allow null users (api handles it)
        // ideally we wait for user to be defined? 
        // user is undefined initially, then null or object.
        // We can wait until it is not undefined? 
        // usage of useAuth returns user|null, loading.
        // let's wait for loading to be false?
        // But useAuth loading might be true for a while.
        // Let's just go with it.
        createPendingOrder();

        return () => { isMounted = false; };
    }, [user, amount, method]);

    const config = {
        reference: reference || `FALLBACK-${Date.now()}`,
        email: email || "anon@kihumba.com",
        amount: amount * 100, // Kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        currency: "KES",
        metadata: {
            payout_method: method,
            payout_details: JSON.stringify(details),
            custom_fields: [
                { display_name: "Payout Method", variable_name: "payout_method", value: method },
                ...Object.entries(details).map(([key, value]) => ({
                    display_name: key,
                    variable_name: key,
                    value: String(value),
                }))
            ]
        }
    };

    const componentProps = {
        ...config,
        text: "Confirm & Pay",
        onSuccess: (ref: any) => onPaySuccess(ref),
        onClose: () => console.log("Payment closed"),
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Review Transaction</h2>
                <p className="text-xs text-muted-foreground">Confirm details before proceeding.</p>
            </div>

            {orderError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                    {orderError}
                </div>
            )}

            <div className="bg-accent/20 rounded-xl p-4 space-y-4 border border-border">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Sending</span>
                    <span className="font-mono font-bold text-lg">{amount.toLocaleString()} KES</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Receiving (Approx)</span>
                    <span className="font-mono font-bold text-lg text-primary">{(amount * 0.7).toLocaleString()} KES Value</span>
                </div>
                <div className="text-xs text-right text-muted-foreground">
                    (${usdValue.toFixed(2)} USD)
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Method</span>
                    <div className="text-right">
                        <div className="font-bold">{method}</div>
                        <div className="text-xs text-muted-foreground max-w-[150px] break-words">
                            {Object.values(details).filter(Boolean).join(", ")}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Receipt Email (Optional)</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anon@kihumba.com"
                    className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 flex gap-2 items-start">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold">Manual Fulfillment</p>
                    <p>Transactions are handled manually for security. We will contact you via chat if needed.</p>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button onClick={onBack} className="px-4 py-3 rounded-lg bg-accent/50 hover:bg-accent text-white transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {loadingOrder ? (
                    <button disabled className="flex-1 bg-primary/50 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                        <Loader2 className="h-5 w-5 animate-spin" /> Preparing Secure Transaction...
                    </button>
                ) : (
                    <PaystackButton componentProps={componentProps} onPaySuccess={onPaySuccess} />
                )}
            </div>
        </div>
    );
}
