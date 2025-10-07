import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Save, Copy, ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose, Monitor, Tablet, Smartphone, Grid3x3, Code } from "lucide-react";
import { ComponentPalette } from "./ComponentPalette";
import { PropertiesPanel } from "./PropertiesPanel";
import { ImportHTMLDialog } from "./ImportHTMLDialog";
import { AIDesignDialog } from "../AIDesignDialog";
import { SaveAsDialog } from "./SaveAsDialog";
import { RenderableElement } from "./elements/RenderableElement";
import { useElementOperations } from "./hooks/useElementOperations";
import { 
  createDefaultTextElement, 
  createDefaultImageElement, 
  createDefaultShapeElement, 
  createDefaultButtonElement,
  normalizeAIElement 
} from "./utils/elementDefaults";
import { EmailTemplate } from "@/types/template";
import { HTMLParser } from "@/utils/htmlParser";
import { HTMLGenerator } from "@/utils/htmlGenerator";
import { toast } from "sonner";

interface VisualEditorProps {
  initialName?: string;
  initialApiShortcode?: string;
  initialTemplate?: EmailTemplate;
  initialHtml?: string;
  onSave: (name: string, apiShortcode: string, template: EmailTemplate, html: string) => void;
  onSaveAs?: (name: string, apiShortcode: string, template: EmailTemplate, html: string) => void;
  onPreview?: (name: string, html: string, template: EmailTemplate) => void;
}

const defaultTemplate: EmailTemplate = {
  elements: [],
  canvasSize: { width: 375, height: 667 }, // iPhone mobile size
};

export const VisualEditor = ({
  initialName = "",
  initialApiShortcode = "",
  initialTemplate = defaultTemplate,
  initialHtml = "",
  onSave,
  onSaveAs,
  onPreview,
}: VisualEditorProps) => {
  const [templateName, setTemplateName] = useState(initialName);
  const [apiShortcode, setApiShortcode] = useState(initialApiShortcode);
  const [template, setTemplate] = useState<EmailTemplate>(initialTemplate);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [showComponentPanel, setShowComponentPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialHtml || '');
  const [debouncedHtml, setDebouncedHtml] = useState(initialHtml || '');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Use custom hook for element operations
  const {
    selectedElementId,
    setSelectedElementId,
    editingTextId,
    setEditingTextId,
    handleUpdateElement,
    handleDeleteElement,
    handleBringForward,
    handleSendBackward,
    handleBringToFront,
    handleSendToBack,
    handleDuplicateElement,
  } = useElementOperations(template, setTemplate);

  const canvasSizes = {
    mobile: { width: 375, height: 800 },  // Increased min height
    tablet: { width: 768, height: 1200 },
    desktop: { width: 1200, height: 1000 },
  };

  // Calculate dynamic canvas height based on content
  const calculateCanvasHeight = () => {
    const minHeight = canvasSizes[canvasSize].height;
    if (template.elements.length === 0) return minHeight;
    
    // Find the lowest element bottom edge
    const maxBottom = Math.max(
      ...template.elements.map(el => el.position.y + el.size.height),
      0
    );
    
    // Add padding at the bottom (100px) and ensure minimum height
    return Math.max(minHeight, maxBottom + 100);
  };

  const dynamicCanvasHeight = calculateCanvasHeight();

  const selectedElement = template.elements.find((el) => el.id === selectedElementId) || null;

  // Initialize and debounce HTML content
  useEffect(() => {
    const initial = (initialHtml && initialHtml.trim()) ? initialHtml : HTMLGenerator.generateHTML(template);
    setHtmlContent(initial);
    setDebouncedHtml(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate HTML when template elements change
  useEffect(() => {
    if (template.elements.length > 0 || template.canvasSize) {
      const generatedHtml = HTMLGenerator.generateHTML(template);
      setHtmlContent(generatedHtml);
    }
  }, [template]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedHtml(htmlContent), 250);
    return () => clearTimeout(t);
  }, [htmlContent]);

  // Detect changes
  useEffect(() => {
    const nameChanged = templateName !== initialName;
    const shortcodeChanged = apiShortcode !== initialApiShortcode;
    const templateChanged = JSON.stringify(template) !== JSON.stringify(initialTemplate);
    
    setHasChanges(nameChanged || shortcodeChanged || templateChanged);
  }, [templateName, apiShortcode, template, initialName, initialApiShortcode, initialTemplate]);

  const handleAddElement = (type: 'text' | 'image' | 'shape' | 'button') => {
    const position = { x: 50, y: 50 };
    const zIndex = template.elements.length;
    
    let newElement;
    switch (type) {
      case 'text':
        newElement = createDefaultTextElement(position, zIndex);
        break;
      case 'image':
        newElement = createDefaultImageElement(position, zIndex);
        break;
      case 'shape':
        newElement = createDefaultShapeElement(position, zIndex);
        break;
      case 'button':
        newElement = createDefaultButtonElement(position, zIndex);
        break;
    }

    setTemplate((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElementId(newElement.id);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} element added`);
  };

  const generateHTML = (useTableLayout: boolean = false): string => {
    return HTMLGenerator.generateHTML(template, useTableLayout);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!apiShortcode.trim()) {
      toast.error("Please enter an API shortcode");
      return;
    }

    const html = htmlContent?.trim() ? htmlContent : generateHTML();
    onSave(templateName, apiShortcode, template, html);
    setHasChanges(false); // Reset after save
  };

  const handleSaveAs = (newName: string, newShortcode: string) => {
    if (!newName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!newShortcode.trim()) {
      toast.error("Please enter an API shortcode");
      return;
    }

    const html = htmlContent?.trim() ? htmlContent : generateHTML();
    if (onSaveAs) {
      onSaveAs(newName, newShortcode, template, html);
      setHasChanges(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      const html = htmlContent?.trim() ? htmlContent : generateHTML();
      onPreview(templateName || "Untitled Template", html, template);
    }
  };

  const handleCanvasSizeChange = (size: 'mobile' | 'tablet' | 'desktop') => {
    setCanvasSize(size);
    setTemplate((prev) => ({
      ...prev,
      canvasSize: canvasSizes[size],
    }));
  };

  const handleImportHTML = (html: string) => {
    try {
      setHtmlContent(html);
      setDebouncedHtml(html);
      toast.success("HTML loaded into editor");
    } catch (error) {
      console.error("Error loading HTML:", error);
      toast.error("Failed to load HTML");
    }
  };

  const handleAIDesignGenerated = (template: EmailTemplate) => {
    // Normalize all elements to ensure proper visibility
    const normalizedElements = template.elements.map(normalizeAIElement);

    setTemplate({
      ...template,
      elements: normalizedElements,
    });
    toast.success("AI design loaded successfully!");
  };

  const renderElement = (element: any) => {
    const isSelected = element.id === selectedElementId;
    const isEditing = element.id === editingTextId;
    
    return (
      <RenderableElement
        key={element.id}
        element={element}
        isSelected={isSelected}
        isEditing={isEditing}
        onSelect={() => setSelectedElementId(element.id)}
        onDoubleClick={() => {
          if (element.type === 'text') {
            setEditingTextId(element.id);
            setSelectedElementId(element.id);
          }
        }}
        onUpdate={handleUpdateElement}
        onStopEditing={() => setEditingTextId(null)}
        onBringToFront={() => handleBringToFront(element.id)}
        onBringForward={() => handleBringForward(element.id)}
        onSendBackward={() => handleSendBackward(element.id)}
        onSendToBack={() => handleSendToBack(element.id)}
        onDuplicate={() => handleDuplicateElement(element.id)}
        onDelete={() => handleDeleteElement(element.id)}
      />
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Component Palette - Full Height */}
      {showComponentPanel ? (
        <div className="relative flex-shrink-0 h-full">
          <ComponentPalette onAddElement={handleAddElement} />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
            onClick={() => setShowComponentPanel(false)}
            title="Collapse Components"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 border-r bg-card flex items-start justify-center pt-4 h-full">
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
      
      {/* Canvas Area - Center Section */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        {/* Canvas Toolbar - Reorganized for clarity */}
        <div className="border-b bg-card/50 backdrop-blur-sm flex-shrink-0">
          {/* Top Row: Template Info */}
          <div className="px-4 py-2 border-b flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Name:</label>
              <Input
                placeholder="Enter template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="h-8 text-sm flex-1 max-w-[250px]"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">API:</label>
              <Input
                placeholder="api-shortcode"
                value={apiShortcode}
                onChange={(e) => setApiShortcode(e.target.value)}
                className="h-8 text-sm flex-1 max-w-[200px] font-mono"
              />
            </div>
            <div className="ml-auto flex gap-2">
              {onSaveAs && (
                <Button variant="outline" size="sm" onClick={() => setShowSaveAsDialog(true)} className="h-8">
                  <Copy className="h-4 w-4 mr-1.5" />
                  Save as
                </Button>
              )}
              <Button size="sm" onClick={handleSave} className="h-8" disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-1.5" />
                Save
              </Button>
            </div>
          </div>

          {/* Bottom Row: Tools */}
          <div className="px-4 py-2 flex items-center gap-2">
            {/* Canvas Size Selector with Icons */}
            <div className="flex gap-0.5 border rounded-md p-0.5 bg-background">
              <Button
                variant={canvasSize === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleCanvasSizeChange('mobile')}
                className="h-7 px-2"
                title="Mobile (375px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={canvasSize === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleCanvasSizeChange('tablet')}
                className="h-7 px-2"
                title="Tablet (768px)"
              >
                <Tablet className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={canvasSize === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleCanvasSizeChange('desktop')}
                className="h-7 px-2"
                title="Desktop (1200px)"
              >
                <Monitor className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Grid Toggle */}
            <Button
              variant={showGrid ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="h-7 px-2"
              title={`Grid ${showGrid ? 'ON' : 'OFF'}`}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>

            <div className="w-px h-5 bg-border" />

            {/* Import HTML */}
            <ImportHTMLDialog onImport={handleImportHTML} />

            {/* AI Design */}
            <AIDesignDialog 
              canvasSize={template.canvasSize} 
              onDesignGenerated={handleAIDesignGenerated}
            />
          </div>
        </div>

        {/* Split View: Code and Visual Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* HTML Code Editor */}
          <div className="flex-1 flex flex-col border-r bg-background overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/50 flex justify-between items-center flex-shrink-0">
              <h3 className="text-sm font-semibold">HTML Code</h3>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full h-full font-mono text-sm resize-none"
                placeholder="HTML will be generated from your design..."
                readOnly
              />
            </div>
          </div>

          {/* Visual Editor Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-muted/30 to-muted/5">
            <div className="px-4 py-2 border-b bg-muted/50 flex justify-between items-center flex-shrink-0">
              <h3 className="text-sm font-semibold">Visual Editor</h3>
            </div>
            <div className="flex-1 overflow-auto p-8">
              <div className="relative" style={{ width: template.canvasSize.width + 80, paddingBottom: '40px', margin: '0 auto' }}>
                {/* Ruler guides */}
                <div className="absolute -left-8 top-0 w-8 bg-muted/50 flex flex-col items-center justify-start text-xs text-muted-foreground rounded-l" style={{ height: dynamicCanvasHeight }}>
                  {Array.from({ length: Math.floor(dynamicCanvasHeight / 50) }).map((_, i) => (
                    <div key={i} style={{ position: 'absolute', top: i * 50, left: 0, right: 0, textAlign: 'center' }}>
                      {i * 50}
                    </div>
                  ))}
                </div>
                <div className="absolute -top-8 left-0 right-0 h-8 bg-muted/50 flex items-center justify-start text-xs text-muted-foreground rounded-t">
                  {Array.from({ length: Math.floor(template.canvasSize.width / 50) }).map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: i * 50, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
                      {i * 50}
                    </div>
                  ))}
                </div>

                {/* Safe zone guide overlay */}
                <div 
                  className="absolute border-2 border-dashed border-primary/20 pointer-events-none rounded"
                  style={{
                    left: 20,
                    top: 20,
                    right: 20,
                    width: template.canvasSize.width - 40,
                    height: dynamicCanvasHeight - 40,
                  }}
                >
                  <span className="absolute -top-6 left-0 text-xs text-primary/60 font-medium">Safe Zone (20px margin)</span>
                </div>

                <div
                  ref={canvasRef}
                  className={`bg-white shadow-2xl mx-auto relative rounded-lg overflow-hidden ${showGrid ? 'bg-grid' : ''}`}
                  style={{
                    width: template.canvasSize.width,
                    minHeight: dynamicCanvasHeight,
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
        </div>
      </div>

      {/* Properties Panel - Full Height */}
      {showPropertiesPanel ? (
        <div className="relative flex-shrink-0 h-full">
          <PropertiesPanel
            selectedElement={selectedElement}
            allElements={template.elements}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 h-6 w-6 p-0 z-10"
            onClick={() => setShowPropertiesPanel(false)}
            title="Collapse Properties"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 border-l bg-card flex items-start justify-center pt-4 h-full">
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
      
      {/* Dialogs */}
      <SaveAsDialog
        open={showSaveAsDialog}
        onOpenChange={setShowSaveAsDialog}
        currentName={templateName || "Untitled"}
        currentShortcode={apiShortcode || "untitled"}
        onSave={handleSaveAs}
      />
    </div>
  );
};
