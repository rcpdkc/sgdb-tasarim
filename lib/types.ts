export type OrderStatus = "Yeni" | "Onaylandı" | "Hazırlanıyor" | "Tamamlandı";

export type ProductOrder = {
  id?: number;
  full_name: string;
  product: "Tişört" | "Polar";
  department: "NETWORK" | "SECURITY" | "SYSTEM";
  color: string;
  size: string;
  design_variant: number;
  quantity: number;
  note: string;
  status?: OrderStatus;
  created_at?: string;
};
