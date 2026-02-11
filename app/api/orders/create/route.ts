import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    console.log("--> [API] Order Creation Initiated");
    try {
        const body = await req.json();
        const { amount, email, payoutMethod, payoutDetails, userId } = body;

        console.log(`[API] Payload: Amount=${amount}, Method=${payoutMethod}, User=${userId}`);

        if (!amount || !payoutMethod) {
            console.error("[API] Error: Missing required fields");
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Ensure User Exists (Critical for Foreign Key)
        if (userId) {
            try {
                console.log(`[API] Upserting user ${userId}...`);
                await prisma.user.upsert({
                    where: { id: userId },
                    update: {},
                    create: {
                        id: userId,
                        email: email || `user_${userId.slice(0, 6)}@kihumba.com`,
                        role: "USER",
                        createdAt: new Date(),
                        lastActive: new Date(),
                        visitCount: 1
                    }
                });
                console.log(`[API] User ${userId} upserted successfully.`);
            } catch (userError) {
                console.error("[API] CRITICAL: User Upsert Failed:", userError);
                // We typically should stop here, but let's try to verify if it was a race
            }
        }

        // 2. Create PENDING Order
        const reference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        console.log(`[API] Creating Order ${reference}...`);
        const order = await prisma.order.create({
            data: {
                paystackRef: reference,
                amountKES: amount,
                amountUSDT: amount * 0.7 / 130, // Approx
                email: email || "",
                payoutMethod: payoutMethod,
                payoutDetails: JSON.stringify(payoutDetails),
                status: "PENDING",
                userId: userId
            },
        });

        console.log(`[API] Order Created Successfully: ${order.id}`);

        // 3. Log Analytics Event
        await prisma.analyticsEvent.create({
            data: {
                userId: userId,
                eventType: "ORDER_INITIATED",
                eventName: "checkout_start",
                metadata: JSON.stringify({ orderId: order.id, amount, method: payoutMethod }),
            }
        }).catch(e => console.error("[API] Analytics Log Failed:", e));

        return NextResponse.json({ success: true, orderId: order.id, reference });

    } catch (error: any) {
        console.error("--> [API] ORDER CREATION FAILED:", JSON.stringify(error, null, 2));
        console.error("Stack:", error.stack);
        return NextResponse.json({
            error: "Order Creation Failed",
            details: error.message
        }, { status: 500 });
    }
}
