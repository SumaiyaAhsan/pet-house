import connectDB from "@/lib/db";
import User from "../../../../lib/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, newPassword } = await req.json();

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: "No account found with this email" }, { status: 404 });
    }

    // 2. Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 3. Update the user
    user.password = hashedPassword;
    await user.save();

    return Response.json({ message: "Password reset successfully! You can now login." });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}