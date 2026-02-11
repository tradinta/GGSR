import { NextResponse } from "next/server";
import { validateAmount } from "@/lib/rate";

export async function POST(req: Request) {
    try {
        const { amount, email, walletAddress } = await req.json();

        // 1. Validate Amount
        const error = validateAmount(amount);
        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        if (!email || !walletAddress) {
            return NextResponse.json({ error: "Missing email or wallet address" }, { status: 400 });
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
                    wallet_address: walletAddress,
                    custom_fields: [
                        {
                            display_name: "Wallet Address",
                            variable_name: "wallet_address",
                            value: walletAddress,
                        },
                    ],
                },
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify`, // Redirect after payment
            }),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            return NextResponse.json({ error: paystackData.message }, { status: 400 });
        }

        // TODO: Create Order in Database (Prisma) once Prisma is set up

        return NextResponse.json({ authorization_url: paystackData.data.authorization_url });
    } catch (error) {
        console.error("Paystack Init Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
