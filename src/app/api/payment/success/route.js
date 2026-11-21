import { NextResponse } from "next/server";
import {
  createAppUrl,
  processSslCommerzPayment,
} from "@/lib/payments/sslcommerz";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const valId = String(formData.get("val_id") || "");
    const tranId = String(formData.get("tran_id") || "");

    await processSslCommerzPayment({ valId, tranId });
    return NextResponse.redirect(createAppUrl("/dashboard", { adoption: "success" }), 303);
  } catch (error) {
    console.error("Payment success callback failed.");
    return NextResponse.redirect(
      createAppUrl("/pets", { error: "payment_verification_failed" }),
      303
    );
  }
}
