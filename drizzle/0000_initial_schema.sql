-- Saúde Unida - Initial Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE member_role AS ENUM ('viewer', 'editor', 'admin');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE weekday AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Routines
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, routine_id)
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  created_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  weekday weekday NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_routine_id ON members(routine_id);
CREATE INDEX idx_tasks_routine_id ON tasks(routine_id);
CREATE INDEX idx_tasks_weekday ON tasks(weekday);

-- Auto-delete routine when last admin is removed (via trigger)
CREATE OR REPLACE FUNCTION check_routine_admins()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM members
    WHERE routine_id = OLD.routine_id AND role = 'admin' AND id != OLD.id
  ) THEN
    DELETE FROM routines WHERE id = OLD.routine_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_routine_admin
AFTER DELETE ON members
FOR EACH ROW
EXECUTE FUNCTION check_routine_admins();

CREATE OR REPLACE FUNCTION check_routine_admins_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM members
      WHERE routine_id = NEW.routine_id AND role = 'admin' AND id != NEW.id
    ) THEN
      DELETE FROM routines WHERE id = NEW.routine_id;
      RETURN NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_routine_admin_on_update
AFTER UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION check_routine_admins_on_update();
