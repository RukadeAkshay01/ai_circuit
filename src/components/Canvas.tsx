import { useRef, useEffect, useState, MouseEvent } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { Component, Connection } from '../types';

interface CanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onComponentMove: (id: string, x: number, y: number) => void;
  isDrawingConnection: boolean;
  connectionStart: { componentId: string; pin: string } | null;
  onConnectionPointClick: (componentId: string, pin: string) => void;
}

export function Canvas({
  selectedComponentId,
  onSelectComponent,
  onComponentMove,
  isDrawingConnection,
  connectionStart,
  onConnectionPointClick,
}: CanvasProps) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const { components, connections } = useProject();
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const component = components.find(
      (c) =>
        x >= c.x &&
        x <= c.x + 80 &&
        y >= c.y &&
        y <= c.y + 60
    );

    if (component) {
      setDraggingComponentId(component.id);
      setDragOffset({
        x: x - component.x,
        y: y - component.y,
      });
      onSelectComponent(component.id);
    } else {
      onSelectComponent(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingComponentId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    onComponentMove(draggingComponentId, Math.max(0, x), Math.max(0, y));
  };

  const handleMouseUp = () => {
    setDraggingComponentId(null);
  };

  const renderComponent = (comp: Component) => {
    const isSelected = selectedComponentId === comp.id;
    const width = 80;
    const height = 60;

    return (
      <g key={comp.id}>
        <rect
          x={comp.x}
          y={comp.y}
          width={width}
          height={height}
          fill={comp.aiGenerated ? '#3b82f640' : '#475569'}
          stroke={isSelected ? '#3b82f6' : '#64748b'}
          strokeWidth="2"
          rx="4"
          style={{ cursor: 'move' }}
        />

        <text
          x={comp.x + width / 2}
          y={comp.y + height / 2 + 5}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="12"
          pointerEvents="none"
        >
          {comp.label}
        </text>

        {/* Input pins */}
        {['A', 'B', 'IN', 'OUT', 'ANODE', 'CATHODE'].slice(0, 2).map((pin, idx) => (
          <circle
            key={`pin-${pin}`}
            cx={comp.x}
            cy={comp.y + 15 + idx * 30}
            r="4"
            fill="#0ea5e9"
            stroke="#06b6d4"
            strokeWidth="1"
            style={{ cursor: 'crosshair' }}
            onClick={() => onConnectionPointClick(comp.id, pin)}
          />
        ))}

        {/* Output pin */}
        <circle
          cx={comp.x + width}
          cy={comp.y + height / 2}
          r="4"
          fill="#10b981"
          stroke="#059669"
          strokeWidth="1"
          style={{ cursor: 'crosshair' }}
          onClick={() => onConnectionPointClick(comp.id, 'OUT')}
        />
      </g>
    );
  };

  const renderConnection = (conn: Connection) => {
    const fromComp = components.find((c) => c.id === conn.fromComponentId);
    const toComp = components.find((c) => c.id === conn.toComponentId);

    if (!fromComp || !toComp) return null;

    const x1 = fromComp.x + 80;
    const y1 = fromComp.y + 30;
    const x2 = toComp.x;
    const y2 = toComp.y + 30;

    return (
      <path
        key={conn.id}
        d={`M ${x1} ${y1} L ${(x1 + x2) / 2} ${y1} L ${(x1 + x2) / 2} ${y2} L ${x2} ${y2}`}
        stroke={conn.aiGenerated ? '#3b82f6' : '#64748b'}
        strokeWidth="2"
        fill="none"
        pointerEvents="none"
      />
    );
  };

  return (
    <svg
      ref={canvasRef}
      className="w-full h-full bg-slate-900 border border-slate-700 rounded-lg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid)" />

      {connections.map(renderConnection)}
      {components.map(renderComponent)}
    </svg>
  );
}
