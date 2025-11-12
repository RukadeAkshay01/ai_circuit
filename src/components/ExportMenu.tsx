import { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { Download, FileJson, FileCode, Image } from 'lucide-react';

export function ExportMenu() {
  const { project, components, connections } = useProject();
  const [showMenu, setShowMenu] = useState(false);

  const exportAsJSON = () => {
    if (!project) return;

    const data = {
      project: {
        name: project.name,
        description: project.description,
        type: project.project_type,
      },
      components,
      connections,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCircuitNetlist = () => {
    if (!project) return;

    let netlist = `* Circuit Netlist - ${project.name}\n* Exported from AI Visual Builder\n\n`;

    components.forEach((comp) => {
      switch (comp.componentType) {
        case 'resistor':
          netlist += `R${comp.label} N1 N2 ${comp.properties.resistance || 1000}\n`;
          break;
        case 'capacitor':
          netlist += `C${comp.label} N1 N2 ${comp.properties.capacitance || 1e-6}\n`;
          break;
        case 'led':
          netlist += `D${comp.label} N1 N2 LED\n`;
          break;
        default:
          break;
      }
    });

    netlist += '\n.end\n';

    const blob = new Blob([netlist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '_')}.cir`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsSVG = () => {
    if (!project) return;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800" viewBox="0 0 1000 800">
      <defs>
        <style>
          .component-box { fill: #475569; stroke: #64748b; stroke-width: 2; }
          .component-text { fill: #e2e8f0; font-size: 12px; text-anchor: middle; }
          .connection { stroke: #64748b; stroke-width: 2; fill: none; }
          .pin { fill: #0ea5e9; stroke: #06b6d4; stroke-width: 1; }
        </style>
      </defs>
      <rect width="1000" height="800" fill="#0f172a" />
      `;

    connections.forEach((conn) => {
      const fromComp = components.find((c) => c.id === conn.fromComponentId);
      const toComp = components.find((c) => c.id === conn.toComponentId);

      if (fromComp && toComp) {
        const x1 = fromComp.x + 80;
        const y1 = fromComp.y + 30;
        const x2 = toComp.x;
        const y2 = toComp.y + 30;

        svg += `<path class="connection" d="M ${x1} ${y1} L ${(x1 + x2) / 2} ${y1} L ${(x1 + x2) / 2} ${y2} L ${x2} ${y2}" />\n`;
      }
    });

    components.forEach((comp) => {
      svg += `<rect class="component-box" x="${comp.x}" y="${comp.y}" width="80" height="60" rx="4" />\n`;
      svg += `<text class="component-text" x="${comp.x + 40}" y="${comp.y + 35}">${comp.label}</text>\n`;
    });

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '_')}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
          <button
            onClick={exportAsJSON}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-left text-white border-b border-slate-700 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            <div>
              <div className="font-medium">JSON</div>
              <div className="text-xs text-slate-400">Full project data</div>
            </div>
          </button>

          <button
            onClick={exportAsCircuitNetlist}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-left text-white border-b border-slate-700 transition-colors"
          >
            <FileCode className="w-4 h-4" />
            <div>
              <div className="font-medium">Netlist</div>
              <div className="text-xs text-slate-400">SPICE format</div>
            </div>
          </button>

          <button
            onClick={exportAsSVG}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-left text-white transition-colors"
          >
            <Image className="w-4 h-4" />
            <div>
              <div className="font-medium">SVG</div>
              <div className="text-xs text-slate-400">Schematic image</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
