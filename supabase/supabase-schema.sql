-- Create resume_summaries table
CREATE TABLE resume_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  user_id UUID REFERENCES auth.users(id),
  summary TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  persona TEXT NOT NULL,
  personality TEXT[] NOT NULL,
  portfolio_s3_path TEXT,
  portfolio_public BOOLEAN DEFAULT FALSE,
  portfolio_url TEXT,
  portfolio_updated_at TIMESTAMPTZ
);

-- Add row-level security policies
ALTER TABLE resume_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own data
CREATE POLICY "Users can view their own summaries" ON resume_summaries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert their own summaries" ON resume_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for admins
CREATE POLICY "Admin can do everything" ON resume_summaries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_resume_summaries_created_at ON resume_summaries(created_at);
CREATE INDEX idx_resume_summaries_user_id ON resume_summaries(user_id);
