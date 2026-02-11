"use client";

import { CheckCircle2, ArrowRight, Home, ShieldCheck, Zap } from "lucide-react";

interface SuccessStepProps {
    amount: number;
    method: string;
    orderId: string;
    onReset: () => void;
}

export default function SuccessStep({ amount, method, orderId, onReset }: SuccessStepProps) {
    return (
        <div className="space-y-8 py-4 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <CheckCircle2 className="h-20 w-20 text-primary relative z-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Payment Received</h2>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                        Order <span className="text-primary font-mono font-bold">#{orderId.slice(0, 8)}</span> is now in the queue for manual fulfillment.
                    </p>
                </div>
            </div>

            <div className="bg-accent/20 rounded-2xl p-6 border border-border space-y-4 backdrop-blur-md">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-bold uppercase text-[10px]">Amount</span>
                    <span className="font-mono font-bold text-lg">{amount.toLocaleString()} KES</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-bold uppercase text-[10px]">Method</span>
                    <span className="font-bold">{method}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                    <span className="text-muted-foreground font-bold uppercase text-[10px]">Status</span>
                    <div className="flex items-center gap-1.5 text-green-500 font-bold">
                        <Zap className="h-3 w-3" /> FULFILLING
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
                    <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-400/80 leading-relaxed">
                        <p className="font-bold text-blue-400 mb-1">What happens next?</p>
                        We are currently washing your funds and preparing the payout. This process is manual for your safety. You will be notified via the chat widget if we need any clarification.
                    </div>
                </div>

                <button
                    onClick={onReset}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                >
                    <Home className="h-5 w-5" /> Start New Transaction
                </button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground italic">
                Your transaction details have been encrypted. Record this Order ID for your safety.
            </p>
        </div>
    );
}
