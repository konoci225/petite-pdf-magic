
-- Add a new RLS policy specific to konointer@gmail.com to ensure they always have super_admin access
-- This will allow the special user to always access all tables regardless of their role

-- First, create or update the specific policy for the special admin in the user_roles table
CREATE OR REPLACE POLICY "Allow konointer to manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

-- Add similar policy for modules table
CREATE OR REPLACE POLICY "Allow konointer to manage all modules"
ON public.modules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

-- Add similar policy for user_modules table
CREATE OR REPLACE POLICY "Allow konointer to manage all user modules"
ON public.user_modules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

-- Add generic super_admin policies
CREATE OR REPLACE POLICY "Allow super_admin to manage modules"
ON public.modules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

CREATE OR REPLACE POLICY "Allow super_admin to manage user_modules"
ON public.user_modules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create a function to ensure konointer is always a super_admin
CREATE OR REPLACE FUNCTION public.ensure_special_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'konointer@gmail.com' THEN
    -- Ensure the special user has the super_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'super_admin', assigned_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call this function when a user is created or updated
DROP TRIGGER IF EXISTS ensure_special_admin_role_trigger ON auth.users;
CREATE TRIGGER ensure_special_admin_role_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_special_admin_role();
