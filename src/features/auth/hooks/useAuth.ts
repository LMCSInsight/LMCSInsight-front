import { useAuthContext } from "@/shared/context/AuthContext";

export function useAuth() {
  return useAuthContext();
}
