import { NextResponse } from "next/server";
import { isAdmin, supabaseRequest } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try {
    const data = await supabaseRequest("?select=*&order=created_at.desc");
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Kayıtlar alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try {
    const { id, status } = await request.json();
    const allowed = ["Yeni", "Onaylandı", "Hazırlanıyor", "Tamamlandı"];
    if (!Number.isInteger(id) || !allowed.includes(status)) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    await supabaseRequest(`?id=eq.${id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status }),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Durum güncellenemedi." }, { status: 500 });
  }
}
