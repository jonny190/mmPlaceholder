import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EnquiryEmail {
  type: "buy" | "rent" | "sell" | "general";
  firstName: string;
  lastName?: string;
  email: string;
  company?: string;
  phone?: string;
  machineRef?: string;
  machineName?: string;
  interestType?: string;
  message: string;
}

export async function sendEnquiryEmail(data: EnquiryEmail) {
  const subject = data.machineRef
    ? `[${data.type.toUpperCase()}] Enquiry: ${data.machineName} (${data.machineRef})`
    : `[${data.type.toUpperCase()}] New enquiry from ${data.firstName}`;

  const lines = [
    `Name: ${data.firstName}${data.lastName ? ` ${data.lastName}` : ""}`,
    `Email: ${data.email}`,
    data.company ? `Company: ${data.company}` : null,
    data.phone ? `Phone: ${data.phone}` : null,
    data.interestType ? `Interest: ${data.interestType}` : null,
    data.machineRef ? `Machine: ${data.machineName} (${data.machineRef})` : null,
    "",
    `Message:`,
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ENQUIRY_EMAIL,
    replyTo: data.email,
    subject,
    text: lines,
  });
}

export async function sendSubscriberNotification(email: string) {
  if (!process.env.ENQUIRY_EMAIL) return;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ENQUIRY_EMAIL,
    subject: "[SUBSCRIBER] New mailing list signup",
    text: `New subscriber: ${email}`,
  });
}
