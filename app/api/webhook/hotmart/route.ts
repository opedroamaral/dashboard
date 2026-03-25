import { NextRequest, NextResponse } from "next/server";
import { verifyHotmartSignature, parseHotmartPayload } from "@/lib/hotmart";
import prisma from "@/lib/prisma";
import type { TransactionClient } from "@/types/prisma";
import type { HotmartWebhookBody } from "@/types/hotmart";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-hotmart-hottok") ?? "";
  const secret = process.env.HOTMART_SECRET ?? "";

  if (secret && !verifyHotmartSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: HotmartWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ignoredEvents = ["PURCHASE_BILLET_PRINTED", "PURCHASE_PROTEST"];
  if (ignoredEvents.includes(body.event)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const parsed = parseHotmartPayload(body);

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
    console.error("[webhook/hotmart] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
