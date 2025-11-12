import React, { createContext, useContext, useState } from 'react';
import { Project, Component, Connection } from '../types';
import { supabase } from '../lib/supabase';

interface ProjectContextType {
  project: Project | null;
  components: Component[];
  connections: Connection[];
  loading: boolean;

  loadProject: (projectId: string) => Promise<void>;
  createProject: (name: string, type: string) => Promise<string>;
  saveProject: () => Promise<void>;

  addComponent: (component: Omit<Component, 'id' | 'createdAt'>) => Promise<void>;
  updateComponent: (id: string, updates: Partial<Component>) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;

  addConnection: (connection: Omit<Connection, 'id'>) => Promise<void>;
  updateConnection: (id: string, updates: Partial<Connection>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;

  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) return;

      setProject(projectData as Project);

      const { data: componentData, error: componentError } = await supabase
        .from('components')
        .select('*')
        .eq('project_id', projectId);

      if (componentError) throw componentError;
      setComponents((componentData || []) as Component[]);

      const { data: connectionData, error: connectionError } = await supabase
        .from('connections')
        .select('*')
        .eq('project_id', projectId);

      if (connectionError) throw connectionError;
      setConnections((connectionData || []) as Connection[]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, type: string): Promise<string> => {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          project_type: type,
          design_data: { components: [], connections: [], metadata: {} },
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const newProject = data as Project;
    setProject(newProject);
    setComponents([]);
    setConnections([]);

    return newProject.id;
  };

  const saveProject = async () => {
    if (!project) return;

    const { error } = await supabase
      .from('projects')
      .update({
        design_data: {
          components,
          connections,
          metadata: {},
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id);

    if (error) throw error;
  };

  const addComponent = async (component: Omit<Component, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('components')
      .insert([component])
      .select()
      .single();

    if (error) throw error;
    setComponents([...components, data as Component]);
  };

  const updateComponent = async (id: string, updates: Partial<Component>) => {
    const { error } = await supabase
      .from('components')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    setComponents(
      components.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteComponent = async (id: string) => {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setComponents(components.filter((c) => c.id !== id));
    setConnections(
      connections.filter((cn) => cn.fromComponentId !== id && cn.toComponentId !== id)
    );
  };

  const addConnection = async (connection: Omit<Connection, 'id'>) => {
    const { data, error } = await supabase
      .from('connections')
      .insert([connection])
      .select()
      .single();

    if (error) throw error;
    setConnections([...connections, data as Connection]);
  };

  const updateConnection = async (id: string, updates: Partial<Connection>) => {
    const { error } = await supabase
      .from('connections')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    setConnections(
      connections.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteConnection = async (id: string) => {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setConnections(connections.filter((c) => c.id !== id));
  };

  const clearProject = () => {
    setProject(null);
    setComponents([]);
    setConnections([]);
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        components,
        connections,
        loading,
        loadProject,
        createProject,
        saveProject,
        addComponent,
        updateComponent,
        deleteComponent,
        addConnection,
        updateConnection,
        deleteConnection,
        clearProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
