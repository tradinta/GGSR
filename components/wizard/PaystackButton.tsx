"use client";

import { PaystackConsumer } from "react-paystack";
import { Zap } from "lucide-react";

interface PaystackButtonProps {
    componentProps: any;
    onPaySuccess: (reference: any) => void;
}

export default function PaystackButton({ componentProps, onPaySuccess }: PaystackButtonProps) {
    return (
        <PaystackConsumer {...componentProps}>
            {({ initializePayment }: any) => (
                <button
                    onClick={() => initializePayment(onPaySuccess, () => { })}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <Zap className="h-5 w-5" /> Confirm & Pay
                </button>
            )}
        </PaystackConsumer>
    );
}
