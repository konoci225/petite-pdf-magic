
-- Create function to forcibly set a user's role to super_admin with security definer
-- This function bypasses RLS completely by using the user's email
CREATE OR REPLACE FUNCTION public.force_admin_role_bypass_rls(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update the role by joining with auth.users to find the user ID
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'super_admin'::public.app_role
  FROM auth.users
  WHERE email = user_email
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'super_admin', assigned_at = now();
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.force_admin_role_bypass_rls(text) TO authenticated;
