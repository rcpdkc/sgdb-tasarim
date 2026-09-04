"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import type { ProductOrder } from "@/lib/types";

const colors = [
  { name: "Siyah", value: "#111315" },
  { name: "Lacivert", value: "#101d36" },
  { name: "Antrasit", value: "#343638" },
  { name: "Beyaz", value: "#f4f4f1" },
  { name: "Kırık Beyaz", value: "#ebe7dc" },
];

const initial: ProductOrder = {
  full_name: "",
  product: "Tişört",
  department: "NETWORK",
  color: "Siyah",
  size: "M",
  design_variant: 1,
  quantity: 1,
  note: "",
};

export default function HomePage() {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const selectedColor = useMemo(() => colors.find((item) => item.name === form.color)!, [form.color]);
  const light = ["Beyaz", "Kırık Beyaz"].includes(form.color);

  function update<K extends keyof ProductOrder>(key: K, value: ProductOrder[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState("success");
      setMessage("Tercihiniz başarıyla kaydedildi.");
      setForm((current) => ({ ...initial, department: current.department, product: current.product }));
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Kayıt yapılamadı.");
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-mark">SGDB</div>
        <div>
          <p className="eyebrow">CYBER SECURITY DEPARTMENT</p>
          <h1>Ürün Tasarım Merkezi</h1>
        </div>
        <Link className="admin-link" href="/admin">Yönetim</Link>
      </header>

      <section className="workspace">
        <form className="config-panel" onSubmit={submit}>
          <div className="section-heading">
            <span>01</span>
            <div><h2>Ürününü oluştur</h2><p>Tercihlerini seç ve kaydet.</p></div>
          </div>

          <div className="segmented" aria-label="Ürün türü">
            {(["Tişört", "Polar"] as const).map((item) => (
              <button type="button" className={form.product === item ? "active" : ""} onClick={() => update("product", item)} key={item}>{item}</button>
            ))}
          </div>

          <label>Ad Soyad<input required maxLength={80} value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Adınızı ve soyadınızı yazın" /></label>

          <div className="form-row">
            <label>Birim<select value={form.department} onChange={(e) => update("department", e.target.value as ProductOrder["department"])}><option>NETWORK</option><option>SECURITY</option><option>SYSTEM</option></select></label>
            <label>Beden<select value={form.size} onChange={(e) => update("size", e.target.value)}>{["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((s) => <option key={s}>{s}</option>)}</select></label>
          </div>

          <fieldset><legend>Renk</legend><div className="color-list">{colors.map((color) => <button type="button" key={color.name} onClick={() => update("color", color.name)} className={form.color === color.name ? "color-option selected" : "color-option"}><span style={{ background: color.value }} />{color.name}</button>)}</div></fieldset>

          <div className="form-row">
            <label>Tasarım<select value={form.design_variant} onChange={(e) => update("design_variant", Number(e.target.value))}>{[1, 2, 3, 4, 5].map((v) => <option value={v} key={v}>Model {v}</option>)}</select></label>
            <label>Adet<input type="number" min={1} max={10} value={form.quantity} onChange={(e) => update("quantity", Number(e.target.value))} /></label>
          </div>
          <label>Not <span className="optional">isteğe bağlı</span><textarea maxLength={300} value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="Eklemek istediğiniz bir detay varsa yazın" /></label>
          <button className="save-button" disabled={state === "saving"}>{state === "saving" ? "Kaydediliyor…" : "Tercihimi kaydet"}</button>
          {message && <p className={`notice ${state}`} role="status">{message}</p>}
        </form>

        <aside className="preview-panel">
          <div className="preview-meta"><span>CANLI ÖNİZLEME</span><span>MODEL {form.design_variant}</span></div>
          <div className={`garment-card ${form.product === "Polar" ? "polar" : "tshirt"}`} style={{ backgroundColor: selectedColor.value, color: light ? "#12213a" : "#f4f5f7" }}>
            <div className="garment-neck" />
            <div className="garment-copy"><strong>SGDB</strong><small>{form.department}</small></div>
            {form.full_name && <div className="name-preview">{form.full_name.toUpperCase()}</div>}
          </div>
          <div className="selection-card">
            <div><span>Ürün</span><strong>{form.product}</strong></div><div><span>Renk</span><strong>{form.color}</strong></div><div><span>Beden</span><strong>{form.size}</strong></div><div><span>Adet</span><strong>{form.quantity}</strong></div>
          </div>
          <p className="preview-note">Önizleme yerleşimi temsilidir. Nihai baskı üretim ölçülerine göre hazırlanır.</p>
        </aside>
      </section>
    </main>
  );
}
