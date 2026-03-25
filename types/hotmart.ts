export interface HotmartWebhookBody {
  event: string;
  version: string;
  data: HotmartData;
}

export interface HotmartData {
  product: {
    id: number;
    name: string;
    ucode: string;
  };
  purchase: {
    transaction: string;
    status: string;
    price: {
      value: number;
      currency_value: string;
    };
    order_bump?: {
      is_order_bump: boolean;
      name?: string;
      price?: {
        value: number;
      };
    };
    order_bumps?: HotmartOrderBump[];
    utm?: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_term?: string;
      utm_content?: string;
    };
  };
  buyer: {
    email: string;
    name: string;
  };
  commissions?: Array<{
    value: number;
  }>;
}

export interface HotmartOrderBump {
  name: string;
  price: {
    value: number;
  };
}

export interface SaleParsed {
  transactionId: string;
  status: string;
  saleValue: number;
  totalSaleValue: number;
  productName: string;
  buyerEmail: string;
  utmContent: string | null;
  transactionDate: Date;
  platform: string;
  orderBumps: { name: string; value: number }[];
}
