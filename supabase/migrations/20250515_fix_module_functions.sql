
-- New SQL migration file to fix the create_default_modules function

-- Replace the existing create_default_modules function with a simpler version
-- that avoids permission issues with PostgreSQL roles
CREATE OR REPLACE FUNCTION public.create_default_modules()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the function creator
AS $$
DECLARE
  module_count INT;
BEGIN
  -- Check if there are existing modules
  SELECT COUNT(*) INTO module_count FROM public.modules;
  
  -- Only insert if no modules exist
  IF module_count = 0 THEN
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
    
    RETURN TRUE;
  ELSE
    -- If modules already exist, consider it a success
    RETURN TRUE;
  END IF;
  
  -- In case of any error
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Update security context for the function
ALTER FUNCTION public.create_default_modules() SET search_path = public;

-- Make sure permissions are granted correctly
GRANT EXECUTE ON FUNCTION public.create_default_modules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_modules() TO anon;
GRANT EXECUTE ON FUNCTION public.create_default_modules() TO service_role;

-- Make sure the RLS policies for modules are correctly set up
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
