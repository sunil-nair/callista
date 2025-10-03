import { useState, useEffect } from "react";
import { VisualEditor } from "@/components/visual-editor/VisualEditor";
import { TemplateList } from "@/components/TemplateList";
import { PreviewDialog } from "@/components/PreviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { EmailTemplate } from "@/types/template";

interface Template {
  id: string;
  name: string;
  html: string;
  json_template: EmailTemplate;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      const templatesWithParsed = (data || []).map(t => ({
        ...t,
        json_template: (t.json_template as any) || { elements: [], canvasSize: { width: 375, height: 667 } }
      }));
      
      setTemplates(templatesWithParsed);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (name: string, template: EmailTemplate, html: string) => {
    try {
      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("email_templates")
          .update({ name, html, json_template: template as any })
          .eq("id", selectedTemplate.id);

        if (error) throw error;
        toast.success("Template updated successfully!");
      } else {
        // Create new template
        const { error } = await supabase
          .from("email_templates")
          .insert([{ name, html, json_template: template as any }]);

        if (error) throw error;
        toast.success("Template created successfully!");
      }

      await loadTemplates();
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }

      toast.success("Template deleted successfully!");
      await loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleNew = () => {
    setSelectedTemplate(null);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-subtle">
        <div className="text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Minimal Full-Screen Navbar */}
      <header className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 h-14 flex-shrink-0 shadow-md">
        <div className="h-full px-6 flex items-center">
          <h1 className="text-white text-lg font-semibold">Email Template Designer</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Templates */}
        <TemplateList
          templates={templates}
          selectedId={selectedTemplate?.id}
          onSelect={setSelectedTemplate}
          onNew={handleNew}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <VisualEditor
            key={selectedTemplate?.id || "new"}
            initialName={selectedTemplate?.name || ""}
            initialTemplate={selectedTemplate?.json_template}
            onSave={handleSave}
            onPreview={(name, html, template) => {
              setPreviewTemplate({ 
                id: selectedTemplate?.id || "preview", 
                name, 
                html,
                json_template: template,
                created_at: selectedTemplate?.created_at || new Date().toISOString(),
                updated_at: selectedTemplate?.updated_at || new Date().toISOString()
              });
              setIsPreviewOpen(true);
            }}
          />
        </div>
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        template={previewTemplate}
      />
    </div>
  );
};

export default Index;
