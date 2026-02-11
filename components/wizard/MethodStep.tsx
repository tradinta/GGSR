"use client";

import { Wallet, Smartphone, Building, Banknote, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYOUT_METHODS } from "@/lib/rate";

interface MethodStepProps {
    selectedMethod: string;
    setSelectedMethod: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function MethodStep({ selectedMethod, setSelectedMethod, onNext, onBack }: MethodStepProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">How to receive?</h2>
                <p className="text-xs text-muted-foreground">Select your preferred anonymous payout method.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {PAYOUT_METHODS.map((method) => {
                    const Icon = method.id === "CRYPTO" ? Wallet : method.id === "MOBILE" ? Smartphone : method.id === "BANK" ? Building : Banknote;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-xl border transition-all gap-3",
                                isSelected
                                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,255,148,0.3)]"
                                    : "bg-accent/20 border-border text-muted-foreground hover:bg-accent/40"
                            )}
                        >
                            <Icon className="h-8 w-8" />
                            <span className="font-bold text-sm">{method.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="px-4 py-3 rounded-lg bg-accent/50 hover:bg-accent text-white transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
