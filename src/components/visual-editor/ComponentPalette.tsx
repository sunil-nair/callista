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
    <div className="w-64 border-r bg-card h-full overflow-y-auto">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="text-sm font-semibold">Components</h3>
        <p className="text-xs text-muted-foreground mt-1">Drag or click to add</p>
      </div>
      <div className="p-3 space-y-2">
        {components.map((component) => (
          <Card
            key={component.type}
            className="p-3 cursor-pointer hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
            onClick={() => onAddElement(component.type)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <component.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{component.label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
