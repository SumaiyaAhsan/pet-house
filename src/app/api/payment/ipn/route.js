import {
  markPendingSslCommerzTransaction,
  processSslCommerzPayment,
} from "@/lib/payments/sslcommerz";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const valId = String(formData.get("val_id") || "");
    const tranId = String(formData.get("tran_id") || "");
    const status = String(formData.get("status") || "").toUpperCase();

    const failedStatuses = {
      FAILED: "failed",
      CANCELLED: "cancelled",
      EXPIRED: "failed",
      UNATTEMPTED: "failed",
    };
    if (Object.hasOwn(failedStatuses, status)) {
      await markPendingSslCommerzTransaction(tranId, failedStatuses[status]);
      return Response.json({ received: true });
    }
    if (!["VALID", "VALIDATED"].includes(status)) {
      return Response.json({ error: "Unknown payment notification status." }, { status: 400 });
    }

    await processSslCommerzPayment({ valId, tranId });
    return Response.json({ received: true });
  } catch (error) {
    console.error("Payment IPN validation failed.");
    return Response.json({ error: "Payment notification could not be validated." }, { status: 400 });
  }
}
