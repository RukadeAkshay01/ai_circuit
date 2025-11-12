export interface Component {
  id: string;
  projectId: string;
  componentType: string;
  label: string;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, any>;
  aiGenerated: boolean;
  createdAt: string;
}

export interface Connection {
  id: string;
  projectId: string;
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  connectionType: string;
  aiGenerated: boolean;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  projectType: string;
  designData: {
    components: Component[];
    connections: Connection[];
    metadata: Record<string, any>;
  };
  simulationConfig: Record<string, any>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  iconUrl: string;
  componentType: string;
  defaultProperties: Record<string, any>;
  pins: Array<{ name: string; type: string }>;
  simulationModel?: Record<string, any>;
}

export interface AIHistoryEntry {
  id: string;
  projectId: string;
  userPrompt: string;
  aiResponse: string;
  changesApplied: Record<string, any>;
  userAccepted: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}
