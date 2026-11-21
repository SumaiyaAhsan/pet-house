import { NextResponse } from "next/server";
import {
  createAppUrl,
  markPendingSslCommerzTransaction,
} from "@/lib/payments/sslcommerz";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const url = new URL(request.url);
    const tranId = String(formData.get("tran_id") || url.searchParams.get("tran_id") || "");
    const transaction = await markPendingSslCommerzTransaction(tranId, "failed");

    if (transaction) {
      return NextResponse.redirect(
        createAppUrl(`/payment/${transaction.pet}`, { payment: "failed" }),
        303
      );
    }

    return NextResponse.redirect(createAppUrl("/pets", { error: "payment_failed" }), 303);
  } catch (error) {
    console.error("Payment failure callback failed.");
    return NextResponse.redirect(createAppUrl("/pets", { error: "payment_failed" }), 303);
  }
}
