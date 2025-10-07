import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StructuredTemplate } from "@/types/structuredTemplate";
import { BrandSettingsForm } from "./BrandSettingsForm";
import { HeroSectionForm } from "./HeroSectionForm";
import { TextSectionsForm } from "./TextSectionsForm";
import { CTASectionForm } from "./CTASectionForm";
import { StructuredHtmlGenerator } from "@/utils/structuredHtmlGenerator";
import { Save, Eye } from "lucide-react";

interface StructuredTemplateEditorProps {
  initialTemplate?: StructuredTemplate;
  onSave: (template: StructuredTemplate, html: string) => void;
  onPreview: (template: { name: string; html: string; json_template: any }) => void;
}

const defaultTemplate: StructuredTemplate = {
  name: "New Email Template",
  brand: {
    logoUrl: "",
    businessName: "Your Business",
    primaryColor: "#7C3AED",
    secondaryColor: "#6B7280",
  },
  hero: {
    imageUrl: "",
    headline: "Welcome!",
    subheadline: "",
  },
  textSections: [],
  cta: {
    buttonText: "Learn More",
    buttonUrl: "https://example.com",
    buttonColor: "#7C3AED",
    description: "",
  },
};

export const StructuredTemplateEditor = ({
  initialTemplate,
  onSave,
  onPreview,
}: StructuredTemplateEditorProps) => {
  const [template, setTemplate] = useState<StructuredTemplate>(
    initialTemplate || defaultTemplate
  );

  const handleSave = () => {
    const html = StructuredHtmlGenerator.generateHTML(template);
    onSave(template, html);
  };

  const handlePreview = () => {
    const html = StructuredHtmlGenerator.generateHTML(template);
    onPreview({
      name: template.name,
      html,
      json_template: template,
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Editor Panel */}
      <div className="w-1/2 border-r border-border flex flex-col">
        <div className="p-6 border-b border-border bg-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="My Email Template"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiShortcode">API Shortcode (Optional)</Label>
              <Input
                id="apiShortcode"
                value={template.apiShortcode || ''}
                onChange={(e) => setTemplate({ ...template, apiShortcode: e.target.value })}
                placeholder="welcome-email"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
              <Button onClick={handlePreview} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <BrandSettingsForm
              brand={template.brand}
              onChange={(brand) => setTemplate({ ...template, brand })}
            />

            <Separator />

            <HeroSectionForm
              hero={template.hero}
              onChange={(hero) => setTemplate({ ...template, hero })}
            />

            <Separator />

            <TextSectionsForm
              sections={template.textSections}
              onChange={(textSections) => setTemplate({ ...template, textSections })}
            />

            <Separator />

            <CTASectionForm
              cta={template.cta}
              onChange={(cta) => setTemplate({ ...template, cta })}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 bg-muted/30">
        <div className="p-6 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            See how your email will look to customers
          </p>
        </div>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-6">
            <div 
              className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto"
              style={{ maxWidth: '600px' }}
              dangerouslySetInnerHTML={{ 
                __html: StructuredHtmlGenerator.generateHTML(template) 
              }}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
