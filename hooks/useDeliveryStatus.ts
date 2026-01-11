// useDeliveryStatus.ts
import { useQueryClient } from "@tanstack/react-query";
import type {
  DeliveryItem,
  DeliveryStatus,
} from "@/components/dynamicComponents/ListItem";
import type { DeliveryStatusState } from "../stores/delivery-status.store";

const QUERY_KEY = ["deliveries", "status"];

export function useDeliveryStatus() {
  const queryClient = useQueryClient();

  const getAll = (): DeliveryStatusState => {
    return queryClient.getQueryData<DeliveryStatusState>(QUERY_KEY) ?? {};
  };

  const setStatus = (item: DeliveryItem, status: DeliveryStatus) => {
    queryClient.setQueryData<DeliveryStatusState>(QUERY_KEY, (old = {}) => ({
      ...old,
      [item.id]: {
        id: item.id,
        name: item.name,
        cases: item.cases,
        cans: item.cans,
        status,
      },
    }));
  };

  return { getAll, setStatus };
}
