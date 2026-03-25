import prisma from "@/lib/prisma";
import {
  getAdInsights,
  parseCheckoutsFromActions,
} from "@/lib/facebook";
import { formatDate } from "@/lib/date";

export interface SyncResult {
  synced: number;
  errors: string[];
  duration: number;
}

export async function syncFacebookAds(accountId?: string): Promise<SyncResult> {
  const start = Date.now();
  const errors: string[] = [];
  let synced = 0;

  const accounts = accountId
    ? await prisma.facebookAccount.findMany({ where: { accountId } })
    : await prisma.facebookAccount.findMany();

  if (accounts.length === 0) {
    return { synced: 0, errors: ["No Facebook accounts connected"], duration: 0 };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateRange = {
    since: formatDate(yesterday),
    until: formatDate(today),
  };

  for (const account of accounts) {
    try {
      const insights = await getAdInsights(
        account.accountId,
        account.accessToken,
        dateRange
      );

      for (const row of insights) {
        try {
          const data = {
            adId: row.ad_id,
            campaignName: row.campaign_name,
            adsetName: row.adset_name,
            adName: row.ad_name,
            spend: parseFloat(row.spend ?? "0"),
            impressions: parseInt(row.impressions ?? "0", 10),
            linkClicks: parseInt(row.inline_link_clicks ?? "0", 10),
            landingPageViews: parseInt(row.landing_page_views ?? "0", 10),
            checkoutsInitiated: parseCheckoutsFromActions(row.actions),
            date: new Date(row.date_start),
            accountId: account.accountId,
          };

          await prisma.facebookAd.upsert({
            where: {
              adId_date: {
                adId: data.adId,
                date: data.date,
              },
            },
            create: data,
            update: {
              spend: data.spend,
              impressions: data.impressions,
              linkClicks: data.linkClicks,
              landingPageViews: data.landingPageViews,
              checkoutsInitiated: data.checkoutsInitiated,
            },
          });

          synced++;
        } catch (rowErr) {
          errors.push(`Row error (${row.ad_id}): ${String(rowErr)}`);
        }
      }
    } catch (accErr) {
      errors.push(`Account error (${account.accountId}): ${String(accErr)}`);
    }
  }

  return { synced, errors, duration: Date.now() - start };
}
