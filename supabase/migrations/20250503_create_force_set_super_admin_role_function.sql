
-- Create function to forcibly set a user's role to super_admin with security definer
CREATE OR REPLACE FUNCTION public.force_set_super_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'super_admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'super_admin', assigned_at = now();
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.force_set_super_admin_role(uuid) TO authenticated;
