# SGDB Ürün Tasarım Merkezi

Kurum personelinin tişört ve polar tercihlerini oluşturup kaydedebildiği, yöneticilerin talepleri takip edebildiği Next.js uygulaması.

## Özellikler

- Tişört / polar seçimi
- Network / Security / System birimi
- Renk, beden, model ve adet seçimi
- Canlı ürün özeti
- Supabase veritabanına kayıt
- Şifre korumalı yönetim paneli
- Talep durumu güncelleme
- Mobil ve masaüstü uyumlu arayüz

## Supabase kurulumu

1. Supabase üzerinde yeni bir proje oluşturun.
2. SQL Editor ekranında `supabase-schema.sql` dosyasını çalıştırın.
3. Project Settings > API bölümünden Project URL ve service_role anahtarını alın.
4. Vercel proje ayarlarına aşağıdaki değişkenleri ekleyin:

```env
SUPABASE_URL=https://PROJE.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_anahtari
ADMIN_PASSWORD=guclu_bir_yonetici_sifresi
```

`SUPABASE_SERVICE_ROLE_KEY` yalnızca Vercel ortam değişkenlerinde tutulmalıdır; tarayıcıya veya repoya eklenmemelidir.

## Vercel kurulumu

1. Vercel'de **Add New > Project** seçin.
2. `rcpdkc/sgdb-tasarim` reposunu içe aktarın.
3. Framework olarak Next.js otomatik algılanır.
4. Yukarıdaki üç ortam değişkenini ekleyin.
5. Deploy edin.

Yönetim paneli: `/admin`
