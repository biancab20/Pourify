import { DeliveryStatus } from "@/types/deliveries";

export type DeliveryProductStatus = {
  id: string;
  name: string;
  cases: number;
  cans: number;
  status: DeliveryStatus;
  expectedUnits: number;
  receivedUnits: number;
  notes?: string;
};

export type DeliveryStatusState = Record<string, DeliveryProductStatus>;
