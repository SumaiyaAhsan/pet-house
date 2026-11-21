import nodemailer from "nodemailer";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const runtime = "nodejs";

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(32).optional().default(""),
  topic: z.enum(["adoption", "order", "listing", "other"]),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  message: z.string().trim().min(10).max(4000),
});

const topicLabels = {
  adoption: "Pet adoption",
  order: "Order support",
  listing: "Pet listing",
  other: "Other",
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please submit a valid contact message." }, { status: 400 });
  }

  const validation = contactSchema.safeParse(body);
  if (!validation.success) {
    return Response.json({ error: "Check the form fields and try again." }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT = "587", SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  const port = Number(SMTP_PORT);
  if (
    !SMTP_HOST ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    return Response.json(
      { error: "Contact email is not available right now. Please try again later." },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    const admin = await User.findOne({ role: "admin", status: "active" }).select("email").lean();
    if (!admin?.email) {
      return Response.json(
        { error: "Contact support is not available right now. Please try again later." },
        { status: 503 }
      );
    }

    const { firstName, lastName, phone, topic, email, message } = validation.data;
    const name = `${firstName} ${lastName}`;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });

    await transporter.sendMail({
      from: { name: "PetHouse Contact Form", address: SMTP_FROM || SMTP_USER },
      to: admin.email,
      replyTo: { name, address: email },
      subject: `PetHouse contact: ${topicLabels[topic]}`,
      text: [
        "A visitor sent a message through the PetHouse contact form.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Topic: ${topicLabels[topic]}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return Response.json({ message: "Your message was sent to PetHouse support." });
  } catch (error) {
    console.error("Contact message delivery failed:", error.name || "Unknown error");
    return Response.json(
      { error: "We couldn't send your message right now. Please try again later." },
      { status: 500 }
    );
  }
}
