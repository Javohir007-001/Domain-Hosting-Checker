-- 1. Jadval yaratish
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  plan_name TEXT NOT NULL
);

-- 2. Xavfsizlikni ochish (Hamma ma'lumot yubora olishi uchun)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON orders FOR INSERT WITH CHECK (true);