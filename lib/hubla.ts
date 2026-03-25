import { createHmac } from "crypto";
import type { HublaWebhookBody } from "@/types/hubla";
import type { SaleParsed } from "@/types/hotmart";

export function verifyHublaSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export function parseHublaPayload(body: HublaWebhookBody): SaleParsed {
  const { event, data } = body;

  const isRefund = event === "sale.refunded" || data.status === "refunded";
  const status = isRefund ? "refunded" : "approved";

  const orderBumps = (data.items ?? []).map((item) => ({
    name: item.name,
    value: item.amount / 100, // Hubla envia em centavos
  }));

  const saleValue = data.amount / 100;
  const totalValue = data.totalAmount / 100;

  return {
    transactionId: data.id,
    status,
    saleValue,
    totalSaleValue: totalValue,
    productName: data.product.name,
    buyerEmail: data.buyer.email,
    utmContent: data.utmParams?.utm_content ?? null,
    transactionDate: new Date(data.createdAt),
    platform: "hubla",
    orderBumps,
  };
}
