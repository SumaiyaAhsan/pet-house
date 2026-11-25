import mongoose from "mongoose";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import Message from "@/lib/models/Message";
import Pet from "@/lib/models/Pet";
import User from "@/lib/models/User";
import { getAuthUser, getChatParticipants } from "@/lib/chat";

export const runtime = "nodejs";

function serializeMessages(messages) {
  return messages.map((message) => ({
    _id: message._id,
    pet: message.pet.toString(),
    sender: message.sender.toString(),
    receiver: message.receiver.toString(),
    text: message.text,
    readAt: message.readAt || null,
    createdAt: message.createdAt,
  }));
}

export async function GET(request) {
  const decoded = getAuthUser(request);
  if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
    return Response.json({ error: "Please sign in to view messages." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const petId = searchParams.get("pet");
  const receiverId = searchParams.get("receiver");
  if (
    !mongoose.isValidObjectId(petId) ||
    (receiverId && !mongoose.isValidObjectId(receiverId))
  ) {
    return Response.json({ error: "Invalid message conversation." }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findById(decoded.id).select("_id name email role status").lean();
    if (!user || user.status !== "active") {
      return Response.json({ error: "Your account is not available for messaging." }, { status: 403 });
    }

    const pet = await Pet.findById(petId).select("_id name listedBy status").lean();
    if (!pet) return Response.json({ error: "Pet not found." }, { status: 404 });

    const participantIds = await getChatParticipants(pet, user);
    const recipientRoles =
      user.role === "admin" ? ["user", "shelter"] : user.role === "shelter" ? ["user"] : ["shelter"];
    const participants = await User.find({
      _id: { $in: participantIds },
      status: "active",
      role: { $in: recipientRoles },
    })
      .select("_id name role")
      .sort({ name: 1 })
      .lean();

    if (!receiverId) {
      return Response.json({
        participants: participants.map(({ _id, name, role }) => ({
          id: _id.toString(),
          name,
          role,
        })),
        messages: [],
      });
    }

    if (!participants.some((participant) => participant._id.toString() === receiverId)) {
      return Response.json({ error: "You cannot access this conversation." }, { status: 403 });
    }

    // Opening the conversation marks everything sent to me by this user as read.
    await Message.updateMany(
      { pet: pet._id, sender: receiverId, receiver: user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    const messages = await Message.find({
      pet: pet._id,
      $or: [
        { sender: user._id, receiver: receiverId },
        { sender: receiverId, receiver: user._id },
      ],
    })
      .select("_id pet sender receiver text readAt createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return Response.json({
      participants: participants.map(({ _id, name, role }) => ({
        id: _id.toString(),
        name,
        role,
      })),
      messages: serializeMessages(messages.reverse()),
    });
  } catch (error) {
    console.error("Message lookup failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to load this conversation." }, { status: 500 });
  }
}

export async function POST(request) {
  const decoded = getAuthUser(request);
  if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
    return Response.json({ error: "Please sign in to send messages." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please enter a valid message." }, { status: 400 });
  }

  const petId = typeof body.pet === "string" ? body.pet : "";
  const receiverId = typeof body.receiver === "string" ? body.receiver : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const sendEmail = body.sendEmail === true;
  if (
    !mongoose.isValidObjectId(petId) ||
    !mongoose.isValidObjectId(receiverId) ||
    !text ||
    text.length > 2000
  ) {
    return Response.json({ error: "Enter a message up to 2,000 characters." }, { status: 400 });
  }

  try {
    await connectDB();
    const sender = await User.findById(decoded.id).select("_id name email role status").lean();
    if (!sender || sender.status !== "active") {
      return Response.json({ error: "Your account is not available for messaging." }, { status: 403 });
    }
    if (sendEmail && sender.role !== "admin") {
      return Response.json({ error: "Only administrators can email a message recipient." }, { status: 403 });
    }

    const [pet, recipient] = await Promise.all([
      Pet.findById(petId).select("_id name listedBy status").lean(),
      User.findById(receiverId).select("_id name email role status").lean(),
    ]);
    if (!pet) return Response.json({ error: "Pet not found." }, { status: 404 });
    if (!recipient || recipient.status !== "active" || recipient.role === "admin") {
      return Response.json({ error: "Message recipient is unavailable." }, { status: 404 });
    }

    const participantIds = await getChatParticipants(pet, sender);
    if (!participantIds.includes(receiverId)) {
      return Response.json({ error: "You cannot message this user about this pet." }, { status: 403 });
    }

    const smtp = {
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      port: Number(process.env.SMTP_PORT || "587"),
    };
    if (
      sendEmail &&
      (!smtp.host || !smtp.user || !smtp.password || !Number.isInteger(smtp.port) || smtp.port < 1 || smtp.port > 65535)
    ) {
      return Response.json({ error: "Message email is not configured. Please try again later." }, { status: 503 });
    }
    if (sendEmail && !recipient.email) {
      return Response.json({ error: "This recipient does not have an email address." }, { status: 422 });
    }

    const message = await Message.create({
      pet: pet._id,
      sender: sender._id,
      receiver: recipient._id,
      text,
    });
    let emailSent = false;
    let emailError;

    if (sendEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.port === 465,
          auth: { user: smtp.user, pass: smtp.password },
        });
        await transporter.sendMail({
          from: { name: "PetHouse Messages", address: smtp.from },
          to: recipient.email,
          replyTo: sender.email ? { name: sender.name, address: sender.email } : undefined,
          subject: `PetHouse message about ${pet.name}`,
          text: [
            `Hello ${recipient.name},`,
            "",
            `${sender.name} sent you a message about ${pet.name}:`,
            "",
            text,
            "",
            "Sign in to PetHouse to continue the conversation.",
          ].join("\n"),
        });
        emailSent = true;
      } catch (error) {
        console.error("Message email delivery failed:", error.name || "Unknown error");
        emailError = "Your chat message was sent, but the email could not be delivered.";
      }
    }

    return Response.json({
      message: (await serializeMessages([message.toObject()]))[0],
      emailSent,
      emailError,
    }, { status: 201 });
  } catch (error) {
    console.error("Message send failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to send this message." }, { status: 500 });
  }
}
