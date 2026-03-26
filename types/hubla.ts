export interface HublaWebhookBody {
  type: string;
  version: string;
  event: HublaEventData;
}

export interface HublaEventData {
  product: {
    id: string;
    name: string;
  };
  products?: { id: string; name: string }[];
  invoice: HublaInvoice;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface HublaInvoice {
  id: string;
  parentInvoiceId?: string;
  status: string;
  saleDate: string;
  amount: {
    subtotalCents: number;
    totalCents: number;
  };
  payer: {
    email: string;
    firstName: string;
    lastName: string;
  };
  paymentSession?: {
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
      term?: string;
    };
  };
}

export interface HublaOrderBump {
  name: string;
  amount: number;
}
