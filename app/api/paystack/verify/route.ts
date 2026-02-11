import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { reference, amount, email, payoutMethod, payoutDetails, userId } = body;

        // Verify logic would go here (call Paystack API to confirm status)
        // For now we assume success if client says so (Verification should be rigorous in prod)

        // Create Order in DB
        const order = await prisma.order.create({
            data: {
                paystackRef: reference,
                amountKES: amount,
                amountUSDT: amount * 0.7 / 130, // Approx calculation again or pass from client
                email: email,
                payoutMethod: payoutMethod,
                payoutDetails: JSON.stringify(payoutDetails),
                status: "PAID", // Inline success usually means paid
                userId: userId // Link to anonymous user
            },
        });

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
