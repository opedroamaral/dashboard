export interface HublaWebhookBody {
  event: string;
  data: HublaData;
}

export interface HublaData {
  id: string;
  status: string;
  totalAmount: number;
  amount: number;
  currency: string;
  product: {
    id: string;
    name: string;
  };
  buyer: {
    email: string;
    name: string;
  };
  utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  items?: HublaOrderBump[];
  createdAt: string;
}

export interface HublaOrderBump {
  name: string;
  amount: number;
}
