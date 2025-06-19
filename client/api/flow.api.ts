import { api } from "@/config/api.config";

export const getFlow = async (id: string) => {
  const res = await api.get(`/api/flow/${id}`);
    
  return res.data;
};