
-- Create function to get user role with security definer
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

-- Set up RLS on user_roles table if not already done
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_roles to allow select by the user themselves
CREATE POLICY IF NOT EXISTS "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create trigger for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into user_roles with default 'visitor' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'visitor');
  
  RETURN new;
END;
$$;

-- Create trigger to call handle_new_user function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
