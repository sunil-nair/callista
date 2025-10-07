import { useState, useEffect } from "react";
import { StructuredTemplateEditor } from "@/components/structured-editor/StructuredTemplateEditor";
import { TemplateList } from "@/components/TemplateList";
import { PreviewDialog } from "@/components/PreviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { StructuredTemplate } from "@/types/structuredTemplate";

// Use public schema for email templates
const emailTemplatesTable = () => (supabase as any).from('email_templates');

interface Template {
  id: string;
  name: string;
  html: string;
  json_template: StructuredTemplate | null;
  api_shortcode: string | null;
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
      const { data, error } = await emailTemplatesTable()
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      const templatesWithParsed = ((data as any[]) || []).map((t: any) => ({
        ...t,
        json_template: t.json_template
      })) as Template[];
      
      setTemplates(templatesWithParsed);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (template: StructuredTemplate, html: string) => {
    try {
      if (selectedTemplate) {
        // Update existing template
        const { error } = await emailTemplatesTable()
          .update({ 
            name: template.name, 
            api_shortcode: template.apiShortcode || null, 
            html, 
            json_template: template 
          })
          .eq("id", selectedTemplate.id);

        if (error) throw error;
        toast.success("Template updated successfully!");
      } else {
        // Create new template
        const { error } = await emailTemplatesTable()
          .insert([{ 
            name: template.name, 
            api_shortcode: template.apiShortcode || null, 
            html, 
            json_template: template 
          }]);

        if (error) throw error;
        toast.success("Template created successfully!");
      }

      await loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleSaveAs = async (template: StructuredTemplate, html: string) => {
    try {
      // Always create a new template (never update)
      const { error } = await emailTemplatesTable()
        .insert([{ 
          name: template.name, 
          api_shortcode: template.apiShortcode || null, 
          html, 
          json_template: template 
        }]);

      if (error) throw error;
      toast.success("Template saved as new template!");

      await loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await emailTemplatesTable()
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Minimal Full-Screen Navbar */}
      <header className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 h-14 flex-shrink-0 shadow-md">
        <div className="h-full px-6 flex items-center justify-between">
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
          <StructuredTemplateEditor
            key={selectedTemplate?.id || "new"}
            initialTemplate={selectedTemplate?.json_template || undefined}
            onSave={handleSave}
            onPreview={(template) => {
              setPreviewTemplate({ 
                id: selectedTemplate?.id || "preview", 
                name: template.name, 
                html: template.html,
                json_template: template.json_template,
                api_shortcode: selectedTemplate?.api_shortcode || null,
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
