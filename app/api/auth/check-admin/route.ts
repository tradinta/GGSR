import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { uid } = await req.json();

        const user = await prisma.user.findUnique({
            where: { id: uid },
        });

        if (user && user.role === "ADMIN") {
            return NextResponse.json({ isAdmin: true });
        }

        return NextResponse.json({ isAdmin: false }, { status: 403 });
    } catch (error) {
        return NextResponse.json({ error: "Check failed" }, { status: 500 });
    }
}
