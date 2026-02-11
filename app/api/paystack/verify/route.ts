import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { reference, amount, email, payoutMethod, payoutDetails, userId } = body;

        // Verify logic would go here (call Paystack API to confirm status)
        // For now we assume success if client says so (Verification should be rigorous in prod)

        // Ensure User Exists (Fix for Foreign Key Error)
        // If the sync endpoint failed or hasn't run, we must create the user here.
        if (userId) {
            await prisma.user.upsert({
                where: { id: userId },
                update: {}, // No update needed if exists
                create: {
                    id: userId,
                    email: email || `user_${userId.slice(0, 6)}@kihumba.com`,
                    role: "USER",
                    createdAt: new Date(),
                    lastActive: new Date(),
                    visitCount: 1
                }
            });
        }

        // Check if Order already exists (from immediate persistence)
        const existingOrder = await prisma.order.findFirst({
            where: { paystackRef: reference }
        });

        let order;

        if (existingOrder) {
            console.log(`[API] Updating existing order ${existingOrder.id} to PAID`);
            order = await prisma.order.update({
                where: { id: existingOrder.id },
                data: {
                    status: "PAID",
                    paystackRef: reference, // Ensure ref is set (redundant but safe)
                    userId: userId, // Ensure User is linked
                }
            });
        } else {
            console.log(`[API] Creating NEW order (Fallback for ${reference})`);
            order = await prisma.order.create({
                data: {
                    paystackRef: reference,
                    amountKES: amount,
                    amountUSDT: amount * 0.7 / 130,
                    email: email,
                    payoutMethod: payoutMethod,
                    payoutDetails: JSON.stringify(payoutDetails),
                    status: "PAID",
                    userId: userId
                },
            });
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
