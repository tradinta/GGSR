import { NextResponse } from "next/server";
import { validateAmount } from "@/lib/rate";

export async function POST(req: Request) {
    try {
        const { amount, email, payoutMethod, payoutDetails } = await req.json();

        // 1. Validate Amount
        const error = validateAmount(amount);
        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        if (!email || !payoutMethod) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Initialize Paystack Transaction
        const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                amount: amount * 100, // Paystack expects amount in Kobo (cents)
                currency: "KES",
                metadata: {
                    payout_method: payoutMethod,
                    payout_details: payoutDetails, // Store JSON details in metadata
                    custom_fields: [
                        {
                            display_name: "Payout Method",
                            variable_name: "payout_method",
                            value: payoutMethod,
                        },
                        ...Object.entries(payoutDetails).map(([key, value]) => ({
                            display_name: key,
                            variable_name: key,
                            value: String(value),
                        })),
                    ],
                },
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify`, // Redirect after payment
            }, null, 2),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            return NextResponse.json({ error: paystackData.message }, { status: 400 });
        }

        // Note: Order creation in DB should ideally happen via Webhook to confirm payment,
        // or here as "PENDING". For simplicity in this step, we rely on metadata persistence.

        return NextResponse.json({ authorization_url: paystackData.data.authorization_url });
    } catch (error) {
        console.error("Paystack Init Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
