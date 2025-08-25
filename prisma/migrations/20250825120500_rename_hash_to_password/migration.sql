-- Safely rename users.hash -> users.password if it still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'hash'
  ) THEN
    ALTER TABLE "public"."users" RENAME COLUMN "hash" TO "password";
  END IF;
END $$;

