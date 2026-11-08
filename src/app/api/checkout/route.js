import connectDB from "@/lib/db";
import User from "../../../lib/models/User";
import Pet from "../../../lib/models/Pet";
import Transaction from "../../../lib/models/Transaction";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    
    // 1. Check Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) return Response.json({ error: "Invalid token" }, { status: 401 });

    const { petId } = await req.json();

    // 2. Get Pet and Buyer
    const pet = await Pet.findById(petId);
    if (!pet) return Response.json({ error: "Pet not found" }, { status: 404 });
    if (pet.status === "adopted") return Response.json({ error: "Pet already adopted" }, { status: 400 });

    const buyer = await User.findById(decoded.id);
    const seller = await User.findById(pet.listedBy);

    // 3. Check Balance
    if (buyer.walletBalance < pet.price) {
      return Response.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // 4. Process Payment (Deduct from buyer, add to seller)
    buyer.walletBalance -= pet.price;
    seller.walletBalance += pet.price;
    await buyer.save();
    await seller.save();

    // 5. Update Pet Status
    pet.status = "adopted";
    await pet.save();

    // 6. Create Transaction Record
    await Transaction.create({
      buyer: buyer._id,
      seller: seller._id,
      pet: pet._id,
      amount: pet.price,
    });

    return Response.json({ message: "Payment successful! You adopted the pet." });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}