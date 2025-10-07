import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextSection } from "@/types/structuredTemplate";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface TextSectionsFormProps {
  sections: TextSection[];
  onChange: (sections: TextSection[]) => void;
}

export const TextSectionsForm = ({ sections, onChange }: TextSectionsFormProps) => {
  const addSection = () => {
    onChange([...sections, { id: uuidv4(), content: '', alignment: 'left' }]);
  };

  const removeSection = (id: string) => {
    onChange(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<TextSection>) => {
    onChange(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Content Sections</h3>
        <Button onClick={addSection} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground">No content sections yet. Add one to get started.</p>
      )}

      {sections.map((section, index) => (
        <div key={section.id} className="p-4 border border-border rounded-lg space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <Label>Section {index + 1}</Label>
            <Button 
              onClick={() => removeSection(section.id)} 
              size="sm" 
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`content-${section.id}`}>Content</Label>
            <Textarea
              id={`content-${section.id}`}
              value={section.content}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              placeholder="Enter text or use placeholders like {{wine_description}}"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`alignment-${section.id}`}>Text Alignment</Label>
            <Select
              value={section.alignment || 'left'}
              onValueChange={(value) => updateSection(section.id, { alignment: value as 'left' | 'center' | 'right' })}
            >
              <SelectTrigger id={`alignment-${section.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
};
