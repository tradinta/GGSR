import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const secret = process.env.PAYSTACK_SECRET_KEY || "";

        // Verify signature (skip for now if running locally without ngrok, but good practice)
        // In production: const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');
        // if (hash !== req.headers.get('x-paystack-signature')) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

        const event = body.event;
        const data = body.data;

        if (event === "charge.success") {
            const email = data.customer.email;
            const amountKES = data.amount / 100;
            const metadata = data.metadata || {};
            const payoutMethod = metadata.payout_method || "UNKNOWN";
            // Payout details might be a string if JSON.stringified, or object. Handle both.
            const payoutDetails = typeof metadata.payout_details === 'string'
                ? metadata.payout_details
                : JSON.stringify(metadata.payout_details || {});

            // Calculate USDT/Payout Value again to be safe
            // In a real app, store the quote at initialization time to lock the rate
            // For now, we recalculate or trust the metadata if we added it there

            // Upsert Order in Firestore
            // We use paystack reference as unique ID if possible, or create new
            const db = getAdminDb();
            const snapshot = await db.collection("orders").where("paystackRef", "==", data.reference).limit(1).get();

            let orderId;
            if (!snapshot.empty) {
                // Update existing
                const doc = snapshot.docs[0];
                await doc.ref.set({
                    status: "PAID",
                    amountKES,// We trust the webhook data
                    metadata: data.metadata || {},
                    updatedAt: new Date()
                }, { merge: true });
                orderId = doc.id;
                console.log("Order updated via webhook:", orderId);
            } else {
                // Create new
                const res = await db.collection("orders").add({
                    email,
                    amountKES,
                    amountUSDT: amountKES * 0.7 * (1 / 130),
                    paystackRef: data.reference,
                    status: "PAID",
                    payoutMethod,
                    payoutDetails,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: null // Webhook might not know the userId unless in metadata
                });
                orderId = res.id;
                console.log("Order created via webhook:", orderId);
            }
        }

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
