import { useQuery } from "@tanstack/react-query";
import { supervisionApi } from "@/features/supervisions/api/supervisionApi";

export function useSupervisions() {
  return useQuery({
    queryKey: ["supervisions"],
    queryFn: () => supervisionApi.getAll().then((res) => res.data),
  });
}
