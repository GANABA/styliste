-- Seed data for Styliste.com

-- Insert subscription plans
INSERT INTO subscription_plans (id, name, price, features, limits, is_active, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'Découverte',
    0,
    '{"clients": 20, "orders": 5, "portfolio": false, "notifications": false, "support": "community"}'::json,
    '{"maxClients": 20, "maxActiveOrders": 5, "maxPortfolioItems": 0, "smsCredits": 0}'::json,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Standard',
    500000,
    '{"clients": 100, "orders": 15, "portfolio": false, "notifications": "auto", "support": "email"}'::json,
    '{"maxClients": 100, "maxActiveOrders": 15, "maxPortfolioItems": 0, "smsCredits": 50}'::json,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Pro',
    1000000,
    '{"clients": "unlimited", "orders": 20, "portfolio": true, "notifications": "auto", "support": "priority"}'::json,
    '{"maxClients": -1, "maxActiveOrders": 20, "maxPortfolioItems": 50, "smsCredits": 200}'::json,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Insert admin user (password: admin123, hashed with bcrypt 12 rounds)
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@styliste.com',
  '$2b$12$LXqZ3jF5vhGl0Q.uF7qPCeHYz9E3UkN8WF1mK5VT7pL2xD8jR6nYW',
  'Admin Styliste',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert test user (password: test123, hashed with bcrypt 12 rounds)
DO $$
DECLARE
  test_user_id uuid;
  test_stylist_id uuid;
  free_plan_id uuid;
BEGIN
  -- Insert test user
  INSERT INTO users (id, email, password, name, role, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'test@styliste.com',
    '$2b$12$YGZ4mN8pQ3hRl2SvF6tPDeXy1K9L5W7mT4j.rH3xQ8nU2wP1sV9aK',
    'Test Styliste',
    'STYLIST',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO test_user_id;

  -- Only proceed if we just created the user
  IF test_user_id IS NOT NULL THEN
    -- Insert test stylist
    INSERT INTO stylists (id, user_id, business_name, phone, city, address, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      test_user_id,
      'Atelier Test',
      '+229 97 00 00 00',
      'Cotonou',
      'Akpakpa, Cotonou, Bénin',
      NOW(),
      NOW()
    )
    RETURNING id INTO test_stylist_id;

    -- Get free plan ID
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Découverte' LIMIT 1;

    -- Insert test subscription
    IF test_stylist_id IS NOT NULL AND free_plan_id IS NOT NULL THEN
      INSERT INTO subscriptions (id, stylist_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        test_stylist_id,
        free_plan_id,
        'ACTIVE',
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW(),
        NOW()
      );
    END IF;
  END IF;
END $$;

SELECT 'Seed data inserted successfully!' as result;
