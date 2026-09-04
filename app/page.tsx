"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { ProductOrder } from "@/lib/types";

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const models = [1, 2, 3, 4, 5];
const initial: ProductOrder = { full_name: "", tshirt_design: 0, tshirt_size: "", polar_design: 0, polar_size: "" };

function ZoomIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" /></svg>; }

export default function HomePage() {
  const [form, setForm] = useState<ProductOrder>(initial);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState<{ kind: "tshirt" | "polar"; model: number } | null>(null);

  useEffect(() => {
    if (!modal) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setModal(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [modal]);

  function update<K extends keyof ProductOrder>(key: K, value: ProductOrder[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle");
    setMessage("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState("success");
      setMessage("Seçiminiz başarıyla kaydedildi.");
      setForm(initial);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Kayıt yapılamadı.");
    }
  }

  const complete = form.full_name.trim().length >= 3 && form.tshirt_design > 0 && !!form.tshirt_size && form.polar_design > 0 && !!form.polar_size;

  const productSection = (kind: "tshirt" | "polar") => {
    const isTshirt = kind === "tshirt";
    const selected = isTshirt ? form.tshirt_design : form.polar_design;
    const size = isTshirt ? form.tshirt_size : form.polar_size;
    const designKey = isTshirt ? "tshirt_design" : "polar_design";
    const sizeKey = isTshirt ? "tshirt_size" : "polar_size";
    const name = isTshirt ? "Tişört" : "Polar";

    return <section className="product-section">
      <div className="section-title">
        <span className="step">{isTshirt ? "02" : "03"}</span>
        <div><h2>{name} modelini seç</h2><p>Görsele tıklayarak ön ve arka yüzü detaylı inceleyebilirsin.</p></div>
        <span className={`section-status ${selected ? "done" : ""}`}>{selected ? <><CheckIcon /> Model {String(selected).padStart(2, "0")}</> : "Seçim bekleniyor"}</span>
      </div>
      <div className="design-grid">
        {models.map((model) => <article key={model} className={`design-card ${selected === model ? "selected" : ""}`}>
          <button type="button" className="image-button" onClick={() => setModal({ kind, model })} aria-label={`${name} ${model} ön ve arka görünüşünü büyüt`}>
            <span className="product-image" style={{ backgroundImage: `url(/images/web/${kind}-${model}.webp)` }} />
            <span className="view-tags"><span>ÖN</span><span>ARKA</span></span>
            <span className="zoom-hint"><ZoomIcon /><span className="sr-only">Görseli büyüt</span></span>
          </button>
          <button type="button" className="select-design" onClick={() => update(designKey, model)}>
            <span><small>{name.toUpperCase()}</small><strong>Model {String(model).padStart(2, "0")}</strong></span>
            <span className="select-state">{selected === model ? <><CheckIcon /> Seçildi</> : <>Seç <ArrowIcon /></>}</span>
          </button>
        </article>)}
      </div>
      <label className="size-field"><span>{name} bedeni</span><select required value={size} onChange={(e) => update(sizeKey, e.target.value)}><option value="">Beden seçin</option>{sizes.map((item) => <option key={item}>{item}</option>)}</select></label>
    </section>;
  };

  return <main className="page-shell">
    <header className="topbar">
      <div className="brand-mark"><span>SG</span><span>DB</span></div>
      <div className="brand-copy"><p className="eyebrow">CYBER SECURITY DEPARTMENT</p><strong>SGDB Kurumsal Ürün Seçimi</strong></div>
      <Link className="admin-link" href="/admin">Yönetim paneli <ArrowIcon /></Link>
    </header>

    <section className="intro-panel">
      <div><span className="intro-kicker">2026 • KURUMSAL KOLEKSİYON</span><h1>Ürünlerini seç,<br /><em>tercihini tamamla.</em></h1></div>
      <p>Bir tişört ve bir polar modeli seç. Beden bilgilerini ekledikten sonra tercihin doğrudan sisteme kaydedilir.</p>
      <div className="intro-index"><span>01 <small>Bilgiler</small></span><span>02 <small>Tişört</small></span><span>03 <small>Polar</small></span></div>
    </section>

    <form className="selection-form" onSubmit={submit}>
      <section className="identity-card">
        <div><span className="step">01</span><h2>Katılımcı bilgisi</h2><p>Siparişin doğru kişi adına kaydedilmesi için ad ve soyadını yaz.</p></div>
        <label><span>Ad Soyad</span><input required minLength={3} maxLength={80} autoComplete="name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Adınızı ve soyadınızı yazın" /></label>
      </section>

      {productSection("tshirt")}
      {productSection("polar")}

      <section className="checkout-card">
        <div className="summary-title"><span>SEÇİM ÖZETİ</span><strong>{complete ? "Hazır" : "Eksik bilgileri tamamla"}</strong></div>
        <div className={`summary-item ${form.tshirt_design ? "ready" : ""}`}><span>Tişört</span><strong>{form.tshirt_design ? `Model ${String(form.tshirt_design).padStart(2, "0")} · ${form.tshirt_size || "Beden seçilmedi"}` : "Seçilmedi"}</strong></div>
        <div className={`summary-item ${form.polar_design ? "ready" : ""}`}><span>Polar</span><strong>{form.polar_design ? `Model ${String(form.polar_design).padStart(2, "0")} · ${form.polar_size || "Beden seçilmedi"}` : "Seçilmedi"}</strong></div>
        <button className="save-button" disabled={state === "saving" || !complete}>{state === "saving" ? "Kaydediliyor…" : <>Seçimlerimi kaydet <ArrowIcon /></>}</button>
        {message && <p className={`notice ${state}`} role="status">{message}</p>}
      </section>
    </form>

    <footer className="site-footer"><span>SGDB</span><p>Cyber Security Department • Kurumsal Ürün Seçim Sistemi</p></footer>

    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
      <section className="image-modal" role="dialog" aria-modal="true" aria-label={`${modal.kind === "tshirt" ? "Tişört" : "Polar"} ${modal.model} büyük görünüş`} onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>{modal.kind === "tshirt" ? "TİŞÖRT" : "POLAR"} • MODEL {String(modal.model).padStart(2, "0")}</span><h2>Ön ve arka görünüş</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Pencereyi kapat">×</button></header>
        <div className="modal-image" role="img" aria-label={`${modal.kind === "tshirt" ? "Tişört" : "Polar"} ${modal.model} tam görünüş`} style={{ backgroundImage: `url(/images/web/${modal.kind}-${modal.model}.webp)` }}><span className="modal-side modal-front">ÖN</span><span className="modal-side modal-back">ARKA</span></div>
        <button type="button" className="modal-select" onClick={() => { update(modal.kind === "tshirt" ? "tshirt_design" : "polar_design", modal.model); setModal(null); }}>Bu modeli seç <ArrowIcon /></button>
      </section>
    </div>}
  </main>;
}
