-- Consente spessori decimali come 19.5 mm provenienti dalla legenda Excel.
alter table public.products
  alter column thickness_mm type numeric(8, 2)
  using thickness_mm::numeric(8, 2);
