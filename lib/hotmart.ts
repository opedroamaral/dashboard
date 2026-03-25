import { createHmac } from "crypto";
import type { HotmartWebhookBody, SaleParsed } from "@/types/hotmart";

export function verifyHotmartSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export function parseHotmartPayload(body: HotmartWebhookBody): SaleParsed {
  const { event, data } = body;
  const { purchase, product, buyer } = data;

  const isRefund =
    event === "PURCHASE_REFUNDED" ||
    purchase.status === "REFUNDED" ||
    purchase.status === "CANCELLED";

  const status = isRefund ? "refunded" : "approved";

  const orderBumps = (purchase.order_bumps ?? []).map((ob) => ({
    name: ob.name,
    value: ob.price?.value ?? 0,
  }));

  const orderBumpsTotal = orderBumps.reduce((sum, ob) => sum + ob.value, 0);
  const saleValue = purchase.price?.value ?? 0;
  const totalSaleValue = saleValue + orderBumpsTotal;

  return {
    transactionId: purchase.transaction,
    status,
    saleValue,
    totalSaleValue,
    productName: product.name,
    buyerEmail: buyer.email,
    utmContent: purchase.utm?.utm_content ?? null,
    transactionDate: new Date(),
    platform: "hotmart",
    orderBumps,
  };
}
