export type OrderStatus = "Yeni" | "Onaylandı" | "Hazırlanıyor" | "Tamamlandı";

export type ProductOrder = {
  id?: number;
  full_name: string;
  tshirt_design: number;
  tshirt_size: string;
  polar_design: number;
  polar_size: string;
  status?: OrderStatus;
  created_at?: string;
};
