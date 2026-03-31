import { NextRequest, NextResponse } from "next/server";
import { sendEnquiryEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { type, firstName, lastName, email, company, phone, machineRef, machineName, interestType, message } = body;

  if (!firstName || !email || !message || !type) {
    return NextResponse.json(
      { error: "firstName, email, message, and type are required" },
      { status: 400 }
    );
  }

  try {
    await sendEnquiryEmail({
      type,
      firstName,
      lastName,
      email,
      company,
      phone,
      machineRef,
      machineName,
      interestType,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send enquiry email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
