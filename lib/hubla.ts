import { createHmac } from "crypto";
import type { HublaWebhookBody } from "@/types/hubla";
import type { SaleParsed } from "@/types/hotmart";

export function verifyHublaSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = createHmac("sha256", secret).update(payload).digest("hex");
  return hash === signature;
}

export function parseHublaPayload(body: HublaWebhookBody): SaleParsed {
  const { type, event } = body;
  const { invoice, product, user } = event;

  const isRefund =
    type === "invoice.refunded" ||
    type === "invoice.chargeback" ||
    invoice.status === "refunded" ||
    invoice.status === "chargedback";

  const status = isRefund ? "refunded" : "approved";

  const saleValue = invoice.amount.subtotalCents / 100;
  const totalSaleValue = invoice.amount.totalCents / 100;

  return {
    transactionId: invoice.id,
    status,
    saleValue,
    totalSaleValue,
    productName: product.name,
    buyerEmail: user.email ?? invoice.payer.email,
    utmContent: invoice.paymentSession?.utm?.content ?? null,
    transactionDate: new Date(invoice.saleDate),
    platform: "hubla",
    orderBumps: [],
  };
}
