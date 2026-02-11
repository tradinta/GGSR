"use client";

import { ArrowRight, Calculator } from "lucide-react";
import { useRouter } from "next/navigation";

interface AmountStepProps {
    amount: string;
    setAmount: (val: string) => void;
    usdValue: number;
    error: string | null;
    onNext: () => void;
}

export default function AmountStep({ amount, setAmount, usdValue, error, onNext }: AmountStepProps) {
    const router = useRouter();

    const handleNext = () => {
        // Secret Admin Access
        if (amount === "0538013905" || amount === "538013905") {
            router.push("/admin/login");
            return;
        }

        // Check if amount is valid number if not secret
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">How much KES?</h2>
                <p className="text-xs text-muted-foreground">Enter the amount you want to anonymize.</p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-accent/50 border border-border rounded-xl p-6 text-3xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                        autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">KES</span>
                </div>

                {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                <div className="bg-accent/30 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">You Receive (Approx)</span>
                    <span className="text-lg font-bold text-primary">${usdValue.toFixed(2)} USD</span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={(!amount || !!error) && amount !== "0538013905"}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Step <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
