import { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { Sparkles, Send } from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const { project, addComponent, addConnection } = useProject();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !project) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const responseText = generateAIResponse(input);

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (responseText.includes('Adding')) {
        const components = parseComponentsFromResponse(responseText);
        for (const comp of components) {
          await addComponent(comp);
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('and gate')) {
      return 'Adding AND gate components to your circuit. This creates a logical AND operation with two inputs.';
    } else if (lowerPrompt.includes('or gate')) {
      return 'Adding OR gate components. This will perform a logical OR operation on the inputs.';
    } else if (lowerPrompt.includes('led')) {
      return 'Adding LED component for visual output. You can control its brightness by connecting a signal to it.';
    } else if (lowerPrompt.includes('button') || lowerPrompt.includes('switch')) {
      return 'Adding input control component. This allows you to toggle signals in your circuit.';
    } else if (lowerPrompt.includes('counter')) {
      return 'To create a counter, I recommend connecting AND gates with feedback loops. A 4-bit counter would need 4 flip-flops and logic gates.';
    } else {
      return `Understood! To implement "${prompt}", you might want to:\n1. Add necessary input components\n2. Connect them with logic gates\n3. Add output indicators\n\nTry dragging components from the palette to get started!`;
    }
  };

  const parseComponentsFromResponse = (response: string): any[] => {
    const components = [];

    if (response.includes('AND gate')) {
      components.push({
        projectId: project!.id,
        componentType: 'and_gate',
        label: `AND${Math.random()}`,
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
        rotation: 0,
        properties: {},
        aiGenerated: true,
      });
    }

    return components;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col h-full">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h2 className="font-semibold text-white">AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              Ask me to add components or design patterns!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg bg-slate-700 text-slate-400 text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-slate-700 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add AND gate, create LED, ..."
            disabled={loading}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
