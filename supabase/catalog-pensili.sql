-- Inserisce o aggiorna i due pensili mancanti nel catalogo Supabase.
-- Eseguire dal SQL Editor del progetto Supabase con privilegi admin.
do $$
declare
  pensili_category_id uuid;
begin
  select id
  into pensili_category_id
  from public.categories
  where slug = 'pensili'
  limit 1;

  if pensili_category_id is null then
    insert into public.categories (name, slug, description, sort_order)
    values ('Pensili', 'pensili', 'Pensili verticali e orizzontali', 8)
    returning id into pensili_category_id;
  else
    update public.categories
    set
      name = 'Pensili',
      description = 'Pensili verticali e orizzontali',
      sort_order = 8
    where id = pensili_category_id;
  end if;

  if exists (select 1 from public.products where code = 'PENSILE-VERTICALE') then
    update public.products
    set
      category_id = pensili_category_id,
      name_it = 'Pensile verticale',
      name_en = 'Vertical wall unit',
      width_mm = 700,
      height_mm = 878,
      depth_mm = 350,
      thickness_mm = 20,
      is_published = true
    where code = 'PENSILE-VERTICALE';
  else
    insert into public.products (
      category_id,
      name_it,
      name_en,
      code,
      width_mm,
      height_mm,
      depth_mm,
      thickness_mm,
      price,
      preview_image_url,
      model_url,
      technical_file_url,
      is_published
    )
    values (
      pensili_category_id,
      'Pensile verticale',
      'Vertical wall unit',
      'PENSILE-VERTICALE',
      700,
      878,
      350,
      20,
      null,
      null,
      null,
      null,
      true
    );
  end if;

  if exists (select 1 from public.products where code = 'PENSILE-ORIZZONTALE') then
    update public.products
    set
      category_id = pensili_category_id,
      name_it = 'Pensile orizzontale',
      name_en = 'Horizontal wall unit',
      width_mm = 700,
      height_mm = 439,
      depth_mm = 350,
      thickness_mm = 20,
      is_published = true
    where code = 'PENSILE-ORIZZONTALE';
  else
    insert into public.products (
      category_id,
      name_it,
      name_en,
      code,
      width_mm,
      height_mm,
      depth_mm,
      thickness_mm,
      price,
      preview_image_url,
      model_url,
      technical_file_url,
      is_published
    )
    values (
      pensili_category_id,
      'Pensile orizzontale',
      'Horizontal wall unit',
      'PENSILE-ORIZZONTALE',
      700,
      439,
      350,
      20,
      null,
      null,
      null,
      null,
      true
    );
  end if;
end $$;
