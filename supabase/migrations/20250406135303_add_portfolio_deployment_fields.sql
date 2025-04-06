-- Add portfolio deployment fields to resume_summaries table
ALTER TABLE "resume_summaries" ADD COLUMN IF NOT EXISTS "portfolio_s3_path" TEXT;
ALTER TABLE "resume_summaries" ADD COLUMN IF NOT EXISTS "portfolio_public" BOOLEAN DEFAULT FALSE;
ALTER TABLE "resume_summaries" ADD COLUMN IF NOT EXISTS "portfolio_url" TEXT;
ALTER TABLE "resume_summaries" ADD COLUMN IF NOT EXISTS "portfolio_updated_at" TIMESTAMPTZ;
