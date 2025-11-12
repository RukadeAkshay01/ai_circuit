import { Component } from '../types';
import { useProject } from '../contexts/ProjectContext';

interface PropertyPanelProps {
  selectedComponent: Component | null;
}

export function PropertyPanel({ selectedComponent }: PropertyPanelProps) {
  const { updateComponent, deleteComponent } = useProject();

  if (!selectedComponent) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-sm">Select a component to edit</p>
      </div>
    );
  }

  const handleLabelChange = (label: string) => {
    updateComponent(selectedComponent.id, { label });
  };

  const handlePropertyChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      properties: {
        ...selectedComponent.properties,
        [key]: value,
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm('Delete this component?')) {
      deleteComponent(selectedComponent.id);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
        <h2 className="font-semibold text-white">Properties</h2>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Component Type
          </label>
          <input
            type="text"
            disabled
            value={selectedComponent.componentType}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={selectedComponent.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              X
            </label>
            <input
              type="number"
              value={Math.round(selectedComponent.x)}
              onChange={(e) =>
                updateComponent(selectedComponent.id, {
                  x: parseFloat(e.target.value),
                })
              }
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Y
            </label>
            <input
              type="number"
              value={Math.round(selectedComponent.y)}
              onChange={(e) =>
                updateComponent(selectedComponent.id, {
                  y: parseFloat(e.target.value),
                })
              }
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {selectedComponent.componentType === 'resistor' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Resistance (Ω)
            </label>
            <input
              type="number"
              value={
                selectedComponent.properties.resistance || 1000
              }
              onChange={(e) =>
                handlePropertyChange('resistance', parseFloat(e.target.value))
              }
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {selectedComponent.componentType === 'capacitor' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Capacitance (F)
            </label>
            <input
              type="number"
              value={
                selectedComponent.properties.capacitance || 1e-6
              }
              onChange={(e) =>
                handlePropertyChange('capacitance', parseFloat(e.target.value))
              }
              step="1e-9"
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {(selectedComponent.componentType === 'button' ||
          selectedComponent.componentType === 'switch') && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedComponent.properties.state || false}
                onChange={(e) =>
                  handlePropertyChange('state', e.target.checked)
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-300">Active</span>
            </label>
          </div>
        )}

        {selectedComponent.componentType === 'led' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Color
            </label>
            <select
              value={selectedComponent.properties.color || 'red'}
              onChange={(e) =>
                handlePropertyChange('color', e.target.value)
              }
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="yellow">Yellow</option>
            </select>
          </div>
        )}

        <button
          onClick={handleDelete}
          className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium rounded text-sm transition-colors"
        >
          Delete Component
        </button>
      </div>
    </div>
  );
}
