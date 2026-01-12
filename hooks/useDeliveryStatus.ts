import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeliveryStatus } from "@/types/deliveries";
import type { DeliveryStatusState } from "@/stores/delivery-status.store";
import type { DeliveryItem } from "@/components/screenComponents/DeliveryList";

const KEY = ["deliveries", "status"] as const;

const safeUnits = (cases: number, cans: number) => (cans > 0 ? cases / cans : 0);

export function useDeliveryStatus() {
  const qc = useQueryClient();

  // ✅ reactive subscription
  const statusQuery = useQuery<DeliveryStatusState>({
    queryKey: KEY,
    queryFn: async () => qc.getQueryData<DeliveryStatusState>(KEY) ?? {},
    initialData: {},
    staleTime: Infinity,
  });

  const statusMap = statusQuery.data ?? {};

  const setStatus = (item: DeliveryItem, status: DeliveryStatus) => {
    qc.setQueryData<DeliveryStatusState>(KEY, (old = {}) => {
      const expectedUnits = safeUnits(item.cases, item.cans);
      const prev = old[item.id];
      const receivedUnits =
        typeof prev?.receivedUnits === "number" ? prev.receivedUnits : expectedUnits;

      return {
        ...old,
        [item.id]: {
          id: item.id,
          name: item.name,
          cases: item.cases,
          cans: item.cans,
          status,
          expectedUnits,
          receivedUnits,
        },
      };
    });
  };

  const setReceivedUnits = (id: string, receivedUnits: number) => {
    qc.setQueryData<DeliveryStatusState>(KEY, (old = {}) => {
      const prev = old[id];
      if (!prev) return old;
      return { ...old, [id]: { ...prev, receivedUnits } };
    });
  };

  const resetStatus = () => {
    qc.setQueryData<DeliveryStatusState>(KEY, {});
  };

  return { statusMap, setStatus, setReceivedUnits, resetStatus };
}
