-- Add portfolio_html column to resume_summaries table
ALTER TABLE "resume_summaries" ADD COLUMN IF NOT EXISTS "portfolio_html" TEXT;
