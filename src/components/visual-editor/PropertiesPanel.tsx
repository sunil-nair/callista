import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateElement } from "@/types/template";
import { Trash2, ArrowUp, ArrowDown, AtSign, Type, Image as ImageIcon, Square, MousePointer, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { availableFonts } from "@/lib/fonts";
import { toast } from "sonner";

interface PropertiesPanelProps {
  selectedElement: TemplateElement | null;
  allElements: TemplateElement[];
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  onDeleteElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

export const PropertiesPanel = ({
  selectedElement,
  allElements,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onBringForward,
  onSendBackward,
}: PropertiesPanelProps) => {
  const [showPlaceholderInput, setShowPlaceholderInput] = useState(false);
  const [placeholderName, setPlaceholderName] = useState("");

  const handleStyleUpdate = (key: string, value: any) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      style: { ...selectedElement.style, [key]: value },
    } as any);
  };

  const handleInsertPlaceholder = () => {
    if (!placeholderName.trim()) {
      toast.error("Please enter a placeholder name");
      return;
    }

    if (selectedElement && selectedElement.type === 'text') {
      const currentContent = selectedElement.content || "";
      const placeholder = `{{${placeholderName}}}`;
      onUpdateElement(selectedElement.id, {
        content: currentContent + placeholder,
      } as any);
      setPlaceholderName("");
      setShowPlaceholderInput(false);
      toast.success("Placeholder inserted");
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-3.5 w-3.5" />;
      case 'image': return <ImageIcon className="h-3.5 w-3.5" />;
      case 'shape': return <Square className="h-3.5 w-3.5" />;
      case 'button': return <MousePointer className="h-3.5 w-3.5" />;
    }
  };

  const getElementLabel = (element: TemplateElement) => {
    switch (element.type) {
      case 'text': return element.content.substring(0, 20) + (element.content.length > 20 ? '...' : '');
      case 'image': return 'Image';
      case 'shape': return element.shapeType === 'circle' ? 'Circle' : 'Rectangle';
      case 'button': return element.text;
    }
  };

  const getElementTypeLabel = () => {
    if (!selectedElement) return '';
    switch (selectedElement.type) {
      case 'text': return 'Text';
      case 'image': return 'Image';
      case 'shape': return selectedElement.shapeType === 'circle' ? 'Circle' : 'Rectangle';
      case 'button': return 'Button';
    }
  };

  return (
    <div className="w-80 border-l bg-card flex flex-col h-full overflow-hidden">
      {/* Components List */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Components</h3>
          <Badge variant="secondary" className="ml-auto">{allElements.length}</Badge>
        </div>
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {allElements.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No components yet</p>
            ) : (
              allElements
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((element) => (
                  <button
                    key={element.id}
                    onClick={() => onSelectElement(element.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                      selectedElement?.id === element.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {getElementIcon(element.type)}
                    <span className="flex-1 truncate">{getElementLabel(element)}</span>
                    <span className="text-[10px] opacity-60">z:{element.zIndex}</span>
                  </button>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {!selectedElement ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <AtSign className="h-6 w-6 text-primary/50" />
              </div>
              <h3 className="font-semibold text-sm">No Element Selected</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select a component above to edit
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Element Type Badge */}
              <div className="flex items-center justify-between pb-3 border-b">
                <Badge variant="secondary" className="gap-1.5">
                  {getElementIcon(selectedElement.type)}
                  <span className="font-medium">{getElementTypeLabel()}</span>
                </Badge>
              </div>
        
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
              <div className="mt-2">
                {!showPlaceholderInput ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowPlaceholderInput(true)}
                  >
                    <AtSign className="h-4 w-4 mr-2" />
                    Insert Placeholder
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="name"
                      value={placeholderName}
                      onChange={(e) => setPlaceholderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInsertPlaceholder();
                        if (e.key === "Escape") {
                          setShowPlaceholderInput(false);
                          setPlaceholderName("");
                        }
                      }}
                      className="h-8"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleInsertPlaceholder}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
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
              <Label htmlFor="objectPosition" className="text-xs">Object Position</Label>
              <Select 
                value={selectedElement.style.objectPosition || 'center'} 
                onValueChange={(v) => handleStyleUpdate('objectPosition', v)}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top left">Top Left</SelectItem>
                  <SelectItem value="top right">Top Right</SelectItem>
                  <SelectItem value="bottom left">Bottom Left</SelectItem>
                  <SelectItem value="bottom right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
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
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
