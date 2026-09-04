"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { ProductOrder } from "@/lib/types";

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const models = [1, 2, 3, 4, 5];
const initial: ProductOrder = { full_name: "", tshirt_design: 0, tshirt_size: "", polar_design: 0, polar_size: "" };

export default function HomePage() {
  const [form, setForm] = useState<ProductOrder>(initial);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof ProductOrder>(key: K, value: ProductOrder[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle"); setMessage("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setState("saving"); setMessage("");
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState("success"); setMessage("Seçiminiz başarıyla kaydedildi."); setForm(initial);
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : "Kayıt yapılamadı.");
    }
  }

  const complete = form.full_name.trim().length >= 3 && form.tshirt_design > 0 && !!form.tshirt_size && form.polar_design > 0 && !!form.polar_size;

  return <main className="page-shell">
    <header className="topbar"><div className="brand-mark">SGDB</div><div><p className="eyebrow">CYBER SECURITY DEPARTMENT</p><h1>Ürün Seçim Formu</h1></div><Link className="admin-link" href="/admin">Yönetim</Link></header>
    <form className="selection-form" onSubmit={submit}>
      <section className="identity-card"><div><span className="step">01</span><h2>Bilgilerin</h2><p>Ad ve soyad alanı zorunludur.</p></div><label>Ad Soyad<input required minLength={3} maxLength={80} value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Adınızı ve soyadınızı yazın" /></label></section>

      <section className="product-section">
        <div className="section-title"><span className="step">02</span><div><h2>Bir tişört seç</h2><p>Beş tasarımdan yalnızca birini seçebilirsin.</p></div></div>
        <div className="design-grid">{models.map((model) => <button type="button" key={model} className={`design-card ${form.tshirt_design === model ? "selected" : ""}`} onClick={() => update("tshirt_design", model)}><img src={`/images/tshirt-${model}.png`} alt={`Tişört tasarımı ${model}`} /><span><strong>Tişört {model}</strong><em>{form.tshirt_design === model ? "Seçildi" : "Seç"}</em></span></button>)}</div>
        <label className="size-field">Tişört bedeni<select required value={form.tshirt_size} onChange={(e) => update("tshirt_size", e.target.value)}><option value="">Beden seçin</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
      </section>

      <section className="product-section">
        <div className="section-title"><span className="step">03</span><div><h2>Bir polar seç</h2><p>Beş tasarımdan yalnızca birini seçebilirsin.</p></div></div>
        <div className="design-grid polar-grid">{models.map((model) => <button type="button" key={model} className={`design-card ${form.polar_design === model ? "selected" : ""}`} onClick={() => update("polar_design", model)}><div className="polar-shot"><img src="/images/polar-catalog.png" alt={`Polar tasarımı ${model}`} style={{ transform: `translateX(-${(model - 1) * 20}%)` }} /></div><span><strong>Polar {model}</strong><em>{form.polar_design === model ? "Seçildi" : "Seç"}</em></span></button>)}</div>
        <label className="size-field">Polar bedeni<select required value={form.polar_size} onChange={(e) => update("polar_size", e.target.value)}><option value="">Beden seçin</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
      </section>

      <section className="checkout-card"><div><span>Tişört</span><strong>{form.tshirt_design ? `Model ${form.tshirt_design} · ${form.tshirt_size || "Beden bekleniyor"}` : "Seçilmedi"}</strong></div><div><span>Polar</span><strong>{form.polar_design ? `Model ${form.polar_design} · ${form.polar_size || "Beden bekleniyor"}` : "Seçilmedi"}</strong></div><button className="save-button" disabled={state === "saving" || !complete}>{state === "saving" ? "Kaydediliyor…" : "Seçimlerimi kaydet"}</button>{message && <p className={`notice ${state}`} role="status">{message}</p>}</section>
    </form>
  </main>;
}
