/*
# Fix create_order: iterate jsonb array correctly

## Problem
create_order used `FOREACH item IN ARRAY jsonb_array_elements(p_items)`.
jsonb_array_elements() returns a SETOF jsonb (a set), not an array, so
FOREACH raised: "FOREACH expression must yield an array, not type jsonb".
Every checkout attempt failed with HTTP 400.

## Fix
Replace FOREACH with `FOR item IN SELECT jsonb_array_elements(p_items) LOOP`,
which correctly iterates the set. All other logic (code generation, stock
decrement, frozen snapshots) is unchanged.

## Security
No RLS/policy changes. Only the function body changes.
*/

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
    FOR item IN SELECT jsonb_array_elements(p_items)
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
