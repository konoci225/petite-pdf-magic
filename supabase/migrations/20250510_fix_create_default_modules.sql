
-- Fix the create_default_modules function to avoid PostgreSQL role conflicts
-- The previous version was trying to SET ROLE which requires elevated privileges
-- This version uses SECURITY DEFINER to run with the privileges of the function creator

CREATE OR REPLACE FUNCTION public.create_default_modules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if there are existing modules
  IF NOT EXISTS (SELECT 1 FROM public.modules LIMIT 1) THEN
    -- Insert default modules without trying to change PostgreSQL roles
    INSERT INTO public.modules (module_name, description, is_active, is_premium)
    VALUES 
      ('Module de base', 'Fonctionnalités de base de l''application', true, false),
      ('Module Premium', 'Fonctionnalités avancées pour les utilisateurs premium', true, true),
      ('OCR', 'Reconnaissance optique de caractères pour les documents PDF', false, true),
      ('PDF Merge', 'Fusionner plusieurs fichiers PDF en un seul document', true, false),
      ('PDF Split', 'Diviser un document PDF en plusieurs fichiers', true, false),
      ('PDF Compress', 'Réduire la taille des fichiers PDF', true, false),
      ('PDF to Word', 'Convertir des PDF en documents Word', true, true),
      ('PDF to Excel', 'Convertir des PDF en feuilles de calcul Excel', true, true);
  END IF;
END;
$$;

-- Create a more robust function to ensure konointer has super_admin role
-- This is a critical function for the admin bypass system
CREATE OR REPLACE FUNCTION public.ensure_konointer_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'konointer@gmail.com' THEN
    -- Ensure the special user has the super_admin role
    INSERT INTO public.user_roles (user_id, role, updated_at)
    VALUES (NEW.id, 'super_admin', now())
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'super_admin', updated_at = now();
    
    -- Also add this user to any relevant tables/permissions
    -- You can add more operations here if needed for konointer@gmail.com
  END IF;
  RETURN NEW;
END;
$$;

-- Make sure the trigger is correctly set up
DROP TRIGGER IF EXISTS ensure_konointer_admin_trigger ON auth.users;
CREATE TRIGGER ensure_konointer_admin_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_konointer_admin_role();

-- Fix modules table policies to properly handle super_admin role
-- This removes any incorrect policies and creates correct ones
DROP POLICY IF EXISTS "Allow super_admin to manage modules" ON public.modules;
DROP POLICY IF EXISTS "Allow konointer to manage all modules" ON public.modules;

-- Create policy that allows super_admin role from user_roles to manage modules
CREATE POLICY "Allow super_admin to manage modules" 
ON public.modules
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create special policy for konointer@gmail.com
CREATE POLICY "Allow konointer to manage all modules" 
ON public.modules
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

-- Grant execute permission on the create_default_modules function
-- This ensures that authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.create_default_modules() TO authenticated;

