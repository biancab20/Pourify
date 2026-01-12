import { useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["deliveries", "removedIds"] as const;

export function useDeliveryRemoved() {
  const qc = useQueryClient();

  const removedIdsQuery = useQuery<string[]>({
    queryKey: KEY,
    queryFn: async () => qc.getQueryData<string[]>(KEY) ?? [],
    initialData: [],
    staleTime: Infinity,
  });

  const addRemoved = (id: string) => {
    qc.setQueryData<string[]>(KEY, (old = []) => (old.includes(id) ? old : [...old, id]));
  };

  const resetRemoved = () => {
    qc.setQueryData<string[]>(KEY, []);
  };

  return {
    removedIds: removedIdsQuery.data ?? [],
    addRemoved,
    resetRemoved,
  };
}
