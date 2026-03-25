export interface KPIMetrics {
  totalSpend: number;
  totalRevenue: number;
  netProfit: number;
  roas: number;
  totalSales: number;
  avgCPA: number;
  roi: number;
}

export interface ChartDataPoint {
  date: string;
  spend: number;
  revenue: number;
  profit: number;
}

export interface TableRow {
  adId: string;
  adName: string;
  adsetName: string;
  campaignName: string;
  spend: number;
  impressions: number;
  linkClicks: number;
  checkoutsInitiated: number;
  revenue: number;
  profit: number;
  roas: number;
  cpa: number;
  ctr: number;
  cvr: number;
  sales: number;
  ticketMedio: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
