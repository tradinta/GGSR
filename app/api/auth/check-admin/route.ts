import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const { uid } = await req.json();

        const db = getAdminDb();
        const doc = await db.collection("users").doc(uid).get();

        if (doc.exists && doc.data()?.role === "ADMIN") {
            return NextResponse.json({ isAdmin: true });
        }

        return NextResponse.json({ isAdmin: false }, { status: 403 });
    } catch (error) {
        return NextResponse.json({ error: "Check failed" }, { status: 500 });
    }
}
