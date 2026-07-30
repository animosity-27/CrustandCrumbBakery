/*
# Crust and Crumb — core schema (products, orders, reviews)

## Overview
Bakery commerce platform. Customers order anonymously (browse, add to cart,
checkout, track by short code, leave one review per order). The admin signs in
with Supabase email/password and manages orders, inventory, and reviews from a
dashboard. Order/review creation and order-by-code reads go through SECURITY
DEFINER RPCs so the anon-key frontend can act safely without broad RLS grants.

## New Tables
1. `products` — bakery items for sale.
   - id, name, description, price, image, warm_filter (apply golden photo filter),
     stock (on-hand units), is_active, sort_order, created_at.
2. `orders` — customer orders.
   - id, code (unique short human-readable order code, e.g. CC-A7F3),
     customer_name, customer_contact, pickup_slot, payment_method (cash|gcash|qrph),
     total, status (received|preparing|ready|completed|cancelled), note,
     created_at, updated_at.
3. `order_items` — line items per order (frozen price/name snapshot).
   - id, order_id (FK cascade), product_id (FK SET NULL), product_name, price, quantity.
4. `reviews` — one review per order (unique order_id).
   - id, order_id (unique FK), rating (1..5), body, author, admin_reply, created_at.

## Server Functions (SECURITY DEFINER)
1. generate_order_code() — unique 'CC-XXXX' short code.
2. create_order(...) — atomic order + line items + stock decrement; returns order.
3. submit_review(order_code, rating, body, author) — one review per order by code.
4. admin_stats() — dashboard aggregates for authenticated admins.

## Security (RLS)
- products: public SELECT (storefront); admin (authenticated) full write.
- orders / order_items: no anon table access; created/read via RPCs; admin full CRUD.
- reviews: public SELECT; INSERT via submit_review RPC; admin UPDATE reply + DELETE.
- create_order + submit_review: executable by anon+authenticated (storefront needs them).
- admin_stats: executable by authenticated only.

## Notes
1. Short codes: 'CC-' + 4 base32-ish alnum chars, collision-checked via loop.
2. Stock decremented inside create_order transaction.
3. order_items prices/names are frozen snapshots.
*/

-- products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  warm_filter boolean NOT NULL DEFAULT false,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  customer_contact text NOT NULL DEFAULT '',
  pickup_slot text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','gcash','qrph')),
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','preparing','ready','completed','cancelled')),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_orders" ON orders;
CREATE POLICY "admin_select_orders" ON orders FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_order_items" ON order_items;
CREATE POLICY "admin_select_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_order_items" ON order_items;
CREATE POLICY "admin_insert_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;
CREATE POLICY "admin_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (true);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'Anonymous',
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (true);

-- generate_order_code()
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  tries int := 0;
BEGIN
  LOOP
    new_code := 'CC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    IF NOT EXISTS (SELECT 1 FROM orders WHERE code = new_code) THEN
      RETURN new_code;
    END IF;
    tries := tries + 1;
    IF tries > 50 THEN
      new_code := 'CC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- create_order()
CREATE OR REPLACE FUNCTION create_order(
  p_items jsonb,
  p_name text,
  p_contact text,
  p_slot text,
  p_payment text,
  p_total numeric,
  p_note text DEFAULT ''
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order orders%ROWTYPE;
  item jsonb;
  pid uuid;
  qty int;
BEGIN
  INSERT INTO orders (code, customer_name, customer_contact, pickup_slot, payment_method, total, note)
  VALUES (generate_order_code(), COALESCE(p_name,''), COALESCE(p_contact,''), COALESCE(p_slot,''),
          COALESCE(p_payment,'cash'), COALESCE(p_total,0), COALESCE(p_note,''))
  RETURNING * INTO new_order;

  IF p_items IS NOT NULL THEN
    FOREACH item IN ARRAY jsonb_array_elements(p_items)
    LOOP
      pid := NULLIF(item->>'product_id','')::uuid;
      qty := COALESCE((item->>'quantity')::int, 1);
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
      VALUES (new_order.id, pid, item->>'name', COALESCE((item->>'price')::numeric,0), qty);
      IF pid IS NOT NULL THEN
        UPDATE products SET stock = stock - qty WHERE id = pid;
      END IF;
    END LOOP;
  END IF;

  RETURN new_order;
END;
$$;
REVOKE ALL ON FUNCTION create_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order TO anon, authenticated;

-- submit_review()
CREATE OR REPLACE FUNCTION submit_review(
  p_order_code text,
  p_rating int,
  p_body text,
  p_author text
)
RETURNS reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ord orders%ROWTYPE;
  rev reviews%ROWTYPE;
BEGIN
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  SELECT * INTO ord FROM orders WHERE code = upper(trim(p_order_code));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No order found with that code';
  END IF;
  INSERT INTO reviews (order_id, rating, body, author)
  VALUES (ord.id, p_rating, COALESCE(p_body,''), COALESCE(p_author,'Anonymous'))
  ON CONFLICT (order_id) DO NOTHING
  RETURNING * INTO rev;
  IF rev IS NULL THEN
    RAISE EXCEPTION 'This order already has a review';
  END IF;
  RETURN rev;
END;
$$;
REVOKE ALL ON FUNCTION submit_review FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_review TO anon, authenticated;

-- admin_stats()
CREATE OR REPLACE FUNCTION admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_orders', (SELECT count(*) FROM orders),
    'total_revenue', (SELECT COALESCE(sum(total),0) FROM orders WHERE status <> 'cancelled'),
    'total_reviews', (SELECT count(*) FROM reviews),
    'avg_rating', (SELECT COALESCE(round(avg(rating)::numeric,2),0) FROM reviews),
    'by_status', (
      SELECT jsonb_object_agg(status, cnt) FROM (
        SELECT status, count(*)::int AS cnt FROM orders GROUP BY status
      ) s
    ),
    'top_product', COALESCE((
      SELECT product_name FROM (
        SELECT oi.product_name, sum(oi.quantity) AS qty
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status <> 'cancelled'
        GROUP BY oi.product_name
        ORDER BY qty DESC
        LIMIT 1
      ) t
    ), '—')
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION admin_stats FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_stats TO authenticated;

-- Seed products
INSERT INTO products (name, description, price, image, warm_filter, stock, sort_order)
VALUES
  ('Cream Cheese Garlic Brioche',
   'Our golden, buttery brioche stuffed with gooey cream cheese, topped with savory garlic butter and fresh parsley.',
   120.00,
   'https://images.pexels.com/photos/7159284/pexels-photo-7159284.jpeg?auto=compress&cs=tinysrgb&w=900',
   false, 24, 1),
  ('Choco Banana Bread',
   'Moist banana bread swirled with rich chocolate, baked until just set.',
   85.00,
   'https://images.pexels.com/photos/2955818/pexels-photo-2955818.jpeg?auto=compress&cs=tinysrgb&w=900',
   true, 18, 2),
  ('Fudge Brownies',
   'Dense, fudgy brownies with a crackly top and an intense chocolate center.',
   70.00,
   'https://images.pexels.com/photos/38028993/pexels-photo-38028993.jpeg?auto=compress&cs=tinysrgb&w=900',
   true, 30, 3)
ON CONFLICT DO NOTHING;
