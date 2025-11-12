/*
  # AI-Enhanced Visual Builder Schema
  
  1. New Tables
    - `users` - Extended user profile data
    - `projects` - User design projects (circuits, web apps, etc.)
    - `components` - Component instances in projects
    - `connections` - Connections/wires between components
    - `component_library` - Global library of available components
    - `ai_history` - History of AI-generated suggestions
  
  2. Security
    - Enable RLS on all tables
    - Users can only access their own projects and data
    - Component library is publicly readable
  
  3. Features
    - Projects have metadata (name, type, description, created_at, updated_at)
    - Components store properties as JSON for flexibility
    - Real-time updates via Postgres triggers
*/

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'circuit',
  design_data JSONB DEFAULT '{"components":[],"connections":[],"metadata":{}}',
  simulation_config JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  label TEXT,
  x FLOAT,
  y FLOAT,
  rotation INT DEFAULT 0,
  properties JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  from_pin TEXT,
  to_component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  to_pin TEXT,
  connection_type TEXT DEFAULT 'wire',
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS component_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  component_type TEXT UNIQUE NOT NULL,
  default_properties JSONB DEFAULT '{}',
  pins JSONB DEFAULT '[]',
  simulation_model JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_prompt TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  changes_applied JSONB,
  user_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view components in own projects"
  ON components FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = components.project_id
      AND (projects.user_id = auth.uid() OR projects.is_public = TRUE)
    )
  );

CREATE POLICY "Users can manage components in own projects"
  ON components FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update components in own projects"
  ON components FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete components in own projects"
  ON components FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view connections in own projects"
  ON connections FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = connections.project_id
      AND (projects.user_id = auth.uid() OR projects.is_public = TRUE)
    )
  );

CREATE POLICY "Users can manage connections in own projects"
  ON connections FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update connections in own projects"
  ON connections FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete connections in own projects"
  ON connections FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view component library"
  ON component_library FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can view own AI history"
  ON ai_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create AI history"
  ON ai_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_components_project_id ON components(project_id);
CREATE INDEX idx_connections_project_id ON connections(project_id);
CREATE INDEX idx_ai_history_project_id ON ai_history(project_id);
