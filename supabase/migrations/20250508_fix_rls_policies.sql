
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

-- Update RLS policies for user_roles table
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that could be causing conflicts
DROP POLICY IF EXISTS "Allow konointer to manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow super admin to manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow konointer to view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow konointer to modify all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow konointer to update all roles" ON public.user_roles;

-- Create policy for special email user
CREATE POLICY "Allow konointer to manage user_roles"
ON public.user_roles
FOR ALL
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'konointer@gmail.com'
);

-- Create policy for super_admin users
CREATE POLICY "Allow super_admin to manage user_roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Create policy to let users view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Create service function to set super_admin role
CREATE OR REPLACE FUNCTION public.force_set_super_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update the role as super_admin
  INSERT INTO public.user_roles (user_id, role, updated_at)
  VALUES (target_user_id, 'super_admin'::app_role, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'super_admin'::app_role, updated_at = now();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.force_set_super_admin_role(uuid) TO authenticated;

-- Update RLS policies for modules table
DROP POLICY IF EXISTS "Allow konointer to manage all modules" ON public.modules;
DROP POLICY IF EXISTS "Allow super_admin to manage modules" ON public.modules;

-- Create or replace policies for the modules table
CREATE POLICY IF NOT EXISTS "Allow konointer to manage all modules" 
ON public.modules
FOR ALL 
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'konointer@gmail.com'
);

CREATE POLICY IF NOT EXISTS "Allow super_admin to manage all modules" 
ON public.modules
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create or replace a function to ensure special admin role
CREATE OR REPLACE FUNCTION public.ensure_konointer_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email = 'konointer@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role, updated_at)
    VALUES (NEW.id, 'super_admin'::app_role, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'super_admin'::app_role, updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS ensure_konointer_admin_trigger ON auth.users;

CREATE TRIGGER ensure_konointer_admin_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_konointer_admin();
