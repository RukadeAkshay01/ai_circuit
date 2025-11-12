import { COMPONENT_LIBRARY } from '../utils/simulation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ComponentPaletteProps {
  onAddComponent: (componentType: string) => void;
}

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('logic');

  const categories = Array.from(
    new Set(COMPONENT_LIBRARY.map((c) => c.category))
  );

  const getComponentsByCategory = (category: string) => {
    return COMPONENT_LIBRARY.filter((c) => c.category === category);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
        <h2 className="font-semibold text-white">Components</h2>
      </div>

      <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <div key={category}>
            <button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category ? null : category
                )
              }
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-300 capitalize">
                {category}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedCategory === category ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedCategory === category && (
              <div className="bg-slate-900/50 border-t border-slate-700">
                {getComponentsByCategory(category).map((comp) => (
                  <button
                    key={comp.componentType}
                    onClick={() => onAddComponent(comp.componentType)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-blue-600/20 hover:text-white transition-colors border-b border-slate-700/50 last:border-b-0"
                  >
                    <div className="font-medium">{comp.name}</div>
                    <div className="text-xs text-slate-500">{comp.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
