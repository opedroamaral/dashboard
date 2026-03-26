import { NextRequest, NextResponse } from "next/server";
import { verifyHublaSignature, parseHublaPayload } from "@/lib/hubla";
import prisma from "@/lib/prisma";
import type { TransactionClient } from "@/types/prisma";
import type { HublaWebhookBody } from "@/types/hubla";

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-hubla-signature") ?? "";
  const secret = process.env.HUBLA_SECRET ?? "";

  if (secret && !verifyHublaSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: HublaWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Log payload para debug de estrutura
  console.log("[webhook/hubla] payload:", JSON.stringify(body, null, 2));

  const ignoredEvents = ["sale.pending", "sale.processing"];
  if (ignoredEvents.includes(body.event)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const parsed = parseHublaPayload(body);

    await prisma.$transaction(async (tx: TransactionClient) => {
      const sale = await tx.sale.upsert({
        where: { transactionId: parsed.transactionId },
        create: {
          transactionId: parsed.transactionId,
          status: parsed.status,
          saleValue: parsed.saleValue,
          totalSaleValue: parsed.totalSaleValue,
          productName: parsed.productName,
          buyerEmail: parsed.buyerEmail,
          utmContent: parsed.utmContent,
          transactionDate: parsed.transactionDate,
          platform: parsed.platform,
        },
        update: {
          status: parsed.status,
          totalSaleValue: parsed.totalSaleValue,
        },
      });

      if (parsed.orderBumps.length > 0) {
        await tx.orderBump.deleteMany({ where: { saleId: sale.id } });
        await tx.orderBump.createMany({
          data: parsed.orderBumps.map((ob) => ({
            saleId: sale.id,
            name: ob.name,
            value: ob.value,
          })),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/hubla] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
