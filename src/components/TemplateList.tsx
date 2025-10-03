import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Search, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmailTemplate } from "@/types/template";

interface Template {
  id: string;
  name: string;
  html: string;
  json_template: EmailTemplate;
  api_shortcode: string;
  created_at: string;
  updated_at: string;
}

interface TemplateListProps {
  templates: Template[];
  selectedId?: string;
  onSelect: (template: Template) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onPreview: (template: Template) => void;
}

export const TemplateList = ({
  templates,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  onPreview,
}: TemplateListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-card flex flex-col items-center pt-4 gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          title="Expand Templates"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNew}
          title="New Template"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-card flex flex-col relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
        onClick={() => setIsCollapsed(true)}
        title="Collapse Templates"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Templates</h2>
        </div>
        <Button onClick={onNew} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">No templates found</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`group relative p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                  selectedId === template.id ? "bg-accent border-primary" : ""
                }`}
                onClick={() => onSelect(template)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{template.name}</h3>
                    {template.api_shortcode && (
                      <p className="text-xs text-primary/70 font-mono mt-0.5">
                        {template.api_shortcode}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(template.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(template);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(template.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
