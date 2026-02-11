// @ts-nocheck
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    console.log("--> [API] Order Creation Initiated (Firestore)");
    try {
        const body = await req.json();
        const { amount, email, payoutMethod, payoutDetails, userId } = body;

        console.log(`[API] Payload: Amount=${amount}, Method=${payoutMethod}, User=${userId}`);

        if (!amount || !payoutMethod) {
            console.error("[API] Error: Missing required fields");
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = getAdminDb();

        // 1. Ensure User Exists/Syncs (Mirror sync logic lightly or rely on client sync?)
        // To be safe, let's just ensure we have a user ref.
        // We'll trust the sync endpoint does the heavy lifting for profile, 
        // but we can set basic info here if missing.
        if (userId) {
            const userRef = db.collection("users").doc(userId);
            // Light touch update
            await userRef.set({
                uid: userId,
                email: email || `user_${userId.slice(0, 6)}@kihumba.com`,
                lastActive: new Date()
            }, { merge: true });
        }

        // 2. Create PENDING Order in Firestore
        // Use a random ID or auto-gen. Let's use auto-gen.
        const orderData = {
            amountKES: amount,
            amountUSDT: amount * 0.7 / 130, // Approx
            email: email || "",
            payoutMethod: payoutMethod,
            payoutDetails: JSON.stringify(payoutDetails),
            status: "PENDING",
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            paystackRef: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };

        const orderRef = await db.collection("orders").add(orderData);
        // We need the ID to return
        const orderId = orderRef.id;
        const reference = orderData.paystackRef;

        console.log(`[API] Order Created Successfully: ${orderId}`);

        // 3. Log Analytics Event
        await db.collection("analytics").add({
            userId: userId,
            eventType: "ORDER_INITIATED",
            eventName: "checkout_start",
            metadata: { orderId, amount, method: payoutMethod },
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, orderId, reference });

    } catch (error: any) {
        console.error("--> [API] ORDER CREATION FAILED:", error);
        return NextResponse.json({
            error: "Order Creation Failed",
            details: error.message
        }, { status: 500 });
    }
}
