import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Search, Trash2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmailTemplate } from "@/types/template";

interface Template {
  id: string;
  name: string;
  html: string;
  json_template: EmailTemplate;
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

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      {/* Header */}
      <div className="p-4 border-b bg-sidebar-accent/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Templates</h2>
          <Button size="sm" onClick={onNew} className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Template List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery ? "No templates found" : "No templates yet"}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  selectedId === template.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "hover:bg-sidebar-accent/50"
                }`}
                onClick={() => onSelect(template)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-sidebar-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(template.updated_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(template);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this template?")) {
                        onDelete(template.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
