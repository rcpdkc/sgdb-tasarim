-- Eski ürün oluşturucu tablosunu yeni seçim formuna dönüştürür.
-- Mevcut satırlar korunur; eski kayıtlarda eksik polar seçimi Model 1 / M olarak atanır.
alter table public.product_requests add column if not exists tshirt_design integer;
alter table public.product_requests add column if not exists tshirt_size text;
alter table public.product_requests add column if not exists polar_design integer;
alter table public.product_requests add column if not exists polar_size text;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='product_requests' and column_name='design_variant') then
    execute 'update public.product_requests set tshirt_design=coalesce(tshirt_design,design_variant), tshirt_size=coalesce(tshirt_size,size), polar_design=coalesce(polar_design,1), polar_size=coalesce(polar_size,''M'')';
  end if;
end $$;

alter table public.product_requests alter column tshirt_design set not null;
alter table public.product_requests alter column tshirt_size set not null;
alter table public.product_requests alter column polar_design set not null;
alter table public.product_requests alter column polar_size set not null;

alter table public.product_requests drop column if exists product;
alter table public.product_requests drop column if exists department;
alter table public.product_requests drop column if exists color;
alter table public.product_requests drop column if exists size;
alter table public.product_requests drop column if exists design_variant;
alter table public.product_requests drop column if exists quantity;
alter table public.product_requests drop column if exists note;
