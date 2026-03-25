import {
  AdInsightRow,
  TokenResponse,
  AdAccount,
} from "@/types/facebook";

const GRAPH_URL = "https://graph.facebook.com/v19.0";

export function getFacebookOAuthURL(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
    scope: "ads_read,ads_management",
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
    code,
  });

  const res = await fetch(`${GRAPH_URL}/oauth/access_token?${params}`);
  if (!res.ok) throw new Error(`Facebook token exchange failed: ${res.status}`);
  return res.json();
}

export async function getLongLivedToken(
  shortToken: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    fb_exchange_token: shortToken,
  });

  const res = await fetch(`${GRAPH_URL}/oauth/access_token?${params}`);
  if (!res.ok)
    throw new Error(`Facebook long-lived token exchange failed: ${res.status}`);
  return res.json();
}

export async function getAdAccounts(
  accessToken: string
): Promise<AdAccount[]> {
  const params = new URLSearchParams({
    fields: "id,name,currency",
    access_token: accessToken,
  });
  const res = await fetch(`${GRAPH_URL}/me/adaccounts?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch ad accounts: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}

export async function getAdInsights(
  accountId: string,
  accessToken: string,
  dateRange: { since: string; until: string }
): Promise<AdInsightRow[]> {
  const results: AdInsightRow[] = [];
  let after: string | null = null;

  const fields = [
    "ad_id",
    "campaign_name",
    "adset_name",
    "ad_name",
    "spend",
    "impressions",
    "inline_link_clicks",
    "landing_page_views",
    "actions",
  ].join(",");

  do {
    const params = new URLSearchParams({
      fields,
      time_range: JSON.stringify(dateRange),
      level: "ad",
      time_increment: "1",
      access_token: accessToken,
      limit: "500",
    });

    if (after) params.set("after", after);

    const res = await fetch(
      `${GRAPH_URL}/act_${accountId}/insights?${params}`
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(
        `Facebook Insights API error: ${err?.error?.message ?? res.status}`
      );
    }

    const json = await res.json();
    results.push(...(json.data ?? []));
    after = json.paging?.cursors?.after ?? null;

    if (!json.paging?.next) break;
  } while (after);

  return results;
}

export function parseCheckoutsFromActions(
  actions?: { action_type: string; value: string }[]
): number {
  if (!actions) return 0;
  const checkout = actions.find(
    (a) =>
      a.action_type === "initiate_checkout" ||
      a.action_type === "fb_pixel_initiate_checkout"
  );
  return checkout ? parseInt(checkout.value, 10) : 0;
}
