import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Pet from "@/lib/models/Pet";
import Transaction from "@/lib/models/Transaction";
import { revalidatePublicPetListings } from "@/lib/revalidate-public-pets";

export const SSL_METHOD_CODES = {
  bkash: "bkash",
  nagad: "nagad",
  rocket: "dbblmobilebanking",
};

export function normalizeBdPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const localNumber = digits.startsWith("880") ? `0${digits.slice(3)}` : digits;

  return /^01[3-9]\d{8}$/.test(localNumber) ? localNumber : null;
}

export function getSslCommerzConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!storeId || !storePassword || !appUrl) {
    throw new Error("Payment gateway configuration is incomplete.");
  }

  const parsedAppUrl = new URL(appUrl);
  if (!["http:", "https:"].includes(parsedAppUrl.protocol)) {
    throw new Error("The public application URL must use HTTP or HTTPS.");
  }

  const sandboxSetting = process.env.SSLCOMMERZ_IS_SANDBOX?.trim().toLowerCase();
  const isSandbox =
    !sandboxSetting || !["false", "0", "no", "live"].includes(sandboxSetting);
  if (!isSandbox && parsedAppUrl.protocol !== "https:") {
    throw new Error("Live payments require an HTTPS application URL.");
  }

  const gatewayOrigin = isSandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";

  return {
    storeId,
    storePassword,
    appOrigin: parsedAppUrl.origin,
    gatewayOrigin,
    sessionUrl: `${gatewayOrigin}/gwprocess/v4/api.php`,
    validationUrl: `${gatewayOrigin}/validator/api/validationserverAPI.php`,
  };
}

export function createAppUrl(path, params = {}) {
  const { appOrigin } = getSslCommerzConfig();
  const url = new URL(path, appOrigin);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export async function requestSslCommerzValidation({ valId, tranId }) {
  if (!valId || !tranId) {
    throw new Error("Payment notification is missing transaction details.");
  }

  const config = getSslCommerzConfig();
  const url = new URL(config.validationUrl);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", config.storeId);
  url.searchParams.set("store_passwd", config.storePassword);
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error("Payment validation service returned an error.");
  }

  const validation = await response.json();
  if (
    !["VALID", "VALIDATED"].includes(validation.status) ||
    validation.val_id !== valId ||
    validation.tran_id !== tranId
  ) {
    throw new Error("Payment validation failed.");
  }

  return validation;
}

export async function processSslCommerzPayment({ valId, tranId }) {
  const validation = await requestSslCommerzValidation({ valId, tranId });
  const config = getSslCommerzConfig();
  await connectDB();
  const transaction = await Transaction.findOne({ tranId, gateway: "sslcommerz" });
  if (!transaction) {
    throw new Error("Payment transaction was not found.");
  }

  const paidAmount = Number(validation.amount ?? validation.total_amount);
  if (
    !Number.isFinite(paidAmount) ||
    Math.round(paidAmount * 100) !== Math.round(transaction.amount * 100) ||
    validation.currency !== transaction.currency ||
    (validation.currency_type && validation.currency_type !== transaction.currency) ||
    (validation.store_id && validation.store_id !== config.storeId) ||
    String(validation.value_a) !== transaction.pet.toString()
  ) {
    throw new Error("Payment details do not match the order.");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const currentTransaction = await Transaction.findById(transaction._id).session(session);
      if (!currentTransaction) {
        throw new Error("Payment transaction was not found.");
      }

      if (currentTransaction.status === "completed") return;
      if (currentTransaction.status !== "pending") {
        throw new Error("Payment transaction is no longer pending.");
      }

      const pet = await Pet.findOneAndUpdate(
        { _id: currentTransaction.pet, status: { $in: ["approved", "reserved"] } },
        { $set: { status: "adopted" } },
        { new: true, session }
      );
      if (!pet) {
        throw new Error("This pet is no longer available for adoption.");
      }

      currentTransaction.status = "completed";
      currentTransaction.orderStatus = "completed";
      currentTransaction.confirmedAt = currentTransaction.confirmedAt || new Date();
      currentTransaction.completedAt = new Date();
      currentTransaction.gatewayValidationId = valId;
      currentTransaction.gatewayTransactionId = String(validation.bank_tran_id || "");
      await currentTransaction.save({ session });
    });
  } finally {
    await session.endSession();
  }

  revalidatePublicPetListings();

  return {
    petId: transaction.pet.toString(),
  };
}

export async function markPendingSslCommerzTransaction(tranId, status) {
  if (!tranId) return null;

  await connectDB();
  const session = await mongoose.startSession();
  let transaction;
  try {
    await session.withTransaction(async () => {
      transaction = await Transaction.findOneAndUpdate(
        { tranId, gateway: "sslcommerz", status: "pending" },
        {
          $set: {
            status,
            orderStatus: "cancelled",
            cancelledAt: new Date(),
          },
        },
        { new: true, session }
      ).select("pet");

      if (transaction) {
        await Pet.updateOne(
          { _id: transaction.pet, status: "reserved" },
          { $set: { status: "approved" } },
          { session }
        );
      }
    });
  } finally {
    await session.endSession();
  }
  if (transaction) revalidatePublicPetListings();
  return transaction;
}
