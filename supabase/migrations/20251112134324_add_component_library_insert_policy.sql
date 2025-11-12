/*
  # Add INSERT policy for component library seeding
  
  Allows authenticated users to insert component library entries.
  This is needed for seeding the component library on app startup.
*/

CREATE POLICY "Authenticated users can insert to component library"
  ON component_library FOR INSERT TO authenticated
  WITH CHECK (TRUE);
