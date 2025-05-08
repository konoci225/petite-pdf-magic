
-- Create a function for konointer@gmail.com to execute arbitrary SQL
-- This is used as a last resort in the admin-bypass function
CREATE OR REPLACE FUNCTION public.execute_admin_sql(sql_command TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow this function to be executed by konointer@gmail.com
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'konointer@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: Only konointer@gmail.com can execute admin SQL';
  END IF;

  -- Execute the SQL command
  EXECUTE sql_command;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error executing SQL: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- Create a function to ensure an email address has admin role
-- This is used as a fallback in the set-admin-role function
CREATE OR REPLACE FUNCTION public.ensure_admin_for_email(email_to_promote TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Only allow this function to be executed by authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Only allow konointer@gmail.com to promote other users
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'konointer@gmail.com' AND 
     email_to_promote != (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only konointer@gmail.com can promote other users';
  END IF;

  -- Find the user ID for the email
  SELECT id INTO target_user_id FROM auth.users WHERE email = email_to_promote;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', email_to_promote;
  END IF;
  
  -- Set the user's role to super_admin
  INSERT INTO public.user_roles (user_id, role, updated_at)
  VALUES (target_user_id, 'super_admin', now())
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'super_admin', updated_at = now();
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error setting admin role: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- Create a function to get users by email (for admin use)
CREATE OR REPLACE FUNCTION public.admin_get_users_by_email(target_email TEXT)
RETURNS TABLE (id UUID, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow this function to be executed by konointer@gmail.com
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'konointer@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: Only konointer@gmail.com can use this function';
  END IF;

  RETURN QUERY
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  WHERE u.email = target_email;
END;
$$;

-- Grant execute permissions on these functions
GRANT EXECUTE ON FUNCTION public.execute_admin_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_admin_for_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_users_by_email(TEXT) TO authenticated;
