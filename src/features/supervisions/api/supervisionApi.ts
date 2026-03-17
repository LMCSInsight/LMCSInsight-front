import axiosInstance from "@/shared/lib/axios";
import type { Supervision, SupervisionFormData } from "@/features/supervisions/types";

export const supervisionApi = {
  getAll: () => axiosInstance.get<Supervision[]>("/supervisions"),
  getById: (id: string) => axiosInstance.get<Supervision>(`/supervisions/${id}`),
  create: (data: SupervisionFormData) =>
    axiosInstance.post<Supervision>("/supervisions", data),
  update: (id: string, data: SupervisionFormData) =>
    axiosInstance.patch<Supervision>(`/supervisions/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/supervisions/${id}`),
};
