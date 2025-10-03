import { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Save, ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react";
import { ComponentPalette } from "./ComponentPalette";
import { PropertiesPanel } from "./PropertiesPanel";
import { PlaceholderText } from "./PlaceholderText";
import { TemplateElement, EmailTemplate } from "@/types/template";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface VisualEditorProps {
  initialName?: string;
  initialTemplate?: EmailTemplate;
  onSave: (name: string, template: EmailTemplate, html: string) => void;
  onPreview?: (name: string, html: string) => void;
}

const defaultTemplate: EmailTemplate = {
  elements: [],
  canvasSize: { width: 375, height: 667 }, // iPhone mobile size
};

export const VisualEditor = ({
  initialName = "",
  initialTemplate = defaultTemplate,
  onSave,
  onPreview,
}: VisualEditorProps) => {
  const [templateName, setTemplateName] = useState(initialName);
  const [template, setTemplate] = useState<EmailTemplate>(initialTemplate);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [showComponentPanel, setShowComponentPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const canvasSizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 },
  };

  const selectedElement = template.elements.find((el) => el.id === selectedElementId) || null;

  const handleAddElement = (type: 'text' | 'image' | 'shape' | 'button') => {
    let newElement: TemplateElement;

    if (type === 'text') {
      newElement = {
        id: uuidv4(),
        type: 'text',
        position: { x: 50, y: 50 },
        size: { width: 200, height: 50 },
        zIndex: template.elements.length,
        content: 'Enter text here',
        style: {
          fontSize: 16,
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          fontFamily: 'Inter, sans-serif',
        },
      };
    } else if (type === 'image') {
      newElement = {
        id: uuidv4(),
        type: 'image',
        position: { x: 50, y: 50 },
        size: { width: 200, height: 100 },
        zIndex: template.elements.length,
        src: 'https://via.placeholder.com/200x100',
        alt: 'Image',
        style: {
          objectFit: 'contain',
          borderRadius: 0,
        },
      };
    } else if (type === 'shape') {
      newElement = {
        id: uuidv4(),
        type: 'shape',
        position: { x: 50, y: 50 },
        size: { width: 200, height: 100 },
        zIndex: template.elements.length,
        shapeType: 'rectangle',
        style: {
          backgroundColor: '#e5e7eb',
          borderColor: '#000000',
          borderWidth: 2,
          borderRadius: 0,
        },
      };
    } else {
      newElement = {
        id: uuidv4(),
        type: 'button',
        position: { x: 50, y: 50 },
        size: { width: 200, height: 100 },
        zIndex: template.elements.length,
        text: 'Click me',
        href: 'https://example.com',
        style: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          fontSize: 16,
          borderRadius: 8,
          paddingX: 24,
          paddingY: 12,
        },
      };
    }

    setTemplate((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElementId(newElement.id);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} element added`);
  };

  const handleUpdateElement = (id: string, updates: Partial<TemplateElement>) => {
    setTemplate((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id === id) {
          return { ...el, ...updates } as TemplateElement;
        }
        return el;
      }),
    }));
  };

  const handleDeleteElement = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    setSelectedElementId(null);
    toast.success("Element deleted");
  };

  const handleBringForward = (id: string) => {
    setTemplate((prev) => {
      const element = prev.elements.find((el) => el.id === id);
      if (!element) return prev;

      const maxZIndex = Math.max(...prev.elements.map((el) => el.zIndex));
      if (element.zIndex === maxZIndex) return prev;

      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, zIndex: el.zIndex + 1 } : el
        ),
      };
    });
  };

  const handleSendBackward = (id: string) => {
    setTemplate((prev) => {
      const element = prev.elements.find((el) => el.id === id);
      if (!element || element.zIndex === 0) return prev;

      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, zIndex: el.zIndex - 1 } : el
        ),
      };
    });
  };

  const generateHTML = (): string => {
    const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);
    
    const elementsHTML = sortedElements.map((el) => {
      const style = `position: absolute; left: ${el.position.x}px; top: ${el.position.y}px; width: ${el.size.width}px; height: ${el.size.height}px;`;
      
      if (el.type === 'text') {
        const fontFamily = el.style.fontFamily || 'Inter, sans-serif';
        return `<div style="${style} font-size: ${el.style.fontSize}px; font-weight: ${el.style.fontWeight}; color: ${el.style.color}; text-align: ${el.style.textAlign}; font-family: ${fontFamily};">${el.content}</div>`;
      }
      
      if (el.type === 'image') {
        return `<img src="${el.src}" alt="${el.alt}" style="${style} object-fit: ${el.style.objectFit}; border-radius: ${el.style.borderRadius}px;" />`;
      }
      
      if (el.type === 'shape') {
        const shapeStyle = el.shapeType === 'circle' 
          ? `${style} background-color: ${el.style.backgroundColor}; border: ${el.style.borderWidth}px solid ${el.style.borderColor}; border-radius: 50%;`
          : `${style} background-color: ${el.style.backgroundColor}; border: ${el.style.borderWidth}px solid ${el.style.borderColor}; border-radius: ${el.style.borderRadius}px;`;
        return `<div style="${shapeStyle}"></div>`;
      }
      
      if (el.type === 'button') {
        return `<a href="${el.href}" style="${style} display: flex; align-items: center; justify-content: center; background-color: ${el.style.backgroundColor}; color: ${el.style.color}; font-size: ${el.style.fontSize}px; border-radius: ${el.style.borderRadius}px; text-decoration: none; padding: ${el.style.paddingY}px ${el.style.paddingX}px;">${el.text}</a>`;
      }
      
      return '';
    }).join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0;">
  <div style="position: relative; width: ${template.canvasSize.width}px; height: ${template.canvasSize.height}px; margin: 0 auto; background-color: #ffffff;">
    ${elementsHTML}
  </div>
</body>
</html>`;
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const html = generateHTML();
    onSave(templateName, template, html);
  };

  const handlePreview = () => {
    if (onPreview) {
      const html = generateHTML();
      onPreview(templateName || "Untitled Template", html);
    }
  };

  const handleCanvasSizeChange = (size: 'mobile' | 'tablet' | 'desktop') => {
    setCanvasSize(size);
    setTemplate((prev) => ({
      ...prev,
      canvasSize: canvasSizes[size],
    }));
  };

  const renderElement = (element: TemplateElement) => {
    const isSelected = element.id === selectedElementId;
    
    return (
      <Rnd
        key={element.id}
        position={element.position}
        size={element.size}
        onDragStop={(e, d) => {
          handleUpdateElement(element.id, {
            position: { x: d.x, y: d.y },
          });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          handleUpdateElement(element.id, {
            size: {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            },
            position,
          });
        }}
        bounds="parent"
        style={{ zIndex: element.zIndex }}
        className={`cursor-move ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={() => setSelectedElementId(element.id)}
      >
        <div className="w-full h-full">
          {element.type === 'text' && (
            <PlaceholderText
              content={element.content}
              style={{
                fontSize: element.style.fontSize,
                fontWeight: element.style.fontWeight,
                color: element.style.color,
                textAlign: element.style.textAlign,
                fontFamily: element.style.fontFamily || 'Inter, sans-serif',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            />
          )}
          
          {element.type === 'image' && (
            <img
              src={element.src}
              alt={element.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: element.style.objectFit,
                borderRadius: element.style.borderRadius,
              }}
            />
          )}
          
          {element.type === 'shape' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: element.style.backgroundColor,
                border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
                borderRadius: element.shapeType === 'circle' ? '50%' : element.style.borderRadius,
              }}
            />
          )}
          
          {element.type === 'button' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: element.style.backgroundColor,
                color: element.style.color,
                fontSize: element.style.fontSize,
                borderRadius: element.style.borderRadius,
                padding: `${element.style.paddingY}px ${element.style.paddingX}px`,
              }}
            >
              {element.text}
            </div>
          )}
        </div>
      </Rnd>
    );
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Component Palette - Collapsible */}
      {showComponentPanel ? (
        <div className="relative flex-shrink-0">
          <ComponentPalette onAddElement={handleAddElement} />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => setShowComponentPanel(false)}
            title="Collapse Components"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 border-r bg-card flex items-start justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComponentPanel(true)}
            title="Expand Components"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="border-b bg-card p-4 flex items-center gap-4 flex-shrink-0">
          <Input
            placeholder="Template name..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="max-w-xs"
          />
          
          {/* Canvas Size Selector */}
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={canvasSize === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleCanvasSizeChange('mobile')}
            >
              Mobile
            </Button>
            <Button
              variant={canvasSize === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleCanvasSizeChange('tablet')}
            >
              Tablet
            </Button>
            <Button
              variant={canvasSize === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleCanvasSizeChange('desktop')}
            >
              Desktop
            </Button>
          </div>

          {/* Grid Toggle */}
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            Grid: {showGrid ? 'ON' : 'OFF'}
          </Button>

          <div className="ml-auto flex gap-2">
            {onPreview && (
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>

        {/* Canvas - Scrollable */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-b from-background to-accent/5">
          <div className="mx-auto relative" style={{ width: template.canvasSize.width + 80, paddingBottom: '40px' }}>
            {/* Ruler guides */}
            <div className="absolute -left-8 top-0 bottom-0 w-8 bg-muted/50 flex flex-col items-center justify-start text-xs text-muted-foreground">
              {Array.from({ length: Math.floor(template.canvasSize.height / 50) }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: i * 50, left: 0, right: 0, textAlign: 'center' }}>
                  {i * 50}
                </div>
              ))}
            </div>
            <div className="absolute -top-8 left-0 right-0 h-8 bg-muted/50 flex items-center justify-start text-xs text-muted-foreground">
              {Array.from({ length: Math.floor(template.canvasSize.width / 50) }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', left: i * 50, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
                  {i * 50}
                </div>
              ))}
            </div>

            {/* Safe zone guide overlay */}
            <div 
              className="absolute border-2 border-dashed border-primary/30 pointer-events-none"
              style={{
                left: 20,
                top: 20,
                right: 20,
                bottom: 20,
                width: template.canvasSize.width - 40,
                height: template.canvasSize.height - 40,
              }}
            >
              <span className="absolute -top-6 left-0 text-xs text-primary/60">Safe Zone (20px margin)</span>
            </div>

            <div
              ref={canvasRef}
              className={`bg-white shadow-lg mx-auto relative ${showGrid ? 'bg-grid' : ''}`}
              style={{
                width: template.canvasSize.width,
                height: template.canvasSize.height,
                backgroundImage: showGrid 
                  ? 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)'
                  : 'none',
                backgroundSize: showGrid ? '20px 20px' : 'auto',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedElementId(null);
                }
              }}
            >
              {template.elements.map(renderElement)}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel - Collapsible */}
      {showPropertiesPanel ? (
        <div className="relative flex-shrink-0">
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 h-6 w-6 p-0"
            onClick={() => setShowPropertiesPanel(false)}
            title="Collapse Properties"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 border-l bg-card flex items-start justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPropertiesPanel(true)}
            title="Expand Properties"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
