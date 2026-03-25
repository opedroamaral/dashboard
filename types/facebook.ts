export interface AdInsightRow {
  ad_id: string;
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  spend: string;
  impressions: string;
  inline_link_clicks?: string;
  landing_page_views?: string;
  actions?: { action_type: string; value: string }[];
  date_start: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface FacebookApiError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

export interface AdAccount {
  id: string;
  name: string;
  currency: string;
}
