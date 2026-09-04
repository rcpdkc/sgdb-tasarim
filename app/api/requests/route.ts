import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase";
import type { ProductOrder } from "@/lib/types";

const allowedSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductOrder;
    if (
      body.full_name?.trim().length < 3 ||
      !Number.isInteger(body.tshirt_design) || body.tshirt_design < 1 || body.tshirt_design > 5 ||
      !allowedSizes.includes(body.tshirt_size) ||
      !Number.isInteger(body.polar_design) || body.polar_design < 1 || body.polar_design > 5 ||
      !allowedSizes.includes(body.polar_size)
    ) return NextResponse.json({ error: "Ad soyad, bir tişört, bir polar ve iki beden seçimi zorunludur." }, { status: 400 });

    const payload = {
      full_name: body.full_name.trim().slice(0, 80),
      tshirt_design: body.tshirt_design,
      tshirt_size: body.tshirt_size,
      polar_design: body.polar_design,
      polar_size: body.polar_size,
      status: "Yeni",
    };
    const data = await supabaseRequest("", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
    return NextResponse.json({ success: true, request: data?.[0] });
  } catch {
    return NextResponse.json({ error: "Kayıt sırasında bir sorun oluştu." }, { status: 500 });
  }
}
