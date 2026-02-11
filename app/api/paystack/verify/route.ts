// @ts-nocheck
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { reference, amount, email, payoutMethod, payoutDetails, userId } = body;

        const db = getAdminDb();

        // Verify logic would go here (call Paystack API to confirm status)
        // For now we assume success if client says so (Verification should be rigorous in prod)

        // 1. Ensure User Exists
        if (userId) {
            await db.collection("users").doc(userId).set({
                uid: userId,
                email: email || `user_${userId.slice(0, 6)}@kihumba.com`,
                lastActive: new Date()
            }, { merge: true });
        }

        // 2. Find Pending Order via Query
        const ordersRef = db.collection("orders");
        const querySnapshot = await ordersRef.where("paystackRef", "==", reference).limit(1).get();

        let orderData;
        let orderId;

        if (!querySnapshot.empty) {
            // Update Existing
            const doc = querySnapshot.docs[0];
            orderId = doc.id;
            console.log(`[API] Updating existing order ${orderId} to PAID`);

            await doc.ref.update({
                status: "PAID",
                updatedAt: new Date(),
                userId: userId // Ensure link
            });
            orderData = { id: orderId, ...doc.data(), status: "PAID" };
        } else {
            // Create New (Fallback)
            console.log(`[API] Creating NEW order via Verify (Fallback for ${reference})`);
            const newOrder = {
                paystackRef: reference,
                amountKES: amount,
                amountUSDT: amount * 0.7 / 130,
                email: email,
                payoutMethod: payoutMethod,
                payoutDetails: JSON.stringify(payoutDetails),
                status: "PAID",
                userId: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const res = await ordersRef.add(newOrder);
            orderId = res.id;
            orderData = { id: orderId, ...newOrder };
        }

        return NextResponse.json({ success: true, order: orderData });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
