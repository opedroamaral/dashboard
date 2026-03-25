export function calcROAS(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return revenue / spend;
}

export function calcCPA(spend: number, sales: number): number {
  if (sales === 0) return 0;
  return spend / sales;
}

export function calcROI(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return ((revenue - spend) / spend) * 100;
}

export function calcCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

export function calcCVR(sales: number, clicks: number): number {
  if (clicks === 0) return 0;
  return (sales / clicks) * 100;
}

export function calcNetProfit(revenue: number, spend: number): number {
  return revenue - spend;
}

export function calcTicketMedio(revenue: number, sales: number): number {
  if (sales === 0) return 0;
  return revenue / sales;
}
