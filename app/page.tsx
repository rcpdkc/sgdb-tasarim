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
  const [modal, setModal] = useState<{ kind: "tshirt" | "polar"; model: number } | null>(null);

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
        <div className="design-grid">{models.map((model) => <article key={model} className={`design-card ${form.tshirt_design === model ? "selected" : ""}`}><button type="button" className="image-button" onClick={() => setModal({ kind: "tshirt", model })} aria-label={`Tişört ${model} ön ve arka görünüşünü büyüt`}><img src={`/images/tshirt-${model}.png`} alt={`Tişört tasarımı ${model}, ön ve arka görünüş`} /><span className="side-label front">ÖN</span><span className="side-label back">ARKA</span><span className="zoom-hint">Büyüt</span></button><button type="button" className="select-design" onClick={() => update("tshirt_design", model)}><strong>Tişört {model}</strong><em>{form.tshirt_design === model ? "Seçildi" : "Seç"}</em></button></article>)}</div>
        <label className="size-field">Tişört bedeni<select required value={form.tshirt_size} onChange={(e) => update("tshirt_size", e.target.value)}><option value="">Beden seçin</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
      </section>

      <section className="product-section">
        <div className="section-title"><span className="step">03</span><div><h2>Bir polar seç</h2><p>Beş tasarımdan yalnızca birini seçebilirsin.</p></div></div>
        <div className="design-grid polar-grid">{models.map((model) => <article key={model} className={`design-card ${form.polar_design === model ? "selected" : ""}`}><button type="button" className="image-button" onClick={() => setModal({ kind: "polar", model })} aria-label={`Polar ${model} görünüşünü büyüt`}><div className="polar-shot"><img src="/images/polar-catalog.png" alt={`Polar tasarımı ${model}`} style={{ transform: `translateX(-${(model - 1) * 20}%)` }} /></div><span className="side-label front">ÖN</span><span className="side-label back">ARKA</span><span className="zoom-hint">Büyüt</span></button><button type="button" className="select-design" onClick={() => update("polar_design", model)}><strong>Polar {model}</strong><em>{form.polar_design === model ? "Seçildi" : "Seç"}</em></button></article>)}</div>
        <label className="size-field">Polar bedeni<select required value={form.polar_size} onChange={(e) => update("polar_size", e.target.value)}><option value="">Beden seçin</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
      </section>

      <section className="checkout-card"><div><span>Tişört</span><strong>{form.tshirt_design ? `Model ${form.tshirt_design} · ${form.tshirt_size || "Beden bekleniyor"}` : "Seçilmedi"}</strong></div><div><span>Polar</span><strong>{form.polar_design ? `Model ${form.polar_design} · ${form.polar_size || "Beden bekleniyor"}` : "Seçilmedi"}</strong></div><button className="save-button" disabled={state === "saving" || !complete}>{state === "saving" ? "Kaydediliyor…" : "Seçimlerimi kaydet"}</button>{message && <p className={`notice ${state}`} role="status">{message}</p>}</section>
    </form>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}><section className="image-modal" role="dialog" aria-modal="true" aria-label={`${modal.kind === "tshirt" ? "Tişört" : "Polar"} ${modal.model} büyük görünüş`} onMouseDown={(event) => event.stopPropagation()}><header><div><span>MODEL {modal.model}</span><h2>{modal.kind === "tshirt" ? "Tişört" : "Polar"} ön ve arka görünüş</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Pencereyi kapat">×</button></header>{modal.kind === "tshirt" ? <div className="modal-image"><img src={`/images/tshirt-${modal.model}.png`} alt={`Tişört ${modal.model} tam görünüş`} /><span className="modal-side modal-front">ÖN</span><span className="modal-side modal-back">ARKA</span></div> : <div className="modal-polar"><img src="/images/polar-catalog.png" alt={`Polar ${modal.model} ön ve arka görünüş`} style={{ transform: `translateX(-${(modal.model - 1) * 20}%)` }} /><span className="modal-side modal-front">ÖN</span><span className="modal-side modal-back">ARKA</span></div>}<button type="button" className="modal-select" onClick={() => { update(modal.kind === "tshirt" ? "tshirt_design" : "polar_design", modal.model); setModal(null); }}>Bu modeli seç</button></section></div>}
  </main>;
}
