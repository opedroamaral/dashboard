import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import type { TransactionClient } from "@/types/prisma";

export const dynamic = "force-dynamic";

function parseDate(value: string | null): Date {
  if (!value) return new Date();
  // Format: DD/MM/YYYY HH:MM:SS
  const [datePart, timePart] = value.split(" ");
  const [day, month, year] = datePart.split("/");
  const [hour, minute, second] = (timePart ?? "00:00:00").split(":");
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
}

function parseStatus(status: string | null): string | null {
  switch (status) {
    case "Paga":
      return "approved";
    case "Reembolsada":
      return "refunded";
    default:
      return null; // ignora "Em aberto", "Não paga"
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: null,
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const status = parseStatus(row["Status da fatura"]);
      if (!status) {
        skipped++;
        continue;
      }

      const transactionId = row["ID da fatura"];
      if (!transactionId) {
        skipped++;
        continue;
      }

      const saleValue = parseFloat(String(row["Valor do produto"] ?? 0));
      const totalSaleValue = parseFloat(String(row["Valor total"] ?? saleValue));
      const obName = row["Nome do produto de orderbump"];
      const obValue = obName ? totalSaleValue - saleValue : 0;

      try {
        await prisma.$transaction(async (tx: TransactionClient) => {
          const sale = await tx.sale.upsert({
            where: { transactionId },
            create: {
              transactionId,
              status,
              saleValue,
              totalSaleValue,
              productName: row["Nome do produto"] ?? "Produto Hubla",
              buyerEmail: row["Email do cliente"] ?? null,
              utmContent: row["UTM Conteúdo"] ?? null,
              transactionDate: parseDate(row["Data de pagamento"]),
              platform: "hubla",
            },
            update: { status, totalSaleValue },
          });

          if (obName && obValue > 0) {
            await tx.orderBump.deleteMany({ where: { saleId: sale.id } });
            await tx.orderBump.create({
              data: { saleId: sale.id, name: obName, value: obValue },
            });
          }
        });

        imported++;
      } catch (err) {
        errors.push(`${transactionId}: ${String(err)}`);
      }
    }

    return NextResponse.json({ imported, skipped, errors: errors.slice(0, 10) });
  } catch (err) {
    console.error("[hubla/import] Error:", err);
    return NextResponse.json({ error: "Falha ao processar arquivo" }, { status: 500 });
  }
}
