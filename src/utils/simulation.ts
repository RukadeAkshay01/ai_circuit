import { Component, Connection } from '../types';

export interface SimulationState {
  [componentId: string]: {
    value: number | boolean;
    outputs: Record<string, number | boolean>;
  };
}

export const COMPONENT_LIBRARY = [
  {
    name: 'AND Gate',
    category: 'logic',
    componentType: 'and_gate',
    description: 'Logical AND gate',
    defaultProperties: { label: 'AND1' },
    pins: [
      { name: 'A', type: 'input' },
      { name: 'B', type: 'input' },
      { name: 'OUT', type: 'output' },
    ],
  },
  {
    name: 'OR Gate',
    category: 'logic',
    componentType: 'or_gate',
    description: 'Logical OR gate',
    defaultProperties: { label: 'OR1' },
    pins: [
      { name: 'A', type: 'input' },
      { name: 'B', type: 'input' },
      { name: 'OUT', type: 'output' },
    ],
  },
  {
    name: 'NOT Gate',
    category: 'logic',
    componentType: 'not_gate',
    description: 'Logical NOT gate',
    defaultProperties: { label: 'NOT1' },
    pins: [
      { name: 'IN', type: 'input' },
      { name: 'OUT', type: 'output' },
    ],
  },
  {
    name: 'LED',
    category: 'output',
    componentType: 'led',
    description: 'Light Emitting Diode',
    defaultProperties: { label: 'LED1', color: 'red', brightness: 0 },
    pins: [
      { name: 'ANODE', type: 'input' },
      { name: 'CATHODE', type: 'input' },
    ],
  },
  {
    name: 'Button',
    category: 'input',
    componentType: 'button',
    description: 'Momentary push button',
    defaultProperties: { label: 'BTN1', state: false },
    pins: [
      { name: 'OUT', type: 'output' },
    ],
  },
  {
    name: 'Switch',
    category: 'input',
    componentType: 'switch',
    description: 'Toggle switch',
    defaultProperties: { label: 'SW1', state: false },
    pins: [
      { name: 'OUT', type: 'output' },
    ],
  },
  {
    name: 'Resistor',
    category: 'passive',
    componentType: 'resistor',
    description: 'Resistor',
    defaultProperties: { label: 'R1', resistance: 1000 },
    pins: [
      { name: 'A', type: 'inout' },
      { name: 'B', type: 'inout' },
    ],
  },
  {
    name: 'Capacitor',
    category: 'passive',
    componentType: 'capacitor',
    description: 'Capacitor',
    defaultProperties: { label: 'C1', capacitance: 1e-6 },
    pins: [
      { name: 'A', type: 'inout' },
      { name: 'B', type: 'inout' },
    ],
  },
  {
    name: 'Text Label',
    category: 'annotation',
    componentType: 'text_label',
    description: 'Text annotation',
    defaultProperties: { label: 'Label', fontSize: 14, color: 'black' },
    pins: [],
  },
];

export function runSimulation(
  components: Component[],
  connections: Connection[],
  iterations: number = 100
): SimulationState[] {
  const states: SimulationState[] = [];
  let currentState: SimulationState = {};

  components.forEach((comp) => {
    currentState[comp.id] = {
      value: comp.properties.state || 0,
      outputs: {},
    };
  });

  for (let i = 0; i < iterations; i++) {
    const newState: SimulationState = { ...currentState };

    components.forEach((comp) => {
      const outputs: Record<string, number | boolean> = {};

      switch (comp.componentType) {
        case 'and_gate': {
          const inputConnections = connections.filter(
            (c) => c.toComponentId === comp.id
          );
          let a = false;
          let b = false;

          inputConnections.forEach((conn) => {
            const source = currentState[conn.fromComponentId];
            if (source) {
              if (conn.toPin === 'A') a = !!source.value;
              if (conn.toPin === 'B') b = !!source.value;
            }
          });

          outputs['OUT'] = a && b;
          break;
        }

        case 'or_gate': {
          const inputConnections = connections.filter(
            (c) => c.toComponentId === comp.id
          );
          let a = false;
          let b = false;

          inputConnections.forEach((conn) => {
            const source = currentState[conn.fromComponentId];
            if (source) {
              if (conn.toPin === 'A') a = !!source.value;
              if (conn.toPin === 'B') b = !!source.value;
            }
          });

          outputs['OUT'] = a || b;
          break;
        }

        case 'not_gate': {
          const inputConnection = connections.find(
            (c) => c.toComponentId === comp.id && c.toPin === 'IN'
          );
          let input = false;

          if (inputConnection) {
            const source = currentState[inputConnection.fromComponentId];
            if (source) input = !!source.value;
          }

          outputs['OUT'] = !input;
          break;
        }

        case 'button':
        case 'switch': {
          outputs['OUT'] = comp.properties.state || false;
          break;
        }

        case 'led': {
          const inputConnections = connections.filter(
            (c) => c.toComponentId === comp.id
          );
          let voltage = 0;

          inputConnections.forEach((conn) => {
            const source = currentState[conn.fromComponentId];
            if (source && source.outputs[conn.fromPin]) {
              voltage += source.outputs[conn.fromPin] as number;
            }
          });

          outputs['BRIGHTNESS'] = Math.max(0, Math.min(1, voltage / 5));
          break;
        }

        default:
          break;
      }

      newState[comp.id] = {
        value: newState[comp.id]?.value || 0,
        outputs,
      };
    });

    currentState = newState;
    states.push({ ...newState });
  }

  return states;
}

export function getComponentSimulationOutput(
  componentId: string,
  state: SimulationState
): Record<string, number | boolean> {
  return state[componentId]?.outputs || {};
}
