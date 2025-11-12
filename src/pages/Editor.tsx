import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { Component } from '../types';
import { Canvas } from '../components/Canvas';
import { ComponentPalette } from '../components/ComponentPalette';
import { PropertyPanel } from '../components/PropertyPanel';
import { AIAssistant } from '../components/AIAssistant';
import { SimulationPanel } from '../components/SimulationPanel';
import { ExportMenu } from '../components/ExportMenu';
import { useNavigate } from '../utils/router';
import { ChevronLeft, Save } from 'lucide-react';

export function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    project,
    components,
    connections,
    loading,
    loadProject,
    saveProject,
    addComponent,
    addConnection,
  } = useProject();

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [connectionStart, setConnectionStart] = useState<{
    componentId: string;
    pin: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const selectedComponent = components.find(
    (c) => c.id === selectedComponentId
  );

  const handleAddComponent = async (componentType: string) => {
    const newComponent: Omit<Component, 'id' | 'createdAt'> = {
      projectId: project!.id,
      componentType,
      label: componentType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
      rotation: 0,
      properties: { state: false },
      aiGenerated: false,
    };

    try {
      await addComponent(newComponent);
    } catch (error) {
      console.error('Failed to add component:', error);
    }
  };

  const handleComponentMove = async (id: string, x: number, y: number) => {
    const component = components.find((c) => c.id === id);
    if (component) {
      Object.assign(component, { x, y });
    }
  };

  const handleConnectionPointClick = async (componentId: string, pin: string) => {
    if (!connectionStart) {
      setConnectionStart({ componentId, pin });
    } else if (
      connectionStart.componentId !== componentId ||
      connectionStart.pin !== pin
    ) {
      try {
        await addConnection({
          projectId: project!.id,
          fromComponentId: connectionStart.componentId,
          fromPin: connectionStart.pin,
          toComponentId: componentId,
          toPin: pin,
          connectionType: 'wire',
          aiGenerated: false,
        });
        setConnectionStart(null);
      } catch (error) {
        console.error('Failed to add connection:', error);
      }
    } else {
      setConnectionStart(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProject();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-1 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-white">{project.name}</h1>
          <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
            {project.project_type}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-hidden">
        <div className="col-span-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ComponentPalette onAddComponent={handleAddComponent} />
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Canvas
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              onComponentMove={handleComponentMove}
              isDrawingConnection={!!connectionStart}
              connectionStart={connectionStart}
              onConnectionPointClick={handleConnectionPointClick}
            />
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-4 overflow-hidden">
          <div className="h-1/3 overflow-hidden">
            <PropertyPanel selectedComponent={selectedComponent || null} />
          </div>
          <div className="h-1/3 overflow-hidden">
            <SimulationPanel />
          </div>
          <div className="h-1/3 overflow-hidden">
            <AIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}
