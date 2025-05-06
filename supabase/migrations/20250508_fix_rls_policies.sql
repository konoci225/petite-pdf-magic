
-- Make sure we have the app_role enum type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('super_admin', 'subscriber', 'visitor');
  END IF;
END $$;

-- Make sure user_roles table has a proper structure
ALTER TABLE IF EXISTS public.user_roles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create UNIQUE constraint on user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_key' AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Update RLS policies for modules table
DROP POLICY IF EXISTS "Allow konointer to manage all modules" ON public.modules;
DROP POLICY IF EXISTS "Allow super_admin to manage modules" ON public.modules;

-- Create strong RLS policies for the modules table
CREATE POLICY "Allow super_admin users to manage modules" 
ON public.modules
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create special user policy
CREATE POLICY "Allow konointer user to manage modules" 
ON public.modules
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);
