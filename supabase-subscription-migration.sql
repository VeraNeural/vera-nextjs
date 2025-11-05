-- Add subscription and trial tracking fields to users table
-- Run this in your Supabase SQL Editor

-- Add new columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'canceled', 'past_due', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly', NULL)),
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create index for faster trial expiration checks
CREATE INDEX IF NOT EXISTS idx_users_trial_end ON users(trial_end);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Function to check if user's trial/subscription is active
CREATE OR REPLACE FUNCTION is_user_access_active(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT subscription_status, trial_end, subscription_current_period_end
  INTO user_record
  FROM users
  WHERE id = user_id;

  -- If no user found, deny access
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Active subscription
  IF user_record.subscription_status = 'active' THEN
    -- Check if subscription hasn't expired
    IF user_record.subscription_current_period_end IS NULL OR 
       user_record.subscription_current_period_end > NOW() THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- Trialing - check if trial hasn't expired
  IF user_record.subscription_status = 'trialing' THEN
    IF user_record.trial_end > NOW() THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- All other cases: deny access
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_user_access_active TO authenticated;

SELECT 'Subscription schema updated successfully!' as status;
