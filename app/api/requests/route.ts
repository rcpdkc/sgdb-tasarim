import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase";
import type { ProductOrder } from "@/lib/types";

const allowedProducts = ["Tişört", "Polar"];
const allowedDepartments = ["NETWORK", "SECURITY", "SYSTEM"];
const allowedSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductOrder;
    if (
      !body.full_name?.trim() ||
      !allowedProducts.includes(body.product) ||
      !allowedDepartments.includes(body.department) ||
      !allowedSizes.includes(body.size) ||
      !body.color ||
      body.design_variant < 1 ||
      body.design_variant > 5 ||
      body.quantity < 1 ||
      body.quantity > 10
    ) {
      return NextResponse.json({ error: "Lütfen zorunlu alanları kontrol edin." }, { status: 400 });
    }

    const payload = {
      full_name: body.full_name.trim().slice(0, 80),
      product: body.product,
      department: body.department,
      color: body.color.slice(0, 30),
      size: body.size,
      design_variant: Number(body.design_variant),
      quantity: Number(body.quantity),
      note: (body.note || "").trim().slice(0, 300),
      status: "Yeni",
    };

    const data = await supabaseRequest("", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ success: true, request: data?.[0] });
  } catch {
    return NextResponse.json({ error: "Kayıt sırasında bir sorun oluştu." }, { status: 500 });
  }
}
