import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriberNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await prisma.subscriber.create({ data: { email } });
    await sendSubscriberNotification(email).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
