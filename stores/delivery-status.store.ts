// delivery-status.store.ts
// Central place to keep track of per-product delivery status using React Query cache

import type { DeliveryStatus } from "@/components/ui/ListItem";

export type DeliveryProductStatus = {
  id: string;
  name: string;
  cases: number;
  cans: number;
  status: DeliveryStatus;
  notes?: string;
};

export type DeliveryStatusState = Record<string, DeliveryProductStatus>;
