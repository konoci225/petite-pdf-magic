
-- Supprimer les anciennes politiques qui pourraient causer des problèmes
DROP POLICY IF EXISTS "Allow konointer to manage all modules" ON public.modules;
DROP POLICY IF EXISTS "Allow super_admin to manage modules" ON public.modules;

-- Créer des nouvelles politiques plus permissives
CREATE POLICY "Allow super_admin to manage all modules" 
ON public.modules
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Politiques spécifiques pour l'utilisateur konointer@gmail.com
CREATE POLICY "Allow konointer to manage all modules regardless of role" 
ON public.modules
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

-- Politique pour la table user_roles permettant à konointer@gmail.com de voir les rôles
CREATE POLICY IF NOT EXISTS "Allow konointer to view all roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

-- Politique pour la table user_roles permettant à konointer@gmail.com de modifier les rôles
CREATE POLICY IF NOT EXISTS "Allow konointer to modify all roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

CREATE POLICY IF NOT EXISTS "Allow konointer to update all roles"
ON public.user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'konointer@gmail.com'
  )
);

-- Fonction permettant de récupérer le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role::text 
  FROM public.user_roles 
  WHERE user_id = $1 
  LIMIT 1;
$$;

-- Fonction pour s'assurer que konointer@gmail.com est toujours super_admin
CREATE OR REPLACE FUNCTION public.ensure_konointer_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email = 'konointer@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'super_admin';
  END IF;
  RETURN NEW;
END;
$$;

-- Créer ou remplacer le trigger
DROP TRIGGER IF EXISTS ensure_konointer_admin_trigger ON auth.users;

CREATE TRIGGER ensure_konointer_admin_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_konointer_admin();

-- Assurez-vous que la fonction RPC create_default_modules existe
CREATE OR REPLACE FUNCTION public.create_default_modules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer des modules par défaut seulement s'il n'y en a pas
  IF NOT EXISTS (SELECT 1 FROM public.modules LIMIT 1) THEN
    INSERT INTO public.modules (module_name, description, is_active, is_premium)
    VALUES 
      ('Module de base', 'Fonctionnalités de base de l''application', true, false),
      ('Module Premium', 'Fonctionnalités avancées pour les utilisateurs premium', true, true),
      ('OCR', 'Reconnaissance optique de caractères pour les documents PDF', false, true);
  END IF;
END;
$$;
