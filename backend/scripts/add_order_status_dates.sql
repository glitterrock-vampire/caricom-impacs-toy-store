-- Add pending_date and processing_date columns to orders table
ALTER TABLE "orders" 
ADD COLUMN IF NOT EXISTS "pending_date" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "processing_date" TIMESTAMP WITH TIME ZONE;

-- Comment the new columns
COMMENT ON COLUMN "orders"."pending_date" IS 'When the order entered pending status';
COMMENT ON COLUMN "orders"."processing_date" IS 'When the order started being processed';
