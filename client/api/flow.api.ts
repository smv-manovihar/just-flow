import { api } from "@/config/api.config";
import { Flow } from "@/types/flow.type";

export const createFlow = async (data: Flow) => {
  try{
    const res = await api.post("/api/flows/create", data);
    return res.data;
  }catch(err){
    console.log(err);
  }
};

export const getFlow = async (id: string) => {
  try{
    const res = await api.get(`/api/flows/${id}`);
    return res.data;
  }catch(err){
    console.log(err);
  }
};

export const updateFlow = async (id: string, data: Flow) => {
  try{
    const res = await api.put(`/api/flows/${id}`, data);
    return res.data;
  }catch(err){
    console.log(err);
  }
};

export const deleteFlow = async (id: string) => {
  try{
    const res = await api.delete(`/api/flows/${id}`);
    return res.data;
  }catch(err){
    console.log(err);
  }
};