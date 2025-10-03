import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Italic, Underline, Link, Image, Code, AtSign } from "lucide-react";
import { toast } from "sonner";

interface TemplateEditorProps {
  initialName?: string;
  initialHtml?: string;
  onSave: (name: string, html: string) => void;
}

export const TemplateEditor = ({ initialName = "", initialHtml = "", onSave }: TemplateEditorProps) => {
  const [templateName, setTemplateName] = useState(initialName);
  const [showPlaceholderInput, setShowPlaceholderInput] = useState(false);
  const [placeholderName, setPlaceholderName] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && initialHtml) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertPlaceholder = () => {
    if (!placeholderName.trim()) {
      toast.error("Please enter a placeholder name");
      return;
    }
    
    const placeholder = `{{${placeholderName}}}`;
    const span = document.createElement("span");
    span.className = "inline-block px-2 py-0.5 mx-1 bg-accent text-accent-foreground rounded text-sm font-mono";
    span.contentEditable = "false";
    span.textContent = placeholder;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    setPlaceholderName("");
    setShowPlaceholderInput(false);
    editorRef.current?.focus();
  };

  const getHtmlContent = () => {
    if (!editorRef.current) return "";
    return editorRef.current.innerHTML;
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    
    const html = getHtmlContent();
    if (!html.trim()) {
      toast.error("Please add some content to your template");
      return;
    }
    
    onSave(templateName, html);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="border-b bg-card p-4 flex items-center gap-4">
        <Input
          placeholder="Template name..."
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleSave} className="ml-auto">
          Save Template
        </Button>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-card p-2 flex items-center gap-1 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("underline")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) executeCommand("createLink", url);
          }}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) executeCommand("insertImage", url);
          }}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPlaceholderInput(!showPlaceholderInput)}
          title="Insert Placeholder"
        >
          <AtSign className="h-4 w-4" />
        </Button>

        {showPlaceholderInput && (
          <div className="flex items-center gap-2 ml-2">
            <Input
              placeholder="placeholder_name"
              value={placeholderName}
              onChange={(e) => setPlaceholderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") insertPlaceholder();
                if (e.key === "Escape") {
                  setShowPlaceholderInput(false);
                  setPlaceholderName("");
                }
              }}
              className="w-48 h-8"
              autoFocus
            />
            <Button size="sm" onClick={insertPlaceholder}>
              Insert
            </Button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-background to-accent/5">
        <div className="max-w-3xl mx-auto">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[500px] bg-card border rounded-lg p-8 focus:outline-none focus:ring-2 focus:ring-ring shadow-medium"
            style={{
              caretColor: "hsl(var(--primary))",
            }}
          />
        </div>
      </div>
    </div>
  );
};
