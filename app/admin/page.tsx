"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OrderStatus, ProductOrder } from "@/lib/types";

const statuses: OrderStatus[] = ["Yeni", "Onaylandı", "Hazırlanıyor", "Tamamlandı"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [filter, setFilter] = useState("Tümü");

  useEffect(() => { const saved = sessionStorage.getItem("sgdb-admin"); if (saved) { setPassword(saved); load(saved); } }, []);

  async function load(pass = password) {
    setLoading(true); setError("");
    const response = await fetch("/api/admin/requests", { headers: { Authorization: `Bearer ${pass}` } });
    if (!response.ok) { setError("Şifre yanlış veya kayıtlar alınamadı."); setLoading(false); return; }
    const data = await response.json();
    sessionStorage.setItem("sgdb-admin", pass); setOrders(data); setAuthenticated(true); setLoading(false);
  }

  async function changeStatus(id: number, status: OrderStatus) {
    const response = await fetch("/api/admin/requests", { method: "PATCH", headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (response.ok) setOrders((list) => list.map((item) => item.id === id ? { ...item, status } : item));
  }

  const shown = useMemo(() => filter === "Tümü" ? orders : orders.filter((o) => o.status === filter), [orders, filter]);
  const counts = useMemo(() => ({ total: orders.length, new: orders.filter((o) => o.status === "Yeni").length, done: orders.filter((o) => o.status === "Tamamlandı").length }), [orders]);

  return <main className="admin-shell">
    <header className="admin-header"><div><p className="eyebrow">SGDB ÜRÜN TASARIM MERKEZİ</p><h1>Talep Yönetimi</h1></div><Link href="/">Tasarım ekranına dön</Link></header>
    {!authenticated && !loading ? <section className="login-card"><h2>Yönetici girişi</h2><p>Talep kayıtlarını görmek için yönetici şifresini girin.</p><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Yönetici şifresi" /><button onClick={() => load()}>Giriş yap</button>{error && <p className="notice error">{error}</p>}</section> : <>
      <section className="stats"><article><span>Toplam</span><strong>{counts.total}</strong></article><article><span>Yeni</span><strong>{counts.new}</strong></article><article><span>Tamamlanan</span><strong>{counts.done}</strong></article></section>
      <div className="admin-actions"><div className="filters">{["Tümü", ...statuses].map((s) => <button className={filter === s ? "active" : ""} onClick={() => setFilter(s)} key={s}>{s}</button>)}</div><button onClick={() => load()}>{loading ? "Yenileniyor…" : "Yenile"}</button></div>
      <div className="table-wrap"><table><thead><tr><th>Ad Soyad</th><th>Tişört</th><th>Polar</th><th>Tarih</th><th>Durum</th></tr></thead><tbody>{shown.map((order) => <tr key={order.id}><td><strong>{order.full_name}</strong></td><td>Model {order.tshirt_design} · {order.tshirt_size}</td><td>Model {order.polar_design} · {order.polar_size}</td><td>{order.created_at ? new Date(order.created_at).toLocaleString("tr-TR") : "—"}</td><td><select value={order.status} onChange={(e) => changeStatus(order.id!, e.target.value as OrderStatus)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{!shown.length && <div className="empty">Henüz kayıt bulunmuyor.</div>}</div>
    </>}
  </main>;
}
