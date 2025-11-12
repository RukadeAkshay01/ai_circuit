import { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { runSimulation, SimulationState } from '../utils/simulation';
import { Play } from 'lucide-react';

export function SimulationPanel() {
  const { components, connections } = useProject();
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<SimulationState[]>([]);
  const [speed, setSpeed] = useState(1);

  const handleRunSimulation = () => {
    setSimulating(true);
    setResults([]);

    try {
      const iterations = Math.max(50, 200 / speed);
      const simulationResults = runSimulation(components, connections, iterations);
      setResults(simulationResults);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setSimulating(false);
    }
  };

  const renderResults = () => {
    if (results.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            Run simulation to see results
          </p>
        </div>
      );
    }

    const lastResult = results[results.length - 1];

    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {components.map((comp) => {
          const output = lastResult[comp.id];
          if (!output) return null;

          return (
            <div
              key={comp.id}
              className="bg-slate-700/50 border border-slate-600 rounded p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-white text-sm">{comp.label}</p>
                  <p className="text-xs text-slate-400">{comp.componentType}</p>
                </div>
                {comp.componentType === 'led' && output.outputs.BRIGHTNESS !== undefined && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-amber-400"
                    style={{
                      backgroundColor: `rgba(255, 193, 7, ${
                        (output.outputs.BRIGHTNESS as number) || 0
                      })`,
                    }}
                  />
                )}
              </div>

              {Object.entries(output.outputs).length > 0 && (
                <div className="text-xs text-slate-300 space-y-1">
                  {Object.entries(output.outputs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-mono font-medium">
                        {typeof value === 'boolean'
                          ? value ? '1' : '0'
                          : (value as number).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col h-full">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
        <h2 className="font-semibold text-white">Simulation</h2>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Simulation Speed
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-slate-400 mt-1">{speed}x</p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={simulating || components.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          {simulating ? 'Running...' : 'Run Simulation'}
        </button>

        <div className="flex-1 overflow-hidden">
          {renderResults()}
        </div>
      </div>
    </div>
  );
}
