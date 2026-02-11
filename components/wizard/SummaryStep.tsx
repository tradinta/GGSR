"use client";

import { Check, ShieldCheck, ArrowLeft, Zap, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

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

    const config = {
        reference: (new Date()).getTime().toString(),
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
        onSuccess: (reference: any) => onPaySuccess(reference),
        onClose: () => console.log("Payment closed"),
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Review Transaction</h2>
                <p className="text-xs text-muted-foreground">Confirm details before proceeding.</p>
            </div>

            <div className="bg-accent/20 rounded-xl p-4 space-y-4 border border-border">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Sending</span>
                    <span className="font-mono font-bold text-lg">{amount.toLocaleString()} KES</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Receiving (Approx)</span>
                    {/* Showing in KES as requested by user, assuming 70% rate */}
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
                <p className="text-[10px] text-muted-foreground">We use this to send you a confirmation link.</p>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 flex gap-2 items-start">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold">Manual Fulfillment</p>
                    <p>Do not be scared if there is a delay. We handle every transaction manually to ensure maximum security and anonimity. We will contact you via chat if needed.</p>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button onClick={onBack} className="px-4 py-3 rounded-lg bg-accent/50 hover:bg-accent text-white transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </button>

                <PaystackButton componentProps={componentProps} onPaySuccess={onPaySuccess} />
            </div>
        </div>
    );
}
