import { Type, Image, Square, MousePointer2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ComponentPaletteProps {
  onAddElement: (type: 'text' | 'image' | 'shape' | 'button') => void;
}

export const ComponentPalette = ({ onAddElement }: ComponentPaletteProps) => {
  const components = [
    { type: 'text' as const, icon: Type, label: 'Text' },
    { type: 'image' as const, icon: Image, label: 'Image' },
    { type: 'shape' as const, icon: Square, label: 'Shape' },
    { type: 'button' as const, icon: MousePointer2, label: 'Button' },
  ];

  return (
    <div className="w-64 border-r bg-card p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4">Components</h3>
      <div className="space-y-2">
        {components.map((component) => (
          <Card
            key={component.type}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onAddElement(component.type)}
          >
            <div className="flex items-center gap-3">
              <component.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{component.label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
