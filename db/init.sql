-- This script runs automatically the FIRST time the PostgreSQL container
-- starts with an empty data volume (see docker-entrypoint-initdb.d in the
-- official postgres image docs). It will NOT re-run on later restarts.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A single demo user is used for the whole workshop app (no login flow).
INSERT INTO users (name, email)
VALUES ('Demo User', 'demo@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name) VALUES
    ('Food'),
    ('Transport'),
    ('Shopping'),
    ('Entertainment'),
    ('Bills'),
    ('Health'),
    ('Education'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- A couple of sample expenses so the dashboard is not empty on first run.
INSERT INTO expenses (user_id, category_id, title, amount, expense_date, notes)
SELECT 1, c.id, 'Lunch with friends', 250.00, CURRENT_DATE, 'Sample seed data'
FROM categories c WHERE c.name = 'Food'
ON CONFLICT DO NOTHING;

INSERT INTO expenses (user_id, category_id, title, amount, expense_date, notes)
SELECT 1, c.id, 'Bus pass', 100.00, CURRENT_DATE, 'Sample seed data'
FROM categories c WHERE c.name = 'Transport'
ON CONFLICT DO NOTHING;
