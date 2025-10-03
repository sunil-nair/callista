import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TemplateElement } from "@/types/template";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { availableFonts } from "@/lib/fonts";

interface PropertiesPanelProps {
  selectedElement: TemplateElement | null;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  onDeleteElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

export const PropertiesPanel = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onBringForward,
  onSendBackward,
}: PropertiesPanelProps) => {
  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-card p-4">
        <p className="text-sm text-muted-foreground">Select an element to edit its properties</p>
      </div>
    );
  }

  const handleStyleUpdate = (key: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      style: { ...selectedElement.style, [key]: value },
    } as any);
  };

  return (
    <div className="w-80 border-l bg-card p-4 overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Properties</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBringForward(selectedElement.id)}
              title="Bring Forward"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSendBackward(selectedElement.id)}
              title="Send Backward"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteElement(selectedElement.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Position & Size */}
        <div className="space-y-2">
          <Label className="text-xs">Position & Size</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x" className="text-xs text-muted-foreground">X</Label>
              <Input
                id="x"
                type="number"
                value={selectedElement.position.x}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    position: { ...selectedElement.position, x: parseInt(e.target.value) },
                  })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="y" className="text-xs text-muted-foreground">Y</Label>
              <Input
                id="y"
                type="number"
                value={selectedElement.position.y}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    position: { ...selectedElement.position, y: parseInt(e.target.value) },
                  })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
              <Input
                id="width"
                type="number"
                value={selectedElement.size.width}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    size: { ...selectedElement.size, width: parseInt(e.target.value) },
                  })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
              <Input
                id="height"
                type="number"
                value={selectedElement.size.height}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, {
                    size: { ...selectedElement.size, height: parseInt(e.target.value) },
                  })
                }
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Text Element Properties */}
        {selectedElement.type === 'text' && (
          <>
            <div>
              <Label htmlFor="content" className="text-xs">Content</Label>
              <Textarea
                id="content"
                value={selectedElement.content}
                onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value } as any)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={selectedElement.style.fontSize}
                onChange={(e) => handleStyleUpdate('fontSize', parseInt(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fontWeight" className="text-xs">Font Weight</Label>
              <Select value={selectedElement.style.fontWeight} onValueChange={(v) => handleStyleUpdate('fontWeight', v)}>
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="400">Normal</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semibold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color" className="text-xs">Color</Label>
              <Input
                id="color"
                type="color"
                value={selectedElement.style.color}
                onChange={(e) => handleStyleUpdate('color', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="textAlign" className="text-xs">Text Align</Label>
              <Select value={selectedElement.style.textAlign} onValueChange={(v) => handleStyleUpdate('textAlign', v)}>
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontFamily" className="text-xs">Font Family</Label>
              <Select 
                value={selectedElement.style.fontFamily || 'Inter, sans-serif'} 
                onValueChange={(v) => handleStyleUpdate('fontFamily', v)}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50 max-h-[300px]">
                  {availableFonts.map((font) => (
                    <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Image Element Properties */}
        {selectedElement.type === 'image' && (
          <>
            <div>
              <Label htmlFor="src" className="text-xs">Image URL</Label>
              <Input
                id="src"
                value={selectedElement.src}
                onChange={(e) => onUpdateElement(selectedElement.id, { src: e.target.value } as any)}
                className="h-8 mt-1"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="alt" className="text-xs">Alt Text</Label>
              <Input
                id="alt"
                value={selectedElement.alt}
                onChange={(e) => onUpdateElement(selectedElement.id, { alt: e.target.value } as any)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="borderRadius" className="text-xs">Border Radius</Label>
              <Input
                id="borderRadius"
                type="number"
                value={selectedElement.style.borderRadius}
                onChange={(e) => handleStyleUpdate('borderRadius', parseInt(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
          </>
        )}

        {/* Shape Element Properties */}
        {selectedElement.type === 'shape' && (
          <>
            <div>
              <Label htmlFor="shapeType" className="text-xs">Shape Type</Label>
              <Select value={selectedElement.shapeType} onValueChange={(v) => onUpdateElement(selectedElement.id, { shapeType: v } as any)}>
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={selectedElement.style.backgroundColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
              <Input
                id="borderColor"
                type="color"
                value={selectedElement.style.borderColor}
                onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="borderWidth" className="text-xs">Border Width</Label>
              <Input
                id="borderWidth"
                type="number"
                value={selectedElement.style.borderWidth}
                onChange={(e) => handleStyleUpdate('borderWidth', parseInt(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
          </>
        )}

        {/* Button Element Properties */}
        {selectedElement.type === 'button' && (
          <>
            <div>
              <Label htmlFor="text" className="text-xs">Button Text</Label>
              <Input
                id="text"
                value={selectedElement.text}
                onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value } as any)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="href" className="text-xs">Link URL</Label>
              <Input
                id="href"
                value={selectedElement.href}
                onChange={(e) => onUpdateElement(selectedElement.id, { href: e.target.value } as any)}
                className="h-8 mt-1"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="bgColor" className="text-xs">Background Color</Label>
              <Input
                id="bgColor"
                type="color"
                value={selectedElement.style.backgroundColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="textColor" className="text-xs">Text Color</Label>
              <Input
                id="textColor"
                type="color"
                value={selectedElement.style.color}
                onChange={(e) => handleStyleUpdate('color', e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="btnBorderRadius" className="text-xs">Border Radius</Label>
              <Input
                id="btnBorderRadius"
                type="number"
                value={selectedElement.style.borderRadius}
                onChange={(e) => handleStyleUpdate('borderRadius', parseInt(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
